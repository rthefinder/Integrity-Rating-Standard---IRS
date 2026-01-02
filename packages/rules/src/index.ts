import { TokenSnapshotT, RuleConfigT, ChecklistEntryT } from '@irs/shared'

export type EvaluationResult = {
  score: number
  rating: 'PASS' | 'WARN' | 'FAIL'
  checklist: ChecklistEntryT[]
}

export function evaluate(snapshot: TokenSnapshotT, config: RuleConfigT): EvaluationResult {
  const checklist: ChecklistEntryT[] = []
  let score = 100

  // Rule: mint authority should be null
  if (!snapshot.mintAuthority) {
    checklist.push({
      ruleId: 'mint-authority-null',
      status: 'PASS',
      title: 'Mint authority revoked',
      explanation: 'Mint authority is null',
      evidence: { mintAuthority: snapshot.mintAuthority }
    })
  } else {
    checklist.push({
      ruleId: 'mint-authority-null',
      status: 'FAIL',
      title: 'Mint authority present',
      explanation: 'Mint authority is not null; new tokens may be minted',
      evidence: { mintAuthority: snapshot.mintAuthority }
    })
    score -= 40
  }

  // Rule: freeze authority should be null
  if (!snapshot.freezeAuthority) {
    checklist.push({
      ruleId: 'freeze-authority-null',
      status: 'PASS',
      title: 'Freeze authority revoked',
      explanation: 'Freeze authority is null',
      evidence: { freezeAuthority: snapshot.freezeAuthority }
    })
  } else {
    checklist.push({
      ruleId: 'freeze-authority-null',
      status: 'WARN',
      title: 'Freeze authority present',
      explanation: 'Freeze authority is present; token transfers may be frozen',
      evidence: { freezeAuthority: snapshot.freezeAuthority }
    })
    score -= 10
  }

  // Rule: supply immutability — if mintAuthority null and supply doesn't indicate inflation
  // Supply check is simplistic: if mint authority null we assume supply fixed
  if (!snapshot.mintAuthority) {
    checklist.push({
      ruleId: 'supply-fixed',
      status: 'PASS',
      title: 'Supply appears fixed',
      explanation: 'Mint authority revoked so supply cannot be increased via mint',
      evidence: { supply: snapshot.supply }
    })
  } else {
    checklist.push({
      ruleId: 'supply-fixed',
      status: 'FAIL',
      title: 'Supply may be mutable',
      explanation: 'Mint authority present; additional tokens can be minted',
      evidence: { supply: snapshot.supply }
    })
    score -= 20
  }

  // Holder concentration checks
  const { top1, top5, top10 } = snapshot.concentrationMetrics

  function checkConcentration(value: number, warnThreshold: number, failThreshold: number, id: string, title: string) {
    if (value >= failThreshold) {
      checklist.push({
        ruleId: id,
        status: 'FAIL',
        title,
        explanation: `High concentration: ${value}% >= fail threshold ${failThreshold}%`,
        evidence: { value }
      })
      score -= 30
    } else if (value >= warnThreshold) {
      checklist.push({
        ruleId: id,
        status: 'WARN',
        title,
        explanation: `Concentration above warning: ${value}% >= warn ${warnThreshold}%`,
        evidence: { value }
      })
      score -= 10
    } else {
      checklist.push({
        ruleId: id,
        status: 'PASS',
        title,
        explanation: `Concentration acceptable: ${value}% < warn ${warnThreshold}%`,
        evidence: { value }
      })
    }
  }

  checkConcentration(top1, config.thresholds.top1Warn, config.thresholds.top1Fail, 'concentration-top1', 'Top 1 holder concentration')
  checkConcentration(top5, config.thresholds.top5Warn, config.thresholds.top5Fail, 'concentration-top5', 'Top 5 holders concentration')
  checkConcentration(top10, config.thresholds.top10Warn, config.thresholds.top10Fail, 'concentration-top10', 'Top 10 holders concentration')

  // Known-risk lists: check mint or top holders against lists
  const known = config.knownBadLists
  const hits: string[] = []
  if (known.mints.includes(snapshot.mint)) hits.push(snapshot.mint)
  snapshot.largestHolders.forEach(h => {
    if (known.wallets.includes(h.address)) hits.push(h.address)
  })
  if (hits.length > 0) {
    checklist.push({
      ruleId: 'known-risk-list',
      status: 'FAIL',
      title: 'Known-risk list match',
      explanation: 'Token or holders match known-risk lists',
      evidence: { hits }
    })
    score -= 50
  } else {
    checklist.push({
      ruleId: 'known-risk-list',
      status: 'PASS',
      title: 'No known-risk matches',
      explanation: 'No matches in configured known-risk lists',
      evidence: {}
    })
  }

  if (score < 0) score = 0
  if (score > 100) score = 100

  let rating: 'PASS' | 'WARN' | 'FAIL' = 'PASS'
  if (score >= 70) rating = 'PASS'
  else if (score >= 40) rating = 'WARN'
  else rating = 'FAIL'

  return { score, rating, checklist }
}
