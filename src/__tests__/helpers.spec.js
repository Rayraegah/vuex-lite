import Vue from "vue";
import Vuex from "../";

// install vuex
Vue.use(Vuex);

// supress production tips
Vue.config.productionTip = false;

describe("Helpers", () => {
  test("mapState (array)", () => {
    const store = new Vuex.Store({
      state: {
        a: 1
      },

      mutations: {
        inc(state, val) {
          state.a += val;
        }
      }
    });

    const vm = new Vue({
      store,
      computed: store.mapState(["a"])
    });

    expect(vm.a).toBe(1);
    store.commit("inc", 1);
    expect(vm.a).toBe(2);
  });

  test("mapState (object)", () => {
    const store = new Vuex.Store({
      state: {
        a: 1,
        b: 1
      },

      mutations: {
        inc(state, val) {
          state.a += val;
        }
      }
    });

    const vm = new Vue({
      store,
      computed: store.mapState({
        a: state => {
          return state.a + state.b;
        }
      })
    });

    expect(vm.a).toBe(2);
    store.commit("inc", 1);
    expect(vm.a).toBe(3);
  });

  test("mapMutations (object)", () => {
    const store = new Vuex.Store({
      state: { count: 0 },
      mutations: {
        inc: state => state.count++,
        dec: state => state.count--
      }
    });
    const vm = new Vue({
      store,
      methods: store.mapMutations({
        plus: "inc",
        minus: "dec"
      })
    });
    vm.plus();
    expect(store.state.count).toBe(1);
    vm.minus();
    expect(store.state.count).toBe(0);
  });
});
