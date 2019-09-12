import React from 'react'
import ReactDOM from 'react-dom/server'
import axios from 'axios'
import Html from './Html'
import App from './app/App'
import { getSyncState } from '../../lib'

const render = async (ctx, next) => {

  const extras = {
    axios,
  }

  const syncState = await getSyncState(<App extras={extras} />)
  console.log(syncState)
  // const syncState = {}

  const content = ReactDOM.renderToString(<App extras={extras} />)

  const body = ReactDOM.renderToStaticMarkup(<Html state={syncState} content={content} />)

  ctx.body = `<!doctype html>${body}`
}

export default render
