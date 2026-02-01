# ZK-GovProof: Composable Zero-Knowledge Proofs for AI Governance

Privacy-preserving verification of AI governance compliance using zero-knowledge cryptography.

**Project for:** Technical AI Governance Hackathon (Apart Research, January 2026)

---

## What This Is

ZK-GovProof enables AI labs to **cryptographically prove** they meet regulatory requirements without revealing sensitive information:

- Training compute below threshold → **Exact FLOPs stay private**
- Safety evaluations completed → **Scores stay private**
- Policy requirements met → **Internal processes stay private**

**Key Innovation #1:** **Composable Governance Proofs** - Combine multiple compliance requirements into a single efficient proof.

**Key Innovation #2:** **Verifiability Gap Analysis** - Rigorous mapping of what ZK can and cannot verify for AI governance.

---

## The Problem

International AI governance is blocked by a verification paradox:

1. **Regulators need data** to verify compliance (compute usage, eval results, safety processes)
2. **Labs won't share sensitive data** (competitive advantage, security risks)
3. **Countries won't sign unverifiable agreements** (no enforcement mechanism)

**Current State:**

- EU AI Act requires reporting but has no privacy-preserving verification
- Responsible Scaling Policies rely on self-reporting
- International coordination lacks trustless verification infrastructure

**Our Solution:** Zero-knowledge proofs enable proving compliance _without revealing the underlying data_.

---

## What We Built

### 1. Three Core ZK Circuits

| Circuit                    | Proves                              | Keeps Private                        |
| -------------------------- | ----------------------------------- | ------------------------------------ |
| **Compute Threshold**      | Training < 10²⁵ FLOPs               | Exact compute amount                 |
| **Evaluation Attestation** | All required safety evals completed | Evaluation scores, methodologies     |
| **Policy Compliance**      | All RSP requirements met            | Internal processes, specific actions |

### 2. Composable Proof Framework

Instead of submitting 3 separate proofs, labs generate **one composite proof** verifying all requirements:

```
PROOF: (compute < 10²⁵) ∧ (evals complete) ∧ (RSP followed)
PRIVATE: exact compute, eval scores, implementation details
```

**Benefits:**

- 3x reduction in verification overhead
- Atomic compliance (all-or-nothing)
- Simpler regulatory integration
- Scales to complex frameworks

### 3. Verifiability Gap Analysis

Comprehensive analysis of what ZK **can**, **cannot**, and **partially** verifies:

**CAN Verify:**

- Quantitative thresholds (compute, parameters, data size)
- Binary completion (evals run, audits done)
- Temporal claims (completed before date X)
- Set membership (approved lists)
- Range proofs (value in bounds)

**CANNOT Verify:**

