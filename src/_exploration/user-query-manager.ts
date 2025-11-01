import type {_rootDesc} from "../models/_root";
import {queryToKey} from "../query-helpers";
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
  const queryListeners = new Set<() => void>();
  let lastData: {parts: string[]; data: unknown} = {parts: [], data: null};

  const reconcileNextResult = (nextData: unknown) => {
    const {added, removed, reconciledResult} = diffResults(lastData.data, lastData.parts, nextData);
    if (!added.length && !removed.length) {
      lastData = reconciledResult;
      updateDataListener({added, removed}, notify);
      queryListeners.forEach((listener) => listener());
    }
  };
  const notify = () => {
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
    queryListeners.add(listener);
    return () => {
      queryListeners.delete(listener);
      if (queryListeners.size === 0) onDispose();
      updateDataListener({added: [], removed: lastData.parts}, notify);
    };
  };

  const get = (): QueryResult<any> => {
    return data;
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
