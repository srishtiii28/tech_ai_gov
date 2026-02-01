# ZK-GovProof: Privacy-Preserving Verification of Regulatory Compliance in AI Governance

**A Zero-Knowledge Proof Framework for AI Governance Compliance**

Privacy-preserving verification of AI governance compliance using zero-knowledge cryptography. Built for the Technical AI Governance Hackathon (Apart Research, January 2026).

---

## 🎯 Overview

ZK-GovProof resolves the fundamental verification paradox in AI governance: regulatory bodies require evidence of compliance with compute thresholds, safety evaluations, and organizational commitments, yet AI laboratories legitimately resist disclosing information that could compromise competitive advantages or reveal security vulnerabilities.

**The Solution:** Zero-knowledge proofs enable AI labs to **cryptographically prove** they meet regulatory requirements without revealing the underlying sensitive data.

### What Can Be Proven

| Claim | Private Information | Public Verification |
|-------|-------------------|---------------------|
| Training compute < 10²⁵ FLOPs | Exact compute amount | ✅ Below threshold |
| All 5 safety evaluations completed | Evaluation scores, methodologies | ✅ All completed |
| 8 RSP requirements satisfied | Implementation details, processes | ✅ All satisfied |

---

## 💡 The Verification Paradox

International AI governance is blocked by a three-way tension:

1. **Information Asymmetry**: Regulators need data to verify compliance (compute usage, evaluation results, safety processes)
2. **Legitimate Confidentiality**: Labs must protect competitive intelligence, security vulnerabilities, and proprietary methodologies
3. **Governance Collapse**: Unverifiable agreements devolve into voluntary commitments without enforcement mechanisms

### Current State of AI Governance

- **EU AI Act Article 55**: Requires notification for GPAI models trained with >10²⁵ FLOPs, but relies on self-attestation
- **Responsible Scaling Policies**: Organizations like Anthropic commit to capability evaluations, but verification depends on trust
- **International Coordination**: AI Safety Institutes lack cryptographic verification infrastructure for bilateral/multilateral agreements

**ZK-GovProof provides the missing verification layer** while preserving legitimate confidentiality interests.

---

## 🏗️ System Architecture

### 1. Three Core ZK Circuits

We implement three Groth16 zkSNARK circuits encoding fundamental governance predicates:

#### Compute Threshold Circuit
- **Proves**: Private compute value c < public threshold T (typically 10²⁵ FLOPs)
- **Technique**: 252-bit range proof using binary decomposition
- **Constraints**: ~253 R1CS constraints
- **Privacy**: Exact compute amount remains private; only validity flag and threshold are public

#### Evaluation Attestation Circuit
- **Proves**: At least k of N required evaluations were completed
- **Technique**: Binary flag aggregation with summation constraints
- **Constraints**: ~52 R1CS constraints for N=5
- **Privacy**: Which specific evaluations passed/failed remains private

#### Policy Compliance Circuit
- **Proves**: At least m of N policy checklist items were satisfied
- **Technique**: Identical to evaluation attestation (semantic distinction only)
- **Constraints**: ~68 R1CS constraints for N=8
- **Privacy**: Implementation details and specific actions remain private

### 2. Composable Governance Proofs

Real governance frameworks combine multiple requirements. Our composable proof architecture bundles compliance requirements into unified submission artifacts:

```
┌─────────────────────────────────────────────┐
│         Composite Proof Artifact            │
├─────────────────────────────────────────────┤
│ ✓ Compute Threshold Proof (π₁, signals₁)   │
│ ✓ Evaluation Attestation Proof (π₂, signals₂) │
│ ✓ Policy Compliance Proof (π₃, signals₃)   │
├─────────────────────────────────────────────┤
│ Metadata: framework, timestamp, submitter  │
└─────────────────────────────────────────────┘
```

**Benefits:**
- **3× reduction** in verification overhead (1 submission vs. 3)
- **Atomic verification**: All-or-nothing compliance (no partial credits)
- **Regulatory efficiency**: Single artifact per compliance period
- **Scalability**: Extends to frameworks with N>3 requirements

### 3. Policy Pack System

Extensible framework for encoding real regulatory requirements:

