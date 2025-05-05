import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { FilesService } from 'src/minio/file.service';
import { Public } from 'src/auth/decotaros/public.decorator';
import { StudentsPageDto } from './dtos/students_page.dto';
import { StudentAdapter } from './student.adapter';
import { StudentDto } from './dtos/student.dto';
import { CustomRequest } from 'src/auth/interfaces/custon_request';
import { PartialStudentDto } from './dtos/partial_student.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

@ApiTags('Student')
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly configService: ConfigService,
    private readonly filesService: FilesService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Get students by pages' })
  @ApiOkResponse({
    description: 'The list of students and the total number of students',
    type: StudentsPageDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'The page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'The number of students per page',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findByPage(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.studentsService.findAndCountAll(page, limit);

    return {
      students: result.students.map((students) =>
        StudentAdapter.entityToDto(students),
      ),
      total: result.total,
    };
  }

  @Public()
  @ApiOperation({ summary: 'Get a student by uuid' })
  @ApiOkResponse({
    description: 'The student',
    type: StudentDto,
  })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @HttpCode(HttpStatus.OK)
  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    const student = await this.studentsService.findByUuid(uuid);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return StudentAdapter.entityToDto(student);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a student partially',
    description:
      'Update some student data partially. At least one field must be sent.',
  })
  @ApiOkResponse({
    description: 'The student was successfully updated',
    type: StudentDto,
  })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiBadRequestResponse({
    description: 'The model state is invalid',
  })
  @HttpCode(HttpStatus.OK)
  @Patch()
  async patialUpdate(
    @Body() partialStudentDto: PartialStudentDto,
    @Req() req: CustomRequest,
  ) {
    const userId = req.user.id;

    const student = await this.studentsService.updateByUserId(
      userId,
      partialStudentDto,
    );

    return StudentAdapter.entityToDto(student);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a new curriculum' })
  @ApiOkResponse({
    description: 'The curriculum was successfully updated',
    type: StudentDto,
  })
  @ApiBadRequestResponse({
    description: 'Only pdf files are allowed',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1024 * 1024 * 5 },
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'application/pdf',
          'application/x-pdf',
          'application/x-bzpdf',
          'application/x-gzpdf',
          'application/pdf; charset=binary',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Only pdf files are allowed'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Patch('curriculum')
  async uploadCurriculum(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: CustomRequest,
  ) {
    const userId = req.user.id;
    const student = await this.studentsService.findByUserId(userId);

    if (!student) throw new NotFoundException('Student not found');
    if (student.curriculumUuid)
      await this.filesService.delete(student.curriculumUuid);

    const result = await this.filesService.upload(file);
    student.curriculumUuid = result.filename;

    const fileUrl = await this.filesService.getUrl(result.filename);
    if (!fileUrl) throw new NotFoundException('Error getting file URL');
    // student.curriculum = fileUrl;
    student.curriculum = `http://localhost:${this.configService.get(
      'PORT',
    )}/api/v1/minio/${result.filename}`;

    await this.studentsService.updateCurriculum(
      student.id,
      student.curriculum,
      student.curriculumUuid,
    );

    return StudentAdapter.entityToDto(student);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a new history' })
  @ApiOkResponse({
    description: 'The history was successfully updated',
    type: StudentDto,
  })
  @ApiBadRequestResponse({
    description: 'Only pdf files are allowed',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1024 * 1024 * 5 },
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'application/pdf',
          'application/x-pdf',
          'application/x-bzpdf',
          'application/x-gzpdf',
          'application/pdf; charset=binary',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Only pdf files are allowed'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Patch('history')
  async uploadHistory(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: CustomRequest,
  ) {
    const userId = req.user.id;
    const student = await this.studentsService.findByUserId(userId);

    if (!student) throw new NotFoundException('Student not found');
    if (student.historyUuid)
      await this.filesService.delete(student.historyUuid);

    const result = await this.filesService.upload(file);
    student.historyUuid = result.filename;

    const fileUrl = await this.filesService.getUrl(result.filename);
    if (!fileUrl) throw new NotFoundException('Error getting file URL');
    // student.history = fileUrl;
    student.history = `http://localhost:${this.configService.get(
      'PORT',
    )}/api/v1/minio/${result.filename}`;

    await this.studentsService.updateHitory(
      student.id,
      student.history,
      student.historyUuid,
    );

    return StudentAdapter.entityToDto(student);
  }
}
