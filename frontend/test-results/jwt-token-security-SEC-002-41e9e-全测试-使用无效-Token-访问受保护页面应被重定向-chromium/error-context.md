# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: jwt-token-security.spec.ts >> SEC-002/SEC-003: JWT Token 安全测试 >> 使用无效 Token 访问受保护页面应被重定向
- Location: e2e\jwt-token-security.spec.ts:48:3

# Error details

```
Error: page.evaluate: SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.
    at UtilityScript.evaluate (<anonymous>:304:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```