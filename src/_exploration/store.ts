import type {AnyDesc} from "../models/_desc";
import {getRelKey, makeRelQuerySerializable} from "../query-helpers";
import type {ModelQuery} from "../query-type";
import {ImmediateCache} from "./immediate-cache";
import type {BaseLoader, LoaderResult, MissingDataRequest} from "./loader-types";

/**
 * Optimize:
 * ===
 * - UserQueryManager: Query to Query Key
 * - UserQueryManager: proper diff within diffResults
 *
 */

type QueryCheckResult = {
  data: any;
  partKeys: string[];
};

const calcPartKeys = (model: string, id: string, field: string): string[] => {
  return [`${model}:${id}:${field}`];
};

export class Store {
  cache = new ImmediateCache();
  modelMap: Record<string, AnyDesc>;
  loader: BaseLoader;

  constructor(modelMap: Record<string, AnyDesc>, loader: BaseLoader) {
    this.modelMap = modelMap;
    this.loader = loader;
    loader.setOnLoaded((model, key, res) => this.onLoaded(model, key, res));
  }

  loadData(
    model: string,
    ids: string[],
    q: ModelQuery<any, any>,
    acceptDirty?: boolean
  ): LoaderResult {
    const desc = this.modelMap[model];
    if (!desc) throw new Error(`Model ${model} not found`);

    // Collect all missing data requests across all ids
    const missingRequests: MissingDataRequest[] = [];
    const resultObj: Record<string, unknown> = {};
    const allPartKeys: string[] = [];

    for (const id of ids) {
      const result = this.checkQueryRecursive(desc, model, id, q, missingRequests, acceptDirty);

      resultObj[id] = result.data;
      allPartKeys.push(...result.partKeys);
    }

    // If all data is present, return immediately
    if (missingRequests.length === 0) {
      return {
        state: "resolved",
        value: {
          value: resultObj,
          partKeys: allPartKeys,
        },
      };
    }

    // Otherwise, batch load missing data and return promise
    const promise = this.loader.loadBatch(missingRequests).then(() => {
      // Retry loadData - should be complete now
      return this.loadData(model, ids, q, acceptDirty);
    });

    return {state: "pending", promise};
  }

  onLoaded(model: string, key: string, partialInstance: Record<string, unknown>) {
    const withPartKeys = Object.fromEntries(
      Object.entries(partialInstance).map(([field, value]) => [
        field,
        {
          value,
          partKeys: calcPartKeys(model, key, field),
        },
      ])
    );
    this.cache.set(model, key, withPartKeys, {state: "fresh"});
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
    const data: any = {};
    const partKeys: string[] = [];

    if (query.fields) {
      for (const field of query.fields) {
        const cachedValue = this.cache.get(model, id, field);
        if (!cachedValue || (cachedValue.meta.state === "dirty" && !acceptDirty)) {
          missingRequests.push({type: "field", model, id, field});
        } else {
          data[field] = cachedValue.value;
          partKeys.push(...cachedValue.partKeys);
        }
      }
    }

    if (query.relations) {
      for (const [relationName, rawRelationQuery] of Object.entries(query.relations)) {
        if (!rawRelationQuery) continue;
        const relatedModel = desc.relations[relationName].relName;
        const relatedModelDesc = this.modelMap[relatedModel];
        const relationQueryList = Array.isArray(rawRelationQuery)
          ? rawRelationQuery
          : [rawRelationQuery];
        for (const relQuery of relationQueryList) {
          const relKey = getRelKey(relQuery, relationName);
          const cachedValue = this.cache.get(model, id, relKey);
          if (!cachedValue || (cachedValue.meta.state === "dirty" && !acceptDirty)) {
            missingRequests.push({
              type: "relation",
              model,
              id,
              relKey,
              query: makeRelQuerySerializable(relQuery),
            });
          } else {
            if (!relatedModelDesc) throw new Error(`Model ${relatedModel} not found`);

            const fieldName = relQuery.as || relationName;

            if (Array.isArray(cachedValue.value)) {
              const relationResults = cachedValue.value.map((key) =>
                this.checkQueryRecursive(
                  relatedModelDesc,
                  relatedModel,
                  key,
                  relQuery,
                  missingRequests,
                  acceptDirty
                )
              );
              data[fieldName] = relationResults.map((result) => result.data);
              partKeys.push(...relationResults.flatMap((result) => result.partKeys));
            } else {
              const relationResult = this.checkQueryRecursive(
                relatedModelDesc,
                relatedModel,
                cachedValue.value,
                relQuery,
                missingRequests,
                acceptDirty
              );
              data[fieldName] = relationResult.data;
              partKeys.push(...relationResult.partKeys);
            }
          }
        }
      }
    }

    return {data, partKeys};
  }
}
