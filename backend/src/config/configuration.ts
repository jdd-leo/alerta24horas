export interface AppConfig {
  port: number;
  jwtSecret: string;
  googleClientId: string;
  uploadDir: string;
  publicBaseUrl: string;
  corsOrigin: string;
  devAuth: boolean;
}

export function loadConfig(): AppConfig {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET é obrigatório');
  }

  return {
    port: Number(process.env.PORT ?? 3333),
    jwtSecret,
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
    uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
    publicBaseUrl: process.env.PUBLIC_BASE_URL ?? 'http://localhost:3333',
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    devAuth: process.env.DEV_AUTH === 'true',
  };
}
