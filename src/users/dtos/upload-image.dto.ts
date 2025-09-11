import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarResponseDto {
  @ApiProperty({
    example:
      'https://minio.example.com/bucket/profile_picture/2024/09/user_1/avatar_123456789.jpg?expires=3600',
    description: 'URL temporária do avatar carregado',
  })
  avatarUrl: string;

  @ApiProperty({
    example: 'avatar_123456789.jpg',
    description: 'Nome do arquivo gerado',
  })
  filename: string;
}

export class UploadBannerResponseDto {
  @ApiProperty({
    example:
      'https://minio.example.com/bucket/banner_picture/2024/09/user_1/banner_123456789.jpg?expires=3600',
    description: 'URL temporária do banner carregado',
  })
  bannerUrl: string;

  @ApiProperty({
    example: 'banner_123456789.jpg',
    description: 'Nome do arquivo gerado',
  })
  filename: string;
}

export class ImageUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo de imagem (JPEG, PNG, WebP)',
  })
  file: Express.Multer.File;
}
