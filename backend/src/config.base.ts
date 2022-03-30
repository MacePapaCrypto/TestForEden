
// dot prop
import dotProp from 'dot-prop';

// base config
const baseConfig = {};

// export
export default {
  data : baseConfig,
  
  get : (key) => dotProp.get(baseConfig, key),
  set : (key, val) => dotProp.set(baseConfig, key, val),
};