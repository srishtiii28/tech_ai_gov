pragma circom 2.1.0;

/*
 * Evaluation Attestation Circuit
 *
 * Proves that all required safety evaluations were completed
 * without revealing the actual evaluation results or scores.
 *
 * Use case: Lab proves they ran all required safety evals (CBRN, cyber, persuasion)
 * without revealing the scores (which might indicate vulnerabilities).
 *
 * Inputs:
 *   - evaluationFlags[N]: Binary flags indicating completion (private)
 *   - requiredCount: Number of evaluations required (public)
 *
 * Output:
 *   - valid: 1 if all required evaluations completed
 */

template EvaluationAttestation(N) {
    // Private inputs: completion flags for each evaluation
    signal input evaluationFlags[N];

    // Public input: number of evaluations required
    signal input requiredCount;

    // Output: validity flag
    signal output valid;

    // Ensure all flags are binary (0 or 1)
    for (var i = 0; i < N; i++) {
        evaluationFlags[i] * (evaluationFlags[i] - 1) === 0;
    }

    // Sum up completed evaluations
    signal completedSum[N];
    completedSum[0] <== evaluationFlags[0];

    for (var i = 1; i < N; i++) {
        completedSum[i] <== completedSum[i-1] + evaluationFlags[i];
    }

    // Check if completed count >= required count
    component checkComplete = GreaterEqThan(8);
    checkComplete.in[0] <== completedSum[N-1];
    checkComplete.in[1] <== requiredCount;

    valid <== checkComplete.out;

    // Constrain that valid must be 1
    valid === 1;
}

/*
 * Helper template: GreaterEqThan
 * Checks if in[0] >= in[1]
 */
template GreaterEqThan(n) {
    signal input in[2];
    signal output out;

    component lt = LessThan(n);
    lt.in[0] <== in[0];
    lt.in[1] <== in[1];

    out <== 1 - lt.out;
}

/*
 * Helper template: LessThan
 * Checks if in[0] < in[1]
 */
template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;

    component n2b = Num2Bits(n+1);

    n2b.in <== in[0] + (1<<n) - in[1];

    out <== 1 - n2b.out[n];
}

/*
 * Helper template: Num2Bits
 * Converts a number to its binary representation
 */
template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1 = 0;

    var e2 = 1;
    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] - 1) === 0;
        lc1 += out[i] * e2;
        e2 = e2 + e2;
    }

    lc1 === in;
}

// Main component - checking 5 evaluation types
component main {public [requiredCount]} = EvaluationAttestation(5);
