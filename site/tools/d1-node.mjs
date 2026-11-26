/* For the tests on this computer: the parts of Cloudflare D1 that server/api.js uses
   (prepare/bind/first/all/run and batch), on Node's own SQLite. */
import { DatabaseSync } from 'node:sqlite';

export function openD1(file, schemaSql) {
  const db = new DatabaseSync(file);
  if (schemaSql) db.exec(schemaSql);
  const plain = (r) => (r ? { ...r } : r);
  const isRead = (sql) => /^\s*(select|with)\b/i.test(sql);

  class Stmt {
    constructor(sql, args = []) { this.sql = sql; this.args = args; }
    bind(...args) {
      args.forEach((v, i) => {
        if (v === undefined) throw new Error(`D1_TYPE_ERROR: argument ${i + 1} is undefined in: ${this.sql}`);
        if (typeof v === 'boolean') throw new Error(`D1 test: a boolean was bound (argument ${i + 1}) in: ${this.sql}`);
      });
      return new Stmt(this.sql, args);
    }
    async first(col) {
      const r = plain(db.prepare(this.sql).get(...this.args));
      if (!r) return null;
      return col ? r[col] : r;
    }
    async all() { return { results: db.prepare(this.sql).all(...this.args).map(plain), success: true, meta: {} }; }
    async run() {
      const i = db.prepare(this.sql).run(...this.args);
      return { success: true, results: [], meta: { changes: Number(i.changes), last_row_id: Number(i.lastInsertRowid) } };
    }
    now() {
      if (isRead(this.sql)) return { success: true, results: db.prepare(this.sql).all(...this.args).map(plain), meta: {} };
      const i = db.prepare(this.sql).run(...this.args);
      return { success: true, results: [], meta: { changes: Number(i.changes), last_row_id: Number(i.lastInsertRowid) } };
    }
  }

  return {
    prepare: (sql) => new Stmt(sql),
    async batch(list) {                    // like D1: all or nothing
      db.exec('BEGIN');
      try {
        const out = list.map((s) => s.now());
        db.exec('COMMIT');
        return out;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
    async exec(sql) { db.exec(sql); return { count: 1 }; },
    sqlite: db,
  };
}
