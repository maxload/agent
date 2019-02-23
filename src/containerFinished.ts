import fetch from 'node-fetch'

const dropletId = process.env.DROPLET_ID
const testRunId = process.env.TEST_RUN_ID
const serviceUrl = process.env.SERVICE_URL

export default async function containerFinished(containerId: string) {
  return fetch(`${serviceUrl}hooks/containerFinished?containerId=${containerId}&dropletId=${dropletId}&testRunId=${testRunId}`)
}
