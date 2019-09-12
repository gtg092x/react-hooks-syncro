import serve from 'koa-static'
import proxies from 'koa-proxies'
import mount from 'koa-mount'

const {
  WEBPACK_PORT,
} = process.env

export default WEBPACK_PORT
  ? proxies('/assets', {
    target: `http://localhost:${WEBPACK_PORT}`,
    changeOrigin: true,
    logs: true
  })
  : mount('/assets', serve('../dist'))