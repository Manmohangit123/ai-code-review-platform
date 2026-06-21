CODE_REVIEW_PROMPT = """You are a senior software engineer doing a code review.

Analyze the following {language} code from file "{file_path}".

Look for:
1. Logic bugs and errors
2. Security vulnerabilities (SQL injection, XSS, hardcoded secrets)
3. Performance issues (expensive loops, unnecessary operations)
4. Code quality issues (naming, complexity, dead code)
5. Missing error handling

Code to review:
```
{code}
```

Respond with ONLY a valid JSON object in this exact format, no other text:
{{
  "overall_score": <integer between 0 and 100>,
  "summary": "<one sentence summary of the code quality>",
  "findings": [
    {{
      "line_start": <integer or null>,
      "line_end": <integer or null>,
      "severity": "<critical|high|medium|low|info>",
      "category": "<bug|security|performance|style|complexity>",
      "title": "<short title>",
      "description": "<what the problem is>",
      "suggestion": "<how to fix it>"
    }}
  ]
}}

If the code looks good, return an empty findings array and a high score.
Return ONLY the JSON, no markdown, no explanation."""


SECURITY_SCAN_PROMPT = """You are a security engineer performing a security audit.

Analyze the following {language} code from file "{file_path}" for security vulnerabilities.

Check for:
1. SQL Injection - unsanitized user input in queries
2. XSS - unescaped output in HTML/JS
3. Hardcoded secrets - API keys, passwords, tokens in code
4. Insecure authentication - weak passwords, missing auth checks
5. Sensitive data exposure - logging passwords, unencrypted data
6. Insecure direct object references (IDOR)
7. Command injection - unsanitized shell commands
8. Path traversal - unvalidated file paths

Code to analyze:
```
{code}
```

Respond with ONLY a valid JSON object, no other text:
{{
  "risk_level": "<critical|high|medium|low|none>",
  "summary": "<one sentence security assessment>",
  "vulnerabilities": [
    {{
      "line_start": <integer or null>,
      "line_end": <integer or null>,
      "severity": "<critical|high|medium|low>",
      "owasp_category": "<e.g. A03:Injection, A02:Cryptographic Failures>",
      "title": "<vulnerability name>",
      "description": "<what the vulnerability is and how it can be exploited>",
      "remediation": "<exact fix with example>"
    }}
  ]
}}

If no vulnerabilities found, return empty array and risk_level "none".
Return ONLY the JSON, no markdown, no explanation."""


README_GENERATOR_PROMPT = """You are a technical writer generating a professional README.md for a software project.

Project name: {project_name}
File structure:
{file_tree}

Sample code files:
{code_samples}

Generate a complete, professional README.md in markdown format including:
1. Project title and description
2. Features list
3. Tech stack / Built With
4. Prerequisites
5. Installation steps
6. Usage instructions
7. API documentation (if applicable)
8. Project structure
9. Contributing guidelines
10. License

Make it detailed, professional, and useful. Use proper markdown formatting with headers, code blocks, and lists.
Return ONLY the markdown content, no extra explanation."""


PERFORMANCE_SCAN_PROMPT = """You are a performance engineer analyzing code for performance issues.

Analyze the following {language} code from file "{file_path}" for performance problems.

Check for:
1. Expensive loops - O(n²) or worse complexity, nested loops on large data
2. Inefficient database queries - N+1 queries, missing indexes, SELECT *
3. Memory issues - large allocations, memory leaks, unnecessary copies
4. Redundant operations - repeated calculations, duplicate API calls
5. Blocking operations - synchronous calls that should be async
6. Unnecessary re-renders (React) - missing useMemo, useCallback
7. Large bundle imports - importing entire libraries for one function

Code to analyze:
```
{code}
```

Respond with ONLY a valid JSON object, no other text:
{{
  "performance_score": <integer between 0 and 100>,
  "summary": "<one sentence performance assessment>",
  "issues": [
    {{
      "line_start": <integer or null>,
      "line_end": <integer or null>,
      "severity": "<critical|high|medium|low>",
      "category": "<complexity|memory|database|network|rendering|bundle>",
      "title": "<issue name>",
      "description": "<what the performance problem is>",
      "impact": "<estimated performance impact>",
      "suggestion": "<how to fix it>"
    }}
  ]
}}

If no issues found, return empty array and score 100.
Return ONLY the JSON, no markdown, no explanation."""
