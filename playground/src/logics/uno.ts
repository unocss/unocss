import { createGenerator } from 'unocss'
import config from '../../unocss.config'

export const customConfigString = useStorage('unocss-custom-config', {})

export const uno = createGenerator(config)

export const options = useStorage('unocss-options', {})
