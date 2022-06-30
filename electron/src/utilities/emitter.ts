
class EmitterUtility {

  /**
   * bind emitter
   *
   * @param name 
   * @param store 
   * @param contents 
   */
  bind(name, store, contents) {
    // set result
    const data = {};

    // loop state
    Object.keys(store.state).forEach((key) => {
      // check type
      if (typeof store.state[key] === 'function') {
        // set callback
        data[key] = 'ipc:callback';
      } else {
        data[key] = store.state[key];
      }
    });

    // send
    contents.send('emitter', {
      name,
      data,
    });
  }
}

// emitter utility
const builtEmitterUtility = new EmitterUtility();

// export default
export default builtEmitterUtility;