import type { ApiResponse, ModelPool } from "./model-pool";
import type { AnyDesc } from "./models/_desc";
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
      rootDesc.hasMany[relName as keyof (typeof rootDesc)["hasMany"]];
    const id = responsePart[relName];
    if (!id) {
      result[relName] = null;
      continue;
    } else {
      result[relName] = reconcileInstanceQuery(
        modelFields as any,
        response,
        relDesc.getModel(),
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
  const result: Record<string, any> = { "~model": instanceModel, "~key": key };
  instanceModel.keys.map((k) => (result[k] = instance[k]));
  for (const field of query.fields || []) {
    result[field as string] = instance[field];
  }
  for (const [relName, _modelFields] of Object.entries(query.relations || {})) {
    const modelFieldsList = Array.isArray(_modelFields)
      ? _modelFields
      : [_modelFields];
    for (const modelFields of modelFieldsList) {
      const belongsToKey = instanceModel.belongsToMap[relName];
      const getRelDesc = () => {
        if (belongsToKey) {
          return instanceModel.fields[belongsToKey].getModel();
        } else {
          return instanceModel.hasMany[relName];
        }
      };
      const relDesc = getRelDesc();
      if (!relDesc) {
        throw new Error(
          `Can't find relation ${relName} in ${instanceModel.name}`,
        );
      }
      const idObj = instance[belongsToKey ?? relName];
      if (belongsToKey) {
        result[belongsToKey] = idObj;
        if (!idObj) {
          result[relName] = null;
        } else {
          result[relName] = reconcileInstanceQuery(
            modelFields as any,
            response,
            relDesc,
            `${idObj}`,
            pool,
          );
        }
      } else {
        const asName = (modelFields as any).as ?? relName;
        result[`~${asName}`] = idObj;
        if (relDesc.isSingleton) {
          if (!idObj) {
            result[asName] = null;
          } else {
            result[asName] = reconcileInstanceQuery(
              modelFields as any,
              response,
              relDesc,
              `${idObj}`,
              pool,
            );
          }
        } else {
          result[asName] = (idObj as any[]).map((id) =>
            reconcileInstanceQuery(
              modelFields as any,
              response,
              relDesc.getModel(),
              `${id}`,
              pool,
            ),
          );
        }
      }
    }
  }
  return result as any;
};
