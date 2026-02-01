pragma circom 2.1.0;

/*
 * Policy Compliance Circuit
 *
 * Proves that all items in a Responsible Scaling Policy (RSP) checklist
 * were completed without revealing specific implementation details.
 *
 * Use case: Lab proves they followed their RSP commitments
 * (red teaming, external audits, incident reporting, capability thresholds)
 * without revealing internal processes or findings.
 *
 * Inputs:
 *   - policyItems[N]: Binary flags for each policy requirement (private)
 *   - minRequired: Minimum items required for compliance (public)
 *
 * Output:
 *   - valid: 1 if compliance requirements met
 */

template PolicyCompliance(N) {
    // Private inputs: completion status for each policy item
    signal input policyItems[N];

    // Public input: minimum items required
    signal input minRequired;

    // Output: validity flag
    signal output valid;

    // Ensure all items are binary (0 or 1)
    for (var i = 0; i < N; i++) {
        policyItems[i] * (policyItems[i] - 1) === 0;
    }

    // Count completed items
    signal itemSum[N];
    itemSum[0] <== policyItems[0];

    for (var i = 1; i < N; i++) {
        itemSum[i] <== itemSum[i-1] + policyItems[i];
    }

    // Check if completed count >= minimum required
    component checkCompliance = GreaterEqThan(8);
    checkCompliance.in[0] <== itemSum[N-1];
    checkCompliance.in[1] <== minRequired;

    valid <== checkCompliance.out;

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

// Main component - checking 8 policy items (common RSP size)
component main {public [minRequired]} = PolicyCompliance(8);
