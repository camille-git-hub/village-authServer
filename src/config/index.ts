
import { z } from 'zod/v4';

const envSchema = z.object({
  MONGO_URI: z.url({ protocol: /mongodb/ }),
  DB_NAME: z.string(),
  PORT: z.coerce.number().int().default(5000),
  REFRESH_TOKEN_TTL: z.coerce.number().default(30 * 24 * 60 * 60), // 30 days in seconds
  SALT_ROUNDS: z.coerce.number().default(13),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default('15m'),
  CORS_ORIGIN: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:\n', z.prettifyError(parsedEnv.error));
  process.exit(1);
}

export const {
JWT_SECRET,
  DB_NAME,
  PORT,
  MONGO_URI,
  REFRESH_TOKEN_TTL,
  SALT_ROUNDS,
  JWT_EXPIRY,
  CORS_ORIGIN
} = parsedEnv.data;