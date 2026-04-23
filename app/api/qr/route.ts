export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '../../../lib/db'
import { calcPerPerson } from '../../../lib/calculate'
import { getQRPayload } from '../../../lib/promptpay'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const sessionId = url.searchParams.get('sessionId')
  const personId = url.searchParams.get('personId')
  const amount = url.searchParams.get('amount')

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }

  if (!sessionId || !personId) {
    return NextResponse.json({ error: 'Missing sessionId or personId' }, { status: 400 })
  }

  const session = await getDb().session.findUnique({
    where: { id: sessionId },
    include: {
      persons: true,
      items: { include: { persons: true } },
    },
  })

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if (!session.promptpayNo) return NextResponse.json({ error: 'No PromptPay number' }, { status: 400 })

  const items = session.items.map(item => ({
    price: Number(item.price),
    personIds: item.persons.map(ip => ip.personId),
  }))

  const results = calcPerPerson(items, session.persons, session.vatPct, session.servicePct)
  const result = results.find(r => r.id === personId)

  if (!result) return NextResponse.json({ error: 'Person not found' }, { status: 404 })

  const payload = getQRPayload(session.promptpayNo, result.total)

  return NextResponse.json({
    payload,
    name: result.name,
    subtotal: result.subtotal,
    total: result.total,
    vatPct: session.vatPct,
    servicePct: session.servicePct,
    promptpayNo: session.promptpayNo,
  })
}
