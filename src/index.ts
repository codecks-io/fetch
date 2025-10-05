import {modelMap} from "./models";
import type {InferModelQuery, InferRelQuery, Instance, ModelQuery, RelQuery} from "./query-type";
import {_rootDesc} from "./models/_root";
import type {DataLoader} from "./loader-utils";
import {createSimpleLoader, type SimpleLoaderOptions} from "./simple-loader";

type ModelMap = typeof modelMap;

type Fetchers = {
  fetchFromRoot: <const Q extends RelQuery<typeof _rootDesc, ModelMap>>(
    q: Q
  ) => Promise<InferRelQuery<typeof _rootDesc, Q, ModelMap>>;
  fetchFromInstance: <M extends keyof ModelMap, const Q extends ModelQuery<ModelMap[M], ModelMap>>(
    instance: Instance<M>,
    q: Q
  ) => Promise<InferModelQuery<ModelMap[M], Q, ModelMap>>;
  fetchInstance: <K extends keyof ModelMap, const Q extends ModelQuery<ModelMap[K], ModelMap>>(
    model: K,
    id: string,
    q: Q
  ) => Promise<InferModelQuery<ModelMap[K], Q, ModelMap>>;
  fetchInstances: <
    K extends keyof ModelMap,
    Id extends string,
    const Q extends ModelQuery<ModelMap[K], ModelMap>,
  >(
    model: K,
    id: Id[],
    q: Q
  ) => Promise<Record<Id, InferModelQuery<ModelMap[K], Q, ModelMap>>>;
};

export const buildFetchersWithSimpleLoader = (opts: SimpleLoaderOptions) => {
  const loader = createSimpleLoader(opts);
  return buildFetchers(loader);
};

export const buildFetchers = (loader: DataLoader): Fetchers => {
  return {
    fetchFromRoot: async (q) => {
      const res = await loader.fetchModel("_root", [""], {relations: q});
      return res[""] as any;
    },
    fetchFromInstance: async (instance, q) => {
      const key = instance["~key"];
      const res = await loader.fetchModel(instance["~model"], [key], q);
      return res[key];
    },
    fetchInstance: async (model, key, q) => {
      const res = await loader.fetchModel(model, [key], q);
      return res[key];
    },
    fetchInstances: loader.fetchModel,
  };
};