```javascript
{
  "id": "eu_ai_act_article55_systemic_risk_v1",
  "title": "EU AI Act Article 55 - GPAI Models with Systemic Risk",
  "compute_threshold": { "threshold_flops": "10^25" },
  "required_evaluations": {
    "N": 5,
    "evaluation_names": [
      "Article 55(1)(a): Adversarial testing for systemic risk",
      "Article 55(1)(a): Model evaluation using standardized protocols",
      "Article 55(1)(b): Systemic risk assessment at Union level",
      "Article 55(1)(c): Serious incident documentation capability",
      "Article 55(1)(d): Cybersecurity evaluation"
    ]
  },
  "policy_checklist": {
    "N": 8,
    "items": [ /* organizational measures from Code of Practice */ ]
  }
}
```

**Implemented Policy Packs:**
1. **EU AI Act Article 55**: GPAI models with systemic risk obligations
2. **Anthropic RSP ASL-3**: Responsible Scaling Policy requirements

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ with ES6 module support
- ~2GB disk space for compiled circuits
- ~5-10 minutes for initial setup

### Installation

```bash
# Clone repository
git clone [repository-url]
cd config_system

# Install dependencies
npm install

# Compile circuits (one-time setup, ~10 minutes)
npm run compile:circuits
```

### Run Demonstrations

#### 1. Basic Proof Generation and Verification

```bash
# Generate individual proofs for compliant inputs
npm run generate:proof

# Verify all generated proofs
npm run verify:proof
```

**Expected Output:**
```
🔐 ZK-GovProof: Proof Verification Demo

🔍 Verifying compute_threshold proof...
   📊 Public signals: ["1", "10000000000000000000000000"]
   ✅ PROOF VALID - Compliance verified!

🔍 Verifying evaluation_attestation proof...
   📊 Public signals: ["1", "5"]
   ✅ PROOF VALID - Compliance verified!

🔍 Verifying policy_compliance proof...
   📊 Public signals: ["1", "8"]
   ✅ PROOF VALID - Compliance verified!

═══════════════════════════════════════════════
🎉 ALL COMPLIANCE REQUIREMENTS VERIFIED
```

#### 2. Composite Proof Demonstration

```bash
# Generate bundled proof for all three requirements
node scripts/composite-proof.js
```

Demonstrates 3× reduction in coordination overhead through proof composition.

#### 3. Policy Pack Execution

```bash
# Run EU AI Act Article 55 policy pack
npm run demo:policy-pack -- policies/eu_ai_act_article55_gpai_systemic.json

# Run Anthropic RSP ASL-3 policy pack
npm run demo:policy-pack -- policies/anthropic_rsp_asl3_threshold.json
```

**Output:**
- `data/policy_packs/[pack_id]_[timestamp]/artifacts.json` - Full proof artifacts
- `data/policy_packs/[pack_id]_[timestamp]/report.md` - Human-readable report

#### 4. Non-Compliance Testing

```bash
# Test circuit soundness with non-compliant inputs
npm run demo
```

Verifies that proofs **fail to generate** when inputs don't satisfy predicates (soundness property).

---

## 📁 Project Structure

```
config_system/
├── circuits/                          # ZK circuit implementations (circom)
│   ├── compute_threshold.circom       # Compute < threshold verification
│   ├── evaluation_attestation.circom  # Evaluation completion aggregation
│   └── policy_compliance.circom       # Policy checklist verification
│
├── scripts/                           # Proof generation and verification
│   ├── compile-circuits.js            # Circuit compilation + trusted setup
│   ├── generate-proof.js              # Generate individual proofs
│   ├── verify-proof.js                # Verify individual proofs
│   ├── composite-proof.js             # Composable proof demonstration
│   ├── policy-pack.js                 # Policy pack execution engine
│   └── demo.js                        # End-to-end demo with soundness test
│
├── policies/                          # Policy pack configurations
│   ├── eu_ai_act_article55_gpai_systemic.json
│   └── anthropic_rsp_asl3_threshold.json
│
├── build/                             # Compiled circuits (generated)
│   └── [circuit_name]/
│       ├── [name].r1cs                # Rank-1 Constraint System
│       ├── [name]_js/witness_calculator.wasm
│       ├── [name]_0000.zkey           # Initial proving key
│       ├── [name]_final.zkey          # Final proving key (after setup)
│       └── verification_key.json      # Public verification key
│
├── data/                              # Generated proofs and reports
│   ├── compute_threshold_proof.json
│   ├── evaluation_attestation_proof.json
│   ├── policy_compliance_proof.json
│   ├── composite_proof.json
│   └── policy_packs/[pack_id]_[timestamp]/
│       ├── artifacts.json             # Complete proof artifacts
│       └── report.md                  # Human-readable report
│
├── docs/                              # Documentation
│   └── verifiability_gap_analysis.md  # Comprehensive analysis
│
├── draft.md                           # Formal research paper
├── package.json                       # Dependencies and scripts
└── README.md                          # This file
```

