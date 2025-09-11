import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { JobStatus, ApplicationStatus, Role } from '@prisma/client';

describe('JobsService', () => {
  let service: JobsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    job: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    jobApplication: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockStorageService = {
    generateSignedUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJob', () => {
    it('should create a job for enterprise user', async () => {
      const companyId = 1;
      const createJobDto = {
        title: 'Desenvolvedor Frontend',
        body: '<p>Vaga para desenvolvedor React</p>',
        status: JobStatus.draft,
      };

      const mockCompany = {
        id: companyId,
        role: Role.enterprise,
        enterprise: { id: 1 },
      };

      const mockJob = {
        id: 1,
        uuid: 'job-uuid',
        title: createJobDto.title,
        body: createJobDto.body,
        status: createJobDto.status,
        companyId,
        company: {
          uuid: 'company-uuid',
          username: 'empresa',
          name: 'Empresa Teste',
        },
        _count: { applications: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: null,
        expiresAt: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockCompany);
      mockPrismaService.job.create.mockResolvedValue(mockJob);

      const result = await service.createJob(companyId, createJobDto);

      expect(result.uuid).toBe('job-uuid');
      expect(result.title).toBe(createJobDto.title);
      expect(result.status).toBe(JobStatus.draft);
    });

    it('should throw ForbiddenException for non-enterprise user', async () => {
      const userId = 1;
      const createJobDto = {
        title: 'Vaga Teste',
        body: '<p>Descrição</p>',
      };

      const mockStudent = {
        id: userId,
        role: Role.student,
        student: { id: 1 },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockStudent);

      await expect(service.createJob(userId, createJobDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('applyToJob', () => {
    it('should allow student to apply to job', async () => {
      const studentId = 1;
      const jobUuid = 'job-uuid';
      const applyDto = {
        coverLetter: 'Gostaria de me candidatar a esta vaga.',
      };

      const mockStudent = {
        id: studentId,
        role: Role.student,
        student: { id: 1 },
      };

      const mockJob = {
        id: 1,
        uuid: jobUuid,
        status: JobStatus.published,
        expiresAt: null,
      };

      const mockApplication = {
        id: 1,
        uuid: 'application-uuid',
        status: ApplicationStatus.pending,
        coverLetter: applyDto.coverLetter,
        job: {
          uuid: jobUuid,
          title: 'Vaga Teste',
          status: JobStatus.published,
        },
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockStudent);
      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.jobApplication.findUnique.mockResolvedValue(null);
      mockPrismaService.jobApplication.create.mockResolvedValue(
        mockApplication,
      );

      const result = await service.applyToJob(jobUuid, studentId, applyDto);

      expect(result.uuid).toBe('application-uuid');
      expect(result.status).toBe(ApplicationStatus.pending);
      expect(result.coverLetter).toBe(applyDto.coverLetter);
    });

    it('should throw ForbiddenException for non-student user', async () => {
      const userId = 1;
      const jobUuid = 'job-uuid';
      const applyDto = { coverLetter: 'Test' };

      const mockEnterprise = {
        id: userId,
        role: Role.enterprise,
        enterprise: { id: 1 },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockEnterprise);

      await expect(
        service.applyToJob(jobUuid, userId, applyDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent job', async () => {
      const studentId = 1;
      const jobUuid = 'non-existent-job';
      const applyDto = { coverLetter: 'Test' };

      const mockStudent = {
        id: studentId,
        role: Role.student,
        student: { id: 1 },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockStudent);
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await expect(
        service.applyToJob(jobUuid, studentId, applyDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listJobs', () => {
    it('should return public jobs for unauthenticated users', async () => {
      const mockJobs = [
        {
          id: 1,
          uuid: 'job-1',
          title: 'Vaga 1',
          body: 'Descrição 1',
          status: JobStatus.published,
          company: {
            uuid: 'company-1',
            username: 'empresa1',
            name: 'Empresa 1',
          },
          _count: { applications: 2 },
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: new Date(),
          expiresAt: null,
        },
      ];

      mockPrismaService.job.findMany.mockResolvedValue(mockJobs);
      mockPrismaService.job.count.mockResolvedValue(1);

      const result = await service.listJobs();

      expect(result.jobs).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.jobs[0].uuid).toBe('job-1');
    });

    it('should return all company jobs for enterprise user', async () => {
      const userId = 1;
      const companyId = 1;

      const mockUser = {
        id: userId,
        role: Role.enterprise,
      };

      const mockJobs = [
        {
          id: 1,
          uuid: 'job-1',
          title: 'Vaga Privada',
          status: JobStatus.draft,
          company: {
            uuid: 'company-1',
            username: 'empresa1',
            name: 'Empresa 1',
          },
          _count: { applications: 0 },
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: null,
          expiresAt: null,
        },
      ];

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.job.findMany.mockResolvedValue(mockJobs);
      mockPrismaService.job.count.mockResolvedValue(1);

      const result = await service.listJobs(userId, undefined, companyId);

      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0].status).toBe(JobStatus.draft);
    });
  });
});
