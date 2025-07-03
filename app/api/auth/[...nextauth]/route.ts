import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { config, validateConfig } from "@/lib/config"

// Validate configuration
try {
  validateConfig()
} catch (error) {
  console.error('❌ NextAuth configuration error:', error)
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: config.google.clientId!,
      clientSecret: config.google.clientSecret!,
    }),
  ],
  secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account && user) {
        token.accessToken = account.access_token
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken
      session.user.id = token.userId
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
})

export { handler as GET, handler as POST } 