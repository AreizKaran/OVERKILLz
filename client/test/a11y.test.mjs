/**
 * Accessibility audit — axe-core across every route, for all three roles.
 *
 * Covers WCAG 2.0/2.1 A and AA, which includes the colour-contrast, name/role/value
 * and landmark rules the brief calls for. Run against the dev server on :5173.
 *
 *   node test/a11y.test.mjs
 */
import { chromium } from 'playwright'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const axePath = require.resolve('axe-core/axe.min.js')
const axeSource = require('fs').readFileSync(axePath, 'utf8')

const EXECUTABLE = process.env.CHROMIUM_PATH || undefined
const browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : {})

const ROUTES = {
  Student: ['/app', '/app/academics', '/app/attendance', '/app/assignments', '/app/exams',
            '/app/results', '/app/timetable', '/app/faculty', '/app/notices', '/app/fees',
            '/app/feedback', '/app/profile', '/app/settings', '/app/documents'],
  Faculty: ['/app', '/app/assignments', '/app/students', '/app/marks'],
  Administrator: ['/app', '/app/students', '/app/departments', '/app/access', '/app/reports'],
}

const violations = new Map()   // rule id -> { impact, help, nodes[], where[] }
let audited = 0

async function audit(page, label) {
  await page.evaluate(axeSource)
  const result = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    return await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    })
  })
  audited++
  for (const v of result.violations) {
    const entry = violations.get(v.id) ?? { impact: v.impact, help: v.help, nodes: new Set(), where: new Set() }
    entry.where.add(label)
    for (const n of v.nodes) entry.nodes.add(n.html.slice(0, 120).replace(/\s+/g, ' '))
    violations.set(v.id, entry)
  }
}

for (const [role, routes] of Object.entries(ROUTES)) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })

  // The sign-in screen itself is audited before authenticating.
  if (role === 'Student') await audit(page, 'login')

  await page.getByRole('button', { name: role, exact: true }).click()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/app', { timeout: 10000 })

  for (const r of routes) {
    await page.goto('http://localhost:5173' + r, { waitUntil: 'networkidle' })
    await page.waitForTimeout(700)
    await audit(page, `${role}${r}`)
  }
  await ctx.close()
}

// Mobile pass: bottom nav, drawer and the stacked layouts.
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } })
  const page = await ctx.newPage()
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Student', exact: true }).click()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/app', { timeout: 10000 })
  await audit(page, 'mobile/app')
  await page.getByRole('button', { name: 'More menu' }).click()
  await page.waitForTimeout(600)
  await audit(page, 'mobile/drawer')
  await ctx.close()
}

console.log(`\n=== axe-core WCAG 2.1 AA — ${audited} page audits ===\n`)
if (violations.size === 0) {
  console.log('No violations.')
} else {
  const order = { critical: 0, serious: 1, moderate: 2, minor: 3 }
  const rows = [...violations.entries()].sort((a, b) => (order[a[1].impact] ?? 9) - (order[b[1].impact] ?? 9))
  for (const [id, v] of rows) {
    console.log(`[${(v.impact ?? 'n/a').toUpperCase()}] ${id} — ${v.help}`)
    console.log(`  on ${v.where.size} page(s): ${[...v.where].slice(0, 5).join(', ')}${v.where.size > 5 ? ' …' : ''}`)
    for (const n of [...v.nodes].slice(0, 3)) console.log(`    ${n}`)
    console.log()
  }
}
await browser.close()
process.exit(violations.size ? 1 : 0)
