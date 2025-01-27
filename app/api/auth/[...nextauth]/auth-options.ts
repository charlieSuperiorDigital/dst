import CredentialsProvider from "next-auth/providers/credentials";
import type {
  AuthOptions,
  User as NextAuthUser,
  Session as NextAuthSession,
} from "next-auth";
import axios from "axios";

interface User extends NextAuthUser {
  role: string;
  token: string;
}

interface Session extends NextAuthSession {
  user: {
    id: string;
    role: string;
    token: string;
  } & NextAuthSession["user"];
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/authorization/login`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          if (response.data.errorMessage) {
            throw new Error(
              response.data.errorMessage || "Authentication failed"
            );
          }

          return {
            id: response.data.userId,
            email: response.data.email,
            name: response.data.fullname,
            role: response.data.role,
            token: response.data.token,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error("Failed to connect to the authentication server");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extendedUser = user as User;
        token.id = extendedUser.id;
        token.email = extendedUser.email;
        token.name = extendedUser.name;
        token.role = extendedUser.role;
        token.token = extendedUser.token;
      }
      return token;
    },
    async session({ session, token }) {
      const extendedSession = session as Session;
      if (extendedSession.user) {
        extendedSession.user.id = token.id as string;
        extendedSession.user.email = token.email as string;
        extendedSession.user.name = token.name as string;
        extendedSession.user.token = token.token as string;
      }
      return extendedSession;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
