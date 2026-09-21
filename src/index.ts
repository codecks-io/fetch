import type {modelMap} from "./models";
import type {InferModelQuery, InferRelQuery, Instance, ModelQuery, RelQuery} from "./query-type";
import type {_rootDesc} from "./models/_root";
import {
  bearerTransport,
  legacyTransport,
  type DataLoader,
  type FetchOptions,
  type LegacyFetchOptions,
} from "./loaders/loader-utils";
import {createSimpleLoader} from "./loaders/simple-loader";

export {CodecksApiError} from "./loaders/loader-utils";
export type {DataLoader, FetchOptions, LegacyFetchOptions} from "./loaders/loader-utils";

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

export const buildFetchers = (opts: FetchOptions): Fetchers =>
  buildFetchersFromLoader(createSimpleLoader(bearerTransport(opts)));

/** @deprecated `X-Auth-Token` stops working on 2026-12-31. Use `buildFetchers` with an API token. */
export const buildLegacyFetchers = (opts: LegacyFetchOptions): Fetchers =>
  buildFetchersFromLoader(createSimpleLoader(legacyTransport(opts)));

export const buildFetchersFromLoader = (loader: DataLoader): Fetchers => {
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
