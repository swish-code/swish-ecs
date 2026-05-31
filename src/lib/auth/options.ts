import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { findAuthenticatedAppUserByEmail, type AuthenticatedAppUser } from "@/lib/auth/repository";
import { env, hasMicrosoftAuthConfig } from "@/lib/env";

type AppToken = {
  appUser?: AuthenticatedAppUser;
};

type AppSessionShape = {
  appUser?: AuthenticatedAppUser;
  user?: {
    email?: string | null;
    name?: string | null;
  };
};

export const authOptions: NextAuthOptions = {
  providers: hasMicrosoftAuthConfig()
    ? [
        AzureADProvider({
          clientId: env.AZURE_CLIENT_ID ?? "",
          clientSecret: env.AZURE_CLIENT_SECRET ?? "",
          tenantId: env.AZURE_TENANT_ID ?? "",
          authorization: {
            params: {
              scope: "openid profile email User.Read",
              prompt: "select_account",
            },
          },
        }),
      ]
    : [],
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, profile }) {
      const microsoftProfile = profile as { email?: string } | undefined;
      const email = (user.email ?? microsoftProfile?.email)?.trim().toLowerCase();

      if (!email) {
        return false;
      }

      return Boolean(await findAuthenticatedAppUserByEmail(email));
    },
    async jwt({ token, user, profile }) {
      const appToken = token as typeof token & AppToken;

      if (appToken.appUser) {
        return appToken;
      }

      const microsoftProfile = profile as { email?: string } | undefined;
      const email = (user?.email ?? microsoftProfile?.email ?? token.email)?.trim().toLowerCase();

      if (!email) {
        return appToken;
      }

      appToken.appUser = (await findAuthenticatedAppUserByEmail(email)) ?? undefined;
      return appToken;
    },
    async session({ session, token }) {
      const appSession = session as AppSessionShape;
      const appToken = token as typeof token & AppToken;

      appSession.appUser = appToken.appUser;

      if (appToken.appUser && appSession.user) {
        appSession.user.email = appToken.appUser.email;
        appSession.user.name = appToken.appUser.displayName;
      }

      return session;
    },
  },
};