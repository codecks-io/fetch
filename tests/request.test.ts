import {test, expect, vi} from "vitest";
import {http, HttpResponse} from "msw";
import {buildFetchers, buildLegacyFetchers, CodecksApiError, type CardId} from "../src";
import {beforeAll, afterEach, afterAll} from "vitest";
import {server} from "./mocks/node";

const myAccountInstance = {"~model": "account", "~key": "1"} as const;

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const getFetchers = () =>
  buildFetchers({
    baseUrl: "https://api.example.com/",
    token: "cdxat_id_secret",
  });

test("base root test", async () => {
  const {fetchFromRoot} = getFetchers();
  const response = await fetchFromRoot({
    account: {
      fields: ["name"],
    },
  });
  // response.account.
  expect(response).toEqual({
    account: {"~model": "account", "~key": "1", name: "myOrg", id: 1},
    "~account": "1",
  });
});

test("base model test", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name", "subdomain"],
  });
  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    subdomain: "myorg",
  });
});

test("belongsTo", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(
    {"~model": "deck", "~key": "1"},
    {fields: ["title"], relations: {milestone: {fields: ["name"]}}}
  );
  expect(response).toEqual({
    "~model": "deck",
    "~key": "1",
    id: 1,
    title: "Backlog",
    milestoneId: 2,
    "~milestone": "2",
    milestone: {
      "~model": "milestone",
      "~key": "2",
      id: 2,
      name: "Alpha",
    },
  });
});

test("belongsToIsNull", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(
    {"~model": "deck", "~key": "2"},
    {fields: ["title"], relations: {milestone: {fields: ["name"]}}}
  );
  expect(response).toEqual({
    "~model": "deck",
    "~key": "2",
    id: 2,
    title: "Ideas",
    milestoneId: null,
    "~milestone": null,
    milestone: null,
  });
});

const gameAndWebsite = [
  {"~model": "project", "~key": "11", id: 11, name: "Game"},
  {"~model": "project", "~key": "12", id: 12, name: "Website"},
];

test("hasMany", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: {projects: {fields: ["name"]}},
  });
  response.projects[0];

  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    "~projects": ["11", "12"],
    projects: gameAndWebsite,
  });
});

test("hasManyNull", async () => {
  // The API returns null (rather than an empty array) for a hasMany with no rows
  // — e.g. a self-referential `childCards` on a card with no children. Reconcile
  // should yield an empty array, not throw on `null.map`.
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(
    {"~model": "account", "~key": "3"},
    {fields: ["name"], relations: {projects: {fields: ["name"]}}}
  );
  expect(response).toEqual({
    "~model": "account",
    "~key": "3",
    id: 3,
    name: "myOrg3",
    "~projects": [],
    projects: [],
  });
});

test("belongsTo pointing at a record the API withholds", async () => {
  // The API names the id and sends `null` for the record — a milestone the token may not
  // read. Reconcile yields null for the relation instead of throwing on the null record.
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(
    {"~model": "deck", "~key": "4"},
    {fields: ["title"], relations: {milestone: {fields: ["name"]}}}
  );
  expect(response).toEqual({
    "~model": "deck",
    "~key": "4",
    id: 4,
    title: "Secret",
    milestoneId: 9,
    "~milestone": "9",
    milestone: null,
  });
  // A withheld record is nothing the caller can act on, unlike an id the response never
  // mentioned — that one still warns.
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

test("hasMany naming a record the API withholds", async () => {
  // The withheld member is dropped from both arrays, so they stay aligned and every
  // element matches the inferred type, which has no null members.
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(
    {"~model": "account", "~key": "5"},
    {fields: ["name"], relations: {projects: {fields: ["name"]}}}
  );
  expect(response).toEqual({
    "~model": "account",
    "~key": "5",
    id: 5,
    name: "myOrg5",
    "~projects": ["51"],
    projects: [{"~model": "project", "~key": "51", id: 51, name: "Game"}],
  });
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

test("hasManyNamed", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: {projects: {as: "myProjects", fields: ["name"]}},
  });
  response.myProjects[0];

  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    "~myProjects": ["11", "12"],
    myProjects: gameAndWebsite,
  });
});

test("hasManyNamedInArray", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: {projects: [{as: "myProjects", fields: ["name"]}]},
  });
  response.myProjects[0];

  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    "~myProjects": ["11", "12"],
    myProjects: gameAndWebsite,
  });
});

test("transform fields", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(
    {"~model": "project", "~key": "1"},
    {fields: ["createdAt"]}
  );
  expect(response).toEqual({
    "~model": "project",
    "~key": "1",
    id: 1,
    createdAt: new Date("2015-01-01T00:00:00.000Z"),
  });
});

test("null date fields remain null", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(
    {"~model": "sprint", "~key": "1"},
    {fields: ["completedAt"]}
  );
  expect(response).toEqual({
    "~model": "sprint",
    "~key": "1",
    id: 1,
    completedAt: null,
  });
});

test("hasMany - count", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: {projects: {type: "count", as: "projectCount"}},
  });
  response.projectCount;
  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    projectCount: 2,
  });
});

test("hasMany - exists", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    relations: {cards: {type: "exists", as: "hasCards"}},
  });
  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    hasCards: true,
  });
});

test("hasMany - first", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: {
      projects: {
        type: "first",
        as: "newestProject",
        orderBy: "-createdAt",
        fields: ["name"],
      },
    },
  });

  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    "~newestProject": "11",
    newestProject: {"~model": "project", "~key": "11", id: 11, name: "Game"},
  });
});

