import type {AnyDesc} from "../models/_desc";
import {getRelKey, makeRelQuerySerializable} from "../query-helpers";
import type {HasManyQuery, ModelQuery} from "../query-type";
import {ImmediateCache, OptimisticUpdater} from "./immediate-cache";
import type {BaseLoader, LoaderResult, MissingDataRequest} from "./loader-types";
import {modelMap} from "../models";

/**
 *
 * Optimize:
 * ===
 * - UserQueryManager: Query to Query Key (normalizeQuery)
 * - UserQueryManager: proper diff within diffResults (check https://github.com/TanStack/query/blob/v5.90.3/packages/query-core/src/utils.ts#L257)
 * - cache when setting data for a field, do a deepEqual before overwriting jsonb data
 */

type QueryCheckResult = {
  data: any;
  allPresent: boolean;
};

type QueryDep = {
  keys: string[];
};

const getQueryDep = (_q: HasManyQuery<any, any>): QueryDep => {
  // TODO: iterate through filters and order and create partKeys
  // e.g.
  // - cards({status: archived}) should get ['cards:*:archived'] as part key
  // - cards({$order:"-createdAt"}) should get ['cards:*:createdAt']
  // - cards({deck: {isDeleted: false}}) should get ['cards:*:deck', 'deck:*:isDeleted']
  return {keys: []};
};

// TODO: create proper part keys according to VISION.md
const calcPartKeys = (model: string, id: string, field: string): string[] => {
  return [`${model}:${id}:${field}`];
};

type ModelMap = typeof modelMap;

export class Store {
  cache = new ImmediateCache();
  modelMap = modelMap;

  requestedRelationKeys = new Map<string, QueryDep>(); // keys don't contain id, e.g. '_root:releases({"$limit":5,"$order":"-createdAt"})'

  constructor(private loader: BaseLoader) {
    loader.setOnLoaded((model, key, res) => this.onLoaded(model, key, res));
  }

  subscribeToField(fieldKey: string, notifyFn: () => void): () => void {
    return this.cache.subscribe(fieldKey, notifyFn);
  }

  invalidate(partKeyPatterns: string[]): void {
    // Mark fields as dirty and get which ones have active subscriptions
    const subscribedFieldRequests = this.cache.markDirty(partKeyPatterns);
    if (subscribedFieldRequests.length === 0) return;
    // Trigger background reload - fire and forget
    // When data loads, onLoaded() will update cache and notify subscribers
    void this.loader.loadBatch(subscribedFieldRequests);
  }

  loadData(
    model: keyof ModelMap,
    ids: string[],
    q: ModelQuery<any, any>,
    acceptDirty?: boolean,
    iteration: number = 0
  ): LoaderResult {
    const desc = this.modelMap[model];
    if (!desc) throw new Error(`Model ${model} not found`);

    // Collect all missing data requests across all ids
    const missingRequests: MissingDataRequest[] = [];
    const resultObj: Record<string, unknown> = {};
    let allPresent: boolean = true;

    for (const id of ids) {
      const result = this.checkQueryRecursive(desc, model, id, q, missingRequests, acceptDirty);
      if (!result.allPresent) allPresent = false;

      resultObj[id] = result.data;
    }

    if (!allPresent && iteration > 5) {
      throw new Error(`Can't seem to load ${JSON.stringify(missingRequests)} after 5 iterations`);
    }

    // If all data is present, return immediately
    if (allPresent) {
      if (missingRequests.length > 0) {
        void this.loader.loadBatch(missingRequests);
      }
      return {
        state: "resolved",
        payload: resultObj,
      };
    }

    // Otherwise, batch load missing data and return promise
    const promise = this.loader.loadBatch(missingRequests).then(() => {
      // Retry loadData - should be complete now
      const res = this.loadData(model, ids, q, acceptDirty, iteration + 1);
      return res.state === "pending" ? res.promise : res.payload;
    });

    return {state: "pending", promise};
  }

  onLoaded(model: string, key: string, partialInstance: Record<string, unknown>) {
    const withPartKeys = Object.fromEntries(
      Object.entries(partialInstance).map(([field, value]) => {
        const relDeps = this.requestedRelationKeys.get(`${model}:${field}`);
        console.log(`${model}:${field}`, relDeps);
        return [
          field,
          {
            value,
            partKeys: relDeps
              ? [...relDeps.keys, ...calcPartKeys(model, key, field)]
              : calcPartKeys(model, key, field),
            type: relDeps ? ("relation" as const) : ("field" as const),
          },
        ];
      })
    );
    const fieldSubs = this.cache.set(model, key, withPartKeys, {state: "fresh"});
    new Set(fieldSubs).forEach((fn) => fn());
  }

