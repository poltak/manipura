import {
  defaultMediationEventsRepository,
  type MediationEventsRepository
} from "./mediation-events-repo";

export type ApiRepositories = {
  mediationEvents: MediationEventsRepository;
};

export const defaultRepositories: ApiRepositories = {
  mediationEvents: defaultMediationEventsRepository
};
