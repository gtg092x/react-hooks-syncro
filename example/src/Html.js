import React from 'react'

const {
  NODE_ENV = 'development',
} = process.env

const Html = ({ state, content }) => {
  return (
    <html>
      <body>
      <div id="react-root" dangerouslySetInnerHTML={{__html: content}} />
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{__html: `window.SYNC_STATE=${JSON.stringify(state)};`}}
      />
        <script src={`/assets/bundle.${NODE_ENV}.js`} />
      </body>
    </html>
  )
}

export default Html
