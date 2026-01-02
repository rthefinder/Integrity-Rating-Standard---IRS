import { describe, it, expect } from 'vitest'
import { evaluate } from '../src'
import { TokenSnapshot, RuleConfig } from '@irs/shared'

const sampleSnapshot = TokenSnapshot.parse({
  mint: 'Mint111',
  updatedAt: new Date().toISOString(),
  mintAuthority: null,
  freezeAuthority: null,
  supply: '1000000',
  decimals: 6,
  largestHolders: [
    { address: 'A', amount: '400000' },
    { address: 'B', amount: '200000' }
  ],
  concentrationMetrics: { top1: 40, top5: 60, top10: 75 }
})

const sampleConfig = RuleConfig.parse({
  version: 1,
  thresholds: {
    top1Warn: 30,
    top5Warn: 50,
    top10Warn: 70,
    top1Fail: 50,
    top5Fail: 70,
    top10Fail: 90
  },
  knownBadLists: { programs: [], wallets: [], mints: [] }
})

describe('rules engine', () => {
  it('scores and produces checklist', () => {
    const res = evaluate(sampleSnapshot, sampleConfig)
    expect(res.score).toBeTypeOf('number')
    expect(res.checklist.length).toBeGreaterThanOrEqual(1)
    expect(['PASS', 'WARN', 'FAIL']).toContain(res.rating)
  })
})
