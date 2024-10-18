import { render } from 'solid-js/web'

import App from './App'
import './index.css'

import 'virtual:uno.css'

render(() => <App />, document.getElementById('root') as HTMLElement)
