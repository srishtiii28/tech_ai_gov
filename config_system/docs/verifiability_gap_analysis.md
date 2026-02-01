# Verifiability Gap Analysis: What Zero-Knowledge Proofs Can and Cannot Verify in AI Governance

**Version:** 1.0
**Date:** January 2026
**Authors:** ZK-GovProof Team

---

## Executive Summary

Zero-knowledge (ZK) proofs enable privacy-preserving verification of certain governance claims, but they are not a panacea. This document provides a rigorous analysis of what ZK cryptography **CAN**, **CANNOT**, and **PARTIALLY** verify for AI governance, helping policymakers understand where ZK is appropriate and where complementary mechanisms are needed.

**Key Findings:**

- ✅ **CAN VERIFY**: Quantitative thresholds, binary completion, temporal claims, range proofs, set membership
- ❌ **CANNOT VERIFY**: Model capabilities, safety properties, intent, quality of processes, completeness of reporting
- ⚠️ **PARTIALLY VERIFIABLE**: Evaluation results, policy compliance, data provenance (requires trust assumptions)

**Recommendation:** ZK proofs should be **one layer** in a defense-in-depth governance strategy, complemented by hardware attestation, audits, and inspections.

---

## Part 1: What CAN Be Verified with Zero-Knowledge Proofs

### 1.1 Quantitative Thresholds

**What it is:** Proving a private value falls above/below a public threshold without revealing the exact value.

| Claim | Private Input | Public Input | Example |
|-------|---------------|--------------|---------|
| Training compute below limit | Actual FLOPs used | Regulatory threshold (10²⁵) | EU AI Act compliance |
| Parameter count in range | Model parameters | Min/max bounds | Export control verification |
| Dataset size within bounds | Training data size | Size limits | Privacy compliance |
| Training duration | Wall-clock time | Maximum allowed | Monitoring rapid capability jumps |

**Why it works:** Range proofs and comparison circuits are well-established ZK primitives. The computation is deterministic and mathematical.

**Limitations:**
- Requires honest input from submitter (garbage in → valid proof of garbage)
- Only verifies reported training runs (unreported runs remain invisible)
- Assumes compute is measured consistently (different accounting methods exist)

**Production readiness:** ✅ High - efficient circuits exist, widely deployed in blockchain systems

---

### 1.2 Binary Completion Claims

**What it is:** Proving a set of required actions were completed without revealing details about those actions.

| Claim | Private Input | Public Input | Example |
|-------|---------------|--------------|---------|
| Safety evaluations completed | Completion flags [1,1,1,1,1] | Required count (5) | EU Code of Practice |
| External audit performed | Audit completion flag | Required: true | Lab commitments |
| Incident reporting enabled | System status flag | Required: enabled | Operational transparency |
| Red teaming conducted | Activity log flag | Required: yes | RSP requirements |

**Why it works:** Binary flags (0/1) are easy to verify cryptographically. Can prove "all items checked" without revealing what each item entailed.

**Limitations:**
- Does NOT verify quality (perfunctory vs. rigorous evaluation)
- Does NOT verify timing (could be done retroactively)
- Does NOT verify independence (internal vs. external audit)
- Prone to "checkbox compliance" (technically met but missing spirit)

**Production readiness:** ✅ High - simple circuits, low proving time

---

### 1.3 Temporal Claims

**What it is:** Proving events occurred before/after specific dates or in specific sequences.

| Claim | Private Input | Public Input | Example |
|-------|---------------|--------------|---------|
| Training completed before date | Completion timestamp | Deadline date | Capability freeze commitments |
| Policy in place since date | Policy creation timestamp | Claimed date | Retroactive compliance claims |
| Incident reported within timeframe | Incident + report timestamps | SLA window | Transparency obligations |
| Sequential order | Event timestamps | Expected sequence | Process compliance |

**Why it works:** Timestamps can be cryptographically signed and compared. Sequence verification is straightforward in ZK circuits.

**Limitations:**
- Requires trusted time source (hardware clocks can be manipulated)
- Does NOT verify causality (could fabricate earlier timestamps)
- Vulnerable to time oracle attacks

**Production readiness:** ⚠️ Medium - requires trusted timestamping infrastructure (TEE or blockchain)

---

### 1.4 Set Membership Proofs

**What it is:** Proving an item belongs to a specific set without revealing which item.

| Claim | Private Input | Public Input | Example |
|-------|---------------|--------------|---------|
| Model on approved list | Model hash | Approved model registry | Deployment allowlists |
| Evaluator is accredited | Evaluator ID | Accredited evaluator list | Third-party audit verification |
| Data source is permitted | Data provenance hash | Allowed sources | Data governance |
| Compute provider authorized | Datacenter ID | Licensed providers | Enforcement mechanisms |

