import { chromium } from 'playwright'
const EXECUTABLE = process.env.CHROMIUM_PATH || undefined  // falls back to Playwright's own browser
const browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : {})
const WIDTHS = [320, 375, 414, 768, 1024, 1440]
const ROUTES = ['/app', '/app/academics', '/app/attendance', '/app/assignments', '/app/exams',
                '/app/results', '/app/timetable', '/app/faculty', '/app/notices', '/app/fees',
                '/app/feedback', '/app/profile', '/app/settings', '/app/documents']
const overflow = [], smallTargets = new Set()

for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } })
  const page = await ctx.newPage()
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Student', exact: true }).click()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/app', { timeout: 10000 })

  for (const r of ROUTES) {
    await page.goto('http://localhost:5173' + r, { waitUntil: 'networkidle' })
    await page.waitForTimeout(350)
    const res = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }))
    if (res.scrollW > res.clientW + 1) overflow.push(`${w}px ${r} → scrollWidth ${res.scrollW} > ${res.clientW}`)

    if (w === 375) {
      const small = await page.evaluate(() => {
        const out = []
        for (const el of document.querySelectorAll('button, a[href], input, select')) {
          const b = el.getBoundingClientRect()
          if (b.width === 0 || b.height === 0) continue
          if (b.height < 44 && b.width < 44) {
            out.push((el.getAttribute('aria-label') || el.textContent.trim().slice(0, 24) || el.tagName) +
                     ` (${Math.round(b.width)}x${Math.round(b.height)})`)
          }
        }
        return out
      })
      small.forEach((s) => smallTargets.add(s))
    }
  }
  await ctx.close()
}

console.log('=== HORIZONTAL OVERFLOW (' + WIDTHS.length + ' widths x ' + ROUTES.length + ' routes = ' + WIDTHS.length * ROUTES.length + ' checks) ===')
console.log(overflow.length ? overflow.join('\n') : 'None — no route scrolls horizontally at any breakpoint.')
console.log('\n=== TOUCH TARGETS UNDER 44x44 AT 375px ===')
console.log(smallTargets.size ? [...smallTargets].join('\n') : 'None.')
await browser.close()
