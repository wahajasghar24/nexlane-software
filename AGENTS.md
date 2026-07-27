# Nexlane Solutions — Development Team

## Kanban Workflow
- Tasks are managed via kanban board at `~/.hermes/kanban.db`
- Use `hermes kanban show <task-id>` to see task details
- Use `hermes kanban comment <task-id> "message"` to communicate with team
- Use `hermes kanban complete <task-id>` when done
- Use `hermes kanban block <task-id> "reason"` if stuck
- Always update task status promptly

## Communication Protocol
- PM profiles assign tasks via kanban
- Agents claim tasks from kanban board
- Agents comment on tasks for blockers/questions
- PM reviews completed tasks before marking done
- Use kanban links for task dependencies

## Coding Standards
- Write clean, documented code
- Follow language-specific best practices (PEP8 for Python, StandardJS for JS)
- Include error handling in all APIs
- Write tests alongside code
- Use meaningful variable/function names
- Comment complex logic only — code should be self-documenting

## Git Workflow
- Feature branches from `main`
- PR naming: `type/description` (e.g., `feat/add-user-auth`)
- All code goes through code-review agent before merge
- Commit messages: conventional commits format

## Project Structure
```
~/nexlane-projects/
├── projects/          # Individual project folders
├── tasks/             # Task-specific work dirs (kanban-managed)
└── shared/            # Shared libraries and configs
```

## Important
- Never delete production data
- Document all API endpoints
- Keep dependencies updated and secure
- Use environment variables for secrets
