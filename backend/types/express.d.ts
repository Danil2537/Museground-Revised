// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User as MyUserType } from './my-user.type';
declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email: string;
    }
  }
}
