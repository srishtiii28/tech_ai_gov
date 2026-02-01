#!/usr/bin/env node

/**
 * Proof Verification Script
 *
 * Verifies zero-knowledge proofs submitted by AI labs.
 * This script demonstrates how regulators would verify compliance proofs
 * without seeing private information.
 */

import { groth16 } from 'snarkjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

/**
 * Verify a proof for a given circuit
 */
async function verifyProof(circuitName) {
    console.log(`\n🔍 Verifying ${circuitName} proof...`);

    const vkeyPath = path.join(projectRoot, 'build', circuitName, 'verification_key.json');
    const proofPath = path.join(projectRoot, 'data', `${circuitName}_proof.json`);
    const publicPath = path.join(projectRoot, 'data', `${circuitName}_public.json`);

    // Load verification key
    const vKey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));

    // Load proof and public signals
    const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
    const publicSignals = JSON.parse(fs.readFileSync(publicPath, 'utf8'));

    console.log(`   📊 Public inputs: ${JSON.stringify(publicSignals)}`);
    console.log(`   ⏳ Verifying...`);

    // Verify the proof
    const isValid = await groth16.verify(vKey, publicSignals, proof);

    if (isValid) {
        console.log(`   ✅ PROOF VALID - Compliance verified!`);
        return true;
    } else {
        console.log(`   ❌ PROOF INVALID - Compliance NOT verified!`);
        return false;
    }
}

/**
 * Interpret verification results with context
 */
function interpretResults(results) {
    console.log('\n═'.repeat(60));
    console.log('📋 VERIFICATION SUMMARY\n');

    const labels = {
        'compute_threshold': 'Compute Threshold',
        'evaluation_attestation': 'Safety Evaluations',
        'policy_compliance': 'Policy Compliance'
    };

    const interpretations = {
        'compute_threshold': 'Training compute was below the regulatory threshold',
        'evaluation_attestation': 'All required safety evaluations were completed',
        'policy_compliance': 'Responsible Scaling Policy requirements were met'
    };

    for (const [circuit, isValid] of Object.entries(results)) {
        const status = isValid ? '✅ VERIFIED' : '❌ FAILED';
        const label = labels[circuit];
        const interpretation = interpretations[circuit];

        console.log(`${status} - ${label}`);
        if (isValid) {
            console.log(`         ${interpretation}`);
        } else {
            console.log(`         Could not verify compliance`);
        }
        console.log('');
    }

    console.log('═'.repeat(60));

    const allValid = Object.values(results).every(v => v);
    if (allValid) {
        console.log('\n🎉 ALL COMPLIANCE REQUIREMENTS VERIFIED');
        console.log('\nThe AI lab has cryptographically proven compliance with:');
        console.log('  • EU AI Act compute thresholds');
        console.log('  • Required safety evaluation protocols');
        console.log('  • Responsible Scaling Policy commitments');
        console.log('\n✨ WITHOUT revealing any sensitive information about:');
        console.log('  • Exact compute usage');
        console.log('  • Evaluation scores or methodologies');
        console.log('  • Internal processes or implementation details\n');
    } else {
        console.log('\n⚠️  COMPLIANCE VERIFICATION INCOMPLETE');
        console.log('Some requirements could not be verified.\n');
    }
}

// Main execution
async function main() {
    console.log('\n🔐 ZK-GovProof: Proof Verification Demo\n');
    console.log('═'.repeat(60));
    console.log('\n👤 Role: Regulator/Auditor');
    console.log('🎯 Goal: Verify AI lab compliance without accessing private data\n');

    const circuits = [
        'compute_threshold',
        'evaluation_attestation',
        'policy_compliance'
    ];

    const results = {};

    for (const circuit of circuits) {
        try {
            results[circuit] = await verifyProof(circuit);
        } catch (error) {
            console.error(`   ❌ Error verifying ${circuit}:`, error.message);
            results[circuit] = false;
        }
    }

    interpretResults(results);
}

main().catch(error => {
    console.error('❌ Error during verification:', error);
    process.exit(1);
});
