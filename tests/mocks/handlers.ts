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
  '{"deck(1)":["title",{"milestone":["name"]}]}': {
    deck: {
      1: {title: "Backlog", id: 1, milestone: 2},
    },
    milestone: {
      2: {id: 2, name: "Alpha"},
    },
  },
  '{"deck(2)":["title",{"milestone":["name"]}]}': {
    deck: {
      2: {title: "Ideas", id: 2, milestone: null},
    },
  },
  '{"account(1)":["name",{"projects":["name"]}]}': {
    account: {
      1: {name: "myOrg", id: 1, projects: ["11", "12"]},
    },
    project: {
      11: {id: 11, name: "Game"},
      12: {id: 12, name: "Website"},
    },
  },
  '{"account(3)":["name",{"projects":["name"]}]}': {
    account: {
      3: {name: "myOrg3", id: 3, projects: null},
    },
  },
  // The API names an id but sends `null` for the record when the token may not read it.
  '{"deck(4)":["title",{"milestone":["name"]}]}': {
    deck: {
      4: {title: "Secret", id: 4, milestone: 9},
    },
    milestone: {
      9: null,
    },
  },
  '{"account(5)":["name",{"projects":["name"]}]}': {
    account: {
      5: {name: "myOrg5", id: 5, projects: ["51", "52"]},
    },
    project: {
      51: {id: 51, name: "Game"},
      52: null,
    },
  },
  '{"project(1)":["createdAt"]}': {
    project: {
      1: {id: 1, createdAt: "2015-01-01T00:00:00.000Z"},
    },
  },
  '{"sprint(1)":["completedAt"]}': {
    sprint: {
      1: {id: 1, completedAt: null},
    },
  },
  '{"account(1)":["name","count:projects"]}': {
    account: {
      1: {name: "myOrg", id: 1, "count:projects": 2},
    },
  },
  '{"account(1)":["exists:cards"]}': {
    account: {
      1: {id: 1, "exists:cards": true},
    },
  },
  '{"account(1)":[{"projects({\\"$limit\\":5,\\"$order\\":\\"-createdAt\\"})":["name"]}]}': {
    account: {
      1: {id: 1, 'projects({"$limit":5,"$order":"-createdAt"})': ["11", "12"]},
    },
    project: {
      11: {id: 11, name: "Game", createdAt: "2025-11-01T00:00:00.000Z"},
      12: {id: 12, name: "Website", createdAt: "2025-10-15T00:00:00.000Z"},
    },
  },
  '{"account(1)":["name",{"projects({\\"$first\\":true,\\"$order\\":\\"-createdAt\\"})":["name"]}]}':
    {
      account: {
        1: {
          name: "myOrg",
          id: 1,
          'projects({"$first":true,"$order":"-createdAt"})': "11",
        },
      },
      project: {
        11: {id: 11, name: "Game"},
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
