import { createInMemoryDbClient } from "../client";

import type {
  MediationEvent,
  MediationFallbackReason,
  MediationRuntime,
  MediationTone
} from "../../types";

export type CreateMediationEventInput = {
  threadId: string | null;
  inputText: string;
  outputText: string;
  tone: MediationTone;
  runtime: MediationRuntime;
  fallbackReason: MediationFallbackReason | null;
};

export interface MediationEventsRepository {
  create(input: CreateMediationEventInput): Promise<MediationEvent>;
}

export class InMemoryMediationEventsRepository
  implements MediationEventsRepository
{
  private readonly db = createInMemoryDbClient();
  private events: MediationEvent[] = [];

  async create(input: CreateMediationEventInput): Promise<MediationEvent> {
    const event: MediationEvent = {
      id: this.db.nextId("evt"),
      createdAt: this.db.nowIso(),
      ...input
    };

    this.events.push(event);
    return event;
  }

  list(): MediationEvent[] {
    return [...this.events];
  }

  reset() {
    this.events = [];
  }
}

export const defaultMediationEventsRepository =
  new InMemoryMediationEventsRepository();
