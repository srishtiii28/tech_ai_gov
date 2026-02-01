# Policy Pack (Demo): EU compute threshold + minimal RSP checklist

This file is a **human-readable** companion to `policy_pack_example.json`.

## What this demonstrates

- Taking a real-ish governance concept (“compute threshold reporting” + “RSP checklist commitments”)
- Converting it into a **machine-checkable compliance predicate**
- Generating ZK proofs for that predicate using the existing circuits

## Important caveat

ZK-GovProof does **not** parse natural-language policies into proofs automatically. The core step is **policy compilation**:

1. Choose which clauses are objectively checkable.
2. Define an explicit predicate over structured inputs (numbers, booleans).
3. Prove that predicate in zero knowledge.

## Mapping to circuits

- **Compute threshold** → `compute_threshold.circom` proves `privateCompute < threshold`.
- **Eval completion** → `evaluation_attestation.circom` proves `sum(flags) >= requiredCount` for N=5.
- **Policy checklist** → `policy_compliance.circom` proves `sum(flags) >= minRequired` for N=8.

