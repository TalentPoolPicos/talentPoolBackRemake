import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchQueryDto } from './dtos/search_query.dto';
import { UserIndexDto } from './dtos/user_index.dto';
import { UsersService } from 'src/users/users.service';
import { UserAdapter } from 'src/adapters/user.adapter';
import { Role } from 'src/common/enums/roles.enum';
import { User } from 'src/entities/user.entity';
import { UserDto } from 'src/dtos/user.dto';

@Injectable()
export class SearchService {
  constructor(
    @Inject() private readonly elasticsearchService: ElasticsearchService,
    private readonly usersService: UsersService,
  ) {
    this.loadIndex().catch(() => {
      console.error('Error loading index:');
    });
  }

  private async loadIndex() {
    try {
      await this.elasticsearchService.indices.delete({
        index: 'users',
      });
    } catch {
      console.error('Error deleting index:');
    }

    const users = await this.usersService.findAll();

    const usersIndex = users.map((user) => this.userToIndex(user));

    const promises = usersIndex.map((user) => {
      return this.indexDocument(user.uuid, {
        name: user.name,
        username: user.username,
        tags: user.tags,
        email: user.email,
        description: user.description,
      });
    });

    await Promise.all(promises);
  }

  private userToIndex(user: User): {
    uuid: string;
    name: string;
    username: string;
    tags: string;
    email: string;
    description: string;
  } {
    const userDto = UserAdapter.entityToDto(user);
    const name =
      userDto.role == Role.STUDENT
        ? userDto.student?.name
        : userDto.enterprise?.name;
    const description =
      userDto.role == Role.STUDENT
        ? userDto.student?.description
        : userDto.enterprise?.description;
    const tags = userDto.tags.map((tag) => tag.label).join(',');
    const email =
      userDto.role == Role.STUDENT
        ? userDto.student?.email
        : userDto.enterprise?.email;
    return {
      uuid: userDto.uuid,
      name: name || '',
      username: userDto.username,
      tags: tags,
      email: email || '',
      description: description || '',
    };
  }

  async users(
    query: SearchQueryDto,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    items: UserDto[];
    total: number;
  }> {
    if (page < 1) {
      throw new BadRequestException('Page must be greater than or equal to 1');
    }

    if (limit > 20) {
      throw new BadRequestException('Limit must be less than or equal to 20');
    }

    const term = query.searchTerm.toLowerCase();
    try {
      const result = await this.elasticsearchService.search({
        index: 'users',
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: term,
                  fields: ['username^3', 'tags^2', 'email', 'description'],
                  fuzziness: 'AUTO',
                  prefix_length: 3,
                  minimum_should_match: '60%',
                  type: 'bool_prefix',
                },
              },
              {
                wildcard: {
                  username: { value: `*${term}*`, case_insensitive: true },
                },
              },
              {
                wildcard: {
                  email: { value: `*${term}*`, case_insensitive: true },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
      });

      const hits = result.hits.hits
        .map((hit) => hit._id)
        .filter((hit) => hit !== undefined);

      const usersPromise = hits.map((uuid) =>
        this.usersService.findByUuid(uuid),
      );

      const users = await Promise.all(usersPromise);

      const usersDto = users
        .filter(
          (user) =>
            user != null &&
            (user.enterprise?.isComplete || user.student?.isComplete),
        )
        .map((user) => UserAdapter.entityToDto(user!));
      const total = usersDto.length;
      return {
        items: usersDto.slice((page - 1) * limit, page * limit),
        total: total,
      };
    } catch {
      throw new BadRequestException('Error searching users');
    }
  }

  async deleteDocumentbyUserUuid(uuid: string) {
    return this.elasticsearchService.delete({
      index: 'users',
      id: uuid,
    });
  }

  async updateDocumentByUser(user: User) {
    const userDto = UserAdapter.entityToDto(user);
    const name =
      userDto.role == Role.STUDENT
        ? userDto.student?.name
        : userDto.enterprise?.name;
    const description =
      userDto.role == Role.STUDENT
        ? userDto.student?.description
        : userDto.enterprise?.description;
    const tags = userDto.tags.map((tag) => tag.label).join(',');
    const email =
      userDto.role == Role.STUDENT
        ? userDto.student?.email
        : userDto.enterprise?.email;

    return this.indexDocument(user.uuid, {
      name: name || '',
      username: user.username,
      tags: tags,
      email: email || '',
      description: description || '',
    });
  }

  async updateDocumentByUserUuid(uuid: string) {
    const user = await this.usersService.findByUuid(uuid);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.updateDocumentByUser(user);
  }

  createDocumentByUser(user: User) {
    const userDto = UserAdapter.entityToDto(user);
    const newIndex = this.userToIndex(user);

    return this.indexDocument(userDto.uuid, {
      name: newIndex.name,
      username: newIndex.username,
      tags: newIndex.tags,
      email: newIndex.email,
      description: newIndex.description,
    });
  }

  async indexDocument(id: string, document: UserIndexDto) {
    return this.elasticsearchService.index({
      index: 'users',
      id: id,
      body: document,
    });
  }
}
