import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import nacl from 'tweetnacl'
import base64 from 'base64-js'

export default function ReportPage() {
  const router = useRouter()
  const { mint } = router.query
  const [report, setReport] = useState<any>(null)
  const [verified, setVerified] = useState<boolean | null>(null)

  useEffect(() => {
    if (!mint) return
    fetch(`/api/report/${mint}`).then(r => r.json()).then(data => setReport(data))
  }, [mint])

  useEffect(() => {
    if (!report) return
    try {
      const message = new TextEncoder().encode(JSON.stringify({ id: report.id, mint: report.mint, score: report.score }))
      const sig = base64.toByteArray(report.signature)
      const pub = Uint8Array.from([]) // omitted: provide signer pubkey if available
      const ok = false
      setVerified(ok)
    } catch (err) {
      setVerified(false)
    }
  }, [report])

  if (!report) return <div style={{padding:20}}>Loading...</div>

  return (
    <div style={{padding:20}}>
      <h2>Report for {mint}</h2>
      <p>Score: {report.score} — Rating: {report.rating}</p>
      <h3>Checklist</h3>
      <ul>
        {report.checklist.map((c:any)=> (
          <li key={c.ruleId}><strong>{c.status}</strong>: {c.title} — {c.explanation}</li>
        ))}
      </ul>
      <p>Signature verified: {String(verified)}</p>
    </div>
  )
}
