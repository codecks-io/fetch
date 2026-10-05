---
"@codecks/fetch": minor
---

`dispatch(name, params)` calls an action of the API, e.g.
`dispatch("cards/update", {id, status: "done"})`. Its params and response are typed from the API
reference for all of its actions; each action's JSDoc holds its description and required scopes,
and `schema/actions.md` lists them. Enums in params are closed: only the values the API accepts
type-check. `ActionMap`, `ActionName`, `ActionParams` and `ActionResponse` are exported.

A refused action throws a `CodecksApiError` whose message is the API's reason, e.g.
`[403] requires card:write`.

**Breaking** for custom loaders: `DataLoader` needs a `dispatch(name, params)` method that posts
the params to `dispatch/<name>` and returns the answer's `payload`.
