import React, { useState } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const [mint, setMint] = useState('')
  const router = useRouter()
  return (
    <div style={{padding:20}}>
      <h1>Integrity Rating Standard ($IRS)</h1>
      <p>Enter an SPL token mint to view its report.</p>
      <input value={mint} onChange={e => setMint(e.target.value)} placeholder="Mint address" style={{width:400}} />
      <button onClick={() => router.push(`/token/${mint}`)} disabled={!mint}>Search</button>
      <hr />
      <p>Not affiliated with the Internal Revenue Service. Not legal or financial advice.</p>
    </div>
  )
}
