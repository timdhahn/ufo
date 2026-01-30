# Skills setup

This project supports local Codex skills stored in this repository for easy reuse.

## Folder layout
- `skills/` contains each skill in its own folder.
- Each skill folder must include a `SKILL.md` that documents how to use it.

Example:
```
skills/
  example-skill/
    SKILL.md
    references/
    scripts/
```

## How to add a new skill
1. Create a new folder under `skills/` (kebab-case name).
2. Add a `SKILL.md` file describing the skill, workflow, and any scripts.
3. (Optional) Add `references/` or `scripts/` for supporting assets.

## How to use skills in this repo
- Reference the skill by name in your request, or mention the `SKILL.md` path.
- Keep skills focused and task-specific.

