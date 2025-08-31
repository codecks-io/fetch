import type { ApiResponse, ModelPool } from "./model-pool";
import type { AnyDesc, RelationEntry, RelationOpts } from "./models/_desc";
import { modelMap, rootDesc } from "./models/models";
import type {
  InferModelQuery,
  InferRelQuery,
  ModelQuery,
  RelQuery,
} from "./query-type";

export const reconcileRootQuery = <
  T extends RelQuery<typeof rootDesc, typeof modelMap>,
>(
  query: T,
  response: ApiResponse,
  pool: ModelPool,
): InferRelQuery<typeof rootDesc, T, typeof modelMap> => {
  const result: Record<string, any> = {};
  const responsePart = response._root;
  for (const [relName, modelFields] of Object.entries(query)) {
    const relDesc =
      rootDesc.relations[relName as keyof (typeof rootDesc)["relations"]];
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
        pool,
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
  pool: ModelPool,
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
  for (const [relName, _modelFields] of Object.entries(query.relations || {})) {
    const modelFieldsList = Array.isArray(_modelFields)
      ? _modelFields
      : [_modelFields];
    for (const modelFields of modelFieldsList) {
      const relDesc = instanceModel.relations[relName] as RelationEntry<
        any,
        any
      >;
      if (!relDesc) {
        throw new Error(
          `Can't find relation ${relName} in ${instanceModel.name}`,
        );
      }
      const opts = relDesc.options as RelationOpts;
      const relModel = modelMap[relDesc.relName];

      switch (opts.type) {
        case "belongsTo":
          result[opts.fk] = instance[relName];
          result[relName] = opts.fk
            ? reconcileInstanceQuery(
                modelFields as any,
                response,
                relModel,
                `${instance[relName]}`,
                pool,
              )
            : null;
          break;
        case "hasOne":
          result[`~${relName}`] = instance[relName];
          result[relName] = reconcileInstanceQuery(
            modelFields as any,
            response,
            relModel,
            `${instance[relName]}`,
            pool,
          );
          break;
        case "hasMany":
          const asName = (modelFields as any).as ?? relName;
          result[`~${asName}`] = instance[relName];
          result[asName] = (instance[relName] as string[]).map((id) =>
            reconcileInstanceQuery(
              modelFields as any,
              response,
              relModel,
              `${id}`,
              pool,
            ),
          );
          break;
      }
    }
  }
  return result as any;
};
