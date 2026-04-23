'use client'
export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { calcPerPerson, type PersonResult } from '../../../../lib/calculate'

type Person = { id: string; name: string; paid: boolean; paidAt: string | null }
type ItemPerson = { personId: string }
type Item = { id: string; name: string; price: string | number; persons: ItemPerson[] }
type Session = {
  id: string
  name: string
  vatPct: number
  servicePct: number
  promptpayNo: string | null
  persons: Person[]
  items: Item[]
}

const fmt = (n: number) =>
  n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function SummaryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => { params.then(p => setId(p.id)) }, [params])

  const load = useCallback(async () => {
    if (!id) return
    try {
      const res = await fetch(`/api/sessions/${id}`)
      if (!res.ok) throw new Error('Not found')
      setSession(await res.json())
    } catch {
      setError('ไม่พบ session นี้')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const togglePaid = async (person: Person) => {
    setTogglingId(person.id)
    try {
      await fetch(`/api/sessions/${id}/payments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId: person.id, paid: !person.paid }),
      })
      await load()
    } finally {
      setTogglingId(null)
    }
  }

  const resetAll = async () => {
    if (!confirm('ยืนยันล้างสถานะการจ่ายเงินทั้งหมด?')) return
    await fetch(`/api/sessions/${id}/payments`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId: 'all' }),
    })
    await load()
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('คัดลอกลิงก์สรุปแล้ว!')
  }

  if (loading) {
    return (
      <div className="page-shell items-center justify-center">
        <p style={{ color: 'var(--muted)' }}>กำลังโหลด…</p>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="page-shell items-center justify-center">
        <div className="card text-center">
          <p className="font-medium mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>{error}</p>
          <Link href="/" className="btn btn-outline btn-sm">กลับหน้าหลัก</Link>
        </div>
      </div>
    )
  }

  // Compute per-person amounts
  const itemsForCalc = session.items.map(it => ({
    price: Number(it.price),
    personIds: it.persons.map(ip => ip.personId),
  }))
  const results: PersonResult[] = calcPerPerson(
    itemsForCalc,
    session.persons,
    session.vatPct,
    session.servicePct
  )

  // Merge paid status
  const enriched = results.map(r => {
    const p = session.persons.find(x => x.id === r.id)!
    return { ...r, paid: p.paid, paidAt: p.paidAt }
  })

  const paidCount = enriched.filter(x => x.paid).length
  const totalOwed = enriched.reduce((s, x) => s + x.total, 0)
  const totalPaid = enriched.filter(x => x.paid).reduce((s, x) => s + x.total, 0)
  const allPaid = paidCount === enriched.length && enriched.length > 0

  return (
    <div className="page-shell">
      {/* Header */}
      <header className="w-full max-w-lg mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link href={`/session/${id}`} className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
            ← กลับไปแก้บิล
          </Link>
          <button onClick={copyLink} className="btn btn-outline btn-sm">
            🔗 แชร์สรุปบิล
          </button>
        </div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{session.name}</h1>
          {allPaid && (
            <span className="badge badge-paid">
              ✓ จ่ายครบแล้ว
            </span>
          )}
        </div>
      </header>

      <main className="w-full max-w-lg flex flex-col gap-5">
        {/* Progress card */}
        <div className="card bg-gradient-to-br from-white to-slate-50 animate-fade-in-up">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>สถานะการจ่าย</p>
              <p className="text-3xl font-bold mt-1">
                {paidCount} <span className="text-lg font-normal text-slate-400">/ {enriched.length} คน</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>ยอดรับแล้ว</p>
              <p className="text-3xl font-bold mt-1 text-emerald-600">฿{fmt(totalPaid)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
            <div
              className="h-full bg-primary transition-all duration-700 ease-out rounded-full shadow-lg shadow-primary/20"
              style={{
                width: enriched.length > 0 ? `${(paidCount / enriched.length) * 100}%` : '0%',
              }}
            />
          </div>

          <div className="flex justify-between text-sm font-medium">
            <span style={{ color: 'var(--muted)' }}>รวมทั้งหมด ฿{fmt(totalOwed)}</span>
            <span className="text-rose-600">ค้างอยู่ ฿{fmt(totalOwed - totalPaid)}</span>
          </div>
        </div>

        {/* Per-person list */}
        <div className="card">
          <h2 className="font-medium mb-3">รายละเอียดรายคน</h2>
          <div className="flex flex-col gap-0">
            {enriched.map((r, i) => (
              <div key={r.id}>
                {i > 0 && <hr className="divider" style={{ margin: '0.75rem 0' }} />}
                <div className="flex items-center gap-3 list-item-hover p-2 -mx-2">
                  {/* Status dot */}
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: r.paid ? '#16a34a' : 'var(--border-strong)',
                      flexShrink: 0,
                    }}
                  />

                  {/* Name & amount */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{r.name}</span>
                      <span
                        className={`badge ${r.paid ? 'badge-paid' : 'badge-unpaid'}`}
                      >
                        {r.paid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
                      <span>ยอด ฿{fmt(r.subtotal)}</span>
                      <span>รวม ฿{fmt(r.total)}</span>
                    </div>
                    {r.paidAt && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                        จ่ายเมื่อ{' '}
                        {new Date(r.paidAt).toLocaleString('th-TH', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 items-center">
                    {!r.paid && session.promptpayNo && (
                      <Link
                        href={`/session/${id}/pay/${r.id}`}
                        className="btn btn-outline btn-sm"
                        id={`qr-link-${r.id}`}
                      >
                        QR
                      </Link>
                    )}
                    <button
                      id={`toggle-paid-${r.id}`}
                      className={`btn btn-sm ${r.paid ? 'btn-ghost' : 'btn-primary'}`}
                      onClick={() => togglePaid(session.persons.find(p => p.id === r.id)!)}
                      disabled={togglingId === r.id}
                    >
                      {togglingId === r.id
                        ? '…'
                        : r.paid
                        ? 'ยกเลิก'
                        : '✓ จ่ายแล้ว'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {enriched.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>ยังไม่มีคนในบิลนี้</p>
            )}
          </div>
        </div>

        {/* Breakdown */}
        {session.items.length > 0 && (
          <div className="card">
            <h2 className="font-medium mb-3">รายการอาหาร ({session.items.length})</h2>
            <div className="flex flex-col gap-0 text-sm">
              {session.items.map((item, i) => (
                <div key={item.id}>
                  {i > 0 && <hr className="divider" style={{ margin: '0.5rem 0' }} />}
                  <div className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="font-medium">฿{fmt(Number(item.price))}</span>
                  </div>
                </div>
              ))}
            </div>

            <hr className="divider" />
            <div className="text-sm flex flex-col gap-1" style={{ color: 'var(--muted)' }}>
              <div className="flex justify-between">
                <span>ยอดก่อนภาษี</span>
                <span>
                  ฿{fmt(session.items.reduce((s, it) => s + Number(it.price), 0))}
                </span>
              </div>
              {session.vatPct > 0 && (
                <div className="flex justify-between">
                  <span>VAT {session.vatPct}%</span>
                  <span>
                    ฿{fmt(session.items.reduce((s, it) => s + Number(it.price), 0) * session.vatPct / 100)}
                  </span>
                </div>
              )}
              {session.servicePct > 0 && (
                <div className="flex justify-between">
                  <span>ค่าบริการ {session.servicePct}%</span>
                  <span>
                    ฿{fmt(session.items.reduce((s, it) => s + Number(it.price), 0) * session.servicePct / 100)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold" style={{ color: 'var(--fg)' }}>
                <span>รวมทั้งหมด</span>
                <span>฿{fmt(totalOwed)}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={resetAll}
          className="btn btn-outline btn-sm"
          style={{ alignSelf: 'center', marginTop: '1rem', color: 'var(--muted)' }}
        >
          🔄 ล้างสถานะการจ่ายทั้งหมด
        </button>
      </main>
    </div>
  )
}
