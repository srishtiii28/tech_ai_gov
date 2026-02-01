#!/usr/bin/env node

/**
 * Proof Generation Script
 *
 * Generates zero-knowledge proofs for AI governance compliance claims.
 * This script demonstrates how AI labs would generate proofs to submit to regulators.
 */

import { groth16 } from 'snarkjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

/**
 * Generate a proof for the Compute Threshold circuit
 */
async function generateComputeThresholdProof(privateCompute, threshold) {
    console.log('\n🔐 Generating Compute Threshold Proof...');
    console.log(`   Private: Actual compute = ${privateCompute} FLOPs`);
    console.log(`   Public: Threshold = ${threshold} FLOPs`);

    const circuitName = 'compute_threshold';
    const input = {
        privateCompute: privateCompute.toString(),
        threshold: threshold.toString()
    };

    return await generateProof(circuitName, input);
}

/**
 * Generate a proof for the Evaluation Attestation circuit
 */
async function generateEvaluationProof(evaluationFlags, requiredCount) {
    console.log('\n🔐 Generating Evaluation Attestation Proof...');
    console.log(`   Private: Evaluation completion flags = [${evaluationFlags.join(', ')}]`);
    console.log(`   Public: Required evaluations = ${requiredCount}`);

    const circuitName = 'evaluation_attestation';
    const input = {
        evaluationFlags: evaluationFlags.map(f => f.toString()),
        requiredCount: requiredCount.toString()
    };

    return await generateProof(circuitName, input);
}

/**
 * Generate a proof for the Policy Compliance circuit
 */
async function generatePolicyComplianceProof(policyItems, minRequired) {
    console.log('\n🔐 Generating Policy Compliance Proof...');
    console.log(`   Private: Policy items = [${policyItems.join(', ')}]`);
    console.log(`   Public: Minimum required = ${minRequired}`);

    const circuitName = 'policy_compliance';
    const input = {
        policyItems: policyItems.map(p => p.toString()),
        minRequired: minRequired.toString()
    };

    return await generateProof(circuitName, input);
}

/**
 * Generic proof generation function
 */
async function generateProof(circuitName, input) {
    const buildDir = path.join(projectRoot, 'build', circuitName);
    const wasmPath = path.join(buildDir, `${circuitName}_js`, `${circuitName}.wasm`);
    const zkeyPath = path.join(buildDir, `${circuitName}_final.zkey`);

    console.log(`   ⏳ Computing witness...`);
    const { proof, publicSignals } = await groth16.fullProve(input, wasmPath, zkeyPath);

    console.log(`   ✅ Proof generated!`);
    console.log(`   📊 Public signals: ${JSON.stringify(publicSignals)}`);

    // Save proof to file
    const proofPath = path.join(projectRoot, 'data', `${circuitName}_proof.json`);
    const publicPath = path.join(projectRoot, 'data', `${circuitName}_public.json`);

    // Create data directory if it doesn't exist
    const dataDir = path.join(projectRoot, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));
    fs.writeFileSync(publicPath, JSON.stringify(publicSignals, null, 2));

    console.log(`   💾 Saved to: ${proofPath}`);

    return { proof, publicSignals };
}

// Main execution
async function main() {
    console.log('\n🚀 ZK-GovProof: Proof Generation Demo\n');
    console.log('═'.repeat(60));

    // Example 1: Compute Threshold
    // Lab trained a model using 5e24 FLOPs (below EU threshold of 1e25)
    await generateComputeThresholdProof(
        5000000000000000000000000n, // 5e24 FLOPs (private)
        10000000000000000000000000n  // 1e25 FLOPs (public threshold)
    );

    // Example 2: Evaluation Attestation
    // Lab completed 5 out of 5 required safety evaluations
    // [CBRN, Cyber, Persuasion, Autonomy, Deception] all completed (1)
    await generateEvaluationProof(
        [1, 1, 1, 1, 1], // All evaluations completed (private)
        5                 // Required: 5 evaluations (public)
    );

    // Example 3: Policy Compliance
    // Lab completed 8 out of 8 RSP requirements
    // [Red teaming, External audit, Incident reporting, Capability eval,
    //  Security measures, Documentation, Deployment safety, Monitoring]
    await generatePolicyComplianceProof(
        [1, 1, 1, 1, 1, 1, 1, 1], // All items completed (private)
        8                          // Minimum required: 8 (public)
    );

    console.log('\n═'.repeat(60));
    console.log('✅ All proofs generated successfully!\n');
    console.log('📁 Proofs saved to: ./data/');
    console.log('\nNext step: Run `npm run verify:proof` to verify these proofs\n');
}

main().catch(error => {
    console.error('❌ Error generating proofs:', error);
    process.exit(1);
});
