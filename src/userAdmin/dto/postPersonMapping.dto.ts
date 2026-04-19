import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePostPersonMappingDto {
  @ApiProperty({
    example: 'post-uuid-here',
    description: 'Post details ID (UUID)',
  })
  @IsOptional()
  @IsString()
  postId?: string;

  @ApiProperty({
    example: 'person-uuid-here',
    description: 'Personal details ID (UUID)',
  })
  @IsOptional()
  @IsString()
  personId?: string;

  @ApiProperty({
    example: 'post-uuid-here',
    description: 'Post ID (snake_case alternative)',
  })
  @IsOptional()
  @IsString()
  post_id?: string;

  @ApiProperty({
    example: 'person-uuid-here',
    description: 'Person ID (snake_case alternative)',
  })
  @IsOptional()
  @IsString()
  person_id?: string;

  @ApiProperty({ required: false, example: '2025-01-01 00:00:00' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2026-12-31 23:59:59' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

/** For update (PUT :id) – same shape; id from route. */
export class PostPersonMappingDTO extends CreatePostPersonMappingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  id?: number;

  @ApiProperty({ required: false, enum: ['ACTIVE', 'INACTIVE'] })
  @IsOptional()
  status?: string;
}