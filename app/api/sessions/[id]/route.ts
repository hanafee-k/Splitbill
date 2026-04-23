export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '../../../../lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getDb().session.findUnique({
    where: { id },
    include: {
      items: { include: { persons: { include: { person: true } } } },
      persons: true,
    },
  })
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(session)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await request.json()
  const updated = await getDb().session.update({ where: { id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await getDb().session.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