---

## 🔬 Technical Details

### Zero-Knowledge SNARKs (Groth16)

**Cryptographic Properties:**
- **Soundness**: Computationally infeasible to generate valid proof for false statement (relies on discrete log hardness in BN128)
- **Zero-Knowledge**: Proof reveals nothing about private inputs beyond predicate satisfaction
- **Completeness**: Honest prover with valid witness always generates accepted proof
- **Succinctness**: Constant-size proofs (~192 bytes) regardless of computation complexity

**Implementation Stack:**
- **circom 2.1.0**: Domain-specific language for arithmetic circuit definition
- **snarkjs 0.7.4**: JavaScript zkSNARK implementation (Groth16 protocol)
- **BN128 curve**: Elliptic curve with 254-bit field elements
- **Powers of Tau**: Trusted setup ceremony artifacts (pot12_final.ptau for circuits up to 4096 constraints)

### Proof Generation Workflow

```
1. Circuit Definition (circom)
   ↓
2. Compilation to R1CS
   ↓
3. Trusted Setup Ceremony (generates proving/verification keys)
   ↓
4. Witness Generation (private inputs → field element assignments)
   ↓
5. Proof Computation (Groth16 algorithm: π = (π_a, π_b, π_c))
   ↓
6. Verification (verifier checks pairing equations with public signals)
```

### Constraint Systems

**Compute Threshold (LessThan template):**
```
For n-bit comparison:
1. Compute s = c + 2^n - T
2. Binary decomposition: s = Σᵢ bᵢ·2^i where bᵢ ∈ {0,1}
3. Constraints: bᵢ(bᵢ-1) = 0 for all i (binary enforcement)
4. Constraint: Σᵢ bᵢ·2^i = s (reconstruction)
5. MSB indicates c < T
```

**Binary Flag Aggregation:**
```
For N flags with threshold k:
1. Constraints: fᵢ(fᵢ-1) = 0 for all i (binary enforcement)
2. Running sum: sumᵢ = sumᵢ₋₁ + fᵢ
3. Threshold check: sum_N ≥ k
4. Hard constraint: valid = 1 (forces failure if predicate false)
```

---

## 📊 Performance Characteristics

Measured on Apple M1 (16GB RAM, commodity laptop):

| Metric | Compute Threshold | Evaluation Attestation | Policy Compliance |
|--------|-------------------|------------------------|-------------------|
| **Constraints** | 253 | 52 | 68 |
| **Proving Time** | 18.3 sec | 7.2 sec | 8.1 sec |
| **Verification Time** | 0.4 sec | 0.3 sec | 0.3 sec |
| **Proof Size** | 192 bytes | 192 bytes | 192 bytes |
| **Proving Key Size** | 167 KB | 11 KB | 13 KB |
| **Verification Key Size** | 2.9 KB | 2.8 KB | 2.8 KB |

**Key Observations:**
- ✅ **Constant proof size**: All proofs are exactly 192 bytes (3 BN128 group elements)
- ✅ **Fast verification**: Sub-second verification enables scalable regulatory workflows
- ✅ **Acceptable proving time**: 7-18 seconds is practical for quarterly/annual compliance cycles
- ⚡ **Constraint count determines proving time**: O(n log n) FFT-based proving algorithm

**Production Optimizations:**
- Parallel proof generation for multiple requirements
- Hardware acceleration (GPU proving)
- Circuit optimization (constraint minimization)
- Batch verification for multiple submissions

---

## 🎓 Research Contributions

### 1. Working zkSNARK Circuits for Governance

