import { Address } from 'src/entities/address.entity';
import { AddressDto } from './dtos/address.dto';

export class AddressAdapter {
  /**
   * Converts an Address entity to a DTO.
   * @param address - The Address entity to convert.
   * @returns The converted Address DTO.
   */
  static entityToDto(address: Address): AddressDto {
    return {
      uuid: address.uuid,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
      street: address.street,
      city: address.city,
      state: address.state,
      neighborhood: address.neighborhood,
      zipCode: address.zipCode,
    };
  }
}
