import snowflake, { type Connection, type ConnectionOptions } from "snowflake-sdk";
import { env, hasSnowflakeConfig } from "@/lib/env";

export function createSnowflakeConnection(): Connection {
  if (!hasSnowflakeConfig()) {
    throw new Error("Snowflake environment variables are not fully configured.");
  }

  const connectionOptions: ConnectionOptions = {
    account: env.SNOWFLAKE_ACCOUNT,
    username: env.SNOWFLAKE_USERNAME,
    password: env.SNOWFLAKE_PASSWORD,
    database: env.SNOWFLAKE_DATABASE,
    schema: env.SNOWFLAKE_SCHEMA,
    warehouse: env.SNOWFLAKE_WAREHOUSE,
    role: env.SNOWFLAKE_ROLE,
  };

  return snowflake.createConnection(connectionOptions);
}

export async function connectSnowflake(connection: Connection): Promise<Connection> {
  await new Promise<void>((resolve, reject) => {
    connection.connect((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  return connection;
}

export async function destroySnowflake(connection: Connection): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    connection.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
