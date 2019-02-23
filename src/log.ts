import fetch from 'node-fetch'

const dropletId = process.env.DROPLET_ID
const testRunId = process.env.TEST_RUN_ID
const serviceUrl = process.env.SERVICE_URL

export default async function log(msg: string, level: string, containerId?: string) {
  return fetch(`${serviceUrl}hooks/log?dropletId=${dropletId}&testRunId=${testRunId}&time=${Date.now()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ msg, level, ...containerId && { containerId } }),
  })
}
