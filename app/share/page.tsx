"use client"

import dynamic from "next/dynamic"

const MomentumSharePage = dynamic(() => import("../../src/components/MomentumSharePage"), { ssr: false })

export default function SharePage() {
  return <MomentumSharePage />
}
