export const walkThroughPrompt = `
### Walkthrough
- Provide a concise, step-by-step explanation of the pull request's purpose and the logical flow of the changes.
- Explain the **"why"** behind the changes, not just the "what."
- Describe the purpose and usage of any new or significantly altered functions, classes, or modules.
- Mention any notable edge cases, technical debt, or important design decisions.
- Keep this section brief, aiming for 3-5 clear sentences.

***

### File Changes Summary
Generate a clear, markdown-formatted table. Group related files or modules into a single row to provide a high-level overview. For each entry, provide a concise, one-line summary of the changes.

| Module(s) / File(s) | Summary of Changes |
|---------------------|--------------------|
| **<grouped files>** | <high-level summary of changes> |
| path/to/file1.js  | <specific summary for this file> |
| path/to/file2.js  | <specific summary for this file> |

***

### Sequence Diagram(s)
- If applicable and relevant to understanding the new logic, generate a Mermaid sequence diagram.
- Focus the diagram on illustrating the flow of new function calls, data movement, or user interactions introduced by this PR.

***

### Estimated Code Review Effort
- Select from: Low, Medium, or High.
- Justify the selected effort level with a brief, 1-2 sentence reason.

## Diff
\`\`\`diff
$file_diff
\`\`\`
`;
// const walkthroughPrompt = `

// ### Walkthrough
// - Explain step by step what was changed in the PR and why.
// - Describe how new functions/classes are used.
// - Mention any edge cases or unusual details.
// - Keep it 3–6 sentences.

// ### Changes
// Create a Markdown table:

// | Cohort / File(s) | Summary |
// |------------------|---------|
// | <file or module> | <one-line summary of changes> |

// ### Sequence Diagram(s)
// - If relevant, generate a Mermaid sequence diagram showing function calls, data flow, or user interactions introduced by this PR.

// ### Estimated Code Review Effort
// - Low / Medium / High, with a short reason.

// `;

export const summarizePRDiffTable = `
You are given summaries of file changes from a GitHub Pull Request.
Your task is to group related files together and produce a **Markdown table**
with two columns: \`Files\` and \`Summary\`.

- Group files logically by functionality or related changes.
- In the \`Files\` column, list file paths separated by commas.
- In the \`Summary\` column, write a concise, factual description of what was changed.
- Keep each summary to 1–2 sentences max.
- Avoid generic filler (like "requires review"), just describe what changed.
- Use backticks (\`) for file paths in the table.
- Preserve order of importance (most significant changes first).

Example format:

| Files | Summary |
| ----- | ------- |
| \`src/main.js\`, \`src/utils.js\` | Updates calculation logic and refactors helper functions. |
| \`README.md\` | Adds usage instructions for new CLI option. |

Here are the file change summaries:

$raw_summary
`;

export const summaryPrompt = `
## GitHub PR Title

\`$title\` 

## Description

\`\`\`
$description
\`\`\`

## Diff

\`\`\`diff
$file_diff
\`\`\`

I would like you to succinctly summarize the diff within 100 words.
If applicable, your summary should include a note about alterations 
to the signatures of exported functions, global data structures and 
variables, and any changes that might affect the external interface or 
behavior of the code.

Focus only on:
- New features
- Bug fixes
- Important notes or constraints
- User-facing or developer-facing impact

Output should be short, clear, and accurate under the heading:

Below the summary, I would also like you to triage the diff as \`NEEDS_REVIEW\` or 
\`APPROVED\` based on the following criteria:

- If the diff involves any modifications to the logic or functionality, even if they 
  seem minor, triage it as \`NEEDS_REVIEW\`. This includes changes to control structures, 
  function calls, or variable assignments that might impact the behavior of the code.
- If the diff only contains very minor changes that don't affect the code logic, such as 
  fixing typos, formatting, or renaming variables for clarity, triage it as \`APPROVED\`.

Please evaluate the diff thoroughly and take into account factors such as the number of 
lines changed, the potential impact on the overall system, and the likelihood of 
introducing new bugs or security vulnerabilities. 
When in doubt, always err on the side of caution and triage the diff as \`NEEDS_REVIEW\`.

You must strictly follow the format below for triaging the diff:
[TRIAGE]: <NEEDS_REVIEW or APPROVED>

Important:
- In your summary do not mention that the file needs a through review or caution about
  potential issues.
- Do not provide any reasoning why you triaged the diff as \`NEEDS_REVIEW\` or \`APPROVED\`.
- Do not mention that these changes affect the logic or functionality of the code in 
  the summary. You must only use the triage status format above to indicate that.

### Summary

`;

// export const summarizeFileDiff = `## GitHub PR Title

// \`$title\`

// ## Description

// \`\`\`
// $description
// \`\`\`

// ## Diff

// \`\`\`diff
// $file_diff
// \`\`\`

// ## Instructions

// I would like you to succinctly summarize the diff within 100 words.
// If applicable, your summary should include a note about alterations
// to the signatures of exported functions, global data structures and
// variables, and any changes that might affect the external interface or
// behavior of the code.
// `;

// const triageFileDiff = `Below the summary, I would also like you to triage the diff as \`NEEDS_REVIEW\` or
// \`APPROVED\` based on the following criteria:

// - If the diff involves any modifications to the logic or functionality, even if they
//   seem minor, triage it as \`NEEDS_REVIEW\`. This includes changes to control structures,
//   function calls, or variable assignments that might impact the behavior of the code.
// - If the diff only contains very minor changes that don't affect the code logic, such as
//   fixing typos, formatting, or renaming variables for clarity, triage it as \`APPROVED\`.

// Please evaluate the diff thoroughly and take into account factors such as the number of
// lines changed, the potential impact on the overall system, and the likelihood of
// introducing new bugs or security vulnerabilities.
// When in doubt, always err on the side of caution and triage the diff as \`NEEDS_REVIEW\`.

// You must strictly follow the format below for triaging the diff:
// [TRIAGE]: <NEEDS_REVIEW or APPROVED>

// Important:
// - In your summary do not mention that the file needs a through review or caution about
//   potential issues.
// - Do not provide any reasoning why you triaged the diff as \`NEEDS_REVIEW\` or \`APPROVED\`.
// - Do not mention that these changes affect the logic or functionality of the code in
//   the summary. You must only use the triage status format above to indicate that.
// `;
