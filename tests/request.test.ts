import { test, expect } from "vitest";
import { buildFetchers } from "../src/queries";
import { accountDesc } from "../src/models/models";

const getFetchers = () =>
  buildFetchers({
    baseUrl: "https://api.example.com/",
  });

const simplifyModel = (obj: Record<string, any>) => {
  if (typeof obj !== "object" || !obj) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      const getValue = (): any => {
        if (key === "~model") return value.name;
        if (!value) return value;
        if (Array.isArray(value)) return value.map(simplifyModel);
        if (typeof value === "object") return simplifyModel(value);
        return value;
      };
      return [key, getValue()];
    }),
  );
};

test("base root test", async () => {
  const { fetchFromRoot } = getFetchers();
  const response = await fetchFromRoot({
    account: {
      fields: ["name"],
    },
  });
  await expect(simplifyModel(response)).toEqual({
    account: { "~model": "account", name: "myOrg", id: 1 },
  });
});

test("base model test", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(
    { "~model": accountDesc, id: 1 },
    { fields: ["name", "subdomain"] },
  );
  await expect(simplifyModel(response)).toEqual({
    id: 1,
    name: "myOrg",
    "~model": "account",
    subdomain: "myorg",
  });
});

test("belongsTo", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(
    { "~model": accountDesc, id: 1 },
    { fields: ["name"], relations: { disabledByUser: { fields: ["name"] } } },
  );
  await expect(simplifyModel(response)).toEqual({
    "~model": "account",
    id: 1,
    name: "myOrg",
    disabledBy: 2,
    disabledByUser: {
      "~model": "user",
      id: 2,
      name: "daniel",
    },
  });
});

test("belongsToIsNull", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(
    { "~model": accountDesc, id: 2 },
    { fields: ["name"], relations: { disabledByUser: { fields: ["name"] } } },
  );
  await expect(simplifyModel(response)).toEqual({
    "~model": "account",
    id: 2,
    name: "myOrg2",
    disabledBy: null,
    disabledByUser: null,
  });
});

test("hasMany", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(
    { "~model": accountDesc, id: 1 },
    { fields: ["name"], relations: { roles: { fields: ["role"] } } },
  );
  await expect(simplifyModel(response)).toEqual({
    "~model": "account",
    id: 1,
    name: "myOrg",
    "~roles": ["[1,1]", "[1,2]"],
    roles: [
      {
        "~model": "accountRole",
        accountId: 1,
        userId: 1,
        role: "admin",
      },
      {
        "~model": "accountRole",
        accountId: 1,
        userId: 2,
        role: "member",
      },
    ],
  });
});
