import { defineConfig } from 'tsdown'
import Quansync from 'unplugin-quansync/rolldown'

export default defineConfig({
  dts: true,
  exports: true,
  plugins: [
    Quansync(),
  ],
})
