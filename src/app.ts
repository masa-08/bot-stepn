import { App } from '@slack/bolt'

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
})

app.event('message', async ({ event }) => {
  if (event.subtype !== 'file_share') {
    return
  }
  console.log(event.files)
})
;(async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ Bolt app is running!')
})()
