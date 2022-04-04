import { Elm } from './src/Main.elm'

import './style.css'
import 'uno.css'

const root = document.querySelector('#app div')
Elm.Main.init({ node: root })
