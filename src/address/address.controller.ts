import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { AddressService } from './address.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/auth/decotaros/public.decorator';
import { AddressDto } from './dtos/address.dto';
import { AddressAdapter } from './address.adapter';
import { CustomRequest } from 'src/auth/interfaces/custon_request';
import { CreateOrUpdateAddressDto } from './dtos/create_or_update_address.dto';

@ApiTags('Address')
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Public()
  @ApiOperation({
    summary: 'Get address by user',
  })
  @ApiOkResponse({
    description: 'The address of the user',
    type: AddressDto,
  })
  @HttpCode(HttpStatus.OK)
  @Get(':userUuid')
  async findByUserUuid(@Param('userUuid') userUuid: string) {
    const address = await this.addressService.findByUserUuid(userUuid);

    if (!address) {
      throw new NotFoundException(
        `Address not found for user with uuid: ${userUuid}`,
      );
    }

    return AddressAdapter.entityToDto(address);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create or update address by user',
  })
  @ApiOkResponse({
    description: 'The address of the user has been created or updated',
    type: AddressDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post()
  async createOrUpdateAddress(
    @Body() addressDto: CreateOrUpdateAddressDto,
    @Req() req: CustomRequest,
  ) {
    const userId = req.user.id;
    const userUuid = req.user.uuid;

    const address = await this.addressService.createOrUpdateByUserId(
      userId,
      addressDto,
    );

    if (!address) {
      throw new NotFoundException(
        `Address not found for user with uuid: ${userUuid}`,
      );
    }

    return AddressAdapter.entityToDto(address);
  }
}
