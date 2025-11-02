import type {AnyDesc} from "../models/_desc";
import {getRelKey, makeRelQuerySerializable} from "../query-helpers";
import type {ModelQuery} from "../query-type";
import {ImmediateCache} from "./immediate-cache";
import type {BaseLoader, LoaderResult, MissingDataRequest} from "./loader-types";
import {modelMap} from "../models";

/**
 *
 * Optimize:
 * ===
 * - UserQueryManager: Query to Query Key (normalizeQuery)
 * - UserQueryManager: proper diff within diffResults
 *
 */

type QueryCheckResult = {
  data: any;
  partKeys: string[];
  allPresent: boolean;
};

const calcPartKeys = (model: string, id: string, field: string): string[] => {
  return [`${model}:${id}:${field}`];
};

export class Store {
  cache = new ImmediateCache();
  modelMap: Record<string, AnyDesc> = modelMap;

  constructor(private loader: BaseLoader) {
    loader.setOnLoaded((model, key, res) => this.onLoaded(model, key, res));
  }

  loadData(
    model: string,
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
    const allPartKeys: string[] = [];
    let allPresent: boolean = true;

    for (const id of ids) {
      const result = this.checkQueryRecursive(desc, model, id, q, missingRequests, acceptDirty);
      if (!result.allPresent) allPresent = false;

      resultObj[id] = result.data;
      allPartKeys.push(...result.partKeys);
    }

    if (!allPresent && iteration > 5) {
      throw new Error(`Can't seem to load ${JSON.stringify(missingRequests)} after 5 iterations`);
    }

    // If all data is present, return immediately
    if (allPresent) {
      if (missingRequests.length > 0) {
        this.loader.loadBatch(missingRequests);
      }
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
      return this.loadData(model, ids, q, acceptDirty, iteration + 1);
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
          partKeys.push(...cachedValue.partKeys);
        } else {
          allPresent = false;
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
          const needsRequest = !cachedValue || cachedValue.meta.state === "dirty";
          if (needsRequest) {
            missingRequests.push({
              type: "relation",
              model,
              id,
              relKey,
              query: makeRelQuerySerializable(relQuery),
            });
          }
          const acceptsData = cachedValue && (cachedValue.meta.state === "fresh" || acceptDirty);
          if (acceptsData) {
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
              if (relationResults.some((result) => !result.allPresent)) allPresent = false;
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
              if (!relationResult.allPresent) allPresent = false;
            }
          } else {
            allPresent = false;
          }
        }
      }
    }

    return {data, partKeys, allPresent};
  }
}
