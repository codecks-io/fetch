import type {modelMap} from "./models";
import type {InferModelQuery, ModelQuery} from "./query-type";

type ModelMap = typeof modelMap;

export type DataLoader = {
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

export type FetchOptions = {
  fetch?: FetchFunction;
  accessToken?: string;
  subdomain?: string;
  baseUrl?: string;
  headers?: Record<string, string>;
  timeout?: number;
};

export const configuredFetch = async (opts: FetchOptions, url: string, init: RequestInit = {}) => {
  const fetchImpl: FetchFunction = opts.fetch || globalThis.fetch;
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
