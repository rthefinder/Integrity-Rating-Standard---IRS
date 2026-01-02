import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function TokenPage() {
  const router = useRouter()
  const { mint } = router.query
  return (
    <div style={{padding:20}}>
      <h2>Token: {mint}</h2>
      <p><Link href={`/report/${mint}`}>View latest report</Link></p>
    </div>
  )
}
