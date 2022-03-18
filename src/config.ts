export class Config {
  readonly port: number | string
  readonly slackSecret: string
  readonly slackToken: string
  readonly sheetId: string
  readonly serviceAccount: string
  readonly privateKey: string
  constructor() {
    this.checkEnvironmentVariables()
    this.port = process.env.PORT || 3000
    this.slackSecret = process.env.SLACK_SIGNING_SECRET!
    this.slackToken = process.env.SLACK_BOT_TOKEN!
    this.sheetId = process.env.GOOGLE_SHEET_ID!
    this.serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT!
    this.privateKey = process.env.GOOGLE_PRIVATE_KEY!
  }

  private checkEnvironmentVariables = () => {
    if (!process.env.SLACK_SIGNING_SECRET) {
      console.error(new Error('Environment variable `SLACK_SIGNING_SECRET` is not set.'))
      process.exit(1)
    }
    if (!process.env.SLACK_BOT_TOKEN) {
      console.error(new Error('Environment variable `SLACK_BOT_TOKEN` is not set.'))
      process.exit(1)
    }
    if (!process.env.GOOGLE_SHEET_ID) {
      console.error(new Error('Environment variable `GOOGLE_SHEET_ID` is not set.'))
      process.exit(1)
    }
    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
      console.error(new Error('Environment variable `GOOGLE_SERVICE_ACCOUNT` is not set.'))
      process.exit(1)
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      console.error(new Error('Environment variable `GOOGLE_PRIVATE_KEY` is not set.'))
      process.exit(1)
    }
  }
}
