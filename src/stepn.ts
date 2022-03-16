import vision, { ImageAnnotatorClient } from '@google-cloud/vision'

import { Failure, Result, Success } from './result'

export type StepnRecord = {
  value: number
  inOut: 'IN' | 'OUT'
  item: 'Repair' | 'Level Up' | 'Move & Earn'
}

export class StepnAnalyzer {
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

  public async parse(image: Buffer): Promise<Result<StepnRecord, Error>> {
    const text = await this.detectText(image)
    if (text.isFailure()) {
      return text
    }
    return await this.parseText(text.value)
  }

  private async detectText(image: Buffer): Promise<Result<string, Error>> {
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

  private parseText(text: string): Result<StepnRecord, Error> {
    if (text.match(this.identifier.REPAIR)) {
      const target = text.match(this.costRegex)
      return target?.groups?.num != null
        ? new Success({ value: Number(target.groups.num), inOut: 'OUT', item: 'Repair' })
        : new Failure(new Error('Cannot extract values.'))
    }

    if (text.match(this.identifier.LEVEL_UP)) {
      const target = text.match(this.costRegex)
      return target?.groups?.num != null
        ? new Success({ value: Number(target.groups.num), inOut: 'OUT', item: 'Level Up' })
        : new Failure(new Error('Cannot extract values.'))
    }

    if (text.match(this.identifier.STEPN)) {
      const target = text.match(this.earningRegex)
      return target?.groups?.num != null
        ? new Success({ value: Number(target.groups.num), inOut: 'IN', item: 'Move & Earn' })
        : new Failure(new Error('Cannot extract values.'))
    }

    return new Failure(new Error('The expected string was not included.'))
  }
}
