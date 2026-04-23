import { describe, it, expect } from 'vitest'
import { calcPerPerson } from './calculate'

const persons = [
  { id: 'a', name: 'มิน' },
  { id: 'b', name: 'บิ๊ก' },
  { id: 'c', name: 'เอ' },
]

describe('calcPerPerson', () => {
  it('หารเท่ากันเมื่อ assign ทั้งคู่', () => {
    const items = [{ price: 100, personIds: ['a', 'b'] }]
    const res = calcPerPerson(items, persons, 0, 0)
    expect(res.find(p => p.id === 'a')?.total).toBe(50)
    expect(res.find(p => p.id === 'b')?.total).toBe(50)
  })

  it('VAT 7% คิดถูกต้อง', () => {
    const items = [{ price: 100, personIds: ['a'] }]
    const res = calcPerPerson(items, persons, 7, 0)
    expect(res.find(p => p.id === 'a')?.total).toBe(107)
  })

  it('service charge 10% คิดถูกต้อง', () => {
    const items = [{ price: 100, personIds: ['a'] }]
    const res = calcPerPerson(items, persons, 0, 10)
    expect(res.find(p => p.id === 'a')?.total).toBe(110)
  })

  it('VAT + service charge พร้อมกัน', () => {
    const items = [{ price: 100, personIds: ['a'] }]
    const res = calcPerPerson(items, persons, 7, 10)
    expect(res.find(p => p.id === 'a')?.total).toBe(117)
  })

  it('คนที่ไม่ได้ assign ยอด = 0', () => {
    const items = [{ price: 100, personIds: ['a'] }]
    const res = calcPerPerson(items, persons, 0, 0)
    expect(res.find(p => p.id === 'b')?.total).toBe(0)
  })

  it('หาร 3 คน', () => {
    const items = [{ price: 300, personIds: ['a', 'b', 'c'] }]
    const res = calcPerPerson(items, persons, 0, 0)
    expect(res.find(p => p.id === 'a')?.total).toBe(100)
    expect(res.find(p => p.id === 'b')?.total).toBe(100)
    expect(res.find(p => p.id === 'c')?.total).toBe(100)
  })
})