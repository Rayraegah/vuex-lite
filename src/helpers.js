function normalizeMap(map) {
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }));
}

export const createMapState = _store => states => {
  const res = {};
  for (const { key, val } of normalizeMap(states)) {
    res[key] = function() {
      const store = _store || this.$store;
      return typeof val === "function"
        ? val.call(this, store.state)
        : store.state[val];
    };
  }
  return res;
};

export const mapToMethods = (sourceName, runnerName, _store) => map => {
  const res = {};
  for (const { key, val } of normalizeMap(map)) {
    res[key] = function(payload) {
      const store = _store || this.$store;
      const source = store[sourceName];
      const runner = store[runnerName];
      const actualSource =
        typeof val === "function" ? val.call(this, source) : val;
      return runner.call(store, actualSource, payload);
    };
  }
  return res;
};
