export class LoginResponse {
  userId?: string;
  userRole?: string;
  otp?: number;
  accessToken: string;
  refreshToken?: string;
  nextPage?: string;
  timer?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  districtName?: string;
  talukaName?: string;
  registrationNumber?: string;
  gender?: string;
  role?: string;
  permission?: string[];
  hId?: number;
  [key: string]: any;
}
