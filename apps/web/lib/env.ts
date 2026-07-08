import { z } from 'zod';

// Define environment schema
const envSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'Clerk publishable key is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'Clerk secret key is required'),
  MONGODB_URI: z.string().url('Invalid MongoDB URI'),
  GEMINI_API_KEY: z.string().min(1, 'Gemini API key is required'),
  RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

type Env = z.infer<typeof envSchema>;

// Validate environment variables
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Export validated environment
export const env = validateEnv();

// Helper function to get environment variable safely
export function getEnv(key: keyof typeof process.env): string | undefined {
  return process.env[key];
}

// Type-safe environment access
export const config = {
  clerk: {
    publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: env.CLERK_SECRET_KEY,
  },
  mongodb: {
    uri: env.MONGODB_URI,
  },
  gemini: {
    apiKey: env.GEMINI_API_KEY,
  },
  resend: {
    apiKey: env.RESEND_API_KEY,
  },
  app: {
    url: env.NEXT_PUBLIC_APP_URL,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
  },
};

export default config;
