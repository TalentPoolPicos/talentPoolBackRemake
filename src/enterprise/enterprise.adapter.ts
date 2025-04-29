import { Enterprise } from 'src/entities/enterprise.entity';
import { EnterpriseDto } from './dtos/enterprise.dto';

export class EnterpriseAdapter {
  /**
   * Converts an enterprise entity to a DTO.
   * @param enterprise - The enterprise entity to convert.
   * @returns The converted enterprise DTO.
   */
  static entityToDto(enterprise: Enterprise): EnterpriseDto {
    return {
      isCompleted: enterprise.isComplete,
      fantasyName: enterprise.fantasyName,
      socialReason: enterprise.socialReason,
      uuid: enterprise.uuid,
      name: enterprise.name,
      email: enterprise.email,
      cnpj: enterprise.cnpj,
      description: enterprise.description,
      createdAt: enterprise.createdAt,
      updatedAt: enterprise.updatedAt,
    };
  }
}
