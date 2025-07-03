"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"

export function useUser() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (session?.user && status === "authenticated") {
      // Create or update user in database
      fetch("/api/auth/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        }),
      }).catch((error) => {
        console.error("Error creating/updating user:", error)
      })
    }
  }, [session, status])

  return { session, status }
} 