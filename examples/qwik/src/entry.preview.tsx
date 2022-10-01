import { qwikCity } from '@builder.io/qwik-city/middleware/node'
import render from './entry.ssr'

export default qwikCity(render)
