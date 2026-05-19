import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { In, Repository } from 'typeorm';
import { AuthService } from 'src/common/auth/auth.service';
import { UserTokenPayload } from 'src/common/auth/types/userToken.payload';
import { CachingUtil } from 'src/common/core/utils/caching.util';
import {
    checkPasswordValidation,
    isBcryptHash,
} from 'src/common/core/utils/utilities.util';
import { DeepPartial } from 'typeorm';
import { UserAdminPersonalDetailsService } from 'src/userAdmin/service/personalDetails.service';
import { PostDetailsService } from 'src/userAdmin/service/postDetails.service';
import { PostManagerMappingService } from 'src/userAdmin/service/postManagerMapping.service';
import { PostPermissionService } from 'src/userAdmin/service/postPermission.service';
import { PostPersonMappingService } from 'src/userAdmin/service/postPersonMapping.service';
import { BlackListTokenService } from '@/common/auth/services/blackListToken.service';
import { CreateUserDto } from '../dto/createUser.dto';
import { RoleCode } from '../enums/roleCode.enum';
import { UserStatus } from '../enums/userStatus.enum';
import { ChangePasswordDto, UserLoginDto, RegisterDto } from '../dto/userLogin.dto';
import { UserType } from '../enums/userTypes.enum';
import { User } from '../entity/user.entity';
import { Role } from '../entity/role.entity';
import { Applicant } from '../entity/applicant.entity';
import { LoginResponse } from '../types/loginResponse.type';
import { RoleService } from './role.service';
import { LoginHistoryService } from './loginHistory.service';
import { EmailService } from '../../mailer/mailer.service';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        private readonly authService: AuthService,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Role)
        private roleRepo: Repository<Role>,
        private readonly roleService: RoleService,
        private readonly postPersonMappingService: PostPersonMappingService,
        private readonly postPermissionMappingService: PostPermissionService,
        private readonly postDetailsService: PostDetailsService,
        private readonly postManagerMappingService: PostManagerMappingService,
        @Inject(forwardRef(() => UserAdminPersonalDetailsService))
        private readonly personDetailsService: UserAdminPersonalDetailsService,
        private readonly jwtService: JwtService,
        private readonly blackListService: BlackListTokenService,
        private readonly cachingUtil: CachingUtil,
        private readonly loginHistoryService: LoginHistoryService,
        @InjectRepository(Applicant)
        private applicantRepo: Repository<Applicant>,
        private readonly emailService: EmailService,
    ) { }

    /**
     * System Initialization: Register the first user as Super Admin.
     */
    async initializeSuperAdmin(registerDto: RegisterDto): Promise<any> {
        try {
            const { mobile, password } = registerDto;
            this.logger.log(`Super Admin initialization attempt for mobile: ${mobile}`);

            // 1. Check if user already exists
            const existingUser = await this.userRepo.findOne({
                where: [{ loginId: mobile }, { aliasName: mobile }]
            });
            if (existingUser) {
                throw new HttpException('User with this mobile number already exists', HttpStatus.BAD_REQUEST);
            }

            // 2. Check if this is the first user in the system
            const userCount = await this.userRepo.count();
            if (userCount > 0) {
                throw new HttpException('System is already initialized. Super Admin exists.', HttpStatus.FORBIDDEN);
            }

            // 3. Register/Create Personal Details
            if (!registerDto.firstName || !registerDto.lastName || !registerDto.email) {
                throw new HttpException('First name, Last name and Email are required for registration.', HttpStatus.BAD_REQUEST);
            }

            const personalDetails = await this.personDetailsService.registerUserByMobile({
                mobileNumber: mobile,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                email: registerDto.email
            });

            this.logger.log('Setting up Super Admin.');
            
            // a. Ensure SUPER_ADMIN role exists
            let superAdminRole = await this.roleRepo.findOne({ 
                where: { code: RoleCode.SUPER_ADMIN } 
            });
            
            if (!superAdminRole) {
                superAdminRole = await this.roleService.create({
                    code: RoleCode.SUPER_ADMIN,
                    name: 'Super Admin'
                });
            }

            if (!superAdminRole) {
                throw new HttpException('Failed to create or find Super Admin role', HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // Ensure all post details are provided
            if (!registerDto.postName || !registerDto.departmentName || !registerDto.location || !registerDto.ofcAddress) {
                throw new HttpException('Post details (Name, Department, Location, Office Address) are required for Super Admin initialization.', HttpStatus.BAD_REQUEST);
            }

            // b. Create a Post for Super Admin
            const post = await this.postDetailsService.create({
                postName: registerDto.postName,
                roleId: superAdminRole.id,
                roleName: superAdminRole.name,
                departmentName: registerDto.departmentName,
                locationId: registerDto.locationId || 1, 
                location: registerDto.location,
                ofcAddress: registerDto.ofcAddress,
                email: registerDto.email,
                phoneNumber: mobile,
                aliasName: registerDto.aliasName || mobile
            });

            // c. Map person to post
            await this.postPersonMappingService.mapping(post.id, personalDetails.id, {
                startDate: new Date().toISOString().split('T')[0]
            });

            // d. Update the user password
            const hashedPassword = await bcrypt.hash(password, 10);
            await this.userRepo.update(post.id, {
                password: hashedPassword,
                status: UserStatus.ACTIVE,
                changePasswordRequired: false,
                userType: UserType.ADMIN
            });

            return { success: true, message: 'Super Admin registered successfully' };

        } catch (error) {
            this.logger.error(`Super Admin initialization failed: ${error.message}`);
            if (error instanceof HttpException) throw error;
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private async generateNextLoginId(): Promise<string> {
        const lastUser = await this.userRepo.createQueryBuilder('user')
            .where('user.loginId LIKE :prefix', { prefix: 'OVS-%' })
            .orderBy('user.loginId', 'DESC')
            .getOne();

        if (!lastUser || !lastUser.loginId) {
            return 'OVS-0001';
        }

        const lastIdStr = lastUser.loginId.replace('OVS-', '');
        const lastIdNum = parseInt(lastIdStr, 10);
        const nextIdNum = lastIdNum + 1;
        return `OVS-${nextIdNum.toString().padStart(4, '0')}`;
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        try {
            const rawPassword = createUserDto.password || '';
            const passwordValidationMsg = checkPasswordValidation(rawPassword);
            if (passwordValidationMsg) {
                throw new HttpException(passwordValidationMsg, HttpStatus.BAD_REQUEST);
            }

            // Generate Serial Login ID
            const loginId = await this.generateNextLoginId();
            this.logger.log(`Generated Serial Login ID: ${loginId}`);

            const passwordToStore = isBcryptHash(rawPassword)
                ? rawPassword
                : await bcrypt.hash(rawPassword, 10);

            // Separate User fields from Profile fields
            const { 
                firstName, lastName, email, departmentName, location, ofcAddress,
                ...userFields 
            } = createUserDto;

            const newUser = this.userRepo.create({
                ...userFields,
                loginId: loginId, // Use generated series ID
                password: passwordToStore,
                changePasswordRequired: true,
                resetRequired: createUserDto.resetRequired ?? true,
                lastPasswordChanged: new Date(),
                aliasName: loginId, // Set alias as loginId for consistency
            });
            const savedUser = await this.userRepo.save(newUser);

            // Create Personal Details if any profile info provided
            if (firstName || lastName || email) {
                await this.personDetailsService.create({
                    firstName,
                    lastName: lastName || '',
                    email: email || '',
                    mobileNumber: createUserDto.loginId || '', // Using provided mobile for profile
                    personUniqueId: savedUser.loginId, // Crucial: link profile to loginId (OVS-xxxx)
                    department: departmentName,
                    state: location,
                    status: 'ACTIVE'
                });
            }

            return savedUser;

        } catch (error) {
            const status =
                error instanceof HttpException
                    ? error.getStatus()
                    : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new HttpException(
                (error as HttpException).message || (error as Error).message,
                status,
            );
        }
    }

    async findAll(): Promise<User[]> {
        return this.userRepo.find({
            order: { id: 'DESC' },
            select: [
                'id',
                'loginId',
                'userType',
                'status',
                'email',
                'aliasName',
                'lastLoggedIn',
                'changePasswordRequired',
            ],
        });
    }

    async login(userLoginDto: UserLoginDto): Promise<LoginResponse | any> {
        try {
            const loginId = userLoginDto.loginId?.trim() || '';
            this.logger.log(`Login attempt for loginId: ${loginId}`);
            if (!loginId) {
                this.logger.warn('Login failed: empty loginId');
                throw new HttpException(
                    'Invalid login credentials.',
                    HttpStatus.UNAUTHORIZED,
                );
            }
            let userDetails = await this.userRepo.findOne({
                where: { aliasName: loginId },
            });
            if (!userDetails) {
                userDetails = await this.userRepo.findOne({
                    where: { aliasName: loginId.toLowerCase() },
                });
            }
            if (!userDetails) {
                userDetails = await this.userRepo.findOne({
                    where: { loginId },
                });
            }
            if (!userDetails) {
                this.logger.warn(
                    `Login failed - no user found for loginId/aliasName: ${loginId}`,
                );
                throw new HttpException(
                    'Invalid login credentials.',
                    HttpStatus.UNAUTHORIZED,
                );
            }
            this.logger.log(
                `User found: id=${userDetails.id}, loginId=${userDetails.loginId}, aliasName=${userDetails.aliasName}`,
            );
            await this.userRepo.update(userDetails.id, {
                lastLoggedIn: new Date(),
            });

            const plainPassword = userLoginDto.password?.trim() || '';
            if (!plainPassword || !userDetails.password) {
                this.logger.warn(
                    `Login failed - password missing for loginId: ${loginId}`,
                );
                throw new HttpException(
                    'Password validation failed.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
            const isPasswordMatched = await bcrypt.compare(
                plainPassword,
                userDetails.password,
            );
            if (!isPasswordMatched) {
                this.logger.warn(
                    `Login failed - password mismatch for loginId: ${loginId}`,
                );
                throw new HttpException(
                    'Invalid login credentials.',
                    HttpStatus.UNAUTHORIZED,
                );
            }
            this.logger.log(`Password matched for loginId: ${loginId}`);
            
            const newUserToken = new UserTokenPayload();
            newUserToken.userId = userDetails.id;
            newUserToken.loginId = userLoginDto.loginId;
            newUserToken.userType = userDetails.userType;
            newUserToken.mimic = false;
            newUserToken.permissions = [];

            let personalDetails: any;
            let postDetails: any;

            if (userDetails.userType === UserType.APPLICANT) {
                const applicant = await this.applicantRepo.findOne({
                    where: { userId: userDetails.id }
                });
                if (!applicant) {
                    throw new HttpException('Applicant details not found.', HttpStatus.NOT_FOUND);
                }
                personalDetails = applicant;
                // Applicants don't have posts yet
                newUserToken.postName = 'Applicant';
                newUserToken.locationId = 1;
                newUserToken.postId = '';
                newUserToken.departmentId = 0;
            } else {
                // Try finding by serial ID (OVS-xxxx)
                personalDetails = await this.personDetailsService.getPersonalDetailsByLoginId(
                    userDetails.loginId || userLoginDto.loginId,
                );

                // Fallback: If profile mismatch (e.g. from older test data), try finding by mobile number
                if (!personalDetails && userDetails.loginId) {
                    personalDetails = await this.personDetailsService.findByMobileNumber(userDetails.loginId);
                }

                if (!personalDetails) {
                    this.logger.warn(`Login failed - personal details not found for loginId: ${loginId}`);
                    throw new HttpException('Personal details not found.', HttpStatus.UNAUTHORIZED);
                }

                // Get Post Details (if assigned)
                try {
                    const postPersonMapping = await this.postPersonMappingService.findMappingByPersonId(personalDetails.id);
                    postDetails = await this.postDetailsService.getById(postPersonMapping.postId);
                    
                    newUserToken.postName = postDetails.postName;
                    newUserToken.locationId = postDetails.locationId;
                    newUserToken.postId = postDetails.id;
                    newUserToken.departmentId = personalDetails.departmentId || 0;
                } catch (e) {
                    this.logger.log(`User ${loginId} has no active post mapping. Proceeding with limited access.`);
                    newUserToken.postName = 'Staff';
                    newUserToken.locationId = 1;
                    newUserToken.postId = '';
                    newUserToken.departmentId = 0;
                }
            }

            const loginHistoryEntry = await this.loginHistoryService.createLoginEntry(
                personalDetails.id,
                userDetails.loginId || userLoginDto.loginId,
                newUserToken.locationId || 1,
                newUserToken.postId || '',
            );

            newUserToken.firstName = personalDetails.firstName;
            newUserToken.lastName = personalDetails.lastName;
            newUserToken.gender = personalDetails.gender;
            newUserToken.districtName = personalDetails.districtName;
            newUserToken.talukaName = personalDetails.talukaName;

            let response: any = await this.userDetailsConstruct(
                userDetails,
                newUserToken,
            );
            if (!response || typeof response !== 'object') response = {};

            const token =
                await this.authService.generateJWTTokenWithRefresh(newUserToken);
            response.accessToken = token.accessToken;
            response.refreshToken = token.refreshToken;
            response.firstName = personalDetails.firstName;
            response.lastName = personalDetails.lastName;
            response.gender = personalDetails.gender;
            response.districtName = personalDetails.districtName;
            response.talukaName = personalDetails.talukaName;
            response.hId = loginHistoryEntry.id;

            for (const key in userDetails) {
                response[key] = (userDetails as any)[key];
            }
            const safeResponse = { ...response };
            delete (safeResponse as any).password;
            await this.cachingUtil.setCache(
                userLoginDto.loginId,
                safeResponse,
                86400,
            );
            this.logger.log(`Login successful for loginId: ${userLoginDto.loginId}`);
            return safeResponse;
        } catch (error) {
            if (error instanceof HttpException) {
                this.logger.warn(
                    `Login failed (${error.getStatus()}): ${error.message}`,
                );
                throw error;
            }
            this.logger.error(
                `Login error: ${(error as Error).message}`,
                (error as Error).stack,
            );
            throw new HttpException(
                (error as Error).message,
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

    private async userDetailsConstruct(
        userDetails: User,
        newUserToken: UserTokenPayload,
    ): Promise<any> {
        const supportedTypes = [
            UserType.ADMIN,
            UserType.CANDIDATE,
            UserType.VOTER,
            UserType.APPLICANT,
        ];
        if (!supportedTypes.includes(userDetails.userType)) {
            return {};
        }

        if (userDetails.userType === UserType.APPLICANT) {
            return {
                role: 'APPLICANT',
                userType: UserType.APPLICANT,
                permissions: []
            };
        }
        const personloginid = await this.userRepo.findOne({
            where: { id: userDetails.id },
            select: ['loginId'],
        });
        if (!personloginid?.loginId) return {};
        const persondetails =
            await this.personDetailsService.getPersonalDetailsByLoginId(
                personloginid.loginId,
            );
        if (!persondetails) return {};
        const postAssignedToUser =
            await this.postPersonMappingService.findMappingByPersonId(
                persondetails.id,
            );
        const rolesAndPermissionsForPost =
            await this.postPermissionMappingService.fetchPermissionsByPostId(
                postAssignedToUser.postId,
            );
        const postDetails = await this.postDetailsService.getById(
            postAssignedToUser.postId,
        );
        const rolesAssignedToPost: string[] = [];
        const permissionsForPost: string[] = [];
        for (const postPermissionRow of rolesAndPermissionsForPost) {
            const roleDetails = await this.roleService.findById(
                postPermissionRow.roleId,
            );
            if (!rolesAssignedToPost.includes(roleDetails.name)) {
                rolesAssignedToPost.push(roleDetails.name);
            }
            if (!permissionsForPost.includes(postPermissionRow.permissionId)) {
                permissionsForPost.push(postPermissionRow.permissionId);
            }
        }
        const managersAssignedToPost =
            await this.postManagerMappingService.getManagersAssignedToPostByPostId(
                postAssignedToUser.postId,
            );
        const managerIds = managersAssignedToPost
            .map((m: any) => m.personalDetails?.id)
            .filter(Boolean);
        const managerPersonalDetails =
            await this.personDetailsService.getPeronalDetailsByUserIds(managerIds);
        const managersWithPostDetails: any[] = [];
        for (const personalDetails of managerPersonalDetails) {
            const managerMapping = managersAssignedToPost.find(
                (m: any) => m.personalDetails?.id === personalDetails.id,
            );
            if (!managerMapping) continue;
            const postAssignedToManager = await this.postPersonMappingService
                .findMappingByPersonId(personalDetails.id)
                .catch(() => null);
            if (!postAssignedToManager) continue;
            managersWithPostDetails.push({
                postId: managerMapping.postId,
                managerId: managerMapping.managerId,
                firstName: managerMapping.personalDetails?.firstName,
                lastName: managerMapping.personalDetails?.lastName,
                name: postDetails?.postName,
                location: postDetails?.location,
                personId: managerMapping.personalDetails?.personUniqueId,
                personName:
                    `${managerMapping.personalDetails?.firstName || ''} ${managerMapping.personalDetails?.lastName || ''}`.trim(),
                mobileNumber: managerMapping.personalDetails?.mobileNumber,
                email: managerMapping.personalDetails?.email,
                districtName: managerMapping.personalDetails?.districtName,
                talukaName: managerMapping.personalDetails?.talukaName,
            });
        }
        newUserToken.role = rolesAssignedToPost[0] || userDetails.userType || '';
        newUserToken.postId = postAssignedToUser.postId;
        newUserToken.postName = postDetails?.postName || '';
        newUserToken.managersAssignedToPost = managersWithPostDetails;
        return {
            role: newUserToken.role,
            permission: permissionsForPost,
            managersAssignedToPost: managersWithPostDetails,
            postDetails,
        };
    }

    async me(refreshTokenFromClient: string): Promise<any> {
        try {
            const userDetailsFromToken = this.jwtService.decode(
                refreshTokenFromClient,
                {
                    complete: false,
                },
            ) as any;
            if (!userDetailsFromToken || typeof userDetailsFromToken === 'string') {
                throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
            }
            await this.jwtService.verifyAsync(refreshTokenFromClient, {
                secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            });
            await this.blackListService.blacklistToken(
                refreshTokenFromClient,
                Number(process.env.REFRESH_EXPIRY) || 604800,
                'blacklist',
            );
            const { accessToken, refreshToken } =
                await this.authService.generateJWTTokenWithRefresh(
                    userDetailsFromToken,
                );
            const userDetailsDB = await this.userRepo.findOne({
                where: { loginId: userDetailsFromToken.loginId },
            });
            let response: any = {};
            if (userDetailsDB) {
                const payload = new UserTokenPayload();
                payload.userId = userDetailsFromToken.userId;
                payload.loginId = userDetailsFromToken.loginId;
                response = await this.userDetailsConstruct(userDetailsDB, payload);
            }
            response.accessToken = accessToken;
            response.refreshToken = refreshToken;
            if (userDetailsDB) {
                for (const key in userDetailsDB) {
                    response[key] = (userDetailsDB as any)[key];
                }
            }
            return response;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                (error as Error).message,
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

    async isUserExists(loginId: string): Promise<boolean> {
        const user = await this.userRepo.findOne({
            where: { loginId },
        });
        return !!user;
    }

    async isUserExistsById(id: string): Promise<User> {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return user;
    }

    async findByIds(ids: string[]): Promise<User[]> {
        return this.userRepo.find({ where: { id: In(ids) } });
    }

    async changePassword(
        userContext: { loginId: string },
        changePasswordDto: ChangePasswordDto,
    ): Promise<{ message: string }> {
        const user = await this.userRepo.findOne({
            where: { loginId: userContext.loginId },
            select: ['id', 'password'],
        });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        const isPasswordMatched = await bcrypt.compare(
            changePasswordDto.oldPassword,
            user.password,
        );
        if (!isPasswordMatched) {
            throw new HttpException('Invalid old password', HttpStatus.BAD_REQUEST);
        }
        const minLength = 6;
        const maxLength = 20;
        if (
            !changePasswordDto.newPassword ||
            changePasswordDto.newPassword.length < minLength ||
            changePasswordDto.newPassword.length > maxLength
        ) {
            throw new HttpException(
                `Password must be between ${minLength} and ${maxLength} characters`,
                HttpStatus.BAD_REQUEST,
            );
        }
        if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
            throw new HttpException(
                'New password and confirm password do not match',
                HttpStatus.BAD_REQUEST,
            );
        }
        const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
        await this.userRepo.update(user.id, {
            password: hashedPassword,
            changePasswordRequired: false,
        });
        return { message: 'Password changed successfully' };
    }

    async forgotPassword(loginIdOrEmail: string): Promise<{ message: string }> {
        const user = await this.userRepo.findOne({
            where: [
                { loginId: loginIdOrEmail },
                { email: loginIdOrEmail },
                { aliasName: loginIdOrEmail }
            ]
        });

        if (!user) {
            throw new HttpException('User not found with provided identifier', HttpStatus.NOT_FOUND);
        }

        if (!user.email) {
            throw new HttpException('No email associated with this account. Please contact admin.', HttpStatus.BAD_REQUEST);
        }

        // Generate random 8-character password
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        await this.userRepo.update(user.id, {
            password: hashedPassword,
            changePasswordRequired: true,
            lastPasswordChanged: new Date()
        });

        // Send email directly (using HTML template)
        await this.emailService.sendPasswordResetEmail(user.email, tempPassword);

        return { message: 'A new temporary password has been sent to your registered email address.' };
    }

    async logout(
        bearerToken: string | null,
        CachingUtil: CachingUtil,
        loginId?: string,
        hId?: number,
    ): Promise<{ success: boolean }> {
        if (hId) {
            try {
                await this.loginHistoryService.updateLogoutEntry(hId);
            } catch (e) {
                this.logger.warn(
                    `Error updating login history: ${(e as Error).message}`,
                );
            }
        }
        if (loginId) {
            const user = await this.userRepo.findOne({
                where: { loginId },
                select: ['id'],
            });
            if (user) {
                await this.userRepo.update(user.id, {
                    lastLoggedOut: new Date(),
                });
            }
            try {
                await CachingUtil.deleteCache(loginId);
            } catch (e) {
                this.logger.warn(`Error clearing cache: ${(e as Error).message}`);
            }
        }
        if (bearerToken) {
            try {
                const expiresInSeconds = 3600;
                await this.blackListService.blacklistToken(
                    bearerToken,
                    expiresInSeconds,
                    'blacklist',
                );
            } catch (e) {
                this.logger.warn(`Error blacklisting token: ${(e as Error).message}`);
            }
        }
        return { success: true };
    }
}
