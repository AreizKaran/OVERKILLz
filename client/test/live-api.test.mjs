import { chromium } from 'playwright'
const EXECUTABLE = process.env.CHROMIUM_PATH || undefined  // falls back to Playwright's own browser
const browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : {})
let pass = 0, fail = 0
const check = (n, c, extra = '') => { c ? (pass++, console.log('  PASS', n)) : (fail++, console.log('  FAIL', n, extra)) }

const TOKEN = 'header.payload.signature'
const USER = { _id: '650000000000000000000001', role: 'student', name: 'Aditya Sharma',
               reg: '202100114', dept: 'CSE', semester: 6, programme: 'B.Tech CSE', status: 'Active' }

async function ctx(routes) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const seen = []
  await c.route('**/api/**', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    seen.push({ path: url.pathname, method: req.method(), auth: req.headers()['authorization'] ?? null,
                ct: req.headers()['content-type'] ?? null, body: req.postData() })
    const handler = routes[url.pathname]
    if (!handler) return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'no stub' }) })
    return route.fulfill(handler(req))
  })
  return { c, seen }
}

const ok = (b) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(b) })

/* ---------------- 1. successful login sends real credentials ------------- */
{
  const { c, seen } = await ctx({
    '/api/auth/login': () => ok({ token: TOKEN, user: USER }),
    '/api/auth/me':    () => ok({ user: USER }),
    '/api/notices':    () => ok({ notices: [{ _id: 'n1', title: 'Stubbed notice from the API', body: 'Live payload.',
                                              category: 'Academic', priority: 'high', dept: 'Dean Academics',
                                              createdAt: '2026-09-14T00:00:00Z', author: { name: 'Registrar' } }] }),
  })
  const p = await c.newPage()
  await p.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' })
  await p.fill('#uid', '202100114')
  await p.fill('#pw', 'smit@demo2026')
  await p.getByRole('button', { name: 'Sign in' }).click()
  await p.waitForURL('**/app', { timeout: 10000 })

  const login = seen.find((s) => s.path === '/api/auth/login')
  console.log('\nlive login')
  check('POSTs to /api/auth/login', login?.method === 'POST')
  check('sends JSON content-type', login?.ct?.includes('application/json'))
  const body = JSON.parse(login.body)
  check('sends the typed identifier, not the role', body.identifier === '202100114', JSON.stringify(body))
  check('sends the typed password', body.password === 'smit@demo2026')

  await p.goto('http://localhost:5174/app/notices', { waitUntil: 'networkidle' })
  await p.waitForTimeout(700)
  console.log('\nauthenticated requests + live rendering')
  const notices = seen.find((s) => s.path === '/api/notices')
  check('attaches the bearer token', notices?.auth === `Bearer ${TOKEN}`, notices?.auth ?? 'none')
  check('renders the API payload, not sample data', await p.getByText('Stubbed notice from the API').isVisible())
  await c.close()
}

/* ---------------- 2. bad credentials surface the server message ---------- */
{
  const { c } = await ctx({
    '/api/auth/login': () => ({ status: 401, contentType: 'application/json',
                                body: JSON.stringify({ error: 'Invalid credentials' }) }),
  })
  const p = await c.newPage()
  await p.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' })
  await p.fill('#pw', 'wrongpassword')
  await p.getByRole('button', { name: 'Sign in' }).click()
  await p.waitForTimeout(900)
  console.log('\nrejected credentials')
  check("shows the server's message", await p.getByRole('alert').textContent() === 'Invalid credentials')
  check('stays on the sign-in screen', p.url().endsWith('/'))
  check('button returns to its idle state', await p.getByRole('button', { name: 'Sign in' }).isEnabled())
  await c.close()
}

/* ---------------- 3. a 401 mid-session ends the session ------------------ */
{
  let meCalls = 0
  const { c } = await ctx({
    '/api/auth/login': () => ok({ token: TOKEN, user: USER }),
    '/api/auth/me':    () => { meCalls++; return ok({ user: USER }) },
    '/api/notices':    () => ({ status: 401, contentType: 'application/json',
                                body: JSON.stringify({ error: 'Session expired — sign in again' }) }),
  })
  const p = await c.newPage()
  await p.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' })
  await p.getByRole('button', { name: 'Sign in' }).click()
  await p.waitForURL('**/app', { timeout: 10000 })
  await p.goto('http://localhost:5174/app/notices', { waitUntil: 'networkidle' })
  await p.waitForTimeout(1200)
  console.log('\nexpired token mid-session')
  check('redirected back to sign-in', p.url().endsWith('/'), p.url())
  check('token cleared from storage',
        await p.evaluate(() => sessionStorage.getItem('smit-ams.token')) === null)
  check('session cleared from storage',
        await p.evaluate(() => sessionStorage.getItem('smit-ams.session')) === null)
  await c.close()
}

/* ---------------- 4. server unreachable -> recoverable error state ------- */
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await c.route('**/api/auth/**', (r) => r.fulfill(ok({ token: TOKEN, user: USER })))
  await c.route('**/api/notices', (r) => r.abort('connectionrefused'))
  const p = await c.newPage()
  await p.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' })
  await p.getByRole('button', { name: 'Sign in' }).click()
  await p.waitForURL('**/app', { timeout: 10000 })
  await p.goto('http://localhost:5174/app/notices', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(1500)
  console.log('\nserver unreachable')
  const alert = await p.getByRole('alert').textContent()
  check('shows a connection error, not a blank screen', /Cannot reach the server/.test(alert ?? ''), alert ?? 'none')
  check('offers a retry', await p.getByRole('button', { name: 'Try again' }).isVisible())
  await c.close()
}


