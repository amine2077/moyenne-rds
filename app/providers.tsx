'use client'

import posthog from 'posthog-js'
import { PostHogProvider, usePostHog } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    session_recording: {
      recordCrossOriginIframes: false,
    },
    autocapture: true,
    capture_pageview: false, // We will capture pageviews manually below
    loaded: (ph) => {
      if (process.env.NODE_ENV !== 'production') ph.opt_out_capturing()
    },
  })
}

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ph = usePostHog()

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      ph.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname, searchParams, ph])

  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  )
}

