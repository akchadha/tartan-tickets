import type { EventRecord } from "./types";
import { buildSeedEvents } from "./seed";

/**
 * Where events are kept. Today it is server memory; a database version can
 * implement the same interface later (needed before Story 3, see README).
 */
export interface EventStore {
  all(): EventRecord[];
}

export function createMemoryStore(records: EventRecord[]): EventStore {
  const data = records.map((r) => ({ ...r }));
  return {
    // Hand out copies so no caller can accidentally edit the stored events.
    all: () => data.map((r) => ({ ...r })),
  };
}

let store: EventStore | undefined;

/** The app-wide store, filled with sample events the first time it is used. */
export function getEventStore(): EventStore {
  store ??= createMemoryStore(buildSeedEvents(new Date()));
  return store;
}
