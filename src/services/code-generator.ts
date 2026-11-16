import { randomInt } from 'node:crypto'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const CODE_LENGTH = 7

export function generateCode(): string {
  let code = ''

  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARSET[randomInt(CHARSET.length)]
  }

  return code
}
