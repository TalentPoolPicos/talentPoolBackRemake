import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User', 'V1')
@Controller('users')
export class UsersController {}