**Why it works:** Merkle tree membership proofs enable efficient set verification. Common in privacy-preserving systems.

**Limitations:**
- Requires maintaining public registries (who controls the list?)
- Static sets (dynamic membership requires frequent updates)
- Does NOT verify the integrity of set construction

**Production readiness:** ✅ High - mature cryptographic technique

---

### 1.5 Range Proofs (Beyond Thresholds)

**What it is:** Proving a value lies within a specific range.

| Claim | Private Input | Public Input | Example |
|-------|---------------|--------------|---------|
| Capability score in safe range | Benchmark score | Safe range [0, 50] | ASL-2 → ASL-3 threshold |
| Training cost within budget | Dollar amount | Budget limits | Financial compliance |
| Team size appropriate | Number of people with access | Min/max bounds | Access control verification |

**Why it works:** Extension of threshold proofs to two-sided bounds.

**Limitations:** Same as quantitative thresholds (input honesty assumption).

**Production readiness:** ✅ High

---

## Part 2: What CANNOT Be Verified with Zero-Knowledge Proofs

### 2.1 Model Capabilities

**The claim:** "This model is safe" or "This model cannot perform dangerous tasks X, Y, Z"

**Why ZK cannot verify this:**

1. **Capabilities are behavioral, not mathematical**: There's no circuit that computes "is_dangerous(model)" deterministically
2. **Emergent properties**: Capabilities emerge from training; they're not encoded in parameters directly
3. **Evaluation-dependent**: "Capability" depends on which benchmarks you run and how you prompt
4. **Adversarial robustness**: Model might hide capabilities until deployed (deceptive alignment)

**What ZK CAN do (limited):**
- Prove a benchmark score is below threshold (but NOT that the benchmark measures what matters)
- Prove evaluations were run (but NOT that they were comprehensive)

**Why this matters:** Regulators want to know if a model is dangerous. ZK can verify you *ran evals*, but not that the model *is safe*.

**Complementary mechanisms needed:**
- Live capability testing by independent evaluators
- Red teaming with adversarial prompts
- Hardware attestation that model wasn't fine-tuned after evaluation
- Ongoing monitoring of deployed systems

---

### 2.2 Safety Properties

**The claim:** "This model won't cause harm" or "Safety measures are adequate"

**Why ZK cannot verify this:**

1. **Non-deterministic**: "Safety" is a property of model-environment interaction, not model parameters
2. **Subjective thresholds**: What counts as "safe" varies by context and values
3. **Unknowable in advance**: Safety failures often emerge from unexpected use cases
4. **Cannot verify counterfactuals**: "Would not have caused harm" is unprovable

**Example failure mode:**
- Lab proves "we implemented safety measures A, B, C" (checkboxes completed)
- But measures A, B, C are inadequate for the actual risks
- ZK proof is valid, but model is still dangerous

**Complementary mechanisms needed:**
- Mandatory incident reporting with root cause analysis
- Third-party safety audits with adversarial mindset
- Deployment monitoring and kill switches
- Insurance/liability frameworks

---

### 2.3 Intent and Good Faith

**The claim:** "We acted in good faith" or "We intended to comply"

**Why ZK cannot verify this:**

1. **Mental states are not observable**: Intent exists in minds, not data
2. **Actions vs. intentions**: Can verify actions, not motivations
3. **Gaming is rational**: Labs might technically comply while violating spirit of rules

**Example failure mode:**
- Lab proves "training compute < 10²⁵ FLOPs"
- But they deliberately split training across multiple runs to evade threshold
- Each run individually complies, but combined violates intent
- ZK proofs are valid, but compliance is hollow

**Complementary mechanisms needed:**
- Whistleblower protections and reporting channels
- Auditor access to internal communications
- Legal definitions of "evasion" with penalties
- Culture of safety beyond compliance

---

### 2.4 Quality of Processes

**The claim:** "Our safety evaluations were rigorous" or "External audit was thorough"

**Why ZK cannot verify this:**

1. **Quality is subjective**: What counts as "rigorous" lacks consensus definition
2. **Process vs. outcome**: Can verify process happened, not that it was good
3. **Effort hiding**: Can claim compliance while doing minimal work

**Example failure mode:**
- Lab proves "external audit completed" (binary flag = 1)
- But audit was 1-hour rubber stamp by friendly contractor
- ZK proof is valid, but audit was worthless

**What ZK CAN do:**
- Prove audit duration > X hours (weak proxy for thoroughness)
- Prove auditor is on accredited list (assumes accreditation means quality)

**Complementary mechanisms needed:**
- Accreditation standards for auditors with real teeth
- Publish audit reports (or summaries) for peer review
- Regulator spot-checks of audit quality
- Reputation systems for auditors

---

### 2.5 Completeness of Reporting

**The claim:** "We reported all training runs above the threshold"

