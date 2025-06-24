import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enterprise } from 'src/entities/enterprise.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EnterpriseService {
  constructor(
    @InjectRepository(Enterprise)
    private readonly enterpriseRepository: Repository<Enterprise>,
  ) {}

  async findById(id: number): Promise<Enterprise | null> {
    return this.enterpriseRepository.findOne({
      where: { id },
      cache: true,
    });
  }

  async findByUuid(uuid: string): Promise<Enterprise | null> {
    return this.enterpriseRepository.findOne({
      where: { uuid },
      cache: true,
    });
  }

  async findByUserId(userId: number): Promise<Enterprise | null> {
    return this.enterpriseRepository.findOne({
      where: { user: { id: userId } },
      cache: true,
    });
  }

  async findByUserUuid(userUuid: string): Promise<Enterprise | null> {
    return this.enterpriseRepository.findOne({
      where: { user: { uuid: userUuid } },
      cache: true,
    });
  }

  async findAll(): Promise<Enterprise[]> {
    return this.enterpriseRepository.find();
  }

  async findAndCountAll(
    page: number,
    limit: number,
  ): Promise<{ enterprises: Enterprise[]; total: number }> {
    if (limit < 1) limit = 1;
    if (limit > 20) limit = 20;

    const [enterprises, total] = await this.enterpriseRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      cache: true,
    });
    return { enterprises, total };
  }

  async checkIfEnterpriseExistsByUuid(uuid: string): Promise<boolean> {
    const enterprise = await this.enterpriseRepository.findOne({
      where: { uuid },
      cache: true,
    });
    return !!enterprise;
  }

  async checkIfEnterpriseExistsById(id: number): Promise<boolean> {
    const enterprise = await this.enterpriseRepository.findOne({
      where: { id },
      cache: true,
    });
    return !!enterprise;
  }

  async deleteByUuid(uuid: string): Promise<void> {
    const result = await this.checkIfEnterpriseExistsByUuid(uuid);
    if (!result) throw new NotFoundException('Enterprise not found');
    await this.enterpriseRepository.delete({ uuid });
  }

  async update(
    id: number,
    enterprise: {
      name?: string;
      email?: string;
      cnpj?: string;
      socialReason?: string;
      description?: string;
      fantasyName?: string;
    },
  ) {
    if (Object.keys(enterprise).length === 0) {
      throw new NotFoundException('No data provided for update');
    }

    const existingEnterprise = await this.findById(id);

    if (!existingEnterprise)
      throw new NotFoundException('Enterprise not found');

    Object.assign(existingEnterprise, enterprise);
    existingEnterprise.updatedAt = new Date();

    if (this.checkIfEnterpriseHasMinimumData(existingEnterprise)) {
      existingEnterprise.isComplete = true;
    }

    return this.enterpriseRepository.save(existingEnterprise);
  }

  async updateByUserId(
    userId: number,
    enterprise: {
      name?: string;
      email?: string;
      cnpj?: string;
      socialReason?: string;
      description?: string;
      fantasyName?: string;
    },
  ): Promise<Enterprise> {
    if (Object.keys(enterprise).length === 0) {
      throw new NotFoundException('No data provided for update');
    }

    const existingEnterprise = await this.findByUserId(userId);

    if (!existingEnterprise)
      throw new NotFoundException('Enterprise not found');
    Object.assign(existingEnterprise, enterprise);
    existingEnterprise.updatedAt = new Date();
    if (this.checkIfEnterpriseHasMinimumData(existingEnterprise)) {
      existingEnterprise.isComplete = true;
    }

    return this.enterpriseRepository.save(existingEnterprise);
  }

  /**
   * @param enterprise
   * @returns boolean
   * @description Check if the enterprise has the minimum required data
   */
  private checkIfEnterpriseHasMinimumData(enterprise: Enterprise): boolean {
    const requiredFields = [
      'name',
      'email',
      'cnpj',
      'socialReason',
      'description',
      'fantasyName',
    ];

    return requiredFields.every((field) => !!enterprise[field]);
  }
}
