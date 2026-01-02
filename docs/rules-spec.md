# Rules Specification

Each rule is deterministic and must provide an explanation and evidence.

1. `mint-authority-null`: PASS if mint authority is null, FAIL otherwise.
2. `freeze-authority-null`: PASS if freeze authority is null, WARN otherwise.
3. `supply-fixed`: PASS if mint authority null, FAIL otherwise.
4. `concentration-top1/top5/top10`: thresholds configurable per `RuleConfig`.
5. `known-risk-list`: checks token and holder addresses against curated lists.

Rules are combined into a score (0–100) with configurable weights in the engine.
