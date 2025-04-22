import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from 'src/entities/tag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async findAllByUserId(userId: number): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { user: { id: userId } },
      cache: true,
    });
  }

  async findAllByUserUuid(uuid: string): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { user: { uuid } },
      cache: true,
    });
  }

  async exists(userId: number, label: string): Promise<Tag | null> {
    return this.tagRepository.findOne({
      where: { user: { id: userId }, label },
      cache: true,
    });
  }

  async add(userId: number, label: string): Promise<Tag> {
    const existingTag = await this.exists(userId, label);

    if (existingTag) {
      existingTag.updatedAt = new Date();
      return this.tagRepository.save(existingTag);
    }

    const tag = this.tagRepository.create({
      label,
      user: { id: userId },
    });
    return this.tagRepository.save(tag);
  }

  async delete(tagId: number): Promise<void> {
    const tag = await this.tagRepository.findOne({ where: { id: tagId } });
    if (!tag) {
      throw new Error('Tag not found');
    }
    await this.tagRepository.remove(tag);
  }

  async deleteByUuid(uuid: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { uuid } });
    if (!tag) throw new NotFoundException('Tag not found');

    return await this.tagRepository.remove(tag);
  }
}
