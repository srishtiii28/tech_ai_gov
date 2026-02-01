# Threat Model and Security Analysis: ZK-GovProof

**Version:** 1.0
**Date:** January 2026

---

## Executive Summary

This document analyzes the security properties, threat model, and attack vectors for ZK-GovProof, a zero-knowledge proof system for AI governance compliance. We identify what the system protects against, what it doesn't, and recommendations for deployment.

**Key Findings:**
- ✅ **Strong privacy guarantees** against honest-but-curious regulators
- ⚠️ **Vulnerable to malicious provers** with dishonest inputs
- ❌ **Cannot detect unreported training runs** (completeness problem)
- 🔒 **Requires trusted setup ceremony** for soundness

---

## 1. System Overview

### 1.1 Actors

| Actor | Role | Trust Level |
|-------|------|-------------|
| **Lab (Prover)** | Generates proofs of compliance | Untrusted |
| **Regulator (Verifier)** | Verifies compliance proofs | Honest-but-curious |
| **Setup Participants** | Conduct trusted setup ceremony | Assumed honest (at least one) |
| **Adversary** | Attempts to fake compliance or extract private data | Malicious |

### 1.2 Assets to Protect

**Private Inputs:**
- Exact compute usage (competitive intelligence)
- Safety evaluation scores (vulnerability indicators)
- Internal process details (trade secrets)
- Model architecture decisions (IP)

**Public Outputs:**
- Compliance status (valid/invalid)
- Regulatory thresholds (known to all)
- Required evaluation types (public standards)

### 1.3 Security Goals