const captureHeaders = () => {
  const seen: Headers[] = [];
  server.use(
    http.post("https://api.example.com/", ({request}) => {
      seen.push(request.headers);
      return HttpResponse.json({_root: {}});
    })
  );
  return seen;
};

// The API only accepts `cdxat_`/`cdxut_` tokens as Bearer, and ignores them in `X-Auth-Token`.
test("buildFetchers sends the token as a bearer header", async () => {
  const seen = captureHeaders();
  await getFetchers().fetchFromRoot({});
  expect(seen[0].get("authorization")).toBe("Bearer cdxat_id_secret");
  expect(seen[0].has("x-auth-token")).toBe(false);
});

// A legacy token sent as Bearer would be answered as if logged out, not with an error.
test("buildFetchers rejects a legacy token", () => {
  expect(() => buildFetchers({token: "3f2a9c"})).toThrow(/buildLegacyFetchers/);
});

test("buildLegacyFetchers sends X-Auth-Token and X-Account", async () => {
  const seen = captureHeaders();
  await buildLegacyFetchers({
    baseUrl: "https://api.example.com/",
    accessToken: "3f2a9c",
    subdomain: "myorg",
  }).fetchFromRoot({});
  expect(seen[0].get("x-auth-token")).toBe("3f2a9c");
  expect(seen[0].get("x-account")).toBe("myorg");
  expect(seen[0].has("authorization")).toBe(false);
});

test("error responses become a CodecksApiError", async () => {
  server.use(
    http.post("https://api.example.com/", () =>
      HttpResponse.json(
        {
          error: "unknown_field",
          message: "'account' has no field 'nme'",
          path: "_root.account.nme",
          statusCode: 400,
        },
        {status: 400}
      )
    )
  );
  const err = await getFetchers()
    .fetchFromRoot({account: {fields: ["name"]}})
    .catch((e) => e);
  expect(err).toBeInstanceOf(CodecksApiError);
  expect(err).toMatchObject({status: 400, code: "unknown_field", path: "_root.account.nme"});
});

// The API puts the reason for a refused token in `message`, not `error`.
test("a refused token's reason becomes the code", async () => {
  server.use(
    http.post("https://api.example.com/", () =>
      HttpResponse.json(
        {error: "Unauthorized", message: "token_expired", statusCode: 401},
        {status: 401}
      )
    )
  );
  const err = await getFetchers()
    .fetchFromRoot({account: {fields: ["name"]}})
    .catch((e) => e);
  expect(err).toMatchObject({status: 401, code: "token_expired"});
});

test("a non-JSON error body still becomes a CodecksApiError", async () => {
  server.use(
    http.post("https://api.example.com/", () => new HttpResponse("Bad Gateway", {status: 502}))
  );
  const err = await getFetchers()
    .fetchFromRoot({account: {fields: ["name"]}})
    .catch((e) => e);
  expect(err).toMatchObject({status: 502, code: null, body: "Bad Gateway"});
});

// The API wraps an action's response as `{payload, actionId}`.
test("dispatch posts the params and returns the payload", async () => {
  let request: {url: string; body: unknown} | null = null;
  server.use(
    http.post("https://api.example.com/dispatch/cards/create", async ({request: r}) => {
      request = {url: r.url, body: await r.json()};
      return HttpResponse.json({payload: {id: "c1", accountSeq: 12}, actionId: "a1"});
    })
  );
  const res = await getFetchers().dispatch("cards/create", {content: "Fix login", deckId: null});
  expect(request).toEqual({
    url: "https://api.example.com/dispatch/cards/create",
    body: {content: "Fix login", deckId: null},
  });
  expect(res).toEqual({id: "c1", accountSeq: 12});
});

test("an action refused for a missing scope has the code missing_scope", async () => {
  server.use(
    http.post("https://api.example.com/dispatch/cards/update", () =>
      HttpResponse.json(
        {
          error: "missing_scope",
          message: "requires card:write",
          requiredScope: "card:write",
          statusCode: 403,
        },
        {status: 403}
      )
    )
  );
  const err = await getFetchers()
    .dispatch("cards/update", {id: "c1" as CardId, status: "done"})
    .catch((e) => e);
  expect(err).toBeInstanceOf(CodecksApiError);
  expect(err).toMatchObject({
    status: 403,
    code: "missing_scope",
    message: "[403] requires card:write",
    body: {requiredScope: "card:write"},
  });
});

test("an action's own refusal becomes the message", async () => {
  server.use(
    http.post("https://api.example.com/dispatch/cards/update", () =>
      HttpResponse.json({payload: {error: "Can't start a hero card directly"}}, {status: 400})
    )
  );
  const err = await getFetchers()
    .dispatch("cards/update", {id: "c1" as CardId, status: "started"})
    .catch((e) => e);
  expect(err).toMatchObject({
    status: 400,
    code: null,
    message: "[400] Can't start a hero card directly",
  });
});

// "https://api.example.com" + "dispatch/…" used to become "https://api.example.comdispatch/…".
test("a baseUrl without a trailing slash still reaches the API", async () => {
  const urls: string[] = [];
  server.use(
    http.post("https://api.example.com/dispatch/cards/update", ({request}) => {
      urls.push(request.url);
      return HttpResponse.json({payload: null});
    })
  );
  await buildFetchers({baseUrl: "https://api.example.com", token: "cdxat_id_secret"}).dispatch(
    "cards/update",
    {id: "c1" as CardId, status: "done"}
  );
  expect(urls).toEqual(["https://api.example.com/dispatch/cards/update"]);
});
