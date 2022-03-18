import { App } from '@slack/bolt'
import { StepnAnalyzer } from './stepn'
import { Slack } from './slack'
import { Sheet } from './sheet'

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
})

const analyzer = new StepnAnalyzer()
const sheet = new Sheet()

app.event('message', async ({ event }) => {
  if (event.subtype !== 'file_share' || event.files == null) {
    return
  }
  const images = await Promise.all(
    event.files.map(async (f) => {
      if (f.url_private != null) {
        const result = await Slack.fetchImage(f.url_private)
        return result.isSuccess() ? result.value : console.error(result.error)
      }
    })
  )

  const parseResults = await Promise.all(
    images
      .flatMap((x) => x ?? []) // undefinedを除去
      .map(async (image) => {
        const result = await analyzer.parse(image)
        return result.isSuccess() ? result.value : console.error(result.error)
      })
  )

  const appendResult = await sheet.append(parseResults.flatMap((x) => x ?? []))
  if (appendResult.isFailure()) {
    console.error(appendResult.error)
  }
})
;(async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ STEPN BOT is running!')
})()