1. **Soundness**: Malicious lab cannot fake compliance (can't create valid proof for false claim)
2. **Zero-Knowledge**: Honest regulator learns nothing beyond validity of claim
3. **Completeness**: Honest lab can always generate valid proof for true claim

---

## 2. Threat Model

### 2.1 In-Scope Threats

| Threat ID | Threat | Impact | Likelihood |
|-----------|--------|--------|------------|
| T1 | Lab submits proof with dishonest inputs | HIGH | HIGH |
| T2 | Lab selectively reports only compliant runs | HIGH | HIGH |
| T3 | Compromised trusted setup enables fake proofs | CRITICAL | LOW |
| T4 | Regulator attempts to extract private data from proofs | MEDIUM | MEDIUM |
| T5 | Man-in-the-middle attack on proof submission | MEDIUM | LOW |
| T6 | Lab games circuit logic to bypass checks | HIGH | MEDIUM |
| T7 | Side-channel attack on proof generation | LOW | LOW |
| T8 | Quantum computer breaks proof system | CRITICAL | LOW (future) |

### 2.2 Out-of-Scope Threats

- Physical attacks on lab hardware
- Social engineering of lab employees
- Legal/regulatory capture
- Economic incentives for non-compliance
- Bugs in circom/snarkjs implementation (assume correct)

---

## 3. Detailed Threat Analysis

### T1: Dishonest Input Attack

**Scenario:** Lab generates valid proof with false private inputs.

**Example:**
```
Actual compute: 2e25 FLOPs (above threshold)
Claimed compute: 5e24 FLOPs (below threshold)

Lab generates proof with claimed value:
PROOF{ privateCompute: 5e24, threshold: 1e25 }

Result: Valid proof, but claim is false
```

**Why this works:**
- ZK proves "IF inputs are X, THEN computation is correct"
- Does NOT prove "inputs actually represent reality"
- Garbage in → cryptographically verified garbage out

**Mitigations:**
1. **Hardware attestation**: Chips cryptographically sign actual compute usage
2. **Trusted witnesses**: Third-party monitors observe training runs
3. **Energy audits**: Cross-check electricity consumption
4. **Whistleblower mechanisms**: Insiders can report discrepancies

**Residual risk:** HIGH - This is the fundamental limit of self-reported ZK proofs

---

### T2: Selective Reporting Attack

**Scenario:** Lab trains multiple models, only reports compliant ones.

**Example:**
```
Lab trains 10 models:
- Models 1-3: Compliant (compute < threshold)
- Models 4-10: Non-compliant (compute > threshold)

Lab submits valid proofs for models 1-3 only.
Models 4-10 remain unreported.

Result: All submitted proofs verify, but lab is non-compliant overall
```

**Why this works:**
- ZK cannot prove non-existence (can't prove "no other training runs occurred")
- Regulator has no visibility into unreported runs
- Selection bias is undetectable

**Mitigations:**
1. **Datacenter monitoring**: Independent observation of all large training runs
2. **Hardware reporting**: Chips report all training above threshold automatically
3. **Energy/network audits**: Detect training activity through side channels
4. **Mandatory logging**: Legal requirement to report all runs with penalties

**Residual risk:** HIGH - Requires complementary mechanisms beyond ZK

---

### T3: Compromised Trusted Setup

**Scenario:** Adversary obtains "toxic waste" from trusted setup ceremony.

**Background:** Groth16 setup generates:
- Proving key (public)
- Verification key (public)
- Secret randomness τ (must be destroyed - "toxic waste")

**Attack:**
```
If adversary knows τ:
1. Can generate valid proofs for ANY claim (true or false)
2. Can fake compliance without actually complying
3. Soundness property completely broken
```

**Why this is critical:**
- Single compromised participant = broken soundness
- Impossible to detect if setup was compromised
- All proofs become untrustworthy

**Mitigations:**
1. **Multi-party computation (MPC) ceremony**: Need to compromise ALL participants
2. **Public participation**: Open ceremony with many independent parties
3. **Transparent ceremony**: Live stream, open-source coordinator
4. **Trusted hardware**: Use TEEs for entropy generation
5. **Alternative proof systems**: Use transparent setups (PLONK, STARKs) - no trusted setup needed

**Residual risk:** LOW if ceremony is done properly, CRITICAL if not

**For production:** Use transparent setup (PLONK) or very large MPC ceremony (100+ participants)

---

### T4: Privacy Extraction Attack

**Scenario:** Malicious verifier attempts to extract private inputs from proof.

**Attack vectors:**
1. **Cryptanalysis**: Try to reverse-engineer private inputs from proof
2. **Timing attacks**: Measure proof verification time to infer inputs
3. **Multiple proofs**: Submit many verification requests to learn information
4. **Side channels**: Observe power consumption, electromagnetic emissions

**Why this mostly fails:**
- Zero-knowledge property: Proof reveals nothing beyond claim validity
- Groth16 is proven zero-knowledge under cryptographic assumptions
- Side channels are mitigated by constant-time implementations

**Edge cases:**
- If public threshold is very close to private value, might infer proximity
- If lab submits many similar proofs, might leak information through patterns

**Mitigations:**
1. **Trusted implementation**: Use audited circom/snarkjs libraries
2. **Constant-time operations**: Prevent timing side channels
3. **Threshold selection**: Set public thresholds far from expected values
4. **Limited proof submission**: Rate-limit to prevent pattern analysis

**Residual risk:** LOW - Zero-knowledge property is well-established

---

### T5: Man-in-the-Middle Attack

**Scenario:** Adversary intercepts proof submission and modifies it.

**Attack:**
```
Lab → [Proof P for claim C] → Adversary → [Proof P' for claim C'] → Regulator
```

**Why this mostly fails:**
- Proof is cryptographically bound to public inputs
- Cannot modify proof without detection (verification fails)
- Cannot swap proofs between different claims

**Real risk:**
- Replay attack: Submit old valid proof for new run
- Substitution: Submit someone else's proof as your own

**Mitigations:**
1. **Nonces/timestamps**: Include unique identifier in public inputs
2. **Digital signatures**: Lab signs proof with identity
3. **TLS/HTTPS**: Encrypted transport layer
4. **Challenge-response**: Regulator sends challenge that must be included in proof

**Residual risk:** LOW with proper protocol design

---

### T6: Circuit Logic Gaming

**Scenario:** Lab finds loophole in circuit logic to bypass checks.

**Example vulnerabilities:**
```
// Overflow attack
privateCompute = 2^252 (wraps around to small number)
Passes threshold check, but actual compute was huge

// Edge case exploit
threshold = X, privateCompute = X
Should fail (need strict <), but circuit uses <=

// Malleability
Find two different inputs that produce same proof
```

**Why this could work:**
- Circuits are complex, bugs are possible
- Arithmetic constraints might have edge cases
- Underflow/overflow in finite fields

**Mitigations:**
1. **Formal verification**: Prove circuit correctness mathematically
2. **Range checks**: Ensure all values are in valid ranges
3. **Audits**: Third-party security review of circuits
4. **Testing**: Extensive unit tests and fuzzing
5. **Open source**: Community review

**Residual risk:** MEDIUM - Circuit bugs are possible, need thorough testing

---

### T7: Side-Channel Attack on Proof Generation

**Scenario:** Adversary observes lab's proof generation process through side channels.

**Channels:**
- Power consumption (DPA/SPA attacks)
- Electromagnetic emissions (EM analysis)
- Timing variations
- Cache timing attacks

**Potential leakage:**
- Private inputs (compute values, evaluation flags)
- Randomness used in proof generation

**Mitigations:**
1. **Constant-time implementations**: snarkjs uses constant-time crypto primitives
2. **Blinding**: Add randomness to mask side channels
3. **Secure execution**: Generate proofs in hardened environments
4. **Air-gapped systems**: No network access during proof generation

**Residual risk:** LOW - Side channels are well-mitigated in modern crypto libraries

---

### T8: Quantum Computing Attack

**Scenario:** Quantum computer breaks discrete log assumption underlying zkSNARKs.

**Impact:**
- Adversary could forge proofs
- Adversary could extract private inputs from proofs
- All historical proofs become insecure

**Timeline:**
- Current risk: LOW (no quantum computer exists)
- 10-year risk: MEDIUM
- 20-year risk: HIGH

**Mitigations:**
1. **Post-quantum SNARKs**: Research area, not yet production-ready
2. **STARKs**: Based on hash functions, believed post-quantum secure
3. **Hybrid approaches**: Combine classical + post-quantum systems
4. **Crypto-agility**: Design systems to swap proof systems easily

**Residual risk:** LOW (short-term), HIGH (long-term)

---

## 4. Security Properties Analysis

### 4.1 What ZK-GovProof DOES Protect

✅ **Privacy of private inputs**
- Regulator cannot extract exact compute, eval scores, or process details
- Even malicious verifier with unlimited compute cannot break zero-knowledge property
- Confidence: HIGH (assuming cryptographic assumptions hold)

✅ **Integrity of computation**
- If inputs are honest, computation is guaranteed correct
- Cannot claim different result for same inputs
- Confidence: HIGH

✅ **Non-repudiation**
- If lab generates proof, cannot deny it later
- Proof is cryptographically binding
- Confidence: HIGH (with proper identity binding)

### 4.2 What ZK-GovProof DOES NOT Protect

❌ **Input honesty**
- Lab can lie about private inputs
- Proof only guarantees "IF inputs are X, THEN result is Y"
- Does NOT guarantee "inputs actually are X"

❌ **Completeness of reporting**
- Lab can selectively report only compliant training runs
- Cannot prove "no other runs occurred"

❌ **Intent and good faith**
- Lab could technically comply while violating spirit of rules
- Cannot verify motivations or quality of compliance

❌ **Future behavior**
- Proof is point-in-time, no guarantees about future actions
- Model could change after proof submission

---

## 5. Attack Tree

```
Goal: Fake compliance without actually complying

├── [HIGH IMPACT] Dishonest Input Attack (T1)
│   ├── Submit false compute value
│   │   └── Mitigated by: Hardware attestation
│   ├── Lie about evaluation completion
│   │   └── Mitigated by: Independent evaluator verification
│   └── Fabricate policy compliance
│       └── Mitigated by: Third-party audits
│
├── [HIGH IMPACT] Selective Reporting (T2)
│   ├── Train models, only report compliant ones
│   │   └── Mitigated by: Datacenter monitoring
│   └── Hide non-compliant runs
│       └── Mitigated by: Hardware reporting, energy audits
│
├── [CRITICAL IMPACT, LOW PROB] Compromised Setup (T3)
│   ├── Obtain toxic waste from ceremony
│   │   └── Mitigated by: MPC ceremony with many participants
│   └── Participate in setup and retain secrets
│       └── Mitigated by: Public, transparent ceremony
│
├── [MEDIUM IMPACT] Circuit Logic Gaming (T6)
│   ├── Find overflow/underflow bugs
│   │   └── Mitigated by: Range checks, formal verification
│   └── Exploit edge cases in circuit logic
│       └── Mitigated by: Extensive testing, audits
│
└── [LOW IMPACT] Technical Attacks
    ├── Privacy extraction (T4)
    │   └── Mitigated by: Zero-knowledge property
    ├── MITM (T5)
    │   └── Mitigated by: TLS, signatures, nonces
    └── Side channels (T7)
        └── Mitigated by: Constant-time implementations
```

---

## 6. Defense-in-Depth Recommendations

ZK proofs should be **one layer** in a multi-layered governance system:

### Layer 1: ZK Proofs (This System)
- Privacy-preserving verification of reported claims
- Efficient, cryptographically secure
- **Limitation:** Cannot verify input honesty or completeness

### Layer 2: Hardware Attestation
- Chips cryptographically sign all training runs
- Provides completeness (all runs reported)
- **Complement:** Addresses T1 and T2

### Layer 3: Third-Party Audits
- Independent evaluators verify quality
- Human judgment for subjective requirements
- **Complement:** Addresses quality and intent issues

### Layer 4: Continuous Monitoring
- Post-deployment behavior tracking
- Real-time anomaly detection
- **Complement:** Addresses future behavior

### Layer 5: Legal Framework
- Penalties for non-compliance
- Whistleblower protections
- Mandatory disclosure requirements
- **Complement:** Creates incentives for honest reporting

**None of these layers alone is sufficient. All are necessary.**

---

## 7. Deployment Recommendations

### For Production Deployment:

1. **Trusted Setup**
   - [ ] Conduct large MPC ceremony (100+ participants)
   - [ ] Or migrate to transparent setup (PLONK)
   - [ ] Publish ceremony transcript publicly

2. **Circuit Security**
   - [ ] Formal verification of circuit logic
   - [ ] Independent security audit (3+ firms)
   - [ ] Bug bounty program

3. **Input Validation**
   - [ ] Require hardware attestation alongside ZK proofs
   - [ ] Cross-check with energy consumption data
   - [ ] Mandate third-party witness for high-stakes claims

4. **Protocol Design**
   - [ ] Include nonces/timestamps in public inputs
   - [ ] Require digital signatures on proof submissions
   - [ ] Implement rate limiting on proof submissions

5. **Monitoring**
   - [ ] Log all proof submissions with timestamps
   - [ ] Detect anomalous patterns (e.g., only compliant proofs)
   - [ ] Alert on statistical outliers

6. **Cryptographic Agility**
   - [ ] Design system to swap proof systems easily
   - [ ] Plan migration path to post-quantum systems
   - [ ] Monitor cryptographic research for breaks

---

## 8. Open Questions and Future Work

1. **Can we verify input honesty without revealing inputs?**
   - Research: Combining ZK with TEE attestation
   - Challenge: Balancing privacy with verifiability

2. **How to handle the completeness problem?**
   - Approaches: Hardware reporting, datacenter monitoring
   - Tradeoff: Visibility vs. operational security

3. **What are the limits of composability?**
   - Can we truly aggregate proofs (recursive SNARKs)?
   - Performance at scale?

4. **How to design incentive-compatible systems?**
   - Making honest reporting the rational choice
   - Economic mechanisms, not just technical

5. **Post-quantum security?**
   - When to migrate to post-quantum systems?
   - Performance implications?

---

## 9. Conclusion

**ZK-GovProof provides strong privacy guarantees** for AI governance compliance verification, but has fundamental limitations:

- ✅ **Effective against honest-but-curious regulators** who want to verify compliance without accessing secrets
- ⚠️ **Vulnerable to dishonest labs** who lie about inputs or selectively report
- 🔒 **Requires defense-in-depth** with hardware attestation, audits, and monitoring

**Key insight:** ZK proofs solve the privacy problem, but not the trust problem. They enable verification without revealing secrets, but cannot force honest reporting. Complementary mechanisms are essential.

**Recommendation:** Deploy ZK proofs as part of a comprehensive governance stack, not as a standalone solution.

---

**For questions or security concerns, contact:** [Team contact]

**Last updated:** January 2026
