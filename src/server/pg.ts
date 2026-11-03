import postgres from "postgres";

export type Db = {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
  tx<T>(fn: (db: Db) => Promise<T>): Promise<T>;
};

type SqlLike = {
  unsafe: (text: string, params: unknown[]) => Promise<Iterable<Record<string, unknown>>>;
  begin?: <T>(fn: (transaction: SqlLike) => Promise<T>) => Promise<T>;
  savepoint?: <T>(fn: (transaction: SqlLike) => Promise<T>) => Promise<T>;
};

function wrap(sql: SqlLike): Db {
  return {
    async query<T>(text: string, params: unknown[] = []) {
      const rows = await sql.unsafe(text, params);
      return [...rows] as T[];
    },
    tx<T>(fn: (db: Db) => Promise<T>) {
      const open = sql.begin ?? sql.savepoint;
      if (!open) throw new Error("This connection cannot open a transaction");
      return open.call(sql, (transaction: SqlLike) => fn(wrap(transaction))) as Promise<T>;
    },
  };
}

export function connect(url: string, opts: { pooled: boolean }): { db: Db; end: () => Promise<void> } {
  const sql = postgres(url, {
    prepare: !opts.pooled,
    max: 1,
    connect_timeout: 5,
    ssl: "require",
  });
  return { db: wrap(sql as unknown as SqlLike), end: () => sql.end({ timeout: 5 }) };
}
