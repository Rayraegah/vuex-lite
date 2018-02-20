import Vue from "vue";
import Vuex from "../";

const TEST = "TEST";

// install vuex
Vue.use(Vuex);

// supress production tips
Vue.config.productionTip = false;

describe("Mutations", () => {
  test("committing mutations", () => {
    const store = new Vuex.Store({
      state: {
        a: 1
      },

      mutations: {
        [TEST](state, n) {
          state.a += n;
        }
      }
    });

    store.commit(TEST, 2);
    expect(store.state.a).toBe(3);
  });

  test("committing with object style", () => {
    const store = new Vuex.Store({
      state: {
        a: 1
      },

      mutations: {
        [TEST](state, payload) {
          state.a += payload.amount;
        }
      }
    });

    store.commit({
      type: TEST,
      amount: 2
    });

    expect(store.state.a).toBe(3);
  });

  it("asserts committed type", () => {
    const store = new Vuex.Store({
      state: {
        a: 1
      },
      mutations: {
        // Maybe registered with undefined type accidentally
        // if the user has typo in a constant type
        undefined(state, n) {
          state.a += n;
        }
      }
    });
    expect(() => {
      store.commit(undefined, 2);
    }).toThrowError(/Expects string as the type, but found undefined/);
    expect(store.state.a).toBe(1);
  });
});

describe("Store", () => {
  it("asserts the call without new operator", () => {
    expect(() => {
      Vuex.Store({});
    }).toThrowError(/Cannot call a class as a function/);
  });

  test("store injection", () => {
    const store = new Vuex.Store({ state: { a: 1 } });
    const vm = new Vue({
      store
    });
    const child = new Vue({ parent: vm });
    expect(child.$store).toBe(store);
  });
});

describe("State", () => {
  it("should accept state as function", () => {
    const store = new Vuex.Store({
      state: () => ({
        a: 1
      }),
      mutations: {
        [TEST](state, n) {
          state.a += n;
        }
      }
    });
    expect(store.state.a).toBe(1);
    store.commit(TEST, 2);
    expect(store.state.a).toBe(3);
  });

  it.skip("should not call root state function twice", () => {
    const spy = createSpy().and.returnValue(1);
    new Vuex.Store({
      state: spy
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("Subscriptions", () => {
  it.skip("subscribe: should handle subscriptions / unsubscriptions", () => {
    const subscribeSpy = jasmine.createSpy();
    const secondSubscribeSpy = jasmine.createSpy();
    const testPayload = 2;
    const store = new Vuex.Store({
      state: {},
      mutations: {
        [TEST]: () => {}
      }
    });

    const unsubscribe = store.subscribe(subscribeSpy);
    store.subscribe(secondSubscribeSpy);
    store.commit(TEST, testPayload);
    unsubscribe();
    store.commit(TEST, testPayload);

    expect(subscribeSpy).toHaveBeenCalledWith(
      { type: TEST, payload: testPayload },
      store.state
    );
    expect(secondSubscribeSpy).toHaveBeenCalled();
    expect(subscribeSpy.calls.count()).toBe(1);
    expect(secondSubscribeSpy.calls.count()).toBe(2);
  });
});
