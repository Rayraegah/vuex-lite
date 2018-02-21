import Vue from "vue";
import Vuex from "../";

const TEST = "TEST";

// install vuex
Vue.use(Vuex);

// supress production tips
Vue.config.productionTip = false;

describe("Mutations", () => {
  test("function style commit", () => {
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

  test("object style commit", () => {
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
  it("cannot be called as a function", () => {
    expect(() => {
      Vuex.Store({});
    }).toThrowError(/Cannot call a class as a function/);
  });

  test("injection", () => {
    const store = new Vuex.Store({ state: { a: 1 } });
    const vm = new Vue({
      store
    });
    const child = new Vue({ parent: vm });
    expect(child.$store).toBe(store);
  });
});

describe("State", () => {
  it("should accept a function as state", () => {
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

  it("should not call root state function twice", () => {
    const setup = {
      initialState: () => ({ a: 1 })
    };

    const spy = jest.spyOn(setup, "initialState");

    new Vuex.Store({
      state: setup.initialState
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("Subscriptions", () => {
  test("subscriptions / unsubscriptions", () => {
    const subscribers = {
      one: () => {},
      two: () => {}
    };

    const subscribeSpy = jest.spyOn(subscribers, "one");
    const secondSubscribeSpy = jest.spyOn(subscribers, "two");

    const testPayload = 2;

    const store = new Vuex.Store({
      state: {},
      mutations: {
        [TEST]: () => {}
      }
    });

    const unsubscribe = store.subscribe(subscribers.one);
    store.subscribe(subscribers.two);

    store.commit(TEST, testPayload);
    unsubscribe();
    store.commit(TEST, testPayload);

    expect(subscribeSpy).toHaveBeenCalledWith(
      { type: TEST, payload: testPayload },
      store.state
    );
    expect(secondSubscribeSpy).toHaveBeenCalled();
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
    expect(secondSubscribeSpy).toHaveBeenCalledTimes(2);
  });
});