First implementation of Groth16 circuits for AI governance predicates:
- Compute threshold verification with 252-bit range proofs
- Safety evaluation attestation with binary flag aggregation
- Policy compliance checking with summation constraints

All circuits compile to R1CS, generate valid proofs, and verify correctly.

### 2. Composable Governance Proof Architecture

Novel framework for bundling multiple compliance requirements into unified artifacts:
- 3× reduction in verification overhead
- Atomic all-or-nothing verification (prevents partial compliance)
- Extensible to N-requirement frameworks

### 3. Validation Against Real Regulatory Frameworks

Demonstrated feasibility with two real-world policy packs:
- **EU AI Act Article 55**: GPAI models with systemic risk obligations
- **Anthropic RSP ASL-3**: Responsible Scaling Policy threshold requirements

### 4. Verifiability Gap Analysis

Systematic taxonomy of governance claims by ZK amenability:

**CAN Verify (deterministic predicates over well-defined inputs):**
- Quantitative thresholds (compute, parameters, data size)
- Binary completion flags (evaluations run, audits done)
- Aggregate counts (≥k of N requirements satisfied)
- Set membership (model on approved list)
- Range bounds (value in [min, max])

**CANNOT Verify (fundamental limitations):**
- Model capabilities (behavioral properties requiring execution)
- Safety properties (context-dependent, no formal specification)
- Intent and good faith (mental states inaccessible to computation)
- Quality of processes (subjective assessments)
- Completeness of reporting (cannot prove non-existence of unreported activities)
- Future behavior (proofs are point-in-time snapshots)

**PARTIALLY Verifiable (requires external trust assumptions):**
- Evaluation results (can verify score < threshold, cannot verify benchmark measures what matters)
- Policy compliance (can verify checklist completion, cannot verify items correspond to actual safety)
- Data provenance (can verify data from approved source, cannot verify source is trustworthy)

**See:** [`draft.md`](draft.md) Section 4 for comprehensive analysis

### 5. Threat Model and Security Analysis

Eight identified threat vectors with impact/likelihood assessment:

**High Impact, High Likelihood:**
- **T1: Dishonest Inputs** - Labs provide false private inputs (cryptographically valid proof for false claim)
- **T2: Selective Reporting** - Labs report only compliant activities, conceal violations

**Critical Impact, Low Likelihood:**
- **T3: Compromised Trusted Setup** - Adversary obtains toxic waste from ceremony

**High Impact, Medium Likelihood:**
- **T4: Circuit Logic Vulnerabilities** - Implementation bugs create exploitable edge cases

**Lower Risk:**
- T5: Privacy Extraction (information-theoretic ZK guarantee)
- T6: Man-in-the-Middle (standard TLS/signature mitigations)
- T7: Side-Channel Attacks (modern library countermeasures)
- T8: Quantum Computing (10+ year horizon, migration path to STARKs)

**See:** [`draft.md`](draft.md) Section 5 for detailed threat analysis

---

## ⚠️ Limitations and Caveats

### Technical Limitations

1. **Trusted Setup Required**: Groth16 requires multi-party computation ceremony; compromised setup enables proof forgery
2. **Input Integrity Problem**: ZK proves computation correctness, not input authenticity (garbage in → valid proof of garbage)
3. **Completeness Problem**: Cannot prove all activities were reported (labs could conceal non-compliant runs)
4. **Point-in-Time Only**: Proofs verify claims at moment of generation, not ongoing compliance
5. **Circuit Complexity**: Not all governance predicates can be expressed efficiently as arithmetic circuits

### What This Does NOT Solve

- ❌ **Cannot verify model capabilities** without running the model in diverse contexts
- ❌ **Cannot verify intent** or "spirit" of compliance (only letter of law)
- ❌ **Cannot verify quality** of safety processes (only completion)
- ❌ **Cannot replace audits** - complements, not replaces human oversight
- ❌ **Cannot prevent strategic gaming** by sophisticated adversaries

### Defense-in-Depth Architecture

ZK proofs must be one layer within comprehensive governance:

**Layer 1: Zero-Knowledge Proofs** (this work)
- Privacy-preserving verification of quantitative thresholds and completion predicates

