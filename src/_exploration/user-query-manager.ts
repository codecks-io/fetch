import type {_rootDesc} from "../models/_root";
import {queryToKey} from "../query-helpers";
import type {ModelQuery} from "../query-type";
import type {Store} from "./store";
import type {LoaderResult} from "./loader-types";

type Unsubscribe = () => void;

// Result returned to the user - wraps only the actual user data
type UserQueryResult<T> =
  | {
      state: "pending";
      promise: Promise<T>;
    }
  | {
      state: "resolved";
      value: T;
    };

export interface UserQuery {
  subscribe: (listener: () => void) => Unsubscribe;
  get: () => UserQueryResult<any>;
}

// Internal tracking structure for user data + associated part keys
type TrackedData = {
  partKeys: string[];
  value: unknown;
};

// Reconciles previous and next query results, computing which part keys were added/removed
// Takes the store's LoaderPayload {value, partKeys} and extracts parts for tracking
const diffResults = (
  prevTrackedData: TrackedData,
  nextStorePayload: {value: unknown; partKeys: string[]}
): {added: string[]; removed: string[]; nextTrackedData: TrackedData} => {
  // TODO: turn result into data parts by doing proper tree diffing
  const nextPartKeys = nextStorePayload.partKeys;

  // Compute added and removed part keys
  const prevSet = new Set(prevTrackedData.partKeys);
  const nextSet = new Set(nextPartKeys);

  const added = nextPartKeys.filter((key) => !prevSet.has(key));
  const removed = prevTrackedData.partKeys.filter((key) => !nextSet.has(key));

  return {
    added,
    removed,
    nextTrackedData: {
      partKeys: nextPartKeys,
      value: nextStorePayload.value,
    },
  };
};

const createStoreQuery = (opts: {
  model: string;
  ids: string[];
  q: ModelQuery<any, any>;
  onDispose: () => void;
  updateDataListener: (opts: {added: string[]; removed: string[]}, notify: () => void) => void;
  store: Store;
}): UserQuery => {
  const {onDispose, updateDataListener, store, q, ids, model} = opts;
  const queryListeners = new Set<() => void>();

  // Track the data internally with its associated part keys
  let trackedData: TrackedData = {partKeys: [], value: null};

  // Process new result from store, update tracked data, and notify listeners
  const reconcileNextResult = (storePayload: {value: unknown; partKeys: string[]}) => {
    const {added, removed, nextTrackedData} = diffResults(trackedData, storePayload);

    // Only update if parts actually changed
    if (added.length || removed.length) {
      trackedData = nextTrackedData;
      updateDataListener({added, removed}, notify);
      queryListeners.forEach((listener) => listener());
    }
  };

  const notify = () => {
    loadData();
  };

  // Current data snapshot for get() - wraps only the user data, not the partKeys
  let userQueryResult: UserQueryResult<any>;

  const loadData = () => {
    const storeResult: LoaderResult = store.loadData(model as any, ids, q);

    if (storeResult.state === "pending") {
      // Store is loading - unwrap the promise to extract just the user data
      userQueryResult = {
        state: "pending",
        promise: storeResult.promise.then((storePayload) => {
          reconcileNextResult(storePayload);
          return storePayload.value; // Return only the user data, not partKeys
        }),
      };
    } else {
      const storePayload = storeResult.payload;
      // Store has data - unwrap to extract just the user data
      reconcileNextResult(storePayload);
      userQueryResult = {
        state: "resolved",
        value: storePayload.value, // Extract user data from {value, partKeys}
      };
    }
  };

  // Initial load
  loadData();

  const subscribe = (listener: () => void): Unsubscribe => {
    queryListeners.add(listener);
    return () => {
      queryListeners.delete(listener);
      if (queryListeners.size === 0) onDispose();
      updateDataListener({added: [], removed: trackedData.partKeys}, notify);
    };
  };

  const get = (): UserQueryResult<any> => {
    return userQueryResult;
  };

  return {subscribe, get};
};

export class UserQueryManager {
  private queryCache = new Map<string, UserQuery>();
  private activeParts = new Map<string, Set<() => void>>();

  constructor(private store: Store) {}

  getQuery(model: string, ids: string[], q: ModelQuery<any, any>): UserQuery {
    // TODO: create proper key for query
    const cacheKey = JSON.stringify({model, ids, q: queryToKey(q as any)});
    let query = this.queryCache.get(cacheKey);

    if (!query) {
      query = createStoreQuery({
        model,
        ids,
        q,
        store: this.store,
        onDispose: () => {
          this.queryCache.delete(cacheKey);
        },
        updateDataListener: ({added, removed}, notify) => {
          added.forEach((partKey) => {
            let partListeners = this.activeParts.get(partKey);
            if (!partListeners) {
              partListeners = new Set();
              this.activeParts.set(partKey, partListeners);
            }
            partListeners.add(notify);
          });
          removed.forEach((partKey) => {
            const partListeners = this.activeParts.get(partKey);
            if (partListeners) {
              partListeners.delete(notify);
              if (partListeners.size === 0) {
                this.activeParts.delete(partKey);
              }
            }
          });
        },
      });
      this.queryCache.set(cacheKey, query);
    }

    return query;
  }

  onInvalidation(partKeys: string[]) {
    const notifyFns = new Set<() => void>();
    for (const partKey of partKeys) {
      this.activeParts.get(partKey)?.forEach((fn) => notifyFns.add(fn));
    }
    notifyFns.forEach((fn) => fn());
  }
}
