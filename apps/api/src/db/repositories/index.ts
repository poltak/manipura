import {
  defaultMediationEventsRepository,
  type MediationEventsRepository
} from "./mediation-events-repo";
import { defaultContextRepository, type ContextRepository } from "./context-repo";

export type ApiRepositories = {
  mediationEvents: MediationEventsRepository;
  context: ContextRepository;
};

export const defaultRepositories: ApiRepositories = {
  mediationEvents: defaultMediationEventsRepository,
  context: defaultContextRepository
};
