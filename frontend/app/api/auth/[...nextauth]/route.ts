import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Email/Password with NestJS backend
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEST_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const user = await res.json();
          if (!res.ok || !user) throw new Error("Invalid login");

          return user; // must contain { id, name, email }
        } catch (err) {
          console.error("Auth error", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user; // attach Nest user
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as
        | {
            name?: string | null | undefined;
            email?: string | null | undefined;
            image?: string | null | undefined;
          }
        | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login", // custom login page
  },
});

export { handler as GET, handler as POST };
