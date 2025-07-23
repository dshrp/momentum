"use client"

import dynamic from "next/dynamic"

const MomentumSourcesPage = dynamic(() => import("../../src/components/MomentumSourcesPage"), { ssr: false })

export default function FollowingPage() {
  return <MomentumSourcesPage />
}
