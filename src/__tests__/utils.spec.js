import { assert, isObject } from "../utils";

describe("Utils", () => {
  test("isObject", () => {
    expect(isObject(1)).toBe(false);
    expect(isObject("String")).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject({})).toBe(true);
    expect(isObject(null)).toBe(false);
    expect(isObject([])).toBe(true);
    expect(isObject(new Function())).toBe(false);
  });

  test("assert", () => {
    expect(assert.bind(null, false, "Hello")).toThrowError("[vuex] Hello");
  });
});
