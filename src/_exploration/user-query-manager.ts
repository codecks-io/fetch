import type {_rootDesc} from "../models/_root";
import type {ModelQuery} from "../query-type";
import type {Store} from "./store";

type Unsubscribe = () => void;
type QueryResult<T> =
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
  get: () => QueryResult<any>;
}

const diffResults = (prevResult: unknown, prevParts: string[], nextResult: unknown) => {
  // reconciles the result trees,
  // TODO: turn result into data parts
  const nextParts: string[] = [];
  return {
    added: nextParts,
    removed: prevParts,
    reconciledResult: {parts: nextParts, data: nextResult},
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
  const listeners = new Set<() => void>();
  let lastData: {parts: string[]; data: unknown} = {parts: [], data: null};

  const reconcileNextResult = (nextData: unknown) => {
    const {added, removed, reconciledResult} = diffResults(lastData.data, lastData.parts, nextData);
    if (!added.length && !removed.length) {
      lastData = reconciledResult;
      updateDataListener({added, removed}, notify);
      listeners.forEach((listener) => listener());
    }
  };
  const notify = () => {
    // TODO: this will be called dozens of times, we probably need some sort of debouncing
    loadData();
  };

  const loadData = (): QueryResult<any> => {
    const res = store.loadData(model, ids, q);
    if (res.state === "pending") {
      res.promise.then(reconcileNextResult);
    } else {
      reconcileNextResult(res.value);
    }
    return res;
  };

  let data = loadData();

  const subscribe = (listener: () => void): Unsubscribe => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) onDispose();
      updateDataListener({added: [], removed: lastData.parts}, notify);
    };
  };

  const get = (): QueryResult<any> => {
    return data;
  };

  return {subscribe, get};
};

export class UserQueryManager {
  queryCache = new Map<string, UserQuery>();
  activeParts = new Map<string, Set<() => void>>();
  store: Store;

  constructor(store: Store) {
    this.store = store;
  }

  getQuery(model: string, ids: string[], q: ModelQuery<any, any>): UserQuery {
    // TODO: create proper key for query
    const cacheKey = JSON.stringify({model, ids, q});
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
            let listeners = this.activeParts.get(partKey);
            if (!listeners) {
              listeners = new Set();
              this.activeParts.set(partKey, listeners);
            }
            listeners.add(notify);
          });
          removed.forEach((partKey) => {
            const listeners = this.activeParts.get(partKey);
            if (listeners) {
              listeners.delete(notify);
              if (listeners.size === 0) {
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
}
