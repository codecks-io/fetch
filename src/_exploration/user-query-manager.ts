import type {_rootDesc} from "../models/_root";
import {queryToKey} from "../query-helpers";
import type {ModelQuery} from "../query-type";
import type {Store} from "./store";
import type {LoaderResult} from "./loader-types";
import {deepUpdateTree} from "./utils/deepUpdateTree";
import {getFieldKey} from "./immediate-cache";

type Unsubscribe = () => void;

/**
 * Extracts all field keys from a data tree for subscription tracking.
 * Returns a set of field keys in the format "model:id:field"
 */
function extractFieldKeys(data: any): Set<string> {
  const fields = new Set<string>();

  function traverse(obj: any) {
    if (!obj || typeof obj !== "object") return;

    if (obj["~model"] && obj["~key"]) {
      const model = obj["~model"];
      const key = obj["~key"];

      for (const field in obj) {
        if (field.startsWith("~")) continue;

        // Add this field to set
        fields.add(getFieldKey(model, key, field));

        // Recurse into nested instances
        const value = obj[field];
        if (Array.isArray(value)) {
          value.forEach(traverse);
        } else {
          traverse(value);
        }
      }
    }
  }

  traverse(data);
  return fields;
}

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

// hooks can use `useSyncExternalStore` by calling `subscribe` and `getSnapshot`
export class UserQuery {
  private queryListeners = new Set<() => void>();
  private subscribedFields = new Map<string, Unsubscribe>();
  private currentData: any = null;
  private userQueryResult!: UserQueryResult<any>;

  constructor(
    private opts: {
      model: string;
      ids: string[];
      q: ModelQuery<any, any>;
      onDispose: () => void;
      store: Store;
    }
  ) {
    // Initial load
    this.loadData();
  }

  private reconcileNextResult(nextData: unknown) {
    if (!this.currentData) {
      this.currentData = nextData;
      const fieldKeys = extractFieldKeys(nextData);
      for (const fieldKey of fieldKeys) {
        this.subscribedFields.set(
          fieldKey,
          this.opts.store.subscribeToField(fieldKey, this.onFieldChanged)
        );
      }
    } else {
      const {result, added, removed} = deepUpdateTree(this.currentData, nextData);
      if (result === this.currentData) return;
      for (const instance of removed) {
        const fieldKeys = extractFieldKeys(instance);
        for (const fieldKey of fieldKeys) {
          const unsubscribe = this.subscribedFields.get(fieldKey);
          if (!unsubscribe) throw new Error(`Unsubscribe not found for field ${fieldKey}`);
          unsubscribe();
          this.subscribedFields.delete(fieldKey);
        }
      }
      for (const instance of added) {
        const fieldKeys = extractFieldKeys(instance);
        for (const fieldKey of fieldKeys) {
          this.subscribedFields.set(
            fieldKey,
            this.opts.store.subscribeToField(fieldKey, this.onFieldChanged)
          );
        }
      }
      this.currentData = result;
      this.notify();
    }

    return this.currentData;
  }

  private onFieldChanged = () => {
    this.loadData();
  };

  private notify = () => {
    this.queryListeners.forEach((listener) => listener());
  };

  private loadData() {
    const {store, model, ids, q} = this.opts;
    const storeResult: LoaderResult = store.loadData(model as any, ids, q, true);

    if (storeResult.state === "pending") {
      // Store is loading - unwrap the promise to extract just the user data
      this.userQueryResult = {
        state: "pending",
        promise: storeResult.promise.then((value) => {
          const result = this.reconcileNextResult(value);
          // Update userQueryResult to resolved state
          this.userQueryResult = {
            state: "resolved",
            value: result,
          };
          return result;
        }),
      };
    } else {
      this.userQueryResult = {
        state: "resolved",
        value: this.reconcileNextResult(storeResult.payload),
      };
    }
  }

  subscribe = (listener: () => void): Unsubscribe => {
    this.queryListeners.add(listener);
    return () => {
      this.queryListeners.delete(listener);
      if (this.queryListeners.size === 0) {
        this.opts.onDispose();
        // Cleanup: unsubscribe from all fields
        for (const unsub of this.subscribedFields.values()) unsub();
        this.subscribedFields.clear();
      }
    };
  };

  getSnapshot = (): UserQueryResult<any> => {
    return this.userQueryResult;
  };
}

export class UserQueryManager {
  private queryCache = new Map<string, UserQuery>();

  constructor(private store: Store) {}

  getQuery(model: string, ids: string[], q: ModelQuery<any, any>): UserQuery {
    // TODO: create proper key for query
    const cacheKey = JSON.stringify({model, ids, q: queryToKey(q as any)});
    let query = this.queryCache.get(cacheKey);

    if (!query) {
      query = new UserQuery({
        model,
        ids,
        q,
        store: this.store,
        onDispose: () => {
          this.queryCache.delete(cacheKey);
        },
      });
      this.queryCache.set(cacheKey, query);
    }

    return query;
  }
}