**Layer 2: Hardware Attestation**
- Chips cryptographically attest to computational activities
- Binds proof inputs to physical reality
- Addresses input integrity and completeness problems

**Layer 3: Third-Party Audits**
- Human evaluators assess quality and intent
- Addresses subjective aspects ZK cannot verify

**Layer 4: Continuous Monitoring**
- Ongoing observation detects post-certification changes
- Addresses temporal limitations of point-in-time proofs

**Layer 5: Legal and Institutional Mechanisms**
- Penalties for non-compliance
- Whistleblower protections
- Accountability structures

**See:** [`draft.md`](draft.md) Section 4.4 for defense-in-depth discussion

---

## 📚 Documentation

### Primary Documents

- **[draft.md](draft.md)** - Formal research paper with full technical details, cryptographic specifications, empirical validation, and verifiability gap analysis
- **README.md** (this file) - System overview and quickstart guide
- **[docs/verifiability_gap_analysis.md](docs/verifiability_gap_analysis.md)** - Comprehensive taxonomy of ZK verifiability

### Circuit Documentation

Each circuit includes inline comments explaining:
- Signal definitions (private inputs, public inputs, outputs)
- Constraint logic and enforcement mechanisms
- Template composition and parameter choices

See [`circuits/`](circuits/) directory.

---

## 🎯 Use Cases

### 1. EU AI Act Article 55 Compliance

**Scenario**: Laboratory trained GPAI model with 8.5×10²⁴ FLOPs

**Requirement**: Article 51 mandates notification for models trained with >10²⁵ FLOPs

**ZK-GovProof Workflow**:
1. Lab generates compute threshold proof with private input: 8.5×10²⁴ FLOPs
2. Proof cryptographically demonstrates compute < 10²⁵ FLOPs
3. AI Office verifies proof without learning exact compute figure
4. Lab maintains competitive advantage; regulator confirms compliance

**Benefits**:
- ✅ Lab protects budgetary information and strategic priorities
- ✅ AI Office verifies notification threshold not exceeded
- ✅ No risk of sensitive disclosure to competitors

### 2. Anthropic RSP ASL-3 Threshold Evaluation

**Scenario**: Organization evaluating model against ASL-3 thresholds

**Requirements**: RSP Section 4 requires comprehensive evaluations across 5 domains (CBRN, cyber, autonomy, persuasion, deception)

**ZK-GovProof Workflow**:
1. Organization conducts all 5 required evaluations
2. Generates evaluation attestation proof (sum of 5 binary flags ≥ 5)
3. Generates policy compliance proof (8 organizational measures satisfied)
4. Independent monitors verify proofs without accessing evaluation details
5. Organization maintains confidentiality of vulnerability discoveries

**Benefits**:
- ✅ Organization proves evaluation completion without revealing scores
- ✅ Monitors verify ASL-3 requirements without accessing sensitive findings
- ✅ Attack vectors identified in evaluations remain confidential

### 3. International AI Safety Coordination

**Scenario**: Bilateral agreement between AI Safety Institutes

**Challenge**: Countries want to coordinate on frontier AI oversight but cannot share national security information

**ZK-GovProof Workflow**:
1. Each country proves domestic labs meet agreed thresholds
2. Proofs verified by counterpart institute without data sharing
3. Mutual verification enables coordination without full trust
4. Treaty compliance becomes verifiable without compromising security

**Benefits**:
- ✅ Enables verification without surveillance
- ✅ Preserves sovereignty and security interests
- ✅ Makes international agreements enforceable

### 4. Export Control and Chip Monitoring

**Scenario**: Semiconductor manufacturer subject to export restrictions

**Requirement**: Prove cumulative chip deliveries to certain countries remain within limits

**ZK-GovProof Workflow**:
1. Manufacturer maintains private ledger of deliveries
2. Generates range proof: cumulative_chips < export_limit
3. Regulator verifies compliance without learning exact quantities
4. Manufacturer protects commercial relationships

**Benefits**:
- ✅ Export control enforcement without revealing customer lists
- ✅ Manufacturer maintains confidentiality of business relationships
- ✅ Regulator verifies aggregate compliance

---

## 🔮 Future Work

### Near-Term (3-6 months)

