import { z } from 'zod'

export const HolderEntry = z.object({
  address: z.string(),
  amount: z.string()
})

export const TokenSnapshot = z.object({
  mint: z.string(),
  updatedAt: z.string(),
  mintAuthority: z.nullable(z.string()),
  freezeAuthority: z.nullable(z.string()),
  supply: z.string(),
  decimals: z.number().int(),
  largestHolders: z.array(HolderEntry),
  concentrationMetrics: z.object({
    top1: z.number(),
    top5: z.number(),
    top10: z.number()
  })
})

export type TokenSnapshotT = z.infer<typeof TokenSnapshot>

export const RuleConfig = z.object({
  version: z.number().int(),
  thresholds: z.object({
    top1Warn: z.number(),
    top5Warn: z.number(),
    top10Warn: z.number(),
    top1Fail: z.number(),
    top5Fail: z.number(),
    top10Fail: z.number()
  }),
  knownBadLists: z.object({
    programs: z.array(z.string()),
    wallets: z.array(z.string()),
    mints: z.array(z.string())
  })
})

export type RuleConfigT = z.infer<typeof RuleConfig>

export const ChecklistEntry = z.object({
  ruleId: z.string(),
  status: z.enum(['PASS', 'WARN', 'FAIL']),
  title: z.string(),
  explanation: z.string(),
  evidence: z.any()
})

export type ChecklistEntryT = z.infer<typeof ChecklistEntry>

export const IRSReport = z.object({
  id: z.string(),
  mint: z.string(),
  configVersion: z.number().int(),
  reportVersion: z.number().int(),
  score: z.number().int(),
  rating: z.enum(['PASS', 'WARN', 'FAIL']),
  checklist: z.array(ChecklistEntry),
  evidence: z.any(),
  signature: z.string(),
  signerPubkey: z.string(),
  createdAt: z.string()
})

export type IRSReportT = z.infer<typeof IRSReport>
