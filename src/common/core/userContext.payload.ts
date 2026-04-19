import { UserType } from '@/common/user/enums/userTypes.enum';

export class UserContext {
  userId: string;
  loginId: string;
  role: string;
  permission: string[];
  departmentId: number;
  postId: string;
  postName: string;
  location: string;
  locationId: number;
  citizenId: number;
  userType: UserType;
  roleName: string;
  firstName: string;
  lastName: string;
}