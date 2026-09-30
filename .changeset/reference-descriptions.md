---
"@codecks/fetch": minor
---

Models, fields and relations carry the API reference's descriptions as JSDoc, so editors show what
e.g. `card.title` or `card.masterTags` holds; `schema/*.md` lists them too.

The models also follow the latest reference: `attachment.creator`, `cardHistory.changer` and
`file.uploader` may be `null`, and `sprint.creator` is gone from the types.
