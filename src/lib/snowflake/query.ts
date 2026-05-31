import type { Connection, RowStatement } from "snowflake-sdk";
import { connectSnowflake, createSnowflakeConnection, destroySnowflake } from "@/lib/snowflake/client";

export type QueryPrimitive = string | number | boolean | null | Date;
export type QueryBindings = QueryPrimitive[];

type QueryRow = Record<string, unknown>;

async function executeStatement<T extends QueryRow>(
  connection: Connection,
  sqlText: string,
  binds: QueryBindings = [],
): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    connection.execute({
      sqlText,
      binds: binds as never,
      complete: (error, _statement: RowStatement, rows) => {
        if (error) {
          reject(error);
          return;
        }

        resolve((rows ?? []) as T[]);
      },
    });
  });
}

export async function withSnowflake<T>(
  runner: (connection: Connection) => Promise<T>,
): Promise<T> {
  const connection = createSnowflakeConnection();

  try {
    await connectSnowflake(connection);
    return await runner(connection);
  } finally {
    await destroySnowflake(connection);
  }
}

export async function queryMany<T extends QueryRow>(
  sqlText: string,
  binds?: QueryBindings,
): Promise<T[]> {
  return withSnowflake((connection) => executeStatement<T>(connection, sqlText, binds));
}

export async function queryFirst<T extends QueryRow>(
  sqlText: string,
  binds?: QueryBindings,
): Promise<T | null> {
  const rows = await queryMany<T>(sqlText, binds);
  return rows[0] ?? null;
}

export async function executeCommand(
  sqlText: string,
  binds?: QueryBindings,
): Promise<void> {
  await withSnowflake((connection) => executeStatement(connection, sqlText, binds));
}
