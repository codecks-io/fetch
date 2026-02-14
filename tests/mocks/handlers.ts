import {http, HttpResponse} from "msw";

const queryMap: Record<string, any> = {
  '{"_root":[{"account":["name"]}]}': {
    _root: {account: 1},
    account: {
      1: {name: "myOrg", id: 1},
    },
  },
  '{"account(1)":["name"]}': {
    account: {
      1: {name: "myOrg", id: 1},
    },
  },
  '{"account(1)":["subdomain"]}': {
    account: {
      1: {subdomain: "myorg", id: 1},
    },
  },
  '{"account(1)":["name","subdomain"]}': {
    account: {
      1: {name: "myOrg", subdomain: "myorg", id: 1},
    },
  },
  '{"account(1)":["name"],"account(2)":["name"]}': {
    account: {
      1: {name: "myOrg", id: 1},
      2: {name: "myOrg2", id: 2},
    },
  },
  '{"account(2)":["subdomain"],"account(3)":["name","subdomain"]}': {
    account: {
      2: {subdomain: "myorg2", id: 2},
      3: {name: "myOrg3", subdomain: "myorg3", id: 3},
    },
  },
  '{"account(1)":["name",{"disabledBy":["name"]}]}': {
    account: {
      1: {name: "myOrg", id: 1, disabledBy: 2},
    },
    user: {
      2: {id: 2, name: "daniel"},
    },
  },
  '{"account(2)":["name",{"disabledBy":["name"]}]}': {
    account: {
      2: {name: "myOrg2", id: 2, disabledBy: null},
    },
  },
  '{"account(1)":["name",{"roles":["role"]}]}': {
    account: {
      1: {name: "myOrg", id: 1, roles: ["[1,1]", "[1,2]"]},
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
      1: {name: "myOrg", id: 1, createdAt: "2015-01-01T00:00:00.000Z"},
    },
  },
  '{"account(1)":["disabledAt"]}': {
    account: {
      1: {id: 1, disabledAt: null},
    },
  },
  '{\"account(1)\":[\"name\",\"count:roles\"]}': {
    account: {
      1: {name: "myOrg", id: 1, "count:roles": 1},
    },
  },
  '{\"_root\":[\"exists:releases\"]}': {
    _root: {
      "exists:releases": true,
    },
  },
  '{"_root":[{"releases({\\"$limit\\":5,\\"$order\\":\\"-createdAt\\"})":["title"]}]}': {
    _root: {
      'releases({"$limit":5,"$order":"-createdAt"})': ["1", "2", "3"],
    },
    release: {
      1: {title: "Release v1.0", id: 1, createdAt: "2025-11-01T00:00:00.000Z"},
      2: {title: "Release v0.9", id: 2, createdAt: "2025-10-15T00:00:00.000Z"},
      3: {title: "Release v0.8", id: 3, createdAt: "2025-10-01T00:00:00.000Z"},
    },
  },
  '{"account(1)":["name",{"roles({\\"$first\\":true,\\"$order\\":\\"-accountId\\"})":["role"]}]}': {
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
  http.post("https://api.example.com/", async ({request}) => {
    const body: any = await request.json();
    const queryAsStr = JSON.stringify(body.query);
    const response = queryMap[queryAsStr];
    // console.log("q", queryAsStr, response);
    if (!response) {
      return HttpResponse.json({error: `No mock reply for '${queryAsStr}'`}, {status: 404});
    }
    return HttpResponse.json(response);
  }),
];
