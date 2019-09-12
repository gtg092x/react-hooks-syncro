import React, { useState, useEffect, useMemo, useCallback, useContext } from '../example/node_modules/react'
import ReactDOM from '../example/node_modules/react-dom/server'

const SyncContext = React.createContext(null)

const values =o => Object.keys(o).map((k) => o[k])
const valuesDeep = o => values(o).reduce((memo, o2) => [...memo, ...values(o2)], [])

const SyncServerContext = React.createContext(null)

export const getSyncState = async (element) => {
  const promises = {
    cache: {}
  }

  do {
    await Promise.all(valuesDeep(promises.cache).map(p => p.promise))

    ReactDOM.renderToStaticMarkup(React.createElement(SyncServerContext.Provider, { value: promises }, element))

  } while (valuesDeep(promises.cache).some(p => p.isPending))

  const result = {}
  const keys = Object.keys(promises.cache)
  for (let i = 0; i < keys.length; i++) {
    const fnkey = keys[i]
    const pm = promises.cache[fnkey]
    const argKeys = Object.keys(pm)
    result[fnkey] = {}
    for (let j = 0; j < keys.length; i++) {
      const argKey = argKeys[j]
      result[fnkey][argKey] = await pm.promise
    }
  }
  return result
}

export const SyncProvider = ({ children, extras, state }) => {

  const cache = useMemo(() => ({}), [])
  const server = useContext(SyncServerContext)

  if (server) {
    server.cache = cache
  }

  return (
    <SyncContext.Provider value={{ cache, extras }}>
      {children}
    </SyncContext.Provider>
  )
}


let index = 0

function createHook (fn, options) {
  const i = `i-${index++}`
  return (args) => {

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const ctx = useContext(SyncContext)
    const { cache, extras } = ctx

    cache[i] = cache[i] || {}

    const resolver = useMemo(() => {
      if(!cache[i][JSON.stringify(args)]) {
        cache[i][JSON.stringify(args)] = { isPending: true, promise: fn(args, extras) }
      }
      return cache[i][JSON.stringify(args)]
    }, [args])


    const load = useCallback(() => {
      setLoading(true)

      Promise.resolve(resolver.promise)
        .then(data => setData(data))
        .then(() => setLoading(false))
        .catch(error => setError(error))
        .then(() => {
          resolver.isPending = false
        })
    }, [setData, setLoading, setError, resolver])

    useEffect(() => {
      load(args)
    }, args)

    const reload = useCallback(() => {
      cache[i][JSON.stringify(args)] = { isPending: true, promise: fn(args, extras) }
      return load()
    }, [args])

    return {
      loading,
      data,
      error,
      reload,
    }
  }
}

export default createHook
