import { google } from 'googleapis'
import { STATUS_CODES } from 'http'
import { DateTime } from 'luxon'
const sheets = google.sheets('v4')

import { Config } from './config'
import { StepnRecord } from './stepn'
import { Failure, Result, Success } from './result'

class Dao {
  private readonly title
  private readonly inOut
  private readonly currency
  private readonly price
  constructor(record: StepnRecord) {
    this.title = record.title
    this.inOut = record.inOut
    this.currency = record.currency
    this.price = record.price
  }

  /*
   * NOTE:
   * スプレッドシートの列の順序に依存している
   * 列A: 日付
   * 列B: 項目
   * 列C: IN_OUT
   * 列D: コイン・トークン名
   * 列E: 金額_コイン・トークン
   */
  public toArray() {
    return [DateTime.now().toISO(), this.title, this.inOut, this.currency, this.price]
  }
}

export class Sheet {
  private readonly sheetId: string
  private readonly jwt
  constructor(sheetId: string, email: string, key: string) {
    this.sheetId = sheetId
    this.jwt = new google.auth.JWT({
      // keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      email,
      key,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    })
  }

  public async append(records: StepnRecord[]): Promise<Result<string, Error>> {
    const daos = records.map((record) => new Dao(record).toArray())
    try {
      const response = await sheets.spreadsheets.values.append({
        auth: this.jwt,
        spreadsheetId: this.sheetId,
        range: 'A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: daos,
        },
      })
      return response.statusText === STATUS_CODES['200']
        ? new Success(response.statusText)
        : new Failure(new Error(response.statusText))
    } catch (err) {
      return new Failure(new Error(err as string))
    }
  }
}
