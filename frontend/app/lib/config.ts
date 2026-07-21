export const config = {
  apiBase: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Dayanusa Homeschooling",
} as const;
export const API_V1 = `${config.apiBase}/api/v1`;
