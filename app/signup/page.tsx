"use client"

import dynamic from "next/dynamic"

const MomentumOnboarding = dynamic(() => import("../../src/components/MomentumOnboarding"), { ssr: false })

export default function SignupPage() {
  return <MomentumOnboarding />
}
