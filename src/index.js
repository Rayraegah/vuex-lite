import Store, { install } from "./store";
import { mapState, mapMutations } from "./helpers";

// emulate vuex esm
export default { Store, install, mapState, mapMutations };
export { Store, install, mapState, mapMutations };
