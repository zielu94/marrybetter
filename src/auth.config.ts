import type { NextAuthConfig } from "next-auth";

export default {
  trustHost: true,
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.onboarded = user.onboarded;
        token.role = user.role || "COUPLE";
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        session.user.onboarded = token.onboarded as boolean;
        session.user.role = (token.role as string) || "COUPLE";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
