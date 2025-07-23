"use client"

import dynamic from "next/dynamic"

const MomentumAbout = dynamic(() => import("../../src/components/MomentumAbout"), { ssr: false })

export default function AboutPage() {
  return <MomentumAbout />
}
