import { STATUS_CODES } from 'http'
import axios from 'axios'
import vision, { ImageAnnotatorClient } from '@google-cloud/vision'

import { Failure, Result, Success } from './result'

export class Analyzer {
  private readonly client: ImageAnnotatorClient
  private readonly costRegex = /(?<num>\d+(\.\d+)?\s*)GST/
  private readonly earningRegex = /\+\s*(?<num>\d+(\.\d+)?)/
  private readonly identifier = {
    REPAIR: 'REPAIR',
    LEVEL_UP: 'LEVEL UP',
    STEPN: 'Long press to identify and download APP', // 歩いてGSTを稼いだ時の画面識別用
  } as const

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

  public parseText(text: string): Result<number, Error> {
    if (text.match(this.identifier.REPAIR) || text.match(this.identifier.LEVEL_UP)) {
      const target = text.match(this.costRegex)
      return target?.groups?.num != null
        ? new Success(Number(target.groups.num))
        : new Failure(new Error('Cannot extract values.'))
    }

    if (text.match(this.identifier.STEPN)) {
      const target = text.match(this.earningRegex)
      return target?.groups?.num != null
        ? new Success(Number(target.groups.num))
        : new Failure(new Error('Cannot extract values.'))
    }

    return new Failure(new Error('The expected string was not included.'))
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
