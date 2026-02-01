#!/usr/bin/env node

/**
 * Policy-pack runner:
 * - Loads a "policy pack" JSON (requirements + labels + public thresholds)
 * - Generates proofs using the existing circuits
 * - Writes a human-readable report describing what was proven
 *
 * This is the bridge between a real-world compliance framework (text)
 * and the machine-checkable predicate that ZK can prove.
 *
 * Usage:
 *   node scripts/run-policy-pack.js policies/policy_pack_example.json
 */

import { groth16 } from 'snarkjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

function die(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function prove(circuitName, input) {
  const buildDir = path.join(projectRoot, 'build', circuitName);
  const wasmPath = path.join(buildDir, `${circuitName}_js`, `${circuitName}.wasm`);
  const zkeyPath = path.join(buildDir, `${circuitName}_final.zkey`);
  return await groth16.fullProve(input, wasmPath, zkeyPath);
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function main() {
  const arg = process.argv[2];
  if (!arg) die('Provide a policy pack path, e.g. `policies/policy_pack_example.json`.');

  const packPath = path.isAbsolute(arg) ? arg : path.join(projectRoot, arg);
  if (!fs.existsSync(packPath)) die(`Policy pack not found: ${packPath}`);

  const pack = readJson(packPath);
  const stamp = nowStamp();

  const outDir = path.join(projectRoot, 'data', 'policy_packs', `${pack.id}_${stamp}`);
  ensureDir(outDir);

  // Inputs: either from pack.example_private_inputs (demo) or env override later.
  const example = pack.example_private_inputs ?? {};

  // 1) compute_threshold
  const computeInput = {
    privateCompute: String(example.private_compute_flops),
    threshold: String(pack.compute_threshold.public_threshold_flops),
  };
  const computeRes = await prove('compute_threshold', computeInput);

  // 2) evaluation_attestation (N=5 fixed by circuit main)
  const evalFlags = example.evaluation_flags ?? [];
  const evalInput = {
    evaluationFlags: evalFlags.map(String),
    requiredCount: String(pack.required_evaluations.required_count_public),
  };
  const evalRes = await prove('evaluation_attestation', evalInput);

  // 3) policy_compliance (N=8 fixed by circuit main)
  const policyFlags = example.policy_flags ?? [];
  const policyInput = {
    policyItems: policyFlags.map(String),
    minRequired: String(pack.policy_checklist.min_required_public),
  };
  const policyRes = await prove('policy_compliance', policyInput);

  // Persist artifacts (proofs + public signals)
  const artifacts = {
    policy_pack: {
      id: pack.id,
      title: pack.title,
      frameworks: pack.frameworks,
      source_note: pack.source_note,
      input_pack_path: path.relative(projectRoot, packPath),
    },
    generated_at: new Date().toISOString(),
    proofs: {
      compute_threshold: {
        proof: computeRes.proof,
        publicSignals: computeRes.publicSignals,
        claim: `privateCompute < threshold (${pack.compute_threshold.public_threshold_flops})`,
      },
      evaluation_attestation: {
        proof: evalRes.proof,
        publicSignals: evalRes.publicSignals,
        claim: `sum(evaluationFlags) >= requiredCount (${pack.required_evaluations.required_count_public})`,
      },
      policy_compliance: {
        proof: policyRes.proof,
        publicSignals: policyRes.publicSignals,
        claim: `sum(policyItems) >= minRequired (${pack.policy_checklist.min_required_public})`,
      },
    },
  };

  fs.writeFileSync(path.join(outDir, 'artifacts.json'), JSON.stringify(artifacts, null, 2));

  // Human-readable report
  const reportLines = [];
  reportLines.push(`# ZK-GovProof Policy Pack Run`);
  reportLines.push(``);
  reportLines.push(`- Pack: **${pack.title}** (\`${pack.id}\`)`);
  reportLines.push(`- Generated at: \`${artifacts.generated_at}\``);
  reportLines.push(`- Source note: ${pack.source_note}`);
  reportLines.push(``);
  reportLines.push(`## What was proven (cryptographically)`);
  reportLines.push(``);
  reportLines.push(`### 1) Compute threshold`);
  reportLines.push(`- Claim: ${artifacts.proofs.compute_threshold.claim}`);
  reportLines.push(`- Public signals: \`${JSON.stringify(computeRes.publicSignals)}\``);
  reportLines.push(``);
  reportLines.push(`### 2) Evaluation completion`);
  reportLines.push(`- Claim: ${artifacts.proofs.evaluation_attestation.claim}`);
  reportLines.push(`- Evaluation list (human-readable):`);
  for (const name of pack.required_evaluations.evaluation_names ?? []) {
    reportLines.push(`  - ${name}`);
  }
  reportLines.push(`- Public signals: \`${JSON.stringify(evalRes.publicSignals)}\``);
  reportLines.push(``);
  reportLines.push(`### 3) Policy checklist completion`);
  reportLines.push(`- Claim: ${artifacts.proofs.policy_compliance.claim}`);
  reportLines.push(`- Checklist items (human-readable):`);
  for (const item of pack.policy_checklist.items ?? []) {
    reportLines.push(`  - ${item}`);
  }
  reportLines.push(`- Public signals: \`${JSON.stringify(policyRes.publicSignals)}\``);
  reportLines.push(``);
  reportLines.push(`## Important caveat`);
  reportLines.push(
    `This run demonstrates ZK verification of an explicit predicate over structured inputs. It does **not** prove that the private inputs are truthful measurements of reality or that no other unreported runs exist.`
  );

  fs.writeFileSync(path.join(outDir, 'report.md'), reportLines.join('\n') + '\n');

  console.log(`✅ Policy pack executed.`);
  console.log(`📦 Wrote: ${path.relative(projectRoot, outDir)}/artifacts.json`);
  console.log(`📝 Wrote: ${path.relative(projectRoot, outDir)}/report.md`);
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});

