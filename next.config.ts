import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://azljbchqwbgqmvoeryjq.supabase.co; frame-ancestors 'none'" },
];

const corsHeaders = [
  { key: 'Access-Control-Allow-Origin', value: 'https://nexlane-software.vercel.app' },
  { key: 'Access-Control-Allow-Credentials', value: 'true' },
  { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PATCH, PUT, DELETE, OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, x-n8n-api-key, X-Requested-With' },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      // CORS for API — allow production domain + n8n server-to-server
      { source: '/api/(.*)', headers: corsHeaders },
    ]
  },
}

export default withNextIntl(nextConfig)