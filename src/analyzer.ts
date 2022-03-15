import { STATUS_CODES } from 'http'
import axios from 'axios'
import vision, { ImageAnnotatorClient } from '@google-cloud/vision'

import { Failure, Result, Success } from './result'

export class Analyzer {
  private readonly client: ImageAnnotatorClient
  constructor() {
    this.client = new vision.ImageAnnotatorClient()
  }

  public async detectText(image: Buffer): Promise<Result<string, Error>> {
    const [result] = await this.client.textDetection(image)
    // Vision APIでパースできない不正なBufferファイルの場合
    if (result.error != null) {
      return new Failure(
        new Error(`Some error occurred during the text detection process. ${result.error}`)
      )
    }
    // 文字を検出できない画像の場合
    if (
      result.textAnnotations == null ||
      result.textAnnotations.length === 0 ||
      result.textAnnotations[0].description == null
    ) {
      return new Failure(new Error('Cannot detect any texts from the image.'))
    }
    // 正常に文字を検出できる場合
    return new Success(result.textAnnotations[0].description)
  }

  public async fetchImageAsBuffer(url: string): Promise<Result<Buffer, Error>> {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
    })
    return res.statusText === STATUS_CODES['200']
      ? new Success(Buffer.from(res.data))
      : new Failure(new Error('Cannot fetch image from your slack.'))
  }
}
