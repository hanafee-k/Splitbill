import generatePayload from 'promptpay-qr'

export function getQRPayload(
  phoneOrTaxId: string,
  amount: number
): string {
  return generatePayload(phoneOrTaxId, { amount })
}