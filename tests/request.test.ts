import {test, expect, vi} from "vitest";
import {http, HttpResponse} from "msw";
import {buildFetchers, buildLegacyFetchers, CodecksApiError} from "../src";
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
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: {disabledBy: {fields: ["name"]}},
  });
  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    disabledById: 2,
    "~disabledBy": "2",
    disabledBy: {
      "~model": "user",
      "~key": "2",
      id: 2,
      name: "daniel",
    },
  });
});

test("belongsToIsNull", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(
    {"~model": "account", "~key": "2"},
    {fields: ["name"], relations: {disabledBy: {fields: ["name"]}}}
  );
  expect(response).toEqual({
    "~model": "account",
    "~key": "2",
    id: 2,
    name: "myOrg2",
    disabledById: null,
    "~disabledBy": null,
    disabledBy: null,
  });
});

test("hasMany", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: {roles: {fields: ["role"]}},
  });
  response.roles[0];

  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    "~roles": ["[1,1]", "[1,2]"],
    roles: [
      {
        "~model": "accountRole",
        "~key": "[1,1]",
        accountId: 1,
        userId: 1,
        role: "admin",
      },
      {
        "~model": "accountRole",
        "~key": "[1,2]",
        accountId: 1,
        userId: 2,
        role: "member",
      },
    ],
  });
});

test("hasManyNull", async () => {
  // The API returns null (rather than an empty array) for a hasMany with no rows
  // — e.g. a self-referential `childCards` on a card with no children. Reconcile
  // should yield an empty array, not throw on `null.map`.
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(
    {"~model": "account", "~key": "3"},
    {fields: ["name"], relations: {roles: {fields: ["role"]}}}
  );
  expect(response).toEqual({
    "~model": "account",
    "~key": "3",
    id: 3,
    name: "myOrg3",
    "~roles": [],
    roles: [],
  });
});

test("belongsTo pointing at a record the API withholds", async () => {
  // The API names the id and sends `null` for the record — a user the token may not
  // read. Reconcile yields null for the relation instead of throwing on the null record.
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(
    {"~model": "account", "~key": "4"},
    {fields: ["name"], relations: {disabledBy: {fields: ["name"]}}}
  );
  expect(response).toEqual({
    "~model": "account",
    "~key": "4",
    id: 4,
    name: "myOrg4",
    disabledById: 9,
    "~disabledBy": "9",
    disabledBy: null,
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
    {fields: ["name"], relations: {roles: {fields: ["role"]}}}
  );
  expect(response).toEqual({
    "~model": "account",
    "~key": "5",
    id: 5,
    name: "myOrg5",
    "~roles": ["[5,1]"],
    roles: [
      {
        "~model": "accountRole",
        "~key": "[5,1]",
        accountId: 5,
        userId: 1,
        role: "admin",
      },
    ],
  });
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

test("hasManyNamed", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: {roles: {as: "myRoles", fields: ["role"]}},
  });
  response.myRoles[0];

  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    "~myRoles": ["[1,1]", "[1,2]"],
    myRoles: [
      {
        "~model": "accountRole",
        "~key": "[1,1]",
        accountId: 1,
        userId: 1,
        role: "admin",
      },
      {
        "~model": "accountRole",
        "~key": "[1,2]",
        accountId: 1,
        userId: 2,
        role: "member",
      },
    ],
  });
});

test("hasManyNamedInArray", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: {roles: [{as: "myRoles", fields: ["role"]}]},
  });
  response.myRoles[0];

  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    "~myRoles": ["[1,1]", "[1,2]"],
    myRoles: [
      {
        "~model": "accountRole",
        "~key": "[1,1]",
        accountId: 1,
        userId: 1,
        role: "admin",
      },
      {
        "~model": "accountRole",
        "~key": "[1,2]",
        accountId: 1,
        userId: 2,
        role: "member",
      },
    ],
  });
});

test("transform fields", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["createdAt"],
  });
  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    createdAt: new Date("2015-01-01T00:00:00.000Z"),
  });
});

test("null date fields remain null", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["disabledAt"],
  });
  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    disabledAt: null,
  });
});

test("hasMany - count", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: {roles: {type: "count", as: "roleCount"}},
  });
  response.roleCount;
  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    roleCount: 1,
  });
});

test("hasMany on root", async () => {
  const {fetchFromRoot} = getFetchers();
  const response = await fetchFromRoot({
    releases: {
      type: "exists",
      as: "hasReleases",
    },
  });
  expect(response).toEqual({
    hasReleases: true,
  });
});

test("hasMany - first", async () => {
  const {fetchFromInstance} = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: {
      roles: {
        type: "first",
        as: "firstRole",
        orderBy: "-accountId",
        fields: ["role"],
      },
    },
  });

  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    "~firstRole": "[1,1]",
    firstRole: {
      "~model": "accountRole",
      "~key": "[1,1]",
      accountId: 1,
      userId: 1,
      role: "admin",
    },
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

test("a non-JSON error body still becomes a CodecksApiError", async () => {
  server.use(
    http.post("https://api.example.com/", () => new HttpResponse("Bad Gateway", {status: 502}))
  );
  const err = await getFetchers()
    .fetchFromRoot({account: {fields: ["name"]}})
    .catch((e) => e);
  expect(err).toMatchObject({status: 502, code: null, body: "Bad Gateway"});
});
