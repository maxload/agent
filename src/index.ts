#!/usr/bin/env node
import log from './log'
import exec from './execute'
import killSwitch from './killSwitch'
import containerFinished from './containerFinished'

const dropletId = process.env.DROPLET_ID
const testRunId = process.env.TEST_RUN_ID
const dockerImage = process.env.DOCKER_IMAGE
const dockerRegistry = process.env.DOCKER_REGISTRY
const dockerUser = process.env.DOCKER_USER
const dockerPass = process.env.DOCKER_PASS
const testVars = JSON.parse(process.env.TESTVARS || '{}')
const instanceCount = parseInt(process.env.INSTANCE_COUNT || '1', 10)

const start = async () => {
  if (dockerRegistry && dockerUser && dockerPass) {
    await exec(`docker login -u ${dockerUser} -p "${dockerPass}" ${dockerRegistry}`)
  }
  await exec(`docker pull ${dockerImage}`)
  return Promise.all([...Array(instanceCount).keys()].map(async instanceNumber => {
    const containerId = `${testRunId}-${dropletId}-${instanceNumber}`
    const vars = Object.keys(testVars).reduce((str, key) =>
      `${str} -e "${key}=${testVars[key]}"`, '')
    log(`starting container with name ${containerId} …`, 'info')
    await exec(
      `docker run --rm --name ${containerId} ${vars} ${dockerImage}`,
      chunk => log(chunk, 'info', containerId),
      chunk => log(chunk, 'error', containerId),
    )
    return containerFinished(containerId)
  }))
}

start()
  .then(() => {
    console.log('finished')
    killSwitch()
  })
  .catch(err => {
    console.log(err)
    log(err.stack, 'error')
    killSwitch()
  })
