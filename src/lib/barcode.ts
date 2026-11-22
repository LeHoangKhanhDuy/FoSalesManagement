export const ean13CheckDigit = (first12: string) => {
  const sum = first12.split('').reduce((s, d, i) => s + Number(d) * (i % 2 ? 3 : 1), 0)
  return String((10 - (sum % 10)) % 10)
}

export const isValidEan13 = (code: string) => /^\d{13}$/.test(code) && ean13CheckDigit(code.slice(0, 12)) === code[12]

export const generateEan13 = (prefix = '893') => {
  const body = prefix + String(Math.floor(Math.random() * 10 ** (12 - prefix.length))).padStart(12 - prefix.length, '0')
  return body + ean13CheckDigit(body)
}
