const SHOULD_THROW = process.env.NODE_ENV !== "production";

export function assert(condition, msg) {
  if (!condition && SHOULD_THROW) throw new Error(`[vuex] ${msg}`);
}

export function isObject(obj) {
  return obj !== null && typeof obj === "object";
}
