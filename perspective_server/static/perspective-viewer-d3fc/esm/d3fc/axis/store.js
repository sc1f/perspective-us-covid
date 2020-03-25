import "core-js/modules/es.array.iterator";
import "core-js/modules/web.dom-collections.iterator";
export default ((...names) => {
  const data = {};

  const store = target => {
    for (const key of Object.keys(data)) {
      target[key](data[key]);
    }

    return target;
  };

  for (const name of names) {
    store[name] = (...args) => {
      if (!args.length) {
        return data[name];
      }

      data[name] = args[0];
      return store;
    };
  }

  return store;
});
//# sourceMappingURL=store.js.map