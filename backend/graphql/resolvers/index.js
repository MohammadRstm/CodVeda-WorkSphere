import { mergeResolvers } from "@graphql-tools/merge";

import departments from "./departments.js";
import messages from "./messages.js";
import profile from "./profiles.js";
import projects from "./projects.js";
import tasks from "./tasks.js";
import users from "./users.js";

export default mergeResolvers([departments, messages, profile, projects, tasks, users]);
