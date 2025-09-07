import { ModelPool, type ApiResponse } from "./model-pool";
import type { AnyDesc } from "./models/_desc";
import { modelMap } from "./models";
import { serializeInstanceQuery, serializeRootQuery } from "./query-helpers";
import type {
  InferModelQuery,
  InferRelQuery,
  Instance,
  ModelQuery,
  RelQuery,
} from "./query-type";
import { reconcileInstanceQuery, reconcileRootQuery } from "./reconcile-query";
import type { _rootDesc } from "./models/_root";

type ModelMap = typeof modelMap;

type Fetchers = {
  fetchFromRoot: <const Q extends RelQuery<typeof _rootDesc, ModelMap>>(
    q: Q,
  ) => Promise<InferRelQuery<typeof _rootDesc, Q, ModelMap>>;
  fetchFromInstance: <
    M extends AnyDesc,
    const Q extends ModelQuery<M, ModelMap>,
  >(
    instance: Instance<M>,
    q: Q,
  ) => Promise<InferModelQuery<M, Q, ModelMap>>;
  fetchInstance: <
    K extends keyof ModelMap,
    const Q extends RelQuery<ModelMap[K], ModelMap>,
  >(
    model: K,
    id: string,
    q: Q,
  ) => Promise<InferModelQuery<ModelMap[K], Q, ModelMap>>;
  fetchInstances: <
    K extends keyof ModelMap,
    Id extends string,
    const Q extends RelQuery<ModelMap[K], ModelMap>,
  >(
    model: K,
    id: Id[],
    q: Q,
  ) => Promise<Record<Id, InferModelQuery<ModelMap[K], Q, ModelMap>>>;
};

type FetchFunction = (url: string, init?: RequestInit) => Promise<Response>;

type FetcherOptions = {
  fetch?: FetchFunction;
  accessToken?: string;
  subdomain?: string;
  baseUrl?: string;
  headers?: Record<string, string>;
  timeout?: number;
};

export const buildFetchers = (opts: FetcherOptions = {}): Fetchers => {
  const fetchImpl: FetchFunction = opts.fetch || globalThis.fetch;

  const configuredFetch = async (url: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    if (opts.accessToken) {
      headers.set("X-Auth-Token", opts.accessToken);
    }
    if (opts.subdomain) {
      headers.set("X-Account", opts.subdomain);
    }
    if (opts.headers) {
      Object.entries(opts.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }
    const fullUrl = opts.baseUrl ? `${opts.baseUrl}${url}` : url;

    return fetchImpl(fullUrl, { ...init, headers });
  };

  const fetchWithQuery = async (query: Record<string, unknown>) => {
    const response = await configuredFetch("", {
      method: "POST",
      body: JSON.stringify({ query: JSON.stringify(query) }),
    }).then(async (r) => {
      const content = await r.json();
      if (r.status !== 200) {
        throw new Error(`[${r.status}] ${JSON.stringify(content)}`);
      }
      return content as Promise<ApiResponse>;
    });
    return response;
  };
  const _fetchSingleInstance = async <
    M extends AnyDesc,
    const Q extends ModelQuery<M, ModelMap>,
  >(
    instance: Instance<M>,
    q: Q,
  ): Promise<InferModelQuery<M, Q, ModelMap>> => {
    const response = await fetchWithQuery(
      serializeInstanceQuery(q, [instance]),
    );
    const pool = new ModelPool(modelMap);
    pool.add(response);
    return reconcileInstanceQuery(
      q,
      response,
      instance["~model"],
      instance["~key"],
      pool,
    );
  };

  return {
    fetchFromRoot: async (q) => {
      const response = await fetchWithQuery(serializeRootQuery(q));
      const pool = new ModelPool(modelMap);
      pool.add(response);
      return reconcileRootQuery(q, response, pool);
    },
    fetchFromInstance: _fetchSingleInstance,
    fetchInstance: async (key, id, q) => {
      const modelDesc = modelMap[key];
      const instance: Instance<typeof modelDesc> = {
        "~model": modelDesc,
        "~key": id,
      };
      return _fetchSingleInstance(instance, q);
    },
    fetchInstances: async (key, ids, q) => {
      const modelDesc = modelMap[key];
      const instances: Instance<typeof modelDesc>[] = ids.map((id) => ({
        "~model": modelDesc,
        "~key": id,
      }));
      const response = await fetchWithQuery(
        serializeInstanceQuery(q, instances),
      );
      const pool = new ModelPool(modelMap);
      pool.add(response);
      return Object.fromEntries(
        ids.map((id) => [
          id,
          reconcileInstanceQuery(q, response, modelDesc, id, pool),
        ]),
      ) as any;
    },
  };
};
