import {
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
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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

@ApiTags('Student', 'V1')
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
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

    console.log('student', student);

    return StudentAdapter.entityToDto(student);
  }
}
