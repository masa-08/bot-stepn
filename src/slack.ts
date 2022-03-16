import { STATUS_CODES } from 'http'
import axios from 'axios'

import { Failure, Result, Success } from './result'

export class Slack {
  static async fetchImage(url: string): Promise<Result<Buffer, Error>> {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
    })
    return res.statusText === STATUS_CODES['200']
      ? new Success(Buffer.from(res.data))
      : new Failure(new Error('Cannot fetch image from your slack.'))
  }
}
