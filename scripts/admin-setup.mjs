import { randomBytes, scryptSync } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

const env = await readFile('.env', 'utf8').catch(() => '')
if (/^ADMIN_PASSWORD_HASH=.+$/m.test(env)) {
  console.log('Admin credentials already configured. Use the password form inside the admin panel to change them.')
  process.exit(0)
}
const password = randomBytes(18).toString('base64url')
const salt = randomBytes(16).toString('hex')
const hash = scryptSync(password, salt, 64).toString('hex')
const cleaned = env.replace(/^ADMIN_PASSWORD_HASH=.*\r?\n?/gm, '').replace(/^ADMIN_USERNAME=.*\r?\n?/gm, '')
await writeFile('.env', `${cleaned.trim()}\nADMIN_USERNAME=admin\nADMIN_PASSWORD_HASH=${salt}:${hash}\n`, {mode:0o600})
await writeFile('.admin-access.local', `SmartAxis admin\nURL: http://localhost:5173/admin\nUsername: admin\nPassword: ${password}\n\nKeep this file private. Change the password in Admin > Account after signing in.\n`, {mode:0o600})
console.log('Initial admin credentials saved to .admin-access.local (not committed).')
