import CredentialsProvider from "next-auth/providers/credentials";
import type {
  AuthOptions,
  User as NextAuthUser,
  Session as NextAuthSession,
} from "next-auth";

// Extend the RequestInit type to include the agent property
interface ExtendedRequestInit extends RequestInit {
  agent?: unknown;
}

interface User extends NextAuthUser {
  role: string;
  token: string;
}

interface Session extends NextAuthSession {
  user: {
    id: string;
    role: string;
    accessToken: string;
  } & NextAuthSession["user"];
}

async function customFetch(url: string, options: ExtendedRequestInit = {}) {
  const { Agent } = await import("https");
  options.agent = new Agent({ rejectUnauthorized: false });

  return fetch(url, options as RequestInit);
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "login", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const res = await customFetch(
            `${process.env.NEXT_PUBLIC_API_URL}/authorization/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                login: credentials.login,
                password: credentials.password,
              }),
            }
          );

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.errorMessage || "Authentication failed");
          }

          const data = await res.json();
          return {
            id: data.userId,
            email: data.email,
            name: data.fullname,
            token: data.token,
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
        token.accessToken = extendedUser.token;
      }
      return token;
    },

    async session({ session, token }) {
      const extendedSession = session as Session;
      if (extendedSession.user) {
        extendedSession.user.id = token.id as string;
        extendedSession.user.email = token.email as string;
        extendedSession.user.name = token.name as string;
        extendedSession.user.role = token.role as string;
        extendedSession.user.accessToken = token.accessToken as string;
      }
      return extendedSession;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
