export type PersonResult = {
  id: string
  name: string
  subtotal: number
  total: number
}

type ItemWithPersons = {
  price: number | string
  personIds: string[]
}

type Person = {
  id: string
  name: string
}

export function calcPerPerson(
  items: ItemWithPersons[],
  persons: Person[],
  vatPct: number,
  servicePct: number
): PersonResult[] {
  const subtotals: Record<string, number> = {}

  for (const item of items) {
    if (item.personIds.length === 0) continue
    const share = Number(item.price) / item.personIds.length
    for (const pid of item.personIds) {
      subtotals[pid] = (subtotals[pid] ?? 0) + share
    }
  }

  const multiplier = 1 + vatPct / 100 + servicePct / 100

  return persons.map(p => {
    const sub = subtotals[p.id] ?? 0
    const total = Math.round(sub * multiplier * 100) / 100
    return { id: p.id, name: p.name, subtotal: sub, total }
  })
}