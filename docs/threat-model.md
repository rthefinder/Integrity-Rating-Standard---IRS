# Threat Model

This document explains what the Integrity Rating Standard can and cannot detect.

Detects (signals):
- Token authorities (mint/freeze) present or revoked
- Approximate holder concentration using on-chain largest accounts
- Matches against curated known-risk lists
- Produce explainable, auditable checklist items

Cannot detect (limitations):
- Off-chain coordination, private deals, or social engineering
- Guarantees that a token is safe or will not rug
- Complete cluster analysis — heuristics are best-effort
