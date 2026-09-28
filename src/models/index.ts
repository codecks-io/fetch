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
  _root: _rootDesc,
  account: accountDesc,
  attachment: attachmentDesc,
  card: cardDesc,
  /** @experimental `preview` in the Codecks API: may change in any release. */
  cardHistory: cardHistoryDesc,
  deck: deckDesc,
  file: fileDesc,
  handCard: handCardDesc,
  milestone: milestoneDesc,
  /** @experimental `preview` in the Codecks API: may change in any release. */
  milestoneProgress: milestoneProgressDesc,
  milestoneProject: milestoneProjectDesc,
  project: projectDesc,
  projectTag: projectTagDesc,
  queueEntry: queueEntryDesc,
  resolvable: resolvableDesc,
  resolvableEntry: resolvableEntryDesc,
  /** @experimental `preview` in the Codecks API: may change in any release. */
  resolvableEntryReaction: resolvableEntryReactionDesc,
  sprint: sprintDesc,
  sprintConfig: sprintConfigDesc,
  /** @experimental `preview` in the Codecks API: may change in any release. */
  sprintConfigProgress: sprintConfigProgressDesc,
  /** @experimental `preview` in the Codecks API: may change in any release. */
  sprintProgress: sprintProgressDesc,
  sprintProject: sprintProjectDesc,
  user: userDesc,
  /** @experimental `preview` in the Codecks API: may change in any release. */
  workflowItem: workflowItemDesc,
};
