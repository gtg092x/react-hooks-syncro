"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SyncProvider = exports.getSyncState = void 0;

var _react = _interopRequireWildcard(require("../example/node_modules/react"));

var _server = _interopRequireDefault(require("../example/node_modules/react-dom/server"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const SyncContext = _react.default.createContext(null);

const values = o => Object.keys(o).map(k => o[k]);

const valuesDeep = o => values(o).reduce((memo, o2) => [...memo, ...values(o2)], []);

const SyncServerContext = _react.default.createContext(null);

const getSyncState = async element => {
  const promises = {
    cache: {}
  };

  do {
    await Promise.all(valuesDeep(promises.cache).map(p => p.promise));

    _server.default.renderToStaticMarkup(_react.default.createElement(SyncServerContext.Provider, {
      value: promises
    }, element));
  } while (valuesDeep(promises.cache).some(p => p.isPending));

  const result = {};
  const keys = Object.keys(promises.cache);

  for (let i = 0; i < keys.length; i++) {
    const fnkey = keys[i];
    const pm = promises.cache[fnkey];
    const argKeys = Object.keys(pm);
    result[fnkey] = {};

    for (let j = 0; j < keys.length; i++) {
      const argKey = argKeys[j];
      result[fnkey][argKey] = await pm.promise;
    }
  }

  return result;
};

exports.getSyncState = getSyncState;

const SyncProvider = ({
  children,
  extras,
  state
}) => {
  const cache = (0, _react.useMemo)(() => ({}), []);
  const server = (0, _react.useContext)(SyncServerContext);

  if (server) {
    server.cache = cache;
  }

  return _react.default.createElement(SyncContext.Provider, {
    value: {
      cache,
      extras
    }
  }, children);
};

exports.SyncProvider = SyncProvider;
let index = 0;

function createHook(fn, options) {
  const i = `i-${index++}`;
  return args => {
    const [loading, setLoading] = (0, _react.useState)(false);
    const [data, setData] = (0, _react.useState)(null);
    const [error, setError] = (0, _react.useState)(null);
    const ctx = (0, _react.useContext)(SyncContext);
    const {
      cache,
      extras
    } = ctx;
    cache[i] = cache[i] || {};
    const resolver = (0, _react.useMemo)(() => {
      if (!cache[i][JSON.stringify(args)]) {
        cache[i][JSON.stringify(args)] = {
          isPending: true,
          promise: fn(args, extras)
        };
      }

      return cache[i][JSON.stringify(args)];
    }, [args]);
    const load = (0, _react.useCallback)(() => {
      setLoading(true);
      Promise.resolve(resolver.promise).then(data => setData(data)).then(() => setLoading(false)).catch(error => setError(error)).then(() => {
        resolver.isPending = false;
      });
    }, [setData, setLoading, setError, resolver]);
    (0, _react.useEffect)(() => {
      load(args);
    }, args);
    const reload = (0, _react.useCallback)(() => {
      cache[i][JSON.stringify(args)] = {
        isPending: true,
        promise: fn(args, extras)
      };
      return load();
    }, [args]);
    return {
      loading,
      data,
      error,
      reload
    };
  };
}

var _default = createHook;
exports.default = _default;