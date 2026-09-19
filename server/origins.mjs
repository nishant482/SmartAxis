export function allowedOrigins(env = process.env) {
  const values = [
    'https://smart-axis.vercel.app',
    ...(env.PUBLIC_ORIGINS || '').split(','),
    ...[env.VERCEL_URL, env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).map(host => `https://${host}`),
  ]
  return [...new Set(values.flatMap(value => {
    try {
      const url = new URL(value.trim())
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? [url.origin] : []
    } catch { return [] }
  }))]
}
