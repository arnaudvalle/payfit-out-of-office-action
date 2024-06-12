declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CALENDAR_URL?: string;
      NODE_ENV: "test" | "production";
    }
  }
}

export {};
