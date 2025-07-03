"use client"

import { signIn, getSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Chrome } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to RemoteRetro</CardTitle>
          <CardDescription>
            Sign in to start creating and joining retrospectives with your team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center space-x-2"
            size="lg"
          >
            <Chrome className="h-5 w-5" />
            <span>Continue with Google</span>
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 