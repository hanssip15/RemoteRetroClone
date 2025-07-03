import { getServerSession } from "next-auth/next"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { config, validateConfig } from "./config"

// Validate configuration on import
try {
  validateConfig()
} catch (error) {
  console.error('❌ Auth configuration error:', error)
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: config.google.clientId!,
      clientSecret: config.google.clientSecret!,
    }),
  ],
  secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.user.id = token.userId
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

export function getSession() {
  return getServerSession(authOptions)
} 