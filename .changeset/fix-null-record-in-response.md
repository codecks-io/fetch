---
"@codecks/fetch": patch
---

Fix crash when the API names an id but answers `null` for the record — a card, user or
other row the token may not read because it was deleted or sits in a project the token
does not cover. Such a record is now skipped instead of being handed to `Object.entries`,
which threw `Cannot convert undefined or null to object` and failed the whole request.

A withheld record reconciles to `null` on a `belongsTo` or `hasOne`, and is dropped from
a `hasMany` array (from both the array and its `~`-prefixed list of ids, so the two stay
aligned) — the inferred type has no null members. Two consequences worth knowing: a
non-optional `belongsTo` pointing at a withheld record now yields `null` where its type
says otherwise, and a `hasMany` page can come back shorter than the `$limit` that was
asked for, so paging while `length === limit` can stop one page early.

`reconcileInstanceQuery` no longer warns `no instance found in pool` for these ids, since
the caller cannot act on them. An id the response never mentioned at all still warns.
