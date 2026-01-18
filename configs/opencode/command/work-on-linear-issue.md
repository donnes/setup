---
description: Work on the next highest priority Linear issue assigned to me
agent: plan
model: opencode/gpt-5.2-codex
---

Use the Linear API to fetch all issues assigned to "me" that are not completed or cancelled.

Sort these issues by priority, with priority 1 (Urgent) first, then 2 (High), 3 (Normal), 4 (Low). Ignore issues with priority 0 (No priority).

Select the highest priority issue from this sorted list.

Retrieve the full details of this issue, including its branch name, labels, project, title, and description.

Based on the issue's labels, project name, title, and description, determine which specific app or package this issue relates to.

Create a new git branch using the issue's suggested branch name

Move issue to status In Progress when start working.

Output a summary including:
- Issue ID and title
- Priority level
- Determined project/app
- Branch name created