  /**
   * Recursively check if query data is in cache
   * Accumulates missing requests in the missingRequests array
   */
  private checkQueryRecursive(
    desc: AnyDesc,
    model: string,
    id: string,
    query: ModelQuery<any, any>,
    missingRequests: MissingDataRequest[],
    acceptDirty?: boolean
  ): QueryCheckResult {
    const data: any = model === "_root" ? {} : {"~model": model, "~key": id};
    let allPresent = true;

    if (query.fields) {
      for (const field of query.fields) {
        const cachedValue = this.cache.get(model, id, field);
        const needsRequest = !cachedValue || cachedValue.meta.state === "dirty";
        if (needsRequest) {
          missingRequests.push({type: "field", model, id, field});
        }
        const acceptsData = cachedValue && (cachedValue.meta.state === "fresh" || acceptDirty);
        if (acceptsData) {
          data[field] = cachedValue.value;
        } else {
          allPresent = false;
        }
      }
    }

    if (query.relations) {
      for (const [relationName, rawRelationQuery] of Object.entries(query.relations)) {
        if (!rawRelationQuery) continue;
        const relatedModel = desc.relations[relationName].relName as keyof ModelMap;
        const relatedModelDesc = this.modelMap[relatedModel];
        const relationQueryList = Array.isArray(rawRelationQuery)
          ? rawRelationQuery
          : [rawRelationQuery];
        for (const relQuery of relationQueryList) {
          const relKey = getRelKey(relQuery, relationName);
          this.requestedRelationKeys.set(`${model}:${relKey}`, getQueryDep(relQuery));
          const cachedValue = this.cache.get(model, id, relKey);
          const needsRequest = !cachedValue || cachedValue.meta.state === "dirty";
          if (needsRequest) {
            const contents = makeRelQuerySerializable(relQuery);
            missingRequests.push({
              type: "relation",
              model,
              id,
              relKey, // e.g. releases({"$limit":5,"$order":"-createdAt"})
              contents, // e.g { asField: false, fields: [ 'title' ], relations: undefined }
            });
          }
          const acceptsData = cachedValue && (cachedValue.meta.state === "fresh" || acceptDirty);
          if (acceptsData) {
            if (!relatedModelDesc) throw new Error(`Model ${relatedModel} not found`);

            const fieldName = relQuery.as || relationName;

            if (relQuery.type === "count" || relQuery.type === "exists") {
              data[fieldName] = cachedValue.value;
            } else if (Array.isArray(cachedValue.value)) {
              const relationResults = cachedValue.value.map((key) =>
                this.checkQueryRecursive(
                  relatedModelDesc,
                  relatedModel,
                  `${key}`,
                  relQuery,
                  missingRequests,
                  acceptDirty
                )
              );
              data[`~${fieldName}`] = cachedValue.value.map((v) => `${v}`);
              data[fieldName] = relationResults.map((result) => result.data);
              if (relationResults.some((result) => !result.allPresent)) allPresent = false;
            } else {
              const relationResult = this.checkQueryRecursive(
                relatedModelDesc,
                relatedModel,
                `${cachedValue.value}`,
                relQuery,
                missingRequests,
                acceptDirty
              );
              data[`~${fieldName}`] = cachedValue.value != null ? `${cachedValue.value}` : null;
              data[fieldName] = relationResult.data;
              if (!relationResult.allPresent) allPresent = false;
            }
          } else {
            allPresent = false;
          }
        }
      }
    }

    return {data, allPresent};
  }

  /**
   * Execute a mutation with optimistic updates
   *
   * @example
   * ```typescript
   * await store.mutate(
   *   () => api.updateCard('123', {title: 'New Title'}),
   *   {
   *     onMutate: (layer) => {
   *       layer.setField('Card', '123', 'title', 'New Title');
   *     },
   *     onSuccess: () => {
   *       // Optional: invalidate related queries
   *       store.invalidate(['Card:123:title']);
   *     }
   *   }
   * );
   * ```
   */
  mutate<T>(
    mutationFn: () => Promise<T>,
    options: {
      onMutate?: (updater: OptimisticUpdater) => void;
      onSuccess?: (data: T) => void;
      onError?: (error: unknown) => void;
    } = {}
  ): Promise<T> {
    const promise = mutationFn();

    // Create optimistic layer and apply updates (auto-removed when promise settles)
    if (options.onMutate) {
      try {
        this.cache.createOptimisticLayer(promise, options.onMutate);
      } catch (error) {
        console.error("Error in onMutate:", error);
      }
    }

    // Handle success/error
    promise
      .then((data) => {
        options.onSuccess?.(data);
        return data;
      })
      .catch((error) => {
        options.onError?.(error);
        throw error;
      });

    return promise;
  }
}
