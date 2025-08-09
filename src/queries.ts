import { ModelPool, type ApiResponse } from "./model-pool";
import type { StrictAnyDesc } from "./models/_desc";
import { modelMap, type rootDesc } from "./models/models";
import { serializeInstanceQuery, serializeRootQuery } from "./query-helpers";
import type {
  InferModelDict,
  InferRelDict,
  Instance,
  ModelDict,
  RelDict,
} from "./query-type";
import { reconcileInstanceQuery, reconcileRootQuery } from "./reconcile-query";

type Fetchers = {
  fetchFromRoot: <const T extends RelDict<typeof rootDesc>>(
    q: T,
  ) => Promise<InferRelDict<typeof rootDesc, T>>;
  fetchFromInstance: <M extends StrictAnyDesc, const T extends ModelDict<M>>(
    instance: Instance<M> & Record<string, any>,
    q: T,
  ) => Promise<InferModelDict<M, T>>;
  // fetchFromInstances: <M extends StrictAnyDesc, const T extends ModelDict<M>>(
  //   instances: Instance<M>[],
  //   q: T,
  // ) => Promise<Record<string, InferModelDict<M, T>>>;
};

type FetchFunction = (url: string, init?: RequestInit) => Promise<Response>;

type FetcherOptions = {
  // Option 1: Use custom fetch implementation
  fetch?: FetchFunction;

  // Option 2: Use default fetch but with configuration
  accessToken?: string;
  baseUrl?: string;

  // Additional common options
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

  return {
    fetchFromRoot: async (q) => {
      const response = await fetchWithQuery(serializeRootQuery(q));
      const pool = new ModelPool(modelMap);
      pool.add(response);
      return reconcileRootQuery(q, response, pool);
    },
    fetchFromInstance: async (instance, q) => {
      const response = await fetchWithQuery(
        serializeInstanceQuery(q, [instance]),
      );
      const pool = new ModelPool(modelMap);
      pool.add(response);
      return reconcileInstanceQuery(
        q,
        response,
        instance["~model"],
        instance.id,
        pool,
      );
    },
    // fetchFromInstances: async (instances, q) => {
    //   const getInstanceKey = (instance: Instance<StrictAnyDesc>) => {
    //     const keys = instance["~model"].keys;
    //     if (keys.length === 1) {
    //       return (instance as any)[keys[0]];
    //     }
    //     return JSON.stringify(keys.map((f) => (instance as any)[f]));
    //   }
    //   const response = await fetchWithQuery(serializeInstanceQuery(q, instances));
    //   const pool = new ModelPool(modelMap);
    //   pool.add(response);
    //   return Object.fromEntries(instances.map(instance => [getInstanceKey(instance)]))
    // }
  };
};
