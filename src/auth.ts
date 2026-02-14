import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";
import { LoginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // On initial sign-in, copy user fields
      if (user) {
        token.onboarded = user.onboarded;
        token.role = user.role || "COUPLE";
      }

      // Always refresh onboarded + role from DB so changes
      // (e.g. after onboarding completes) take effect immediately
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { onboarded: true, role: true },
        });
        if (dbUser) {
          token.onboarded = dbUser.onboarded;
          token.role = dbUser.role || "COUPLE";
        }
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
  providers: [
    Credentials({
      async authorize(credentials) {
        const validated = LoginSchema.safeParse(credentials);
        if (!validated.success) return null;

        const { email, password } = validated.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          onboarded: user.onboarded,
          role: user.role,
        };
      },
    }),
  ],
});
