export class UserTokenPayload {
  userId: string;
  loginId: string;
  role: string;
  expiresIn?: number;
  permissions: string[];
  departmentId: number;
  postId: string;
  postName: string;
  managersAssignedToPost: unknown;
  locationId: number;
  locationName: string;
  firstName: string;
  lastName: string;
  districtName: string;
  talukaName: string;
  gender: string;
  mimic: boolean;
}