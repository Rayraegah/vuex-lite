import { assert, isObject } from "./utils";
import { createMapState, mapToMethods } from "./helpers";

// connects to vuex devtools
import devtoolPlugin from "./plugins/devtool";

let Vue; // bind on install => Vue.use(Vuex)

function unifyObjectStyle(type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }

  assert(
    typeof type === "string",
    `Expects string as the type, but found ${typeof type}.`
  );

  return { type, payload, options };
}

export default class Store {
  constructor({ state, mutations = {}, plugins = [], subscribers = [] } = {}) {
    // automatic installation on browsers
    if (!Vue && typeof window !== "undefined" && window.Vue) {
      install(window.Vue);
    }

    const store = this;
    const { commit } = this;

    this._vm = new Vue({
      data: {
        $$state: typeof state === "function" ? state() : state
      }
    });

    this._committing = false;
    this.mutations = mutations;
    this.subscribers = subscribers;

    // bind commit to self
    this.commit = (type, payload, options) => {
      return commit.call(store, type, payload, options);
    };

    if (plugins) {
      plugins.forEach(plugin => plugin(this));
    }

    if (Vue.config.devtools) {
      this.getters = [];
      this.actions = [];
      devtoolPlugin(this);
    }

    this.mapState = createMapState(this);
    this.mapMutations = mapToMethods("mutations", "commit", this);
  }

  get state() {
    return this._vm.$data.$$state;
  }

  set state(v) {
    /**
     * @todo Add deep watch for state to prevent mutations outside handlers
     * @body [not safe for production](https://vuex.vuejs.org/en/strict.html)
     */
    assert(false, `Use store.replaceState() to explicitly replace state.`);
  }

  subscribe(sub) {
    this.subscribers.push(sub);
    return () => this.subscribers.splice(this.subscribers.indexOf(sub), 1);
  }

  commit(_type, _payload, _options) {
    const { type, payload, options } = unifyObjectStyle(
      _type,
      _payload,
      _options
    );

    const mutation = { type, payload };
    const handler = this.mutations[type];

    this._withCommit(() => {
      handler(this.state, payload);
    });

    this.subscribers.forEach(sub => sub(mutation, this.state));
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

export function install(_Vue) {
  if (Vue && _Vue === Vue) {
    assert(
      false,
      `already installed. Vue.use(Vuex) should be called only once.`
    );
    /* istanbul ignore next: unreachable code in test or development */
    return;
  }

  Vue = _Vue;

  Vue.mixin({
    beforeCreate: vuexInit
  });

  function vuexInit() {
    const options = this.$options;

    if (options.store) {
      // store injection
      this.$store =
        typeof options.store === "function" ? options.store() : options.store;
    } else if (options.parent && options.parent.$store) {
      // store injection for children
      this.$store = options.parent.$store;
    }
  }
}
