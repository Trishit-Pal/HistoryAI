import { PGlite } from "@electric-sql/pglite";
import type { Db } from "./pg";

export function createPgliteDb(client: PGlite): Db {
  return {
    async query<T>(text: string, params: unknown[] = []) {
      const result = await client.query<T>(text, params);
      return result.rows;
    },
    async tx<T>(fn: (db: Db) => Promise<T>) {
      await client.query("begin");
      try {
        const value = await fn(createPgliteDb(client));
        await client.query("commit");
        return value;
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    },
  };
}

export async function migratePglite(client: PGlite, sql: string): Promise<void> {
  await client.exec(sql);
}
