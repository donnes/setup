---
description: Create a pull request with commit (enforces partial commits for large changes)
agent: build
model: zen/grok-code-fast-1
---

Check the number of changed files with `git diff --name-only main...HEAD | wc -l`

If the number is greater than 10, output instructions for the user to manually create partial commits (e.g., using `git add -p` or staging specific files) and then re-run this command. Do not proceed with committing or PR creation.

If the number is 10 or less, proceed:

Stage all changes with `git add .`

Generate a concise commit message summarizing the changes based on `git diff --cached`

Commit the changes with the generated message.

To create the PR:

Get the current branch changes with `git diff main...HEAD`

Analyze the diff to identify:
- New files added
- Modified files
- Deleted files
- Key features or improvements
- Any setup instructions needed
- Technical details
- Testing approach
- Breaking changes

Use the following PR template to generate the title and description:

# Title

[Provide a title for this PR]

## Summary

[Provide a brief, one-sentence summary of the changes in this PR]

## Changes

### New Files
[List any new files added with brief descriptions]
- `path/to/file` - Description

### Modified Files
[List any files that were modified with brief descriptions]
- `path/to/file` - Description of changes

### Deleted Files
[List any files that were removed]
- `path/to/file` - Reason for removal

## Features

[List the key features or improvements this PR introduces]
- Feature 1
- Feature 2

## Setup Instructions

[If this PR requires any setup steps, document them here. Use numbered steps with code blocks where appropriate. Remove if not applicable]

1. Step one
2. Step two

## Technical Details

[Provide technical context, implementation details, architectural decisions, or important notes about the implementation. Remove if not applicable]

## Testing

[Describe how this change was tested. Use checkboxes for test cases]
- [ ] Test case 1
- [ ] Test case 2

## Screenshots/Demo

[Add screenshots, GIFs, or links to demos if applicable. Remove if not applicable]

## Notes

[Any additional notes, considerations, or follow-up items. Remove if not applicable]

## Documentation

[List any documentation updates or links to relevant docs. Remove if not applicable]

## Breaking Changes

[List any breaking changes and migration steps. If none, state "None."]

## Guidelines

- Be concise but comprehensive
- Use clear, descriptive language
- Include code examples when helpful
- Link to related issues or discussions
- Use checkboxes for test cases
- Remove sections that don't apply
- Keep the summary to one sentence
- Focus on "what" and "why" in motivation
- Be specific about file changes
- Include setup steps if needed
- Document testing approach
- Note breaking changes clearly

Create the PR using `gh pr create --title "<generated title>" --body "<generated description>"`
