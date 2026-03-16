import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async findOneByEmail(email: string): Promise<User | null> {
        this.logger.debug(`Executing DB query: findOneByEmail for ${email}`);
        return this.userRepository.createQueryBuilder("user")
            .where("user.loginId = :email", { email })
            .addSelect("user.password")
            .getOne();
    }

    async findByLoginId(email: string): Promise<User | null> {
        return this.findOneByEmail(email);
    }

    async findById(id: string | number): Promise<User | null> {
        this.logger.debug(`Executing DB query: findById for ID ${id}`);
        return this.userRepository.findOne({ where: { id: Number(id) } });
    }

    async comparePassword(plain: string, hashed: string): Promise<boolean> {
        return await bcrypt.compare(plain, hashed);
    }

    async create(userData: Partial<User>): Promise<User> {
        this.logger.debug(`Executing DB query: creating new user record`);
        // Hash the password securely using bcrypt before saving
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }
        
        const user = this.userRepository.create(userData);
        const savedUser = await this.userRepository.save(user);
        this.logger.debug(`Successfully created user record with ID ${savedUser.id}`);
        return savedUser;
    }
}
