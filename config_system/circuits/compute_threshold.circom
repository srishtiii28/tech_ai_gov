pragma circom 2.1.0;

/*
 * Compute Threshold Circuit
 *
 * Proves that a private compute value is below a public threshold
 * without revealing the exact compute amount.
 *
 * Use case: Lab proves training used < 10^25 FLOPs (EU AI Act threshold)
 * without revealing exact compute (competitive advantage).
 *
 * Inputs:
 *   - privateCompute: The actual compute used (private)
 *   - threshold: The maximum allowed compute (public)
 *
 * Output:
 *   - valid: 1 if privateCompute < threshold, constraint fails otherwise
 */

template ComputeThreshold() {
    // Private input: actual compute used
    signal input privateCompute;

    // Public input: threshold value
    signal input threshold;

    // Output: validity flag (1 if valid)
    signal output valid;

    // Intermediate signal for the difference
    signal difference;

    // Check that privateCompute < threshold
    // We compute threshold - privateCompute and ensure it's positive
    difference <== threshold - privateCompute;

    // Ensure difference is non-negative (this constrains privateCompute < threshold)
    // We use a range check to ensure the difference is positive
    component rangeCheck = LessThan(252);
    rangeCheck.in[0] <== privateCompute;
    rangeCheck.in[1] <== threshold;

    // Output is 1 if the check passes
    valid <== rangeCheck.out;

    // Constrain that valid must be 1
    valid === 1;
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

// Main component
component main {public [threshold]} = ComputeThreshold();
