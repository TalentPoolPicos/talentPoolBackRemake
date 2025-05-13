import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { Role } from 'src/common/enums/roles.enum';

export class SearchQueryDto {
  @ApiProperty({
    type: String,
    description: 'The query string to search for',
    example: 'john',
  })
  @IsString()
  searchTerm: string;

  @ApiProperty({
    type: String,
    description: 'Optional field to filter results by role',
    enum: Role,
    required: false,
  })
  @IsOptional()
  role?: Role;
}
