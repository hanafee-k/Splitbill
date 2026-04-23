export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '../../../lib/db'

export async function GET() {
  const sessions = await getDb().session.findMany({
    include: { items: true, persons: true },
  })
  return NextResponse.json(sessions)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // body: { name, vatPct, servicePct, promptpayNo, expiresAt, persons: string[] }
    const { persons: personNames = [], ...sessionData } = body
    const session = await getDb().session.create({
      data: {
        ...sessionData,
        expiresAt: sessionData.expiresAt
          ? new Date(sessionData.expiresAt)
          : new Date(Date.now() + 24 * 60 * 60 * 1000),
        persons: personNames.length > 0
          ? { create: (personNames as string[]).map((name: string) => ({ name })) }
          : undefined,
      },
      include: { persons: true, items: true },
    })
    return NextResponse.json(session, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
