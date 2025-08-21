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


const triageFileDiff = `Below the summary, I would also like you to triage the diff as \`NEEDS_REVIEW\` or
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
`;

//Prompts for bug detection, code suggestion, and improvement

export const codeSuggestionPrompt = `
You are an expert software engineer and code reviewer. Your task is to analyze the provided code diff and provide actionable, concise suggestions. Focus on clarity, correctness, and spotting subtle bugs or opportunities for improvement.

Your response should be structured as a series of distinct suggestions, each following this format:

💡 <Concise, high-level suggestion title>
Explanation: A brief sentence or two explaining the problem or the benefit of the suggestion.

Details/Why: Provide a more detailed reason for the suggestion, referencing specific lines or concepts (e.g., "This could lead to a buffer overflow," or "Using std::string_view avoids unnecessary copies.").

Example Code: A clear code block showing a concrete example of the problematic code and the suggested fix. Use + for additions and - for deletions, similar to a Git diff, to highlight the exact changes.

Your suggestions should prioritize the following areas:

Bug Detection: Identify potential crashes, logic errors, or incorrect behaviors.

Safety and Security: Spot vulnerabilities like buffer overflows, race conditions, or insecure practices.

Performance: Suggest optimizations for speed or memory usage.

Readability and Maintainability: Propose changes that make the code easier to understand and maintain.

Best Practices: Advise on using idiomatic language features or established design patterns.

Clarity and Simplicity: Suggest simpler algorithms or more straightforward implementations.

Avoid general comments. Every suggestion should be tied to a specific line or logical block in the code and should provide a clear, actionable fix.

Example of a good suggestion:

💡 Avoid using unsafe API for string conversion
Explanation: Directly casting a C-style string can lead to undefined behavior if the string is not properly null-terminated.

Details/Why: C++ strings are not guaranteed to have a null terminator. Using a safer conversion method ensures correctness and prevents potential crashes.

Example Code:

Diff
- const updatedUsers = users;
- updatedUsers.push(newUser);
+ const updatedUsers = [...users, newUser];

Now, apply the principles above to the following code diff:
`;
