import { UserRole } from '../utils/constants';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        phone: string;
        role: UserRole;
        isAdmin: boolean;
      };
    }
  }
}
export {};
