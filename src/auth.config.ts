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
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        session.user.onboarded = token.onboarded as boolean;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