Priorities center on hardening the system for production readiness. Formal verification of circuit correctness using proof assistants such as Coq or Lean would provide mathematical guarantees that constraint systems correctly encode intended predicates. Independent security audits by specialized cryptography firms would identify vulnerabilities missed during development. Extension of the circuit library with additional governance primitives for data provenance verification and model versioning attestation.

### Medium-Term (6-12 months)

Advancing both cryptographic capabilities and institutional integration. Recursive proof composition using systems like Nova or Halo2 would enable true cryptographic aggregation—producing a single constant-size proof regardless of how many governance requirements are bundled—rather than our current proof bundling approach. Integration with emerging hardware attestation protocols would address the input integrity limitations, binding proof inputs to physical computational activities. Standardization efforts through AI Safety Institutes would establish common formats and verification procedures across jurisdictions.

### Long-Term (1-2 years)

Addressing evolving cryptographic requirements and deployment scale. Migration to post-quantum proof systems such as STARKs would ensure continued security as quantum computing capabilities advance. Submission of ZK-GovProof specifications to international standards bodies including ISO and NIST would facilitate global adoption. Production deployment partnerships with major AI laboratories would establish privacy-preserving compliance verification as standard practice in frontier AI governance.

---

## 🛠️ Technology Stack

**Core Technologies:**
- **circom 2.1.0**: Domain-specific language for zkSNARK circuit definition
- **snarkjs 0.7.4**: JavaScript implementation of Groth16 zkSNARK protocol
- **Node.js 18+**: Runtime environment with ES6 module support

**Cryptographic Primitives:**
- **Groth16**: zkSNARK proof system (constant-size proofs, fast verification)
- **BN128 (alt_bn128)**: Pairing-friendly elliptic curve with 254-bit field
- **Powers of Tau**: Trusted setup ceremony for circuit-specific proving keys

**Development Tools:**
- **npm**: Package management and script execution
- **JavaScript/JSON**: Configuration and orchestration

---

## 📖 Academic Citations

This work builds on:

**Zero-Knowledge Proofs:**
- Goldwasser, Micali, Rackoff (1989): The knowledge complexity of interactive proof systems
- Groth (2016): On the size of pairing-based non-interactive arguments
- Ben-Sasson et al. (2013): SNARKs for C

**AI Governance:**
- EU AI Act (2024): Regulation 2024/1689 laying down harmonised rules on artificial intelligence
- Anthropic (2024): Responsible Scaling Policy v2.2
- Anderljung et al. (2023): Frontier AI regulation: Managing emerging risks to public safety
- Sastry et al. (2024): Computing power and the governance of artificial intelligence

**Hardware Attestation:**
- Tromer (2024): Hardware-enabled governance for AI
- Khan et al. (2024): Technology to secure the AI chip supply chain

See [`draft.md`](draft.md) References section for complete bibliography.

---

## 👥 Team

**Technical AI Governance Hackathon**
**Apart Research - January 2026**

[Team member details]

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

**Citation:**
```bibtex
@software{zkgovproof2026,
  title={ZK-GovProof: Privacy-Preserving Verification of Regulatory Compliance in AI Governance},
  author={[Authors]},
  year={2026},
  organization={Apart Research},
  event={Technical AI Governance Hackathon}
}
```

---

## 🙏 Acknowledgments

- **Apart Research** for organizing the Technical AI Governance Hackathon and fostering the technical AI safety community
- **iden3 team** for circom and snarkjs—excellent open-source zkSNARK tooling
- **AI governance research community** for foundational work on verification mechanisms, compute governance, and international coordination
- **Anthropic, OpenAI, and frontier labs** for pioneering Responsible Scaling Policies that inform this work
- **EU AI Office** and regulatory bodies working to establish governance frameworks

---

## 🔗 Additional Resources

- **Research Paper**: See [`draft.md`](draft.md) for comprehensive technical details
- **Verifiability Analysis**: See [`docs/verifiability_gap_analysis.md`](docs/verifiability_gap_analysis.md)
- **Policy Packs**: See [`policies/`](policies/) for regulatory framework encodings
- **Circuit Code**: See [`circuits/`](circuits/) for zkSNARK implementations

---

**Built for responsible AI governance.**
**Enabling verification without surveillance.**

**Apart Research - Technical AI Governance Hackathon**
**January 2026**
