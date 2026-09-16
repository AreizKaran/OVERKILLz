process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-not-a-real-one'
const { signToken, authorise, ownRecordOnly, authenticate } = await import('../src/middleware/auth.js')

let pass = 0, fail = 0
const check = (name, cond) => { cond ? (pass++, console.log('  PASS', name)) : (fail++, console.log('  FAIL', name)) }
const res = () => { const r = { code: null, body: null }; r.status = (c) => { r.code = c; return r }; r.json = (b) => { r.body = b; return r }; return r }
const run = (mw, req) => new Promise((done) => { const r = res(); let nexted = false; mw(req, r, () => { nexted = true; done({ r, nexted }) }); if (!nexted) setImmediate(() => done({ r, nexted })) })

console.log('\nauthorise(): role gating')
for (const [role, allowed] of [['admin', true], ['faculty', true], ['student', false]]) {
  const { r, nexted } = await run(authorise('faculty', 'admin'), { user: { role } })
  check(`${role} -> ${allowed ? 'allowed' : '403'}`, allowed ? nexted : (!nexted && r.code === 403))
}
{
  const { r, nexted } = await run(authorise('admin'), {})
  check('no session -> 401', !nexted && r.code === 401)
}

console.log('\nownRecordOnly(): a student cannot read another student by URL')
{
  const me = 'aaaaaaaaaaaaaaaaaaaaaaaa', other = 'bbbbbbbbbbbbbbbbbbbbbbbb'
  let { nexted } = await run(ownRecordOnly(), { user: { role: 'student', _id: me }, params: { studentId: me } })
  check('own record -> allowed', nexted)
  const out = await run(ownRecordOnly(), { user: { role: 'student', _id: me }, params: { studentId: other } })
  check('another student -> 403', !out.nexted && out.r.code === 403)
  const staff = await run(ownRecordOnly(), { user: { role: 'faculty', _id: me }, params: { studentId: other } })
  check('faculty reading a student -> allowed', staff.nexted)
}

console.log('\nJWT: token shape and rejection')
{
  const t = signToken({ _id: { toString: () => 'abc123' }, role: 'student' })
  check('token is a 3-part JWT', t.split('.').length === 3)
  const payload = JSON.parse(Buffer.from(t.split('.')[1], 'base64').toString())
  check('payload carries sub + role', payload.sub === 'abc123' && payload.role === 'student')
  check('payload carries NO password field', !('password' in payload))
  const bad = await run(authenticate, { headers: { authorization: 'Bearer not.a.token' } })
  check('garbage token -> 401', bad.r.code === 401)
  const none = await run(authenticate, { headers: {} })
  check('missing header -> 401', none.r.code === 401)
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
