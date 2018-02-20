import Vue from "vue";
import devtoolPlugin from "./plugins/devtool";
import { IS_PROD, unifyObjectStyle, assert } from "./util";

export default class Store {
  static install(_Vue) {
    _Vue.mixin({
      beforeCreate() {
        this.$store =
          this.$options.store || (this.$parent && this.$parent.$store);
      }
    });
  }

  constructor({ state, mutations = {}, plugins = [], subscribers = [] } = {}) {
    if (!Vue && typeof window !== "undefined" && window.Vue) {
      install(window.Vue);
    }

    this._vm = new Vue({
      data: {
        $$state: typeof state === "function" ? state() : state
      }
    });

    this._committing = false;
    this._mutations = mutations;
    this._subscribers = subscribers;

    if (plugins) {
      plugins.forEach(p => this.use(p));
    }

    if (Vue.config.devtools) {
      this._getters = [];
      this._actions = [];
      devtoolPlugin(this);
    }
  }

  get state() {
    return this._vm.$data.$$state;
  }

  set state(d) {
    if (!IS_PROD) {
      assert(
        false,
        `Use store.replaceState() to explicit replace store state.`
      );
    }
  }

  subscribe(sub) {
    this._subscribers.push(sub);
    return () => this._subscribers.splice(this._subscribers.indexOf(sub), 1);
  }

  commit(_type, _payload, _options) {
    const { type, payload, options } = unifyObjectStyle(
      _type,
      _payload,
      _options
    );

    const mutation = { type, payload };
    const handler = this._mutations[type];

    this._withCommit(() => {
      handler(this.state, payload);
    });

    this._subscribers.forEach(sub => sub(mutation, this.state));
  }

  use(fn) {
    fn(this);
    return this;
  }

  replaceState(state) {
    this._vm.$data.$$state = state;
    return this;
  }

  _withCommit(fn) {
    const committing = this._committing;
    this._committing = true;
    fn();
    this._committing = committing;
  }
}
