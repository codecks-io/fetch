import {_rootDesc} from "./_root";
import {accountDesc} from "./Account";
import {attachmentDesc} from "./Attachment";
import {cardDesc} from "./Card";
import {cardHistoryDesc} from "./CardHistory";
import {deckDesc} from "./Deck";
import {fileDesc} from "./File";
import {handCardDesc} from "./HandCard";
import {milestoneDesc} from "./Milestone";
import {milestoneProgressDesc} from "./MilestoneProgress";
import {milestoneProjectDesc} from "./MilestoneProject";
import {projectDesc} from "./Project";
import {projectTagDesc} from "./ProjectTag";
import {queueEntryDesc} from "./QueueEntry";
import {releaseDesc} from "./Release";
import {resolvableDesc} from "./Resolvable";
import {resolvableEntryDesc} from "./ResolvableEntry";
import {resolvableEntryReactionDesc} from "./ResolvableEntryReaction";
import {sprintDesc} from "./Sprint";
import {sprintConfigDesc} from "./SprintConfig";
import {sprintConfigProgressDesc} from "./SprintConfigProgress";
import {sprintProgressDesc} from "./SprintProgress";
import {sprintProjectDesc} from "./SprintProject";
import {userDesc} from "./User";
import {workflowItemDesc} from "./WorkflowItem";

export const modelMap = {
  /** The starting point of every query. */
  _root: _rootDesc,
  /** An organization and its settings. */
  account: accountDesc,
  /** A file attached to a card. */
  attachment: attachmentDesc,
  /**
   * A task or a document card when `isDoc` is set or a hero card if it contains sub cards.
The
   * card's color is derived from `status`, `visibility`, `isDoc` and whether it has sub cards or
   * open block or review conversations.
   */
  card: cardDesc,
  /**
   * One version of a card and what changed in it. The web app shows these in the card's history.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  cardHistory: cardHistoryDesc,
  /** A list of cards within a project. `deckType` says which kind of cards it is meant for. */
  deck: deckDesc,
  /** An uploaded file, like a card attachment or a cover image. */
  file: fileDesc,
  /** A card a user bookmarked. Deleting the card removes its bookmarks. */
  handCard: handCardDesc,
  /**
   * A date that cards are planned towards. It belongs to a list of projects, or with `isGlobal` to
   * all projects of the organization.
   */
  milestone: milestoneDesc,
  /**
   * The state of a milestone's cards on a day (UTC). A row is only written on days when the numbers
   * change, so a day without a row has the numbers of the row before it.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  milestoneProgress: milestoneProgressDesc,
  /**
   * Links a milestone to a project whose cards and decks can use it. A milestone with `isGlobal` is
   * linked to every project.
   */
  milestoneProject: milestoneProjectDesc,
  /** Groups decks. A card belongs to the project of its deck. */
  project: projectDesc,
  /**
   * A tag in a project's tag list. A card in the project with this tag lists it in `masterTags`.
   */
  projectTag: projectTagDesc,
  /**
   * A card in a user's Hand. When a card is done, its owner gets an entry in their Hand's done
   * pile, even if the card wasn't in their Hand.
   */
  queueEntry: queueEntryDesc,
  /** An entry in the Codecks changelog. It's the same for every organization. */
  release: releaseDesc,
  /**
   * A comment thread on a card. Its `context` says if it's a plain conversation or if it marks the
   * card as blocked or in review.
   */
  resolvable: resolvableDesc,
  /** A comment in a comment thread. */
  resolvableEntry: resolvableEntryDesc,
  /**
   * An emoji reaction to a comment. A user can add each emoji only once per comment.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  resolvableEntryReaction: resolvableEntryReactionDesc,
  /**
   * A run: one time box of a Run Config, from `startDate` to `endDate`. Codecks creates the
   * upcoming runs ahead of time and completes a run when it ends.
   */
  sprint: sprintDesc,
  /**
   * A Run Config. It creates runs of the same length one after the other, like sprints, for its
   * projects.
   */
  sprintConfig: sprintConfigDesc,
  /**
   * The done cards of all runs of a Run Config on a day (UTC). A row is only written on days when
   * the numbers change, so a day without a row has the numbers of the row before it.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  sprintConfigProgress: sprintConfigProgressDesc,
  /**
   * The state of a run's cards on a day (UTC). A row is only written on days when the numbers
   * change, so a day without a row has the numbers of the row before it.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  sprintProgress: sprintProgressDesc,
  /**
   * Links a run config to a project whose cards can be planned into its runs. A run config with
   * `isGlobal` is linked to every project.
   */
  sprintProject: sprintProjectDesc,
  /**
   * A person, or an integration or API token that acts in an organization. `kind` tells them apart.
   */
  user: userDesc,
  /**
   * A Journey Step: a template for a sub card. Starting a deck's journey on a card creates a sub
   * card from each of its steps.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  workflowItem: workflowItemDesc,
};
