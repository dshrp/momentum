"use client"

import dynamic from "next/dynamic"

const MomentumAdmin = dynamic(() => import("../../src/components/MomentumAdmin"), { ssr: false })

export default function AdminPage() {
  return <MomentumAdmin />
}
