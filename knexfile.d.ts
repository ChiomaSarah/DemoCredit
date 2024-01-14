declare module "knexfile" {
  interface KnexConfig {
    development: {
      client: string;
      connection: {
        user: string;
        password: string;
        database: string;
      };
      migrations: {
        directory: string;
      };
    };
    production: {
      client: string;
      connection: {
        user: string;
        password: string;
        database: string;
      };
      migrations: {
        directory: string;
      };
      // Add other configurations as needed
    };
    // Define other environments similarly
  }

  const config: KnexConfig;
  export default config;
}
