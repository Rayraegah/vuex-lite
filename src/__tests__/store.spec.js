import Vue from "vue";
import Vuex, { install } from "../";

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

    const stateSpy = jest.spyOn(setup, "initialState");

    new Vuex.Store({
      state: setup.initialState
    });

    expect(stateSpy).toHaveBeenCalledTimes(1);
  });

  it("should not allow explicit state modification", () => {
    const store = new Vuex.Store({
      state: {
        a: 1
      }
    });
    expect(() => {
      store.state = { a: 10 };
    }).toThrowError(/to explicitly replace state/);
    expect(store.state.a).toBe(1);
  });

  test("replace state", () => {
    const initialState = { a: 1 };

    const store = new Vuex.Store({
      state: initialState
    });

    expect(store.state.a).toBe(1);
    store.replaceState({ a: 2 });
    expect(store.state.a).toBe(2);
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

  test("plugins", () => {
    const myplugins = {
      logger: _store => {
        // called when the store is initialized
        _store.subscribe((mutation, state) => {
          // called after every mutation.
          // The mutation comes in the format of `{ type, payload }`.
          return true;
        });
      }
    };

    const pluginSpy = jest.spyOn(myplugins, "logger");

    const store = new Vuex.Store({
      state: {
        a: 1
      },

      plugins: [myplugins.logger],

      mutations: {
        [TEST](state, n) {
          state.a += n;
        }
      }
    });

    store.commit(TEST, 2);
    store.commit(TEST, 5);
    expect(pluginSpy).toHaveBeenCalledTimes(1);
  });

  test("install", () => {
    expect(() => {
      install(Vue);
    }).toThrowError(/already installed/);
  });
});
