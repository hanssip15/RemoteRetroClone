import { NextResponse } from "next/server"
import { config } from "@/lib/config"

export async function GET() {
  try {
    // Check environment variables (without exposing secrets)
    const envCheck = {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasViteBackendUrl: !!process.env.VITE_BACKEND_URL,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    }

    // Check config values (without exposing secrets)
    const configCheck = {
      backendUrl: config.backendUrl,
      hasGoogleConfig: !!config.google.clientId && !!config.google.clientSecret,
      hasNextAuthConfig: !!config.nextAuth.secret,
      hasDatabaseConfig: !!config.database.url,
    }

    return NextResponse.json({
      success: true,
      message: "Debug information",
      environment: envCheck,
      config: configCheck,
      nodeEnv: process.env.NODE_ENV,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    }, { status: 500 })
  }
} 