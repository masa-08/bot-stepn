import { App } from '@slack/bolt'
import { StepnAnalyzer } from './stepn'
import { Slack } from './slack'

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
})

const analyzer = new StepnAnalyzer()

app.event('message', async ({ event }) => {
  if (event.subtype !== 'file_share' || event.files == null) {
    return
  }
  const images = await Promise.all(
    event.files.map(async (f) => {
      if (f.url_private != null) {
        const result = await Slack.fetchImage(f.url_private)
        if (result.isSuccess()) {
          return result.value
        } else {
          console.error(result.error)
        }
      }
    })
  )

  const results = await Promise.all(
    images.map(async (image) => {
      if (image == null) {
        return
      }
      const result = await analyzer.parse(image)
      if (result.isSuccess()) {
        return result.value
      } else {
        console.error(result.error)
      }
    })
  )

  console.log(results)
})
;(async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ STEPN BOT is running!')
})()
