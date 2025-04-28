import { Tag } from 'src/entities/tag.entity';
import { TagDto } from './dtos/tag.dto';

export class TagsAdapter {
  /**
   * Converts a Tag entity to a TagDto.
   * @param tag - The Tag entity to convert.
   * @returns The converted TagDto.
   */
  static entityToDto(tag: Tag): TagDto {
    return {
      uuid: tag.uuid,
      created_at: tag.createdAt,
      updated_at: tag.updatedAt,
      label: tag.label,
    };
  }
}