**Why ZK cannot verify this:**

1. **Cannot prove non-existence**: ZK proves properties of submitted data, not what's missing
2. **Selection bias**: Labs could only report compliant runs, hide non-compliant ones
3. **No external visibility**: Regulator doesn't know how many runs occurred total

**Example failure mode:**
- Lab trains 10 models, 7 are non-compliant
- Lab only reports the 3 compliant ones with valid ZK proofs
- All proofs verify correctly, but compliance is fake

**This is THE fundamental limit of self-reporting with ZK proofs.**

**Complementary mechanisms needed:**
- **Hardware attestation**: Chips report all large training runs (not just self-reported ones)
- **Datacenter monitoring**: Independent verification of compute usage
- **Whistleblower protections**: Insiders can report hidden training runs
- **Energy audits**: Cross-check electricity consumption against reported compute

---

### 2.6 Future Behavior

**The claim:** "This model will remain safe" or "We will continue to comply"

**Why ZK cannot verify this:**

1. **Proofs are point-in-time**: Valid at submission, no guarantees afterward
2. **Models can change**: Fine-tuning, RLHF, adversarial training post-deployment
3. **Environments change**: Safe in context A, dangerous in context B
4. **Commitment problems**: Today's proof doesn't bind tomorrow's actions

**Example failure mode:**
- Lab submits valid proof at deployment
- Immediately fine-tunes model to add dangerous capabilities
- Original proof remains cryptographically valid, but model changed

**Complementary mechanisms needed:**
- Continuous monitoring of deployed models
- Hardware attestation of model updates
- Legal obligations for re-evaluation after modifications
- Version control with cryptographic hashing

---

## Part 3: What is PARTIALLY Verifiable (With Caveats)

### 3.1 Evaluation Results

**The claim:** "Our model scored below the danger threshold on benchmark X"

**What ZK CAN verify:**
- ✅ Score was below threshold (if score is reported honestly)
- ✅ Evaluation was completed (binary flag)
- ✅ Evaluator was accredited (set membership)

**What ZK CANNOT verify:**
- ❌ Benchmark measures what matters (might miss key risks)
- ❌ Evaluation was adversarial (might be softball questions)
- ❌ Results weren't cherry-picked (best of N runs)
- ❌ Model wasn't specifically trained to pass this benchmark

**Trust assumptions:**
- Benchmark creators designed good tests
- Evaluators ran tests properly
- Labs didn't overfit to benchmarks

