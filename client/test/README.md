# Client tests

Both are standalone Playwright scripts (no test runner) driving a real Chromium
against a running dev server.

```bash
# responsive + touch targets — needs the app on :5173 in sample mode
npm run dev
node test/responsive.test.mjs

# live API path — needs the app on :5174 with an API origin configured.
# Requests are intercepted, so no server or database is required.
VITE_API_URL=http://api.test npm run dev -- --port 5174
node test/live-api.test.mjs
```

`responsive.test.mjs` asserts no horizontal scroll at 320/375/414/768/1024/1440px
across every route, and that touch targets are at least 44x44px at 375px.

`live-api.test.mjs` asserts the sign-in request carries the typed credentials, that
the bearer token is attached to subsequent calls, that API payloads render in place
of sample data, that a 401 clears the session, and that an unreachable server
produces a recoverable error state rather than a blank screen.
