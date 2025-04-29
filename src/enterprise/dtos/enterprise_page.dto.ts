import { ApiProperty } from '@nestjs/swagger';
import { EnterpriseDto } from './enterprise.dto';

export class EnterprisePageDto {
  @ApiProperty({
    type: EnterpriseDto,
    description: 'The list of enterprises',
  })
  enterprises: EnterpriseDto[];

  @ApiProperty({
    type: Number,
    description: 'The total number of enterprises',
  })
  total: number;
}
