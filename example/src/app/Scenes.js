import React from 'react'
import createSyncHook from '../../../lib'

const useSubReddit = createSyncHook(async (sub, extras) => {
  const { axios } = extras;
  const { data } = await axios.get(`https://www.reddit.com/r/${sub}.json`)
  return data
})

export const Home = () => {

  const { data = {}, loading, error } = useSubReddit('dadjokes')

  return (
    <div>
      <pre>
        <code>
          {JSON.stringify(data, false, 4)}
        </code>
      </pre>
    </div>
  )
}