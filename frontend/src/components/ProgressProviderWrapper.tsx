'use client'

import { ProgressProvider } from '@bprogress/next/app'

export default function ProgressProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProgressProvider
      height="4px"
      color="#0042A3"
      options={{ showSpinner: false }}
      shallowRouting={true}
      delay={500}
      stopDelay={100}
    >
      {children}
    </ProgressProvider>
  )
}
