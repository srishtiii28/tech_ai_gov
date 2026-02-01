#!/usr/bin/env node

/**
 * End-to-end demo runner (paper companion).
 *
 * Runs:
 *  1) Proof generation for compliant inputs
 *  2) Proof verification (regulator workflow)
 *  3) Negative test: attempt to generate a proof for a NON-compliant claim
 *     (expected to fail at witness generation because the circuit constrains valid === 1)
 */

import { groth16 } from 'snarkjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

function ensureDataDir() {
  const dataDir = path.join(projectRoot, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  return dataDir;
}

async function fullProveAndPersist(circuitName, input) {
  const buildDir = path.join(projectRoot, 'build', circuitName);
  const wasmPath = path.join(buildDir, `${circuitName}_js`, `${circuitName}.wasm`);
  const zkeyPath = path.join(buildDir, `${circuitName}_final.zkey`);

  const { proof, publicSignals } = await groth16.fullProve(input, wasmPath, zkeyPath);

  ensureDataDir();
  fs.writeFileSync(
    path.join(projectRoot, 'data', `${circuitName}_proof.json`),
    JSON.stringify(proof, null, 2)
  );
  fs.writeFileSync(
    path.join(projectRoot, 'data', `${circuitName}_public.json`),
    JSON.stringify(publicSignals, null, 2)
  );

  return { proof, publicSignals };
}

async function verify(circuitName, proof, publicSignals) {
  const vkeyPath = path.join(projectRoot, 'build', circuitName, 'verification_key.json');
  const vKey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));
  return await groth16.verify(vKey, publicSignals, proof);
}

async function main() {
  console.log('\n🧪 ZK-GovProof: End-to-End Demo\n');
  console.log('This demo shows that:');
  console.log('  (a) compliant claims verify, and');
  console.log('  (b) non-compliant claims cannot produce a proof.\n');

  // 1) Positive path: generate proofs for compliant inputs
  console.log('1) Generating proofs for compliant inputs...\n');

  const compute = await fullProveAndPersist('compute_threshold', {
    privateCompute: '5000000000000000000000000', // 5e24
    threshold: '10000000000000000000000000', // 1e25
  });

  const evals = await fullProveAndPersist('evaluation_attestation', {
    evaluationFlags: ['1', '1', '1', '1', '1'],
    requiredCount: '5',
  });

  const policy = await fullProveAndPersist('policy_compliance', {
    policyItems: ['1', '1', '1', '1', '1', '1', '1', '1'],
    minRequired: '8',
  });

  // 2) Positive path: verify proofs (regulator workflow)
  console.log('2) Verifying proofs...\n');
  const computeOk = await verify('compute_threshold', compute.proof, compute.publicSignals);
  const evalsOk = await verify('evaluation_attestation', evals.proof, evals.publicSignals);
  const policyOk = await verify('policy_compliance', policy.proof, policy.publicSignals);

  console.log(`   ${computeOk ? '✅' : '❌'} compute_threshold verified`);
  console.log(`   ${evalsOk ? '✅' : '❌'} evaluation_attestation verified`);
  console.log(`   ${policyOk ? '✅' : '❌'} policy_compliance verified\n`);

  // 3) Negative path: try to generate a proof for a false claim.
  console.log('3) Negative test: attempt to prove a NON-compliant claim...\n');
  console.log('   Claim: privateCompute < threshold');
  console.log('   Input: privateCompute = 2e25, threshold = 1e25 (should FAIL)\n');

  try {
    await fullProveAndPersist('compute_threshold', {
      privateCompute: '20000000000000000000000000', // 2e25 (non-compliant)
      threshold: '10000000000000000000000000', // 1e25
    });
    console.log('   ❌ Unexpected: proof generation succeeded for a false claim.');
    process.exitCode = 1;
  } catch (err) {
    console.log('   ✅ Expected: proof generation failed for a false claim.');
    console.log(`   (error: ${String(err?.message ?? err)})\n`);
  }

  console.log('Done.');
  console.log('\nArtifacts written to `data/` for inspection.\n');
}

main().catch((err) => {
  console.error('❌ Demo failed:', err);
  process.exit(1);
});

