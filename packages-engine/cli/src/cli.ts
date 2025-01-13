import { startCli } from './cli-start'
import { handleError } from './errors'

startCli().catch(handleError)
