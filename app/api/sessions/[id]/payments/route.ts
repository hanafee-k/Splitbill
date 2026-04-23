export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '../../../../../lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params
  const { personId, paid } = await request.json()
  try {
    if (personId === 'all') {
      await getDb().person.updateMany({
        where: { sessionId },
        data: { paid: false, paidAt: null },
      })
      return NextResponse.json({ success: true })
    }

    const person = await getDb().person.update({
      where: { id: personId, sessionId },
      data: { paid: Boolean(paid), paidAt: paid ? new Date() : null },
    })
    return NextResponse.json(person)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}
