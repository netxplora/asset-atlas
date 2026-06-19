import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SUPABASE_PROJECT_ID: z.string().min(1),
  // Add other critical environment variables here
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv() {
  // Use import.meta.env for Vite environment variables
  const env = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID,
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    
    if (import.meta.env.PROD) {
      throw new Error("Critical environment variables are missing. Application cannot start.");
    }
    
    return {
      isValid: false,
      errors: result.error.format(),
    };
  }

  return {
    isValid: true,
    data: result.data,
  };
}
