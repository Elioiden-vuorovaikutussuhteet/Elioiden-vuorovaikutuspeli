/* Recursively merges a source object over a target object without losing unpassed nested properties. */
function isPlainObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === "object" && !Array.isArray(item);
}

export function deepMerge<T>(target: T, source: unknown): T {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return (source !== undefined ? source : target) as T;
  }

  const output: Record<string, unknown> = { ...target };

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = output[key];

    if (isPlainObject(targetVal) && isPlainObject(sourceVal)) {
      output[key] = deepMerge(targetVal, sourceVal);
    } else if (sourceVal !== undefined) {
      output[key] = sourceVal;
    }
  }

  return output as T;
}
