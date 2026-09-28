import type {UserId} from "./User";

export type CardVisibility = "default" | "archived" | "deleted" | (string & {});
export type Checkbox = {label: string; checked: boolean};
export type CheckboxStats = {total: number; checked: number};
export type DefaultCard = {
  content?: string;
  assigneeId?: UserId | null;
  priority?: Priority | null;
  effort?: number | null;
  masterTags?: string[];
};
export type DerivedStatus =
  | "deleted"
  | "archived"
  | "archivedDone"
  | "archivedHeroDone"
  | "doc"
  | "blocked"
  | "review"
  | "hero"
  | "heroDone"
  | "heroDoc"
  | "assigned"
  | "unassigned"
  | "started"
  | "done"
  | "snoozing"
  | "archivedHero"
  | (string & {});
export type MilestoneColor =
  | "gray"
  | "brown"
  | "yellow"
  | "red"
  | "pink"
  | "blue"
  | "green"
  | (string & {});
export type Priority = "a" | "b" | "c" | (string & {});
export type StartWeekday = "monday" | "saturday" | "sunday" | (string & {});
export type TimeTrackingMode = "none" | "manual" | "strict" | (string & {});
export type TimelineScaleType = "day" | "week" | (string & {});
export type Workdays = {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
};
export type WorkflowMode = "none" | "only_parent_cards" | "journeys" | (string & {});
