import { Global, Module } from '@nestjs/common';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enterprise } from 'src/entities/enterprise.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Enterprise])],
  controllers: [EnterpriseController],
  providers: [EnterpriseService],
  exports: [EnterpriseService],
})
export class EnterpriseModule {}
