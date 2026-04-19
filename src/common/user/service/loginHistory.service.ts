    import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginHistory } from '../entity/loginHistory.entity';

@Injectable()
export class LoginHistoryService {
  private readonly logger = new Logger(LoginHistoryService.name);

  constructor(
    @InjectRepository(LoginHistory)
    private loginHistoryRepository: Repository<LoginHistory>,
  ) {}

  async createLoginEntry(
    userId: string,
    loginId: string,
    locationId?: number,
    postId?: string,
  ): Promise<LoginHistory> {
    const loginEntry = this.loginHistoryRepository.create({
      userId,
      loginId,
      loginTime: new Date(),
      locationId,
      postId,
    });
    return this.loginHistoryRepository.save(loginEntry);
  }

  async updateLogoutEntry(historyId: number): Promise<LoginHistory> {
    const loginEntry = await this.loginHistoryRepository.findOne({
      where: { id: historyId },
    });
    if (!loginEntry) {
      throw new Error(`Login history entry with ID ${historyId} not found`);
    }
    loginEntry.logoutTime = new Date();
    return this.loginHistoryRepository.save(loginEntry);
  }
}
