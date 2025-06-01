import { Like } from 'src/entities/like.entity';
import { LikeDto } from './dtos/like.dto';
import { UserAdapter } from 'src/adapters/user.adapter';

export class LikeAdapter {
  /**
   * Converts a Match entity to a MatchDto.
   * @param like - The Match entity to convert.
   * @return The converted MatchDto.
   */
  static entityToDto(like: Like): LikeDto {
    return {
      uuid: like.uuid,
      initiator: UserAdapter.entityToDto(like.initiator),
      receiver: UserAdapter.entityToDto(like.receiver),
      createdAt: like.createdAt,
      updatedAt: like.updatedAt,
    };
  }
}
