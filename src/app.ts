import { App } from '@slack/bolt'
import { Analyzer } from './analyzer'

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
})

const analyzer = new Analyzer()

app.event('message', async ({ event }) => {
  if (event.subtype !== 'file_share') {
    return
  }
  event.files?.forEach(async (e) => {
    if (e.url_private != null) {
      const buf = await analyzer.fetchImageAsBuffer(e.url_private)
      buf.isSuccess() && (await analyzer.detectText(buf.value))
    }
  })
})
;(async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ STEPN BOT is running!')
})()
