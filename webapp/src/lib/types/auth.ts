import { User } from "./user";

export interface AuthResult {
  success: boolean;
  user?: Partial<User>;
  error?: string;
}
