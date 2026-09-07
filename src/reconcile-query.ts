import type {ApiResponse} from "./model-pool";
import {modelMap} from "./models";
import type {AnyDesc, RelationEntry, RelationOpts} from "./models/_desc";
import {_rootDesc} from "./models/_root";
import {getRelKey} from "./query-helpers";
import type {InferModelQuery, ModelQuery} from "./query-type";

interface ModelStore {
  get(model: string, key: string): Record<string, any> | null;
}

/**
 * The API names an id but answers `null` for it when the token may not read that
 * record. Such an id never enters the pool, and the caller can do nothing about it —
 * unlike an id the response never mentioned at all, which points at a bug worth a warning.
 */
const isWithheldByApi = (response: ApiResponse, model: string, key: string) =>
  (response as Record<string, Record<string, unknown>>)[model]?.[key] === null;

export const reconcileInstanceQuery = <
  M extends AnyDesc,
  const T extends ModelQuery<M, typeof modelMap>,
>(
  query: T,
  response: ApiResponse,
  instanceModel: M,
  key: string,
  store: ModelStore
): InferModelQuery<M, T, typeof modelMap> => {
  const instance = store.get(instanceModel.name, key);
  if (!instance) {
    if (!isWithheldByApi(response, instanceModel.name, key)) {
      console.warn(`no instance found in pool: [${instanceModel.name}, ${key}]`);
    }
    return null as any;
  }
  const result: Record<string, any> =
    instanceModel.name === "_root"
      ? {}
      : {
          "~model": instanceModel.name,
          "~key": key,
        };
  instanceModel.keys.map((k) => (result[k] = instance[k]));
  for (const field of (query.fields as string[]) || []) {
    result[field] = instance[field];
  }
  for (const [relName, _relEntries] of Object.entries(query.relations || {})) {
    const relEntryList = Array.isArray(_relEntries) ? _relEntries : [_relEntries];
    for (const relEntry of relEntryList) {
      const relDesc = instanceModel.relations[relName] as RelationEntry<any, any>;
      if (!relDesc) {
        throw new Error(`Can't find relation ${relName} in ${instanceModel.name}`);
      }
      const opts = relDesc.options as RelationOpts;
      const relModel = modelMap[relDesc.relName as keyof typeof modelMap];

      switch (opts.type) {
        case "belongsTo":
          result[opts.fk] = instance[relName];
          result[`~${relName}`] = instance[relName] != null ? `${instance[relName]}` : null;
          result[relName] =
            instance[relName] != null
              ? reconcileInstanceQuery(
                  relEntry as any,
                  response,
                  relModel,
                  `${instance[relName]}`,
                  store
                )
              : null;
          break;
        case "hasOne":
          result[`~${relName}`] = instance[relName] != null ? `${instance[relName]}` : null;
          // A relation the API answers with null has no row to look up — reconciling the
          // string "null" would only report a missing instance the caller cannot act on.
          result[relName] =
            instance[relName] != null
              ? reconcileInstanceQuery(
                  relEntry as any,
                  response,
                  relModel,
                  `${instance[relName]}`,
                  store
                )
              : null;
          break;
        case "hasMany":
          const asName = (relEntry as any).as ?? relName;
          const relKey = getRelKey(relEntry, relName);
          const val = instance[relKey];
          switch (relEntry.type) {
            case "count":
            case "exists": {
              result[asName] = instance[relKey];
              break;
            }
            case "first":
              result[`~${asName}`] = val != null ? `${val}` : null;
              // The API answers null for a `first` with no matching row.
              result[asName] =
                val != null
                  ? reconcileInstanceQuery(relEntry as any, response, relModel, `${val}`, store)
                  : null;
              break;
            default: {
              // The API omits/nulls a hasMany array when the relation has no rows
              // (e.g. a self-referential `childCards` on a card with no children).
              // Treat an absent array as empty rather than mapping over null.
              const ids = (val as string[] | null | undefined) ?? [];
              // An id the API withheld reconciles to null. The inferred type has no null
              // members, so drop such an id from both arrays instead of handing callers
              // an element they would have to guard on every access.
              const members: {key: string; instance: any}[] = [];
              for (const id of ids) {
                const instance = reconcileInstanceQuery(
                  relEntry as any,
                  response,
                  relModel,
                  `${id}`,
                  store
                );
                if (instance != null) members.push({key: `${id}`, instance});
              }
              result[`~${asName}`] = members.map((m) => m.key);
              result[asName] = members.map((m) => m.instance);
            }
          }
          break;
      }
    }
  }
  return result as any;
};
