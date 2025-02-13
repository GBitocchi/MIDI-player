export class PlayerError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'PlayerError';
    }
  }
  
  export const PlayerLogger = {
    debug: (message: string, ...args: any[]) => {
      if (process.env.DEBUG) {
        console.log(`[Player Debug]: ${message}`, ...args);
      }
    },
    error: (message: string, error?: Error) => {
      console.error(`[Player Error]: ${message}`, error);
    }
  };