**Risk:** Benchmarks become targets (Goodhart's Law). Labs optimize for passing evals, not actual safety.

**Mitigation:**
- Dynamic benchmarks (change over time)
- Secret test sets (labs can't train on them)
- Adversarial red teaming (not just standardized evals)

---

### 3.2 Policy Compliance

**The claim:** "We followed all items in our Responsible Scaling Policy"

**What ZK CAN verify:**
- ✅ All checklist items marked complete
- ✅ Required actions were taken (if binary flags are honest)
- ✅ Sequence of actions (if timestamps are honest)

**What ZK CANNOT verify:**
- ❌ Items were done well (quality)
- ❌ Policy is adequate for the risks (could be weak policy)
- ❌ Spirit of policy was followed (vs. letter)

**Trust assumptions:**
- Lab's policy is actually protective (not just cosmetic)
- Lab's self-assessment is honest
- Checklist items capture what matters

**Risk:** "Checkbox governance" - technically compliant but unsafe in practice.

**Mitigation:**
- Minimum policy standards set by regulators
- Auditor review of policy adequacy
- Incident reports trigger policy reviews

---

### 3.3 Data Provenance

**The claim:** "Our training data came from approved sources"

**What ZK CAN verify:**
- ✅ Data hash matches approved dataset
- ✅ Data source is on allowlist
- ✅ Data lineage chain is intact (if cryptographically signed)

**What ZK CANNOT verify:**
- ❌ Data quality or accuracy
- ❌ Data wasn't poisoned or manipulated
- ❌ Approved source is itself trustworthy
- ❌ Synthetic or adversarial data wasn't added

**Trust assumptions:**
- Data sources maintain integrity
- Hashing captures relevant properties
- Allowlist construction is sound

**Risk:** "Provenance washing" - data technically from approved source but contaminated.

**Mitigation:**
- Audits of data pipelines
- Sampling verification
- Anomaly detection on training dynamics

---

## Part 4: Implications for AI Governance

### 4.1 Where to Use ZK Proofs

ZK proofs are **best suited** for:

1. **Quantitative thresholds** (compute, parameters, data size)
2. **Process completion** (evaluations run, audits done, reports filed)
3. **Allowlist/blocklist enforcement** (approved models, accredited evaluators)
4. **Multi-party verification** (international agreements without trust)

**Use cases:**
- EU AI Act GPAI reporting (compute thresholds)
- Export control verification (chip quantities, model sizes)
- Lab commitment tracking (promised actions taken)
- International AI Safety Institute coordination

---

### 4.2 Where ZK Proofs Are Insufficient

ZK proofs **must be complemented** by:

1. **Hardware attestation** (TEEs, on-chip governance) → Address completeness problem
2. **Third-party audits** (human judgment) → Address quality problem
3. **Capability evaluations** (live testing) → Address safety property problem
4. **Continuous monitoring** (post-deployment) → Address future behavior problem
5. **Whistleblower mechanisms** (insider reporting) → Address intent problem

**Architecture recommendation:**
```
┌─────────────────────────────────────────────────────┐
│         Defense-in-Depth Governance Stack           │
├─────────────────────────────────────────────────────┤
│  Layer 1: ZK Proofs (quantitative + completion)     │
│  Layer 2: Hardware Attestation (completeness)       │
│  Layer 3: Third-Party Audits (quality + safety)     │
│  Layer 4: Continuous Monitoring (behavior)          │
│  Layer 5: Legal + Cultural (intent + compliance)    │
└─────────────────────────────────────────────────────┘
```

No single layer is sufficient. All five are needed.

---

### 4.3 Risk of Over-Reliance on ZK Proofs

**Danger:** Policymakers might believe ZK proofs provide stronger guarantees than they actually do.

**Failure scenarios:**

1. **False sense of security**: "Lab submitted valid ZK proof, so model must be safe"
   - Reality: Proof only verified compute was below threshold, not that model is safe

2. **Checkbox governance**: "Lab proved all RSP items complete, compliance achieved"
   - Reality: Items were done perfunctorily, policy was weak

3. **Gaming and evasion**: "All training runs have valid proofs"
   - Reality: Lab hid non-compliant runs, only reported compliant ones

4. **Complexity shield**: "Verification uses advanced cryptography, must be rigorous"
   - Reality: Garbage in → cryptographically verified garbage out

**Mitigation:**
- Clear public communication about what ZK does/doesn't verify
- Training for regulators on ZK limitations
- Mandatory complementary mechanisms in regulations
- Red teams to find evasion strategies

---

### 4.4 Recommendations for Policymakers

1. **Use ZK for quantitative thresholds**: Best fit for compute limits, parameter counts, etc.

2. **Require hardware attestation**: Don't rely solely on self-reported ZK proofs. Mandate chip-level reporting.

3. **Combine with audits**: ZK proves processes happened; audits verify they were done well.

4. **Test capabilities directly**: Don't substitute benchmark score proofs for actual safety testing.

5. **Monitor continuously**: Point-in-time proofs don't guarantee ongoing compliance.

6. **Design for evasion**: Assume labs will find loopholes. Red team your governance systems.

7. **Build institutional capacity**: Regulators need cryptography expertise to verify ZK systems themselves.

8. **International coordination**: ZK's main value is enabling verification between parties without full trust. Leverage this for treaties.

---

## Part 5: Research Gaps and Future Work

### Open Questions

1. **Recursive SNARKs for aggregation**: Can we truly compose proofs into single cryptographic objects (not just bundles)?

2. **Verifiable computation over models**: Can we prove properties of neural network inference in ZK?

3. **Privacy-preserving capability evals**: Can evaluators test models without seeing weights, and prove results in ZK?

4. **Continuous verification**: How to extend point-in-time proofs to ongoing compliance monitoring?

5. **Adversarial robustness**: How to prevent labs from gaming ZK verification systems?

6. **Standardization**: Which governance claims should have standardized circuits?

7. **Hardware integration**: How to combine ZK proofs with TEE attestation for stronger guarantees?

---

## Conclusion

Zero-knowledge proofs are a **powerful tool** for privacy-preserving AI governance, but they are **not a complete solution**. They excel at verifying quantitative thresholds and process completion, but cannot verify safety properties, intent, quality, or completeness.

**The Path Forward:**

- ✅ **DO use ZK** for compute thresholds, process verification, and international coordination
- ⚠️ **DON'T over-rely** on ZK as the sole governance mechanism
- 🔧 **DO combine** ZK with hardware attestation, audits, monitoring, and legal frameworks
- 🎯 **DO invest** in research to expand what ZK can verify while being honest about limitations

**Ultimate goal:** A governance stack where ZK proofs provide efficient, privacy-preserving verification of objective claims, complemented by other mechanisms that address the gaps ZK cannot fill.

---

**References:**
- EU AI Act and Code of Practice (2024-2025)
- METR Common Elements of Frontier AI Safety Policies
- CNAS Technology to Secure the AI Chip Supply Chain
- FlexHEG Report (FLI, 2025)
- International AI Safety Report (2025)
- ZK-SNARK academic literature (Groth16, PLONK, etc.)
