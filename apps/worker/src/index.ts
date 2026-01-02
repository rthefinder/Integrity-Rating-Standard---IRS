import dotenv from 'dotenv'
import { Connection, PublicKey } from '@solana/web3.js'
import { PrismaClient } from '@prisma/client'
import { evaluate } from '@irs/rules'
import { RuleConfig as RuleConfigZ } from '@irs/shared'
import { signMessage, generateKeypair } from '@irs/crypto'

dotenv.config()

const RPC = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com'
const connection = new Connection(RPC)
const prisma = new PrismaClient()

async function fetchTokenSnapshot(mintAddress: string) {
  const mintPub = new PublicKey(mintAddress)
  const mintInfo = await connection.getParsedAccountInfo(mintPub)
  // best-effort: use getTokenSupply and getTokenLargestAccounts
  const supplyResp = await connection.getTokenSupply(mintPub)
  const largest = await connection.getTokenLargestAccounts(mintPub)
  const holders = await Promise.all(largest.value.map(async la => ({ address: la.address.toString(), amount: la.amount })))

  // compute concentration (very basic)
  const total = Number(supplyResp.value.amount || 0)
  const topVals = holders.map(h => Number(h.amount))
  const top1 = total ? (topVals[0] / total) * 100 : 0
  const top5 = total ? (topVals.slice(0, 5).reduce((a, b) => a + (b || 0), 0) / total) * 100 : 0
  const top10 = total ? (topVals.slice(0, 10).reduce((a, b) => a + (b || 0), 0) / total) * 100 : 0

  const snapshot = {
    mint: mintAddress,
    updatedAt: new Date().toISOString(),
    mintAuthority: null, // placeholder: real code should fetch mint account
    freezeAuthority: null,
    supply: supplyResp.value.amount,
    decimals: supplyResp.value.decimals || 0,
    largestHolders: holders.map(h => ({ address: h.address, amount: String(h.amount) })),
    concentrationMetrics: { top1: Math.round(top1), top5: Math.round(top5), top10: Math.round(top10) }
  }

  return snapshot
}

async function runForMint(mint: string) {
  const cfg = await prisma.ruleConfig.findFirst({ orderBy: { version: 'desc' } })
  if (!cfg) throw new Error('No rule config found in DB')

  const config = RuleConfigZ.parse({
    version: cfg.version,
    thresholds: cfg.thresholds,
    knownBadLists: cfg.knownBadLists
  })

  const snapshot = await fetchTokenSnapshot(mint)

  // store snapshot
  await prisma.tokenSnapshot.upsert({ where: { mint }, update: { ...snapshot, updatedAt: new Date() }, create: { ...snapshot } })

  const result = evaluate(snapshot as any, config as any)

  // sign report
  const key = process.env.SIGNER_SECRET_BASE64
  if (!key) {
    console.warn('No signer key available; generating ephemeral key for demo')
  }
  const signerSecret = key ? Buffer.from(key, 'base64') : Buffer.from(generateKeypair().secretKey, 'base64')

  const report = {
    id: 'report-' + Date.now(),
    mint,
    configVersion: config.version,
    reportVersion: 1,
    score: result.score,
    rating: result.rating,
    checklist: result.checklist,
    evidence: {},
    createdAt: new Date().toISOString()
  }

  const payload = Buffer.from(JSON.stringify(report))
  const signature = signMessage(payload, signerSecret)

  await prisma.iRSReport.create({ data: {
    id: report.id,
    mint,
    configVersion: config.version,
    reportVersion: 1,
    score: report.score,
    rating: report.rating,
    checklist: report.checklist as any,
    evidence: report.evidence,
    signature,
    signerPubkey: '',
    createdAt: new Date()
  }})

  console.log('Generated report', report.id)
}

if (require.main === module) {
  const mint = process.env.MINT || ''
  if (!mint) {
    console.error('Set MINT env or call runForMint programmatically')
    process.exit(1)
  }
  runForMint(mint).then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1) })
}
