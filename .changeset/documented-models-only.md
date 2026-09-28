---
"@codecks/fetch": major
---

The models are generated from the Codecks API reference, so they only contain what the API documents, typed the way the API documents them.

- Undocumented models, fields and relations are gone from the types and from `schema/*.md`, e.g.
  `account.seats`, `account.roles` and the `_root` relations other than `account`,
  `loggedInUser` and `releases`. The API still answers them, but they can change without notice.
- Fields and relations the API marks `preview` carry `@experimental`; deprecated ones carry
  `@deprecated` with their removal date, so editors strike them through on a query's result.
  `schema/*.md` shows the same markers.
- Enums are typed as open unions: `card.status` is
  `"not_started" | "started" | "snoozing" | "done" | (string & {})`. The values autocomplete, but a
  `switch` over one isn't exhaustive, since the API may add values.
- json and array fields are typed instead of `any`: `card.checkboxInfo` is `Checkbox[]`,
  `milestone.userCapacities` is `{[userId: UserId]: number}`. Ids inside arrays and maps are
  nominal: `card.mentionedUsers` is `UserId[]`. Timestamps and days nested in a json value stay
  strings; top-level ones still parse to a `Date` and `{year, month, day}`.
- The reference's named types (`Priority`, `Checkbox`, `DefaultCard`, `Workdays`, …) and every
  model's id type (`CardId`, `UserId`, …) are exported from the package.
- Foreign keys come from the reference instead of being guessed from the relation name.
  `resolvableEntryReaction.resolvableEntryId` is gone, the fk is `entryId` (now a
  `ResolvableEntryId`). `resolvable.closedById` is gone; query the `closedBy` relation, which is
  now nullable.
- Other field types follow the API where the old descriptors typed them as `string`: `file.size`
  and `workflowItem.version` are numbers, `isGlobal`, `handSyncEnabled` and `hasGuardians` are
  booleans, `manualOrderLabels` and `sprintConfig.moveOnFinish` are arrays.
- New documented fields: the account settings needed to read cards and Runs (`priorityLabels`,
  `effortScale`, `workdays`, `startWeekday`, the `*Enabled` switches), `card.isBlockingDep` and `version`,
  `deck.isDeleted`, `user.kind`, `isIntegration` and `profileImage`, `project.coverFile`,
  `file.createdAt` and `uploader`, `deck.deckType`, `resolvable.reopenedAt` and
  `reopenedBy`, `sprintConfig.runLabelTemplate`, and `date` on the progress models.
