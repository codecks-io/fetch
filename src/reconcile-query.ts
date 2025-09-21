import type {ApiResponse, ModelPool} from "./model-pool";
import {modelMap} from "./models";
import type {AnyDesc, RelationEntry, RelationOpts} from "./models/_desc";
import {_rootDesc} from "./models/_root";
import {getRelKey} from "./query-helpers";
import type {InferModelQuery, InferRelQuery, ModelQuery, RelQuery} from "./query-type";

export const reconcileRootQuery = <T extends RelQuery<typeof _rootDesc, typeof modelMap>>(
  query: T,
  response: ApiResponse,
  pool: ModelPool
): InferRelQuery<typeof _rootDesc, T, typeof modelMap> => {
  const result: Record<string, any> = {};
  const responsePart = response._root;
  for (const [relName, modelFields] of Object.entries(query)) {
    const relDesc = _rootDesc.relations[relName as keyof (typeof _rootDesc)["relations"]];
    const id = responsePart[relName];
    if (!id) {
      result[relName] = null;
      continue;
    } else {
      result[relName] = reconcileInstanceQuery(
        modelFields as any,
        response,
        modelMap[relDesc.relName],
        // TODO: we somehow should ensure that all ids are string!?
        `${id}`,
        pool
      );
    }
  }
  return result as any;
};

export const reconcileInstanceQuery = <
  M extends AnyDesc,
  const T extends ModelQuery<M, typeof modelMap>,
>(
  query: T,
  response: ApiResponse,
  instanceModel: M,
  key: string,
  pool: ModelPool
): InferModelQuery<M, T, typeof modelMap> => {
  const instance = pool.get(instanceModel.name, key);
  if (!instance) {
    console.warn(`no instance found in pool: [${instanceModel.name}, ${key}]`);
    return null as any;
  }
  const result: Record<string, any> = {
    "~model": instanceModel.name,
    "~key": key,
  };
  instanceModel.keys.map((k) => (result[k] = instance[k]));
  for (const field of query.fields || []) {
    result[field as string] = instance[field];
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
                pool
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
            pool
          );
          break;
        case "hasMany":
          const asName = (relEntry as any).as ?? relName;
          const relKey = getRelKey(relEntry, relName);
          const val = instance[relKey];
          switch (relEntry.type) {
            case "count": {
              result[asName] = instance[`count(${relKey})`];
              break;
            }
            case "exists": {
              result[asName] = instance[`exists(${relKey})`];
              break;
            }
            case "first":
              result[`~${asName}`] = val;
              result[asName] = reconcileInstanceQuery(
                relEntry as any,
                response,
                relModel,
                `${val}`,
                pool
              );
              break;
            default: {
              result[`~${asName}`] = val;
              result[asName] = (val as string[]).map((id) =>
                reconcileInstanceQuery(relEntry as any, response, relModel, `${id}`, pool)
              );
            }
          }
          break;
      }
    }
  }
  return result as any;
};
