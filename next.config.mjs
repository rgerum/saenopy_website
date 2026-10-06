let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev only: Next blocks cross-origin requests to its dev resources, which
  // fails the HMR websocket whenever the dev server is reached as anything
  // other than localhost. Cover every name this machine answers to — the
  // MagicDNS short name, the full tailnet name, and mDNS.
  allowedDevOrigins: [
    'richard-aspire-a515-55g',
    'richard-aspire-a515-55g.tailed9e74.ts.net',
    'richard-aspire-a515-55g.local',
    '*.ts.net',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
