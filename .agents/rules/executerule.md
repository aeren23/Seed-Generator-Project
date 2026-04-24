---
trigger: always_on
---

# AI Agent Execution Rules (CRITICAL DIRECTIVE)

## 0. Context & Application
This file contains the absolute, non-negotiable execution rules for any AI agent or coding assistant operating in this repository. These rules apply to EVERY prompt, EVERY session, and EVERY task execution.

## 1. Rule: Mandatory State Update (`state.md`)
**Condition:** At the conclusion of ANY interaction, task execution, or before ending a session.
**Action:** YOU MUST open, review, and update the `/state.md` file.
**Requirements:**
* Update the "Last Updated" date.
* Recalculate and update the "Overall Progress" percentage.
* Check off `[x]` any specific sub-tasks that were completed during this session.
* Change statuses from `[TODO]` to `[IN PROGRESS]` where applicable.
* Strictly define the "Current Focus / Next Action" for the next session so the human developer knows exactly where to resume.
* **Failure to do this is a critical system failure.**

## 2. Rule: Implementation Plan Tracking (`implementation_plan.md`)
**Condition:** Only when an entire Phase or a major milestone defined in the implementation plan is fully coded, tested, and verified.
**Action:** YOU MUST open `/implementation_plan.md` and visually mark the completed phase/item.
**Requirements:**
* Change the bullet point or phase marker to indicate completion (e.g., adding `[COMPLETED]` or a checkmark `[x]` if applicable).
* Do NOT mark items as complete if they are only partially implemented or contain placeholder logic (unless explicitly instructed by the user).

## 3. Rule: Stop & Report
**Condition:** If you hit a roadblock, dependency error, or architectural conflict.
**Action:** STOP coding immediately. Do not guess or hallucinate a massive refactor. 
**Requirements:**
* Report the error clearly to the user.
* Provide 2 possible solutions.
* Wait for explicit human authorization before proceeding.
* Update `/state.md` noting the "Blocker".

## 4. Execution Acknowledgment
You do not need to verbally confirm these rules in every chat response. You just need to silently execute them at the end of your workflow. When you finish a task, your final output should simply be: *"Task complete. I have updated state.md [and implementation_plan.md if applicable]."*