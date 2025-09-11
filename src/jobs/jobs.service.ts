import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { JobStatus, ApplicationStatus, Role } from '@prisma/client';
import {
  CreateJobDto,
  UpdateJobDto,
  UpdateJobContentDto,
  ApplyToJobDto,
  UpdateApplicationStatusDto,
} from './dtos/job.dto';
import {
  JobResponseDto,
  JobApplicationResponseDto,
  JobListResponseDto,
  ApplicationListResponseDto,
} from './dtos/job-response.dto';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  // Constantes para Job Status
  private readonly JOB_STATUS = {
    DRAFT: 'draft' as const,
    PUBLISHED: 'published' as const,
    CLOSED: 'closed' as const,
  } as const;

  // Constantes para Application Status
  private readonly APPLICATION_STATUS = {
    PENDING: 'pending' as const,
    APPROVED: 'approved' as const,
    REJECTED: 'rejected' as const,
  } as const;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Criar nova vaga (apenas empresas)
   */
  async createJob(
    companyId: number,
    createJobDto: CreateJobDto,
  ): Promise<JobResponseDto> {
    this.logger.log(`Criando nova vaga para empresa ID: ${companyId}`);

    // Verificar se o usuário é uma empresa
    const company = await this.prisma.user.findUnique({
      where: { id: companyId },
      include: { enterprise: true },
    });

    if (!company?.enterprise || company.role !== Role.enterprise) {
      throw new ForbiddenException('Apenas empresas podem criar vagas');
    }

    const jobData = {
      title: createJobDto.title,
      body: createJobDto.body,
      status: createJobDto.status ?? this.JOB_STATUS.DRAFT,
      enterpriseId: company.enterprise.id,
      publishedAt:
        createJobDto.status === this.JOB_STATUS.PUBLISHED ? new Date() : null,
      expiresAt: createJobDto.expiresAt
        ? new Date(createJobDto.expiresAt)
        : null,
    };

    const job = await this.prisma.job.create({
      data: jobData,
      include: {
        enterprise: {
          select: {
            id: true,
            uuid: true,
            user: {
              select: {
                uuid: true,
                username: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    this.logger.log(`Vaga criada com sucesso: ${job.uuid}`);

    return this.mapJobToResponse(job, null);
  }

  /**
   * Listar vagas (públicas para estudantes, todas para empresas)
   */
  async listJobs(
    userId?: number,
    status?: JobStatus,
    companyId?: number,
    limit = 20,
    offset = 0,
  ): Promise<JobListResponseDto> {
    const where: Record<string, any> = {};

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role === Role.student) {
        Object.assign(where, {
          status: this.JOB_STATUS.PUBLISHED,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        });
      } else if (user?.role === Role.enterprise && companyId) {
        where.enterprise = {
          user: {
            id: companyId,
          },
        };
      }
    } else {
      Object.assign(where, {
        status: this.JOB_STATUS.PUBLISHED,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      });
    }

    if (status) {
      where.status = status;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          enterprise: {
            select: {
              id: true,
              uuid: true,
              user: {
                select: {
                  uuid: true,
                  username: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.job.count({ where }),
    ]);

    // Check if user has applied to any jobs (for students only)
    let appliedJobIds = new Set<number>();
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role === Role.student) {
        const userApplications = await this.prisma.jobApplication.findMany({
          where: {
            student: {
              user: {
                id: userId,
              },
            },
            jobId: { in: jobs.map((job) => job.id) },
          },
          select: { jobId: true },
        });
        appliedJobIds = new Set(userApplications.map((app) => app.jobId));
      }
    }

    return {
      jobs: jobs.map((job) =>
        this.mapJobToResponse(job, appliedJobIds.has(job.id)),
      ),
      total,
      limit,
      offset,
    };
  }

  /**
   * Aplicar para vaga (apenas estudantes)
   */
  async applyToJob(
    jobUuid: string,
    studentId: number,
    applyDto: ApplyToJobDto,
  ): Promise<JobApplicationResponseDto> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { student: true },
    });

    if (!student || student.role !== Role.student || !student.student) {
      throw new ForbiddenException(
        'Apenas estudantes podem se candidatar a vagas',
      );
    }

    const job = await this.prisma.job.findUnique({
      where: { uuid: jobUuid },
    });

    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }

    if (job.status !== this.JOB_STATUS.PUBLISHED) {
      throw new BadRequestException('Esta vaga não está disponível');
    }

    if (job.expiresAt && job.expiresAt < new Date()) {
      throw new BadRequestException('Esta vaga expirou');
    }

    const existingApplication = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_studentId: {
          jobId: job.id,
          studentId: student.student.id,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('Você já se candidatou a esta vaga');
    }

    const application = await this.prisma.jobApplication.create({
      data: {
        jobId: job.id,
        studentId: student.student.id,
        coverLetter: applyDto.coverLetter,
      },
      include: {
        job: {
          select: {
            uuid: true,
            title: true,
            status: true,
          },
        },
      },
    });

    this.logger.log(
      `Nova candidatura: estudante ${studentId} para vaga ${jobUuid}`,
    );

    return this.mapApplicationToResponse(application, false);
  }

  /**
   * Atualizar status de candidatura (apenas empresa que criou a vaga)
   */
  async updateApplicationStatus(
    applicationUuid: string,
    companyId: number,
    updateDto: UpdateApplicationStatusDto,
  ): Promise<JobApplicationResponseDto> {
    const application = await this.prisma.jobApplication.findUnique({
      where: { uuid: applicationUuid },
      include: {
        job: {
          include: {
            enterprise: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Candidatura não encontrada');
    }

    if (application.job.enterprise.user.id !== companyId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta candidatura',
      );
    }

    const updatedApplication = await this.prisma.jobApplication.update({
      where: { uuid: applicationUuid },
      data: {
        status: updateDto.status,
        reviewerNotes: updateDto.reviewerNotes,
        reviewedAt: new Date(),
      },
      include: {
        job: {
          select: {
            uuid: true,
            title: true,
            status: true,
          },
        },
        student: {
          select: {
            uuid: true,
            user: {
              select: {
                uuid: true,
                username: true,
                name: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(
      `Status da candidatura atualizado: ${applicationUuid} -> ${updateDto.status}`,
    );

    return this.mapApplicationToResponse(updatedApplication, true);
  }

  /**
   * Listar candidaturas do estudante
   */
  async getStudentApplications(
    studentId: number,
    status?: ApplicationStatus,
    limit = 20,
    offset = 0,
  ): Promise<ApplicationListResponseDto> {
    const student = await this.prisma.student.findFirst({
      where: { user: { id: studentId } },
    });

    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }

    const where: Record<string, any> = { studentId: student.id };
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where,
        include: {
          job: {
            select: {
              uuid: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.jobApplication.count({ where }),
    ]);

    return {
      applications: applications.map((app) =>
        this.mapApplicationToResponse(app, false),
      ),
      total,
      limit,
      offset,
    };
  }

  /**
   * Mapear Job para DTO de resposta
   */
  private mapJobToResponse(
    job: any,
    hasApplied: boolean | null,
  ): JobResponseDto {
    return {
      uuid: job.uuid,
      title: job.title,
      body: job.body,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      publishedAt: job.publishedAt?.toISOString(),
      expiresAt: job.expiresAt?.toISOString(),
      company: {
        uuid: job.enterprise.uuid,
        username: job.enterprise.user.username,
        name: job.enterprise.user.name,
        avatarUrl: null,
      },
      totalApplications: job._count.applications,
      hasApplied: hasApplied ?? undefined,
    };
  }

  /**
   * Mapear Application para DTO de resposta
   */
  private mapApplicationToResponse(
    application: any,
    includeStudent: boolean,
  ): JobApplicationResponseDto {
    return {
      uuid: application.uuid,
      status: application.status,
      coverLetter: application.coverLetter,
      appliedAt: application.appliedAt.toISOString(),
      reviewedAt: application.reviewedAt?.toISOString(),
      reviewerNotes: application.reviewerNotes,
      job: {
        uuid: application.job.uuid,
        title: application.job.title,
        status: application.job.status,
      },
      student:
        includeStudent && application.student
          ? {
              uuid: application.student.uuid,
              username: application.student.user.username,
              name: application.student.user.name,
              avatarUrl: null,
            }
          : undefined,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
    };
  }

  /**
   * Obter vaga por UUID
   */
  async getJobByUuid(uuid: string, userId?: number): Promise<JobResponseDto> {
    this.logger.log(`Buscando vaga por UUID: ${uuid}`);

    const job = await this.prisma.job.findUnique({
      where: { uuid },
      include: {
        enterprise: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }

    // Se a vaga está como draft, apenas a empresa que criou pode ver
    if (
      job.status === this.JOB_STATUS.DRAFT &&
      (!userId || job.enterprise.user.id !== userId)
    ) {
      throw new NotFoundException('Vaga não encontrada');
    }

    return this.mapJobToResponse(job, null);
  }

  /**
   * Atualizar vaga
   */
  async updateJob(
    uuid: string,
    companyId: number,
    updateJobDto: UpdateJobDto,
  ): Promise<JobResponseDto> {
    this.logger.log(`Atualizando vaga ${uuid} para empresa ID: ${companyId}`);

    // Verificar se a vaga existe e pertence à empresa
    const job = await this.prisma.job.findUnique({
      where: { uuid },
      include: {
        enterprise: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }

    if (job.enterprise.user.id !== companyId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta vaga',
      );
    }

    const updateData: any = {};

    if (updateJobDto.title !== undefined) {
      updateData.title = updateJobDto.title;
    }

    if (updateJobDto.body !== undefined) {
      updateData.body = updateJobDto.body;
    }

    if (updateJobDto.status !== undefined) {
      updateData.status = updateJobDto.status;
    }

    if (updateJobDto.expiresAt !== undefined) {
      updateData.expiresAt = new Date(updateJobDto.expiresAt);
    }

    const updatedJob = await this.prisma.job.update({
      where: { uuid },
      data: updateData,
      include: {
        enterprise: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return this.mapJobToResponse(updatedJob, null);
  }

  /**
   * Listar candidaturas de uma vaga
   */
  async getJobApplications(
    jobUuid: string,
    companyId: number,
    status?: ApplicationStatus,
    limit: number = 20,
    offset: number = 0,
  ): Promise<ApplicationListResponseDto> {
    this.logger.log(
      `Listando candidaturas da vaga ${jobUuid} para empresa ID: ${companyId}`,
    );

    // Verificar se a vaga existe e pertence à empresa
    const job = await this.prisma.job.findUnique({
      where: { uuid: jobUuid },
      include: {
        enterprise: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }

    if (job.enterprise.user.id !== companyId) {
      throw new ForbiddenException(
        'Você não tem permissão para ver as candidaturas desta vaga',
      );
    }

    const whereCondition: any = {
      jobId: job.id,
    };

    if (status) {
      whereCondition.status = status;
    }

    const [applications, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where: whereCondition,
        include: {
          job: {
            select: {
              uuid: true,
              title: true,
              status: true,
            },
          },
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.jobApplication.count({
        where: whereCondition,
      }),
    ]);

    return {
      applications: applications.map((app) =>
        this.mapApplicationToResponse(app, true),
      ),
      total,
      limit,
      offset,
    };
  }

  /**
   * Remover candidatura do estudante
   */
  async removeStudentApplication(
    applicationUuid: string,
    studentId: number,
  ): Promise<void> {
    this.logger.log(
      `Removendo candidatura ${applicationUuid} do estudante ID: ${studentId}`,
    );

    // Verificar se a candidatura existe e pertence ao estudante
    const application = await this.prisma.jobApplication.findUnique({
      where: { uuid: applicationUuid },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Candidatura não encontrada');
    }

    if (application.student.user.id !== studentId) {
      throw new ForbiddenException(
        'Você só pode remover suas próprias candidaturas',
      );
    }

    // Verificar se a candidatura pode ser removida (apenas pending)
    if (application.status !== this.APPLICATION_STATUS.PENDING) {
      throw new BadRequestException(
        'Apenas candidaturas pendentes podem ser removidas',
      );
    }

    await this.prisma.jobApplication.delete({
      where: { uuid: applicationUuid },
    });

    this.logger.log(`Candidatura ${applicationUuid} removida com sucesso`);
  }

  /**
   * Atualizar apenas o conteúdo da vaga (título, body, expiresAt)
   */
  async updateJobContent(
    uuid: string,
    companyId: number,
    updateJobContentDto: UpdateJobContentDto,
  ): Promise<JobResponseDto> {
    this.logger.log(
      `Atualizando conteúdo da vaga ${uuid} para empresa ID: ${companyId}`,
    );

    // Verificar se a vaga existe e pertence à empresa
    const job = await this.prisma.job.findUnique({
      where: { uuid },
      include: {
        enterprise: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }

    if (job.enterprise.user.id !== companyId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta vaga',
      );
    }

    // Verificar se a vaga está em status de rascunho para permitir edição
    if (job.status !== this.JOB_STATUS.DRAFT) {
      throw new BadRequestException(
        'Apenas vagas em rascunho (draft) podem ter seu conteúdo editado',
      );
    }

    const updateData: any = {};

    if (updateJobContentDto.title !== undefined) {
      updateData.title = updateJobContentDto.title;
    }

    if (updateJobContentDto.body !== undefined) {
      updateData.body = updateJobContentDto.body;
    }

    if (updateJobContentDto.expiresAt !== undefined) {
      updateData.expiresAt = new Date(updateJobContentDto.expiresAt);
    }

    const updatedJob = await this.prisma.job.update({
      where: { uuid },
      data: updateData,
      include: {
        enterprise: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return this.mapJobToResponse(updatedJob, null);
  }

  /**
   * Publicar vaga (mudar status para published)
   */
  async publishJob(uuid: string, companyId: number): Promise<JobResponseDto> {
    this.logger.log(`Publicando vaga ${uuid} para empresa ID: ${companyId}`);
    return this.updateJobStatus(uuid, companyId, this.JOB_STATUS.PUBLISHED);
  }

  /**
   * Pausar vaga (mudar status para draft)
   */
  async pauseJob(uuid: string, companyId: number): Promise<JobResponseDto> {
    this.logger.log(`Pausando vaga ${uuid} para empresa ID: ${companyId}`);
    return this.updateJobStatus(uuid, companyId, this.JOB_STATUS.DRAFT);
  }

  /**
   * Finalizar vaga (mudar status para closed)
   */
  async closeJob(uuid: string, companyId: number): Promise<JobResponseDto> {
    this.logger.log(`Finalizando vaga ${uuid} para empresa ID: ${companyId}`);
    return this.updateJobStatus(uuid, companyId, this.JOB_STATUS.CLOSED);
  }

  /**
   * Método privado para atualizar status da vaga
   */
  private async updateJobStatus(
    uuid: string,
    companyId: number,
    status: JobStatus,
  ): Promise<JobResponseDto> {
    // Verificar se a vaga existe e pertence à empresa
    const job = await this.prisma.job.findUnique({
      where: { uuid },
      include: {
        enterprise: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }

    if (job.enterprise.user.id !== companyId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta vaga',
      );
    }

    const updateData: any = { status };

    // Se estiver publicando, definir publishedAt
    if (status === this.JOB_STATUS.PUBLISHED && !job.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updatedJob = await this.prisma.job.update({
      where: { uuid },
      data: updateData,
      include: {
        enterprise: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return this.mapJobToResponse(updatedJob, null);
  }
}
