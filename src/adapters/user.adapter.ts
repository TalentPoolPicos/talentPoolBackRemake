import { Role } from 'src/common/enums/roles.enum';
import { UserDto } from 'src/dtos/user.dto';
import { User } from 'src/entities/user.entity';
import { SocialMediaAdapter } from 'src/socialmedia/socialmedia.adapter';
import { StudentAdapter } from 'src/students/student.adapter';
import { TagsAdapter } from 'src/tags/tags.adapter';

export class UserAdapter {
  private static stringToRole(role: string): Role {
    switch (role) {
      case 'admin':
        return Role.ADMIN;
      case 'moderator':
        return Role.MODERATOR;
      case 'student':
        return Role.STUDENT;
      case 'teacher':
        return Role.TEACHER;
      case 'enterprise':
        return Role.ENTERPRISE;

      default:
        throw new Error(`Unknown role: ${role}`);
    }
  }

  /**
   * Converts a User entity to a UserDto.
   * @param user - The User entity to convert.
   * @returns The converted UserDto.
   */
  static entityToDto(user: User): UserDto {
    return {
      uuid: user.uuid,
      username: user.username,
      bannerPicture: user.bannerPicture,
      profilePicture: user.profilePicture,
      email: user.email,
      role: this.stringToRole(user.role),
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      socialMedia: user.socialMedia.map((social) =>
        SocialMediaAdapter.entityToDto(social),
      ),
      tags: user.tag.map((tag) => TagsAdapter.entityToDto(tag)),
      ...(user.student
        ? { student: StudentAdapter.entityToDto(user.student) }
        : {}),
    };
  }
}
