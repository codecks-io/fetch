// Type-level tests for the field types generated from the reference's JTD schemas. No runtime
// assertions: `npm run typecheck` fails when a type drifts.
import {expectTypeOf} from "vitest";
import type {MilestoneId, Priority, ResolvableEntryId, UserId, buildFetchers} from "../src/index";

type Fetchers = ReturnType<typeof buildFetchers>;
declare const fetchers: Fetchers;

export async function _check() {
  const card = await fetchers.fetchInstance("card", "", {
    fields: ["priority", "mentionedUsers", "status", "checkboxInfo", "dueDate"],
    relations: {assignee: {fields: ["name"]}, account: {fields: ["name"]}},
  });
  expectTypeOf(card.priority).toEqualTypeOf<Priority | null>();
  expectTypeOf(card.mentionedUsers).toEqualTypeOf<UserId[]>();
  expectTypeOf(card.status).toEqualTypeOf<
    "not_started" | "started" | "snoozing" | "done" | (string & {})
  >();
  expectTypeOf(card.checkboxInfo).toEqualTypeOf<{label: string; checked: boolean}[]>();
  expectTypeOf(card.dueDate).toEqualTypeOf<{day: number; month: number; year: number} | null>();
  expectTypeOf<null>().toMatchTypeOf<typeof card.assignee>();
  expectTypeOf(card.assignee!.name).toEqualTypeOf<string>();
  expectTypeOf<null>().not.toMatchTypeOf<typeof card.account>();

  const milestone = await fetchers.fetchInstance("milestone", "", {fields: ["userCapacities"]});
  expectTypeOf(milestone.userCapacities).toEqualTypeOf<{[userId: UserId]: number}>();

  const reaction = await fetchers.fetchInstance("resolvableEntryReaction", "", {
    fields: ["entryId"],
  });
  expectTypeOf(reaction.entryId).toEqualTypeOf<ResolvableEntryId>();
  // @ts-expect-error the API has no `resolvableEntryId`, the fk is `entryId`
  await fetchers.fetchInstance("resolvableEntryReaction", "", {fields: ["resolvableEntryId"]});

  // a self-named fk: the relation is nullable, and there's no made-up `closedById`
  const resolvable = await fetchers.fetchInstance("resolvable", "", {
    relations: {closedBy: {fields: ["name"]}},
  });
  expectTypeOf<null>().toMatchTypeOf<typeof resolvable.closedBy>();
  expectTypeOf(resolvable.closedBy!.name).toEqualTypeOf<string>();
  // @ts-expect-error `closedById` isn't a field
  await fetchers.fetchInstance("resolvable", "", {fields: ["closedById"]});

  // a day that is a key stays the wire string
  const progress = await fetchers.fetchInstance("milestoneProgress", "", {fields: ["date"]});
  expectTypeOf(progress.date).toEqualTypeOf<string>();
  expectTypeOf(progress.milestoneId).toEqualTypeOf<MilestoneId>();
}
