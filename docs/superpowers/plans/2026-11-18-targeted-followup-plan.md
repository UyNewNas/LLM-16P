# Targeted follow-up implementation plan

1. Add a separate original and balanced supplemental bank, with design notes.
2. Extend strict cumulative scoring and types, write behavior tests before implementation, and retain legacy input compatibility.
3. Add result-page follow-up entry/preview, manual and Agent continuation, baseline comparison and history labeling.
4. Export follow-up static resources/schema/module/CLI and document the workflow.
5. Review scoring and UI independently; verify tests, typecheck, build integrity, browser behavior and mobile layout.
6. Publish an atomic commit to the existing master branch with a checked expected SHA; verify the GitHub Actions deployment and live resources.

Implementation uses an isolated checkout at `/workspace/worktrees/LLM-16P-followup`, based on published commit `2a7372bf2ed94f51fc44fbf2a1e7f3813d51bb7f`. The user requested continuation of the published app; proceed through implementation and publication without a separate design-approval pause.
