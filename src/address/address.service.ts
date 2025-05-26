import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/entities/address.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async findAllByUserId(userId: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { user: { id: userId } },
      cache: true,
    });
  }

  async findAllByUserUuid(uuid: string): Promise<Address[]> {
    return this.addressRepository.find({
      where: { user: { uuid } },
      cache: true,
    });
  }

  async findByUserId(userId: number): Promise<Address | null> {
    return this.addressRepository.findOne({
      where: { user: { id: userId } },
      cache: true,
    });
  }

  async findByUserUuid(uuid: string): Promise<Address | null> {
    return this.addressRepository.findOne({
      where: { user: { uuid } },
      cache: true,
    });
  }

  async createOrUpdateByUserId(
    userId: number,
    address: {
      zipCode: string;
      street?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
    },
  ): Promise<Address> {
    let existingAddress = await this.findByUserId(userId);

    if (existingAddress) {
      existingAddress.updatedAt = new Date();
      existingAddress = {
        ...existingAddress,
        ...address,
      };

      return this.addressRepository.save(existingAddress);
    }

    const newAddress = this.addressRepository.create({
      ...address,
      user: { id: userId },
    });
    return this.addressRepository.save(newAddress);
  }

  async deleteByUserId(userId: number): Promise<void> {
    const address = await this.findByUserId(userId);
    if (address) {
      await this.addressRepository.remove(address);
    }
  }
}
