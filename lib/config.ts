export const config = {
  // Backend URL configuration
  backendUrl: process.env.VITE_BACKEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
  
  // NextAuth configuration
  nextAuth: {
    url: process.env.VITE_BACKEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
    secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET,
  },
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Google OAuth configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
}

// Validation function to check required environment variables
export function validateConfig() {
  const errors: string[] = []
  
  // Only require Google OAuth in production
  if (process.env.NODE_ENV === 'production') {
    if (!config.google.clientId) {
      errors.push('GOOGLE_CLIENT_ID is required in production')
    }
    
    if (!config.google.clientSecret) {
      errors.push('GOOGLE_CLIENT_SECRET is required in production')
    }
  }
  
  if (!config.nextAuth.secret) {
    errors.push('JWT_SECRET or NEXTAUTH_SECRET is required')
  }
  
  if (!config.database.url) {
    errors.push('DATABASE_URL is required')
  }
  
  if (errors.length > 0) {
    console.error('❌ Configuration errors:')
    errors.forEach(error => console.error(`  - ${error}`))
    throw new Error(`Missing required environment variables: ${errors.join(', ')}`)
  }
  
  console.log('✅ Configuration validated successfully')
} 