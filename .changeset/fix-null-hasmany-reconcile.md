---
"@codecks/fetch": patch
---

Fix crash when reconciling a hasMany relation that the API returns as `null`
instead of an empty array (e.g. a self-referential `childCards` on a card with
no children). Such relations now reconcile to `[]` rather than throwing
`Cannot read properties of null (reading 'map')`.
