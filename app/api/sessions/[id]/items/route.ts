export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '../../../../../lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const body = await request.json()
    // body: { name, price, personIds?: string[] }
    const { personIds = [], ...itemData } = body
    const item = await getDb().item.create({
      data: {
        ...itemData,
        price: Number(itemData.price),
        sessionId,
        persons: personIds.length > 0
          ? { create: (personIds as string[]).map((personId: string) => ({ personId })) }
          : undefined,
      },
      include: { persons: { include: { person: true } } },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const body = await request.json()
    const { id: itemId, name, price, personIds } = body

    if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 })

    // Update item and its person relations
    const item = await getDb().item.update({
      where: { id: itemId, sessionId },
      data: {
        name,
        price: price !== undefined ? Number(price) : undefined,
        persons: personIds !== undefined ? {
          deleteMany: {},
          create: (personIds as string[]).map((personId: string) => ({ personId })),
        } : undefined,
      },
      include: { persons: { include: { person: true } } },
    })

    return NextResponse.json(item)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const url = new URL(request.url)
    const itemId = url.searchParams.get('itemId')
    if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 })
    await getDb().item.delete({ where: { id: itemId, sessionId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
