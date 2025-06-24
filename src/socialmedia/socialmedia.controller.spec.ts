import { Test, TestingModule } from '@nestjs/testing';
import { SocialmediaController } from './socialmedia.controller';

describe('SocialmediaController', () => {
  let controller: SocialmediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialmediaController],
    }).compile();

    controller = module.get<SocialmediaController>(SocialmediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
