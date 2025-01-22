// import { UserRole } from '@/entities/user-role'
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      token: string;
      refreshToken: string;
    };
  }
}

// declare module 'next-auth/jwt' {
//   interface JWT {
//     roles?: UserRole[]
//   }
// }
