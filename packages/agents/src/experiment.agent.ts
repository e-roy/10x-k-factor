import type { ExperimentInput, ExperimentOutput } from "./types";
import { experimentInputSchema } from "./types";
import { createHash } from "crypto";

/**
 * Hash-based variant assignment for consistent user bucketing
 * Uses SHA-256 hash of user_id + experiment_name for deterministic assignment
 */
function hashToBucket(
  userId: string,
  experimentName: string,
  numBuckets: number
): number {
  const hashInput = `${userId}:${experimentName}`;
  const hash = createHash("sha256").update(hashInput).digest("hex");
  // Convert first 8 hex chars to integer and mod by numBuckets
  const hashInt = parseInt(hash.substring(0, 8), 16);
  return hashInt % numBuckets;
}

/**
 * Assign user to experiment variant using hash-based bucketing
 * Ensures consistent assignment per user (same user always gets same variant)
 */
export function assignExperiment(
  input: ExperimentInput
): ExperimentOutput {
  // Validate input
  const validated = experimentInputSchema.parse(input);

  const { user_id, experiment_name, experiment_config } = validated;

  // Get variants and traffic splits
  const variants = experiment_config.variants;
  const trafficSplits = experiment_config.traffic_splits;

  // Calculate traffic splits (default to equal if not provided)
  let splits: number[];
  if (trafficSplits && trafficSplits.length === variants.length) {
    // Validate splits sum to ~1.0 (allow small floating point errors)
    const sum = trafficSplits.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.01) {
      throw new Error(
        `Traffic splits must sum to 1.0, got ${sum}. Please adjust splits.`
      );
    }
    splits = trafficSplits;
  } else {
    // Equal splits
    splits = new Array(variants.length).fill(1.0 / variants.length);
  }

  // Calculate bucket boundaries
  const bucketBoundaries: number[] = [];
  let cumulative = 0;
  for (const split of splits) {
    cumulative += split;
    bucketBoundaries.push(cumulative);
  }

  // Assign user to bucket (0-9999 for precision)
  const numBuckets = 10000;
  const bucket = hashToBucket(user_id, experiment_name, numBuckets);
  const normalizedBucket = bucket / numBuckets;

  // Find which variant this bucket falls into
  let selectedVariant = variants[0]; // Default to first variant
  for (let i = 0; i < bucketBoundaries.length; i++) {
    if (normalizedBucket < bucketBoundaries[i]) {
      selectedVariant = variants[i];
      break;
    }
  }

  // Generate exposure_id (deterministic but unique per user+experiment)
  const exposureHash = createHash("sha256")
    .update(`${user_id}:${experiment_name}:${selectedVariant}`)
    .digest("hex")
    .substring(0, 16);
  const exposure_id = `exp_${exposureHash}`;

  // Build rationale
  const rationale = `Assigned user ${user_id.substring(0, 8)}... to variant ${selectedVariant} in experiment ${experiment_name} using hash-based bucketing (bucket ${bucket}/${numBuckets}, normalized ${normalizedBucket.toFixed(4)}).`;

  // Features used for auditing
  const featuresUsed = [
    `user_id:${user_id.substring(0, 8)}...`,
    `experiment:${experiment_name}`,
    `variant:${selectedVariant}`,
    `bucket:${bucket}`,
    `method:hash_based`,
  ];

  return {
    variant: selectedVariant,
    exposure_id,
    rationale,
    features_used: featuresUsed,
    ttl_ms: 3600000, // 1 hour cache TTL (experiment assignments are stable)
  };
}