/* ---------------- 5. newly wired read paths render API data ------------- */
{
  const { c, seen } = await ctx({
    '/api/auth/login': () => ok({ token: TOKEN, user: USER }),
    '/api/auth/me':    () => ok({ user: USER }),
    '/api/courses':    () => ok({ courses: [{ _id: 'c1', code: 'ZZ9999', name: 'Quantum Basket Weaving',
                                              credits: 4, faculty: { _id: 'f1', name: 'Dr. Stub' }, room: 'X-1' }] }),
    '/api/assignments':() => ok({ assignments: [] }),
    '/api/attendance/650000000000000000000001': () =>
      ok({ overall: 42, courses: [{ code: 'ZZ9999', name: 'Quantum Basket Weaving', held: 10, attended: 4, pct: 42 }] }),
    '/api/results/650000000000000000000001': () =>
      ok({ results: [{ course: { code: 'ZZ9999', name: 'Quantum Basket Weaving', credits: 4 },
                       internal: 11, external: 22, total: 33, grade: 'C' }], credits: 4, cgpa: 5.0 }),
    '/api/exams': () => ok({ exams: [] }),
  })
  const p = await c.newPage()
  await p.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' })
  await p.getByRole('button', { name: 'Sign in' }).click()
  await p.waitForURL('**/app', { timeout: 10000 })

  console.log('\nnewly wired read paths')
  await p.goto('http://localhost:5174/app/academics', { waitUntil: 'networkidle' })
  await p.waitForTimeout(800)
  check('academics renders API courses', await p.getByText('Quantum Basket Weaving').first().isVisible())

  await p.goto('http://localhost:5174/app/attendance', { waitUntil: 'networkidle' })
  await p.waitForTimeout(900)
  check('attendance renders the API percentage', (await p.locator('body').textContent()).includes('42%'))
  check('attendance uses the API class counts', (await p.locator('body').textContent()).includes('4/10 classes'))

  await p.goto('http://localhost:5174/app/results', { waitUntil: 'networkidle' })
  await p.waitForTimeout(900)
  check('results renders API marks', (await p.locator('body').textContent()).includes('ZZ9999'))
  check('requested the results endpoint', seen.some((x) => x.path.startsWith('/api/results/')))
  await c.close()
}

/* ---------------- 6. write paths POST to the API ------------------------ */
{
  const posted = []
  const { c, seen } = await ctx({
    '/api/auth/login': () => ok({ token: TOKEN, user: USER }),
    '/api/auth/me':    () => ok({ user: USER }),
    '/api/fees/650000000000000000000001': () =>
      ok({ fee: { dueDate: '2026-09-30', breakdown: [{ head: 'Tuition', amount: 1000, paid: 400 }], payments: [] },
           total: 1000, paid: 400, pending: 600 }),
    '/api/fees/650000000000000000000001/pay': () => ok({ receipt: 'SMIT/2026/999111', paid: 1000, pending: 0 }),
  })
  const p = await c.newPage()
  await p.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' })
  await p.getByRole('button', { name: 'Sign in' }).click()
  await p.waitForURL('**/app', { timeout: 10000 })
  await p.goto('http://localhost:5174/app/fees', { waitUntil: 'networkidle' })
  await p.waitForTimeout(900)

  console.log('\nwrite path: fee payment')
  await p.getByRole('button', { name: /Pay now/ }).click()
  await p.waitForTimeout(400)
  await p.getByRole('dialog').getByRole('button', { name: /^Pay .600/ }).click()
  await p.waitForTimeout(1200)

  const pay = seen.find((x) => x.path.endsWith('/pay'))
  check('POSTs to the payment endpoint', pay?.method === 'POST', JSON.stringify(seen.map(s => s.path)))
  check('sends the outstanding amount', pay && JSON.parse(pay.body).amount === 600, pay?.body)
  check('carries the bearer token', pay?.auth === `Bearer ${TOKEN}`)
  check("surfaces the server's receipt number",
        (await p.locator('[role="status"]').textContent()).includes('SMIT/2026/999111'))
  await c.close()
}

/* ---------------- 7. a rejected write surfaces the server error --------- */
{
  const { c } = await ctx({
    '/api/auth/login': () => ok({ token: TOKEN, user: USER }),
    '/api/auth/me':    () => ok({ user: USER }),
    '/api/fees/650000000000000000000001': () =>
      ok({ fee: { dueDate: '2026-09-30', breakdown: [{ head: 'Tuition', amount: 1000, paid: 400 }], payments: [] },
           total: 1000, paid: 400, pending: 600 }),
    '/api/fees/650000000000000000000001/pay': () => ({ status: 422, contentType: 'application/json',
      body: JSON.stringify({ error: 'Amount exceeds the outstanding balance' }) }),
  })
  const p = await c.newPage()
  await p.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' })
  await p.getByRole('button', { name: 'Sign in' }).click()
  await p.waitForURL('**/app', { timeout: 10000 })
  await p.goto('http://localhost:5174/app/fees', { waitUntil: 'networkidle' })
  await p.waitForTimeout(900)
  await p.getByRole('button', { name: /Pay now/ }).click()
  await p.waitForTimeout(400)
  await p.getByRole('dialog').getByRole('button', { name: /^Pay .600/ }).click()
  await p.waitForTimeout(1200)

  console.log('\nrejected write')
  check("shows the server's rejection, not a success",
        (await p.locator('[role="status"]').textContent()).includes('exceeds the outstanding balance'))
  await c.close()
}

console.log(`\n${pass} passed, ${fail} failed`)
await browser.close()
process.exit(fail ? 1 : 0)
