"use client"

import dynamic from "next/dynamic"

const MomentumChromeExtension = dynamic(() => import("../../src/components/MomentumChromeExtension"), { ssr: false })

export default function ExtensionPage() {
  return <MomentumChromeExtension />
}
