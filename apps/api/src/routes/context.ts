import { defaultRepositories, type ApiRepositories } from "../db/repositories";

import type { RelationshipContext } from "../db/repositories/context-repo";

type ContextPayload = {
  communicationStyle?: unknown;
  preferences?: unknown;
  triggers?: unknown;
};

export async function handleGetContext(
  coupleId: string,
  repositories: ApiRepositories = defaultRepositories
) {
  const context = await repositories.context.get(coupleId);

  return {
    status: 200,
    body: context
  };
}

export async function handlePutContext(
  coupleId: string,
  input: ContextPayload,
  repositories: ApiRepositories = defaultRepositories
): Promise<{ status: 200; body: RelationshipContext } | { status: 400; body: { error: string } }> {
  if (!isValidInput(input)) {
    return {
      status: 400,
      body: { error: "Invalid context payload." }
    };
  }

  const context = await repositories.context.upsert(coupleId, {
    communicationStyle: input.communicationStyle,
    preferences: input.preferences,
    triggers: input.triggers
  });

  return {
    status: 200,
    body: context
  };
}

function isValidInput(input: ContextPayload) {
  const validStyle =
    input.communicationStyle === undefined ||
    typeof input.communicationStyle === "string";

  const validPreferences =
    input.preferences === undefined ||
    (Array.isArray(input.preferences) &&
      input.preferences.every((item) => typeof item === "string"));

  const validTriggers =
    input.triggers === undefined ||
    (Array.isArray(input.triggers) &&
      input.triggers.every((item) => typeof item === "string"));

  return validStyle && validPreferences && validTriggers;
}
