export type DbRecord = {
  id: string;
  createdAt: string;
};

export type DbTableName =
  | "users"
  | "couples"
  | "memberships"
  | "threads"
  | "messages"
  | "mediation_events";

export interface DbClient {
  nextId(prefix: string): string;
  nowIso(): string;
}

export function createInMemoryDbClient(): DbClient {
  return {
    nextId(prefix: string) {
      const random = Math.random().toString(36).slice(2, 10);
      return `${prefix}_${Date.now()}_${random}`;
    },
    nowIso() {
      return new Date().toISOString();
    }
  };
}
