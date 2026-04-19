import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePostPermissionDto {
  @ApiProperty({
    example: 'post-uuid-here',
    description: 'Post details ID (UUID)',
  })
  @IsString()
  @IsNotEmpty()
  postId: string;

  @ApiProperty({ example: 1, description: 'Role ID from role table' })
  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty({
    example: 'permission-uuid-or-code',
    description: 'Permission ID or code',
  })
  @IsString()
  @IsNotEmpty()
  permissionId: string;
}