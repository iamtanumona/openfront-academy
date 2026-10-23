import 'dotenv/config';
import { z } from 'zod';
const schema=z.object({
 NODE_ENV:z.enum(['development','test','production']).default('development'),
 HOST:z.string().default('0.0.0.0'),
 PORT:z.coerce.number().int().min(1).max(65535).default(3001),
 DATABASE_URL:z.string().min(1), WEB_ORIGIN:z.string().url(),
 AUTH_ISSUER:z.string().url(), AUTH_AUDIENCE:z.string().min(1),
 CREDENTIAL_PRIVATE_KEY_PEM:z.string().optional(), CREDENTIAL_KEY_ID:z.string().default('ofa-dev-key-1'),
 PUBLIC_WEB_URL:z.string().url().default('http://localhost:4321')
});
export const config=schema.parse(process.env);
