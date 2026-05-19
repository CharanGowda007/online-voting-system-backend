import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/auth/guards/permissions.guard';
import { Permissions } from '@/common/auth/decorators/permissions.decorator';
import { ApplicantService } from '../service/applicant.service';
import { RegisterDto } from '../dto/userLogin.dto';

@ApiTags('Applicants')
@Controller('applicants')
export class ApplicantController {
  constructor(private readonly applicantService: ApplicantService) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Public registration for applicants (voters)' })
  @ApiResponse({ status: 201, description: 'Applicant registered' })
  async register(@Body() registerDto: RegisterDto) {
    return this.applicantService.register(registerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('APPLICANT:VIEW')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all applicants (Admin only)' })
  async list() {
    return this.applicantService.findAll();
  }
}
