import type {modelMap} from "../models";
import type {InferModelQuery, ModelQuery} from "../query-type";

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

type BaseFetchOptions = {
  fetch?: FetchFunction;
  baseUrl?: string;
  headers?: Record<string, string>;
  /** in milliseconds */
  timeout?: number;
};

export type FetchOptions = BaseFetchOptions & {
  /** an organization (`cdxat_…`) or personal (`cdxut_…`) API token */
  token: string;
};

/** @deprecated `X-Auth-Token` stops working on 2026-12-31. Use `FetchOptions` with an API token. */
export type LegacyFetchOptions = BaseFetchOptions & {
  /** sent as `X-Auth-Token` */
  accessToken?: string;
  /** sent as `X-Account` */
  subdomain?: string;
};

/** Fetch options with the auth headers already folded into `headers`. */
export type TransportOptions = BaseFetchOptions & {authHeaders: Record<string, string>};

export const DEFAULT_BASE_URL = "https://api.codecks.io/";

export const bearerTransport = (opts: FetchOptions): TransportOptions => {
  const {token, ...rest} = opts;
  // The API ignores anything else sent as a bearer token and answers as if logged out.
  if (!/^cdx[au]t_/.test(token)) {
    throw new Error(
      "Expected an API token starting with `cdxat_` or `cdxut_`. Legacy tokens need `buildLegacyFetchers`."
    );
  }
  return {
    baseUrl: DEFAULT_BASE_URL,
    ...rest,
    authHeaders: {Authorization: `Bearer ${token}`},
  };
};

export const legacyTransport = (opts: LegacyFetchOptions): TransportOptions => {
  const {accessToken, subdomain, ...rest} = opts;
  const authHeaders: Record<string, string> = {};
  if (accessToken) authHeaders["X-Auth-Token"] = accessToken;
  if (subdomain) authHeaders["X-Account"] = subdomain;
  return {...rest, authHeaders};
};

/** A non-2xx answer. `code`, `path` and the rest of the body follow the API's error format. */
export class CodecksApiError extends Error {
  readonly status: number;
  /** e.g. `invalid_token`, `token_expired`, `missing_scope`, `unknown_field`, `rate_limit` */
  readonly code: string | null;
  /** where in the query the error sits, e.g. `_root.account.cards.titel` */
  readonly path: string | null;
  /** the parsed JSON body, or the raw text if it wasn't JSON — holds `hint`, `requiredScope`, … */
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    const obj = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    const str = (v: unknown) => (typeof v === "string" ? v : null);
    // Auth failures answer `{error: "Unauthorized", message: "token_expired"}`, so the code is
    // whichever of the two is a snake_case identifier.
    const isCode = (v: string | null): v is string => v !== null && /^[a-z][a-z0-9_]*$/.test(v);
    const code = [str(obj.error), str(obj.message)].find(isCode) ?? null;
    super(`[${status}] ${str(obj.message) ?? code ?? (str(body) || "request failed")}`);
    this.name = "CodecksApiError";
    this.status = status;
    this.code = code;
    this.path = str(obj.path);
    this.body = body;
  }
}

const readErrorBody = async (r: Response) => {
  const text = await r.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export const configuredFetch = async <T>(
  opts: TransportOptions,
  url: string,
  init: RequestInit = {}
): Promise<T> => {
  const fetchImpl: FetchFunction = opts.fetch || globalThis.fetch;
  const headers = new Headers(init.headers);
  for (const [key, value] of Object.entries(opts.authHeaders)) headers.set(key, value);
  if (opts.headers) {
    for (const [key, value] of Object.entries(opts.headers)) headers.set(key, value);
  }
  const fullUrl = opts.baseUrl ? `${opts.baseUrl}${url}` : url;
  const signal = opts.timeout ? AbortSignal.timeout(opts.timeout) : init.signal;

  const r = await fetchImpl(fullUrl, {...init, headers, signal});
  if (r.status < 200 || r.status >= 300)
    throw new CodecksApiError(r.status, await readErrorBody(r));
  return (await r.json()) as T;
};
