import {
  Controller,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationCleanupService } from '../notifications/notification-cleanup.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decotaros/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly notificationCleanupService: NotificationCleanupService,
  ) {}

  @Post('notifications/cleanup')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN) // Apenas admin pode executar limpeza manual
  @ApiOperation({
    summary: 'Executar limpeza manual de notificações',
    description: 'Remove notificações lidas antigas e expiradas do sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Limpeza executada com sucesso',
  })
  async cleanupNotifications(@Query('daysOld') daysOld?: string) {
    this.logger.log(
      'Iniciando limpeza manual de notificações via endpoint administrativo',
    );

    try {
      const daysNumber = daysOld ? parseInt(daysOld, 10) : undefined;

      if (daysOld && daysNumber && (isNaN(daysNumber) || daysNumber < 1)) {
        return {
          success: false,
          message: 'Parâmetro daysOld deve ser um número positivo',
          data: null,
        };
      }

      const result =
        await this.notificationCleanupService.manualCleanup(daysNumber);

      this.logger.log(`Limpeza manual concluída: ${result.message}`);

      return {
        success: true,
        message: 'Limpeza executada com sucesso',
        data: result,
      };
    } catch (error) {
      this.logger.error('Erro durante limpeza manual de notificações:', error);

      return {
        success: false,
        message: 'Erro interno durante a limpeza',
        data: null,
      };
    }
  }
}
