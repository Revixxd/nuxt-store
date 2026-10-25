# CLAUDE.md

## Git

Never commit or push. The user always commits manually. This overrides any skill step (for example `/implement`) that says to commit: leave the changes uncommitted in the working tree and say they are ready to commit.

When proposing a commit message, start it with `[TASK-{number}]`, where the number is the ticket's number from `.scratch/<feature>/issues/NN-<slug>.md` (for example `[TASK-01] Project setup and page shell`).

## Code layout

Presentational UI components go in `app/components/ui/`. Nuxt auto-imports them with the `Ui` prefix (`app/components/ui/AppLogo.vue` → `<UiAppLogo />`).

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root, created lazily. See `docs/agents/domain.md`.
