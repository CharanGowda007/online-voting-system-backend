import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Applicant } from '../entity/applicant.entity';
import { User } from '../entity/user.entity';
import { Role } from '../entity/role.entity';
import { RoleCode } from '../enums/roleCode.enum';
import { UserStatus } from '../enums/userStatus.enum';
import { UserType } from '../enums/userTypes.enum';
import { RegisterDto } from '../dto/userLogin.dto';
import { RoleService } from './role.service';
import { EmailService } from '../../mailer/mailer.service';

@Injectable()
export class ApplicantService {
    private readonly logger = new Logger(ApplicantService.name);

    constructor(
        @InjectRepository(Applicant)
        private applicantRepo: Repository<Applicant>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Role)
        private roleRepo: Repository<Role>,
        private readonly roleService: RoleService,
        private readonly emailService: EmailService,
    ) {}

    /**
     * Public registration for standard applicants (voters).
     */
    async register(registerDto: RegisterDto): Promise<any> {
        try {
            const { mobile } = registerDto;
            this.logger.log(`Applicant registration attempt for mobile: ${mobile}`);

            // 1. Check if user already exists
            const existingUser = await this.userRepo.findOne({
                where: [{ loginId: mobile }, { aliasName: mobile }]
            });
            if (existingUser) {
                throw new HttpException('User with this mobile number already exists', HttpStatus.BAD_REQUEST);
            }

            // Generate random 8-character password
            const password = Math.random().toString(36).slice(-8);

            // 2. Ensure APPLICANT role exists
            let applicantRole = await this.roleRepo.findOne({ 
                where: { code: RoleCode.APPLICANT } 
            });
            
            if (!applicantRole) {
                applicantRole = await this.roleService.create({
                    code: RoleCode.APPLICANT,
                    name: 'Applicant'
                });
            }

            // 3. Create Applicant Record
            const applicant = this.applicantRepo.create({
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                email: registerDto.email,
                mobileNumber: mobile,
                location: registerDto.location,
                ofcAddress: registerDto.ofcAddress,
                departmentName: registerDto.departmentName,
                status: 'PENDING'
            });
            const savedApplicant = await this.applicantRepo.save(applicant);

            // 4. Create User Account
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = this.userRepo.create({
                loginId: mobile,
                password: hashedPassword,
                status: UserStatus.ACTIVE,
                userType: UserType.APPLICANT,
                changePasswordRequired: true
            });
            const savedUser = await this.userRepo.save(user);

            // 5. Link User to Applicant
            savedApplicant.userId = savedUser.id;
            await this.applicantRepo.save(savedApplicant);

            // 6. Send Password to Email directly (using HTML template)
            if (registerDto.email) {
                await this.emailService.sendRegistrationEmail(
                    registerDto.email,
                    registerDto.firstName || 'User',
                    mobile,
                    password
                );
            }

            return { success: true, message: 'Registration successful. Your application is pending review.' };
        } catch (error) {
            this.logger.error(`Applicant registration failed: ${error.message}`);
            if (error instanceof HttpException) throw error;
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(): Promise<Applicant[]> {
        return this.applicantRepo.find({
            order: { createdAt: 'DESC' }
        });
    }

    async findById(id: string): Promise<Applicant> {
        const applicant = await this.applicantRepo.findOne({ where: { id } });
        if (!applicant) {
            throw new HttpException('Applicant not found', HttpStatus.NOT_FOUND);
        }
        return applicant;
    }
}