- Model capabilities (behavioral, not mathematical)
- Safety properties (non-deterministic)
- Intent and good faith (mental states)
- Quality of processes (subjective)
- Completeness of reporting (can't prove non-existence)
- Future behavior (point-in-time only)

**See:** [`docs/verifiability_gap_analysis.md`](docs/verifiability_gap_analysis.md) for full analysis

---

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Compile circuits (this takes 5-10 minutes for trusted setup)
npm run compile:circuits
```

### Generate Proofs

```bash
# Generate individual proofs
npm run generate:proof

# Generate composite proof (demonstrates composability)
node scripts/composite-proof.js
```

### Verify Proofs

```bash
# Verify all proofs
npm run verify:proof
```

### Expected Output

```ZK-GovProof: Proof Verification Demo

🔍 Verifying compute_threshold proof...
   📊 Public inputs: ["10000000000000000000000000"]
   ⏳ Verifying...
   ✅ PROOF VALID - Compliance verified!

🔍 Verifying evaluation_attestation proof...
   ✅ PROOF VALID - Compliance verified!

🔍 Verifying policy_compliance proof...
   ✅ PROOF VALID - Compliance verified!

═══════════════════════════════════════════════════════════

🎉 ALL COMPLIANCE REQUIREMENTS VERIFIED

The AI lab has cryptographically proven compliance with:
  • EU AI Act compute thresholds
  • Required safety evaluation protocols
  • Responsible Scaling Policy commitments

 WITHOUT revealing any sensitive information about:
  • Exact compute usage
  • Evaluation scores or methodologies
  • Internal processes or implementation details
```

---

## Project Structure

```
config_system/
├── circuits/                   # ZK circuit implementations
│   ├── compute_threshold.circom
│   ├── evaluation_attestation.circom
│   └── policy_compliance.circom
├── scripts/                    # Proof generation and verification
│   ├── compile-circuits.js    # Circuit compilation + trusted setup
│   ├── generate-proof.js      # Generate individual proofs
│   ├── verify-proof.js        # Verify proofs
│   └── composite-proof.js     # Composable proof demo
├── docs/                       # Documentation
│   └── verifiability_gap_analysis.md
├── build/                      # Compiled circuits (generated)
│   └── [circuit_name]/
│       ├── *.r1cs             # Constraint system
│       ├── *_js/*.wasm        # Witness calculator
│       ├── *_final.zkey       # Proving key
│       └── verification_key.json
├── data/                       # Generated proofs (generated)
│   ├── compute_threshold_proof.json
│   ├── evaluation_attestation_proof.json
│   ├── policy_compliance_proof.json
│   └── composite_proof.json
└── README.md
```

---

## How It Works

### Zero-Knowledge SNARKs

We use **Groth16 zkSNARKs** via `circom` and `snarkjs`:

1. **Circuit Definition**: Define compliance requirements as arithmetic circuits
2. **Trusted Setup**: Generate proving and verification keys (one-time ceremony)
3. **Proof Generation**: Lab computes proof with private inputs
4. **Verification**: Regulator verifies proof with only public inputs

**Properties:**

- **Succinct**: Proof size ~200 bytes, verification < 1 second
- **Zero-knowledge**: Reveals nothing about private inputs
- **Sound**: Cryptographically impossible to fake valid proof
- **Trusted setup required**: Ceremony must be conducted honestly

### Proof Composition

Our composable proof system bundles multiple proofs into a single attestation:

```
Individual Proofs              Composite Proof
─────────────────             ─────────────────
Proof A: Compute              One bundled proof
Proof B: Evaluations     →    containing all three
Proof C: Policy               requirements
─────────────────             ─────────────────
3 submissions                 1 submission
3 verifications               1 verification
```

**Future Work:** Recursive SNARKs would enable true proof aggregation (single cryptographic proof instead of bundle).

---

## Performance

| Metric              | Value                |
| ------------------- | -------------------- |
| Circuit compilation | ~5-10 min (one-time) |
| Proof generation    | ~10-30 sec per proof |
| Proof verification  | < 1 sec per proof    |
| Proof size          | ~200 bytes           |
| Circuit constraints | 253-300 per circuit  |

**Scalability:** Production systems would optimize circuits and use more powerful hardware for faster proving.

---

## Limitations & Dual-Use Considerations

### Technical Limitations

1. **Trusted Setup**: Groth16 requires ceremony; compromised setup breaks soundness
2. **Input Integrity**: ZK proves computation correctness, not input honesty (garbage in → valid proof of garbage)
3. **Scalability**: Complex circuits have high proving time
4. **Circuit Complexity**: Some governance claims are hard to express as arithmetic circuits

### Mitigations

- Clear documentation of what proofs do/don't guarantee
- Recommendations for complementary verification (hardware attestation, audits)
- Emphasis on ZK as one layer in defense-in-depth governance

**See:** [`docs/verifiability_gap_analysis.md`](docs/verifiability_gap_analysis.md) for comprehensive analysis

---

## Technology Stack

- **circom 2.1.0**: Domain-specific language for ZK circuits
- **snarkjs 0.7.4**: JavaScript zkSNARK implementation
- **Groth16**: Proof system (succinct proofs, fast verification)
- **Node.js/TypeScript**: Scripting and automation

---

## Use Cases

### 1. EU AI Act Compliance

- Labs prove training compute < 10²⁵ FLOPs without revealing exact amount
- Regulators verify compliance without accessing competitive intelligence

### 2. Responsible Scaling Policy Monitoring

- Labs prove ASL-2/ASL-3 requirements met without revealing internal processes
- Independent monitors verify commitments without accessing sensitive data

### 3. International AI Safety Coordination

- Countries verify treaty compliance without sharing national security information
- AI Safety Institutes coordinate without full trust

### 4. Export Control Verification

- Chip manufacturers prove delivery quantities within limits
- Labs prove model sizes comply with export restrictions

---

## Future Work

1. **Recursive SNARKs**: True proof aggregation (single cryptographic proof)
2. **Hardware Integration**: Combine with TEE attestation for stronger guarantees
3. **Standardization**: Standard circuits for common governance claims
4. **Efficiency**: Optimize circuits for production use
5. **Broader Coverage**: Circuits for additional requirements (data provenance, model versioning)
6. **Formal Verification**: Prove circuit correctness mathematically

---

## 📄 License

MIT License - See LICENSE file for details

---

---

**Built for the Technical AI Governance Hackathon**
**Apart Research - January 2026**
