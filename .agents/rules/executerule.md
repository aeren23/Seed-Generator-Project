---
trigger: always_on
---

# AI Agent Execution Rules (CRITICAL DIRECTIVE)

## 0. Context & Application
This file contains the absolute, non-negotiable execution rules for any AI agent or coding assistant operating in this repository. These rules apply to EVERY prompt, EVERY session, and EVERY task execution.

## 1. Rule: Mandatory State Update (`BookStore-Demo/docs/state.md`)
**Condition:** At the conclusion of ANY interaction, task execution, or before ending a session.
**Action:** YOU MUST open, review, and update the `BookStore-Demo/docs/state.md` file.
**Requirements:**
* Update the "Last Modification" date with the exact timestamp.
* Update the "Status" and "Active Blocker / Notes" in the "Component Tracking Matrix".
* Check off `[x]` any specific Database Schema Entities that were successfully verified.
* Pop completed tasks from the "Immediate Execution Queue" or add new ones based on the current focus.
* **Failure to do this is a critical system failure.**

## 2. Rule: Project Plan Tracking (`BookStore-Demo/docs/project_plan.md`)
**Condition:** Only when a task or a major milestone defined in the project plan is fully coded, tested, and verified.
**Action:** YOU MUST open `BookStore-Demo/docs/project_plan.md` and visually mark the completed task/item.
**Requirements:**
* Change the bullet point `[ ]` to `[x]` to indicate completion.
* Do NOT mark items as complete if they are only partially implemented or contain placeholder logic (unless explicitly instructed by the user).

## 3. Rule: Stop & Report
**Condition:** If you hit a roadblock, dependency error, or architectural conflict.
**Action:** STOP coding immediately. Do not guess or hallucinate a massive refactor. 
**Requirements:**
* Report the error clearly to the user.
* Provide 2 possible solutions.
* Wait for explicit human authorization before proceeding.
* Update `BookStore-Demo/docs/state.md` noting the "Blocker".

## 4. Execution Acknowledgment
You do not need to verbally confirm these rules in every chat response. You just need to silently execute them at the end of your workflow. When you finish a task, your final output should simply be: *"Task complete. I have updated state.md [and project_plan.md if applicable]."*