import Koa from 'koa'
import assets from './assets'
import render from './render'

const {
  PORT = 3005,
} = process.env

const app = new Koa()

app.use(assets)
app.use(render)

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
