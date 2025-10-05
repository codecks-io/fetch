import {ModelPool, type ApiResponse} from "./model-pool";
import {modelMap} from "./models";
import {serializeInstanceQuery} from "./query-helpers";
import type {InferModelQuery, Instance, ModelQuery} from "./query-type";
import {reconcileInstanceQuery} from "./reconcile-query";

type ModelMap = typeof modelMap;

type DataLoader = {
  fetchModel: <
    K extends keyof ModelMap,
    Id extends string,
    const Q extends ModelQuery<ModelMap[K], ModelMap>,
  >(
    model: K,
    id: Id[],
    q: Q
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

export const createSimpleLoader = (opts: FetcherOptions = {}): DataLoader => {
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

    return fetchImpl(fullUrl, {...init, headers});
  };

  const fetchWithQuery = async (query: Record<string, unknown>) => {
    const response = await configuredFetch("", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({query}),
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
    fetchModel: async (model, ids, q) => {
      const modelDesc = modelMap[model];
      const instances: Instance<typeof model>[] = ids.map((id) => ({
        "~model": model,
        "~key": id,
      }));
      const response = await fetchWithQuery(serializeInstanceQuery(q, instances, modelMap));
      const pool = new ModelPool(modelMap);
      pool.add(response);
      return Object.fromEntries(
        ids.map((id) => [id, reconcileInstanceQuery(q, response, modelDesc, id, pool)])
      ) as any;
    },
  };
};
