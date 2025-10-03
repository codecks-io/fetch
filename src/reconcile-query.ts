import type {ApiResponse} from "./model-pool";
import {modelMap} from "./models";
import type {AnyDesc, RelationEntry, RelationOpts} from "./models/_desc";
import {_rootDesc} from "./models/_root";
import {getRelKey} from "./query-helpers";
import type {InferModelQuery, ModelQuery} from "./query-type";

interface ModelStore {
  get(model: string, key: string): Record<string, any> | null;
}

export const reconcileInstanceQuery = <
  M extends AnyDesc,
  const T extends ModelQuery<M, typeof modelMap>,
>(
  query: T,
  response: ApiResponse,
  instanceModel: M,
  key: string,
  store: ModelStore,
  skipMeta = false
): InferModelQuery<M, T, typeof modelMap> => {
  const instance = store.get(instanceModel.name, key);
  if (!instance) {
    console.warn(`no instance found in pool: [${instanceModel.name}, ${key}]`);
    return null as any;
  }
  const result: Record<string, any> = skipMeta
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
          result[relName] = opts.fk
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
          result[`~${relName}`] = instance[relName];
          result[relName] = reconcileInstanceQuery(
            relEntry as any,
            response,
            relModel,
            `${instance[relName]}`,
            store
          );
          break;
        case "hasMany":
          const asName = (relEntry as any).as ?? relName;
          const relKey = getRelKey(relEntry, relName);
          const val = instance[relKey];
          switch (relEntry.type) {
            case "count": {
              result[asName] = instance[`count:${relKey}`];
              break;
            }
            case "exists": {
              result[asName] = instance[`exists:${relKey}`];
              break;
            }
            case "first":
              result[`~${asName}`] = val;
              result[asName] = reconcileInstanceQuery(
                relEntry as any,
                response,
                relModel,
                `${val}`,
                store
              );
              break;
            default: {
              result[`~${asName}`] = val;
              result[asName] = (val as string[]).map((id) =>
                reconcileInstanceQuery(relEntry as any, response, relModel, `${id}`, store)
              );
            }
          }
          break;
      }
    }
  }
  return result as any;
};
