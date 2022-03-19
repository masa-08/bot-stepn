export class Config {
  readonly port: number | string
  readonly slackSecret: string
  readonly slackToken: string
  readonly sheetId: string
  readonly googleCredentials: string
  readonly googleServiceAccount: string
  readonly googlePrivateKey: string
  constructor() {
    this.checkEnvironmentVariables()
    this.port = process.env.PORT || 3000
    this.slackSecret = process.env.SLACK_SIGNING_SECRET!
    this.slackToken = process.env.SLACK_BOT_TOKEN!
    this.sheetId = process.env.GOOGLE_SHEET_ID!
    this.googleCredentials = process.env.GOOGLE_CREDENTIALS!

    const keys = JSON.parse(this.googleCredentials)
    this.googleServiceAccount = keys['client_email']
    this.googlePrivateKey = keys['private_key']
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
    if (!process.env.GOOGLE_CREDENTIALS!) {
      console.error(new Error('Environment variable `GOOGLE_CREDENTIALS` is not set.'))
      process.exit(1)
    }
  }
}
