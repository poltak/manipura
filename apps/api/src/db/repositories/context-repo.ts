export type RelationshipContext = {
  communicationStyle: string;
  preferences: string[];
  triggers: string[];
  updatedAt: string;
};

export interface ContextRepository {
  get(coupleId: string): Promise<RelationshipContext>;
  upsert(
    coupleId: string,
    input: {
      communicationStyle?: string;
      preferences?: string[];
      triggers?: string[];
    }
  ): Promise<RelationshipContext>;
}

const DEFAULT_CONTEXT: RelationshipContext = {
  communicationStyle: "neutral",
  preferences: [],
  triggers: [],
  updatedAt: new Date(0).toISOString()
};

export class InMemoryContextRepository implements ContextRepository {
  private contexts = new Map<string, RelationshipContext>();

  async get(coupleId: string): Promise<RelationshipContext> {
    return this.contexts.get(coupleId) ?? { ...DEFAULT_CONTEXT };
  }

  async upsert(
    coupleId: string,
    input: {
      communicationStyle?: string;
      preferences?: string[];
      triggers?: string[];
    }
  ): Promise<RelationshipContext> {
    const current = await this.get(coupleId);

    const next: RelationshipContext = {
      communicationStyle:
        typeof input.communicationStyle === "string"
          ? input.communicationStyle
          : current.communicationStyle,
      preferences: Array.isArray(input.preferences)
        ? input.preferences.filter((item) => typeof item === "string")
        : current.preferences,
      triggers: Array.isArray(input.triggers)
        ? input.triggers.filter((item) => typeof item === "string")
        : current.triggers,
      updatedAt: new Date().toISOString()
    };

    this.contexts.set(coupleId, next);
    return next;
  }

  reset() {
    this.contexts.clear();
  }
}

export const defaultContextRepository = new InMemoryContextRepository();
