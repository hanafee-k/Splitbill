export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '../../../../../lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const { name } = await request.json()
    const person = await getDb().person.create({ data: { name, sessionId } })
    return NextResponse.json(person, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to add person' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const { personId, name } = await request.json()
    if (!personId) return NextResponse.json({ error: 'personId required' }, { status: 400 })
    const person = await getDb().person.update({
      where: { id: personId, sessionId },
      data: { name },
    })
    return NextResponse.json(person)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update person' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const url = new URL(request.url)
    const personId = url.searchParams.get('personId')
    if (!personId) return NextResponse.json({ error: 'personId required' }, { status: 400 })
    await getDb().person.delete({ where: { id: personId, sessionId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete person' }, { status: 500 })
  }
}
