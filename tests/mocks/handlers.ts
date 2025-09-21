import { http, HttpResponse } from "msw";

const queryMap: Record<string, any> = {
  '{"_root":{"account":["name"]}}': {
    _root: { account: 1 },
    account: {
      1: { name: "myOrg", id: 1 },
    },
  },
  '{"account(1)":["name","subdomain"]}': {
    account: {
      1: { name: "myOrg", subdomain: "myorg", id: 1 },
    },
  },
  '{"account(1)":["name",{"disabledBy":["name"]}]}': {
    account: {
      1: { name: "myOrg", id: 1, disabledBy: 2 },
    },
    user: {
      2: { id: 2, name: "daniel" },
    },
  },
  '{"account(2)":["name",{"disabledBy":["name"]}]}': {
    account: {
      2: { name: "myOrg2", id: 2, disabledBy: null },
    },
  },
  '{"account(1)":["name",{"roles":["role"]}]}': {
    account: {
      1: { name: "myOrg", id: 1, roles: ["[1,1]", "[1,2]"] },
    },
    accountRole: {
      "[1,1]": {
        accountId: 1,
        userId: 1,
        role: "admin",
        "~model": "accountRole",
      },
      "[1,2]": {
        accountId: 1,
        userId: 2,
        role: "member",
        "~model": "accountRole",
      },
    },
  },
  '{"account(1)":["createdAt"]}': {
    account: {
      1: { name: "myOrg", id: 1, createdAt: "2015-01-01T00:00:00.000Z" },
    },
  },
  '{\"account(1)\":[\"name\",\"count(roles)\"]}': {
    account: {
      1: { name: "myOrg", id: 1, "count(roles)": 1 },
    },
  },
  '{"account(1)":["name",{"roles({\\"$first\\":true,\\"$order\\":\\"-accountId\\"})":["role"]}]}':
    {
      account: {
        1: {
          name: "myOrg",
          id: 1,
          'roles({"$first":true,"$order":"-accountId"})': "[1,1]",
        },
      },
      accountRole: {
        "[1,1]": {
          accountId: 1,
          userId: 1,
          role: "admin",
          "~model": "accountRole",
        },
      },
    },
};

export const handlers = [
  http.post("https://api.example.com/", async ({ request }) => {
    const body: any = await request.json();
    const response = queryMap[body.query];
    // console.log("q", body.query, response);
    if (!response) {
      return HttpResponse.json(
        { error: `No mock reply for '${body.query}'` },
        { status: 404 },
      );
    }
    return HttpResponse.json(response);
  }),
];
