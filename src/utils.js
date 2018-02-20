export const IS_PROD = !!process.env.NODE_ENV === "production";

export function assert(condition, msg) {
  if (!condition) throw new Error(`[vuex] ${msg}`);
}

export function isObject(obj) {
  return obj !== null && typeof obj === "object";
}

export function unifyObjectStyle(type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }

  if (!IS_PROD) {
    assert(
      typeof type === "string",
      `Expects string as the type, but found ${typeof type}.`
    );
  }

  return { type, payload, options };
}

export function normalizeMap(map) {
  return Array.isArray(map)
    ? map.map(k => ({ k, v: k }))
    : Object.keys(map).map(k => ({ k, v: map[k] }));
}
