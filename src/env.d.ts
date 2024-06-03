declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CALENDAR_URL?: string;
    }
  }
}

export {};
