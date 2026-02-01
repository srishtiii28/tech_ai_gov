#!/usr/bin/env node

/**
 * Circuit Compilation Script
 *
 * Compiles all ZK circuits and generates necessary files for proof generation:
 * 1. Compile .circom files to R1CS format
 * 2. Generate witness calculator (WASM)
 * 3. Perform trusted setup (generates proving and verification keys)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Circuits to compile
const circuits = [
    'compute_threshold',
    'evaluation_attestation',
    'policy_compliance'
];

const CIRCOM_PATH = path.join(projectRoot, 'bin', 'circom');

console.log('🔧 Starting circuit compilation...\n');

// Create build directory
const buildDir = path.join(projectRoot, 'build');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

for (const circuit of circuits) {
    console.log(`\n📦 Compiling ${circuit}...`);

    const circuitPath = path.join(projectRoot, 'circuits', `${circuit}.circom`);
    const outputDir = path.join(buildDir, circuit);

    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
        // Step 1: Compile circuit to R1CS and WASM
        console.log(`  ⚙️  Compiling to R1CS and WASM...`);
        execSync(
            `${CIRCOM_PATH} ${circuitPath} --r1cs --wasm --sym -o ${outputDir}`,
            { stdio: 'inherit' }
        );

        // Step 2: Generate witness calculator info
        console.log(`  ✅ Circuit compiled successfully`);

        // Step 3: Powers of Tau (trusted setup ceremony - using a small power for demo)
        console.log(`  🔐 Running trusted setup...`);
        const ptauPath = path.join(buildDir, 'pot12_final.ptau');

        // Download or generate powers of tau file if it doesn't exist
        if (!fs.existsSync(ptauPath)) {
            console.log(`  📥 Generating powers of tau (this may take a moment)...`);
            execSync(
                `npx snarkjs powersoftau new bn128 12 ${path.join(buildDir, 'pot12_0000.ptau')} -v`,
                { stdio: 'inherit', cwd: projectRoot }
            );
            execSync(
                `npx snarkjs powersoftau contribute ${path.join(buildDir, 'pot12_0000.ptau')} ${ptauPath} --name="First contribution" -v -e="random entropy"`,
                { stdio: 'inherit', cwd: projectRoot }
            );
            execSync(
                `npx snarkjs powersoftau prepare phase2 ${ptauPath} ${path.join(buildDir, 'pot12_final.ptau')} -v`,
                { stdio: 'inherit', cwd: projectRoot }
            );
            // Clean up intermediate file
            fs.unlinkSync(path.join(buildDir, 'pot12_0000.ptau'));
        }

        // Step 4: Setup proving and verification keys (Groth16)
        console.log(`  🔑 Generating proving and verification keys...`);
        const r1csPath = path.join(outputDir, `${circuit}.r1cs`);
        const zkeyPath = path.join(outputDir, `${circuit}_0000.zkey`);
        const finalZkeyPath = path.join(outputDir, `${circuit}_final.zkey`);
        const vkeyPath = path.join(outputDir, `verification_key.json`);

        execSync(
            `npx snarkjs groth16 setup ${r1csPath} ${ptauPath} ${zkeyPath}`,
            { stdio: 'inherit', cwd: projectRoot }
        );

        execSync(
            `npx snarkjs zkey contribute ${zkeyPath} ${finalZkeyPath} --name="Second contribution" -v -e="more entropy"`,
            { stdio: 'inherit', cwd: projectRoot }
        );

        execSync(
            `npx snarkjs zkey export verificationkey ${finalZkeyPath} ${vkeyPath}`,
            { stdio: 'inherit', cwd: projectRoot }
        );

        // Clean up intermediate zkey
        fs.unlinkSync(zkeyPath);

        console.log(`  ✅ ${circuit} setup complete!`);

    } catch (error) {
        console.error(`  ❌ Error compiling ${circuit}:`, error.message);
        process.exit(1);
    }
}

console.log('\n✅ All circuits compiled successfully!\n');
console.log('Generated files:');
circuits.forEach(circuit => {
    console.log(`  - build/${circuit}/${circuit}.r1cs`);
    console.log(`  - build/${circuit}/${circuit}_js/`);
    console.log(`  - build/${circuit}/${circuit}_final.zkey`);
    console.log(`  - build/${circuit}/verification_key.json`);
});
console.log('');
