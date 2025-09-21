import {_rootDesc} from "./_root";
import {accountDesc} from "./Account";
import {accountRoleDesc} from "./AccountRole";
import {userDesc} from "./User";

export const rootDesc = _rootDesc;

export const modelMap = {
  user: userDesc,
  account: accountDesc,
  accountRole: accountRoleDesc,
  _root: _rootDesc,
};
