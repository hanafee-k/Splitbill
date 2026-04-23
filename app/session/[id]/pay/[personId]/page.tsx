'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import QRCode from 'react-qr-code'

type QRData = {
  payload: string
  name: string
  subtotal: number
  total: number
  vatPct: number
  servicePct: number
  promptpayNo: string
}

const fmt = (n: number) =>
  n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function PayPage({
  params,
}: {
  params: Promise<{ id: string; personId: string }>
}) {
  const [id, setId] = useState('')
  const [personId, setPersonId] = useState('')
  const [data, setData] = useState<QRData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [markingPaid, setMarkingPaid] = useState(false)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    params.then(p => {
      setId(p.id)
      setPersonId(p.personId)
    })
  }, [params])

  useEffect(() => {
    if (!id || !personId) return
    setLoading(true)
    fetch(`/api/qr?sessionId=${id}&personId=${personId}`)
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error ?? 'ผิดพลาด')
        return res.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, personId])

  const handleMarkPaid = async () => {
    setMarkingPaid(true)
    try {
      await fetch(`/api/sessions/${id}/payments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId, paid: true }),
      })
      setPaid(true)
    } finally {
      setMarkingPaid(false)
    }
  }

  if (loading) {
    return (
      <div className="page-shell items-center justify-center">
        <p style={{ color: 'var(--muted)' }}>กำลังสร้าง QR…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="page-shell items-center justify-center">
        <div className="card text-center" style={{ maxWidth: 360 }}>
          <p className="font-medium mb-1">ไม่สามารถสร้าง QR ได้</p>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
            {error || 'กรุณาตรวจสอบว่ามีรายการและเบอร์ PromptPay'}
          </p>
          <Link href={`/session/${id}`} className="btn btn-outline btn-sm">← กลับ</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell items-center">
      {/* Nav */}
      <header className="w-full max-w-sm mb-10">
        <Link href={`/session/${id}`} className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
          ← กลับไปที่บิล
        </Link>
      </header>

      <main className="w-full max-w-sm flex flex-col gap-6">
        {/* Person header */}
        <div className="text-center">
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>โอนเงินให้คุณ</p>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{data.name}</h1>
          <p className="text-sm bg-slate-100 inline-block px-3 py-1 rounded-full font-medium" style={{ color: 'var(--muted)' }}>
            PromptPay: {data.promptpayNo}
          </p>
        </div>

        {/* Amount breakdown */}
        <div className="card shadow-xl shadow-slate-200/50">
          <div className="flex flex-col gap-2 text-sm font-medium mb-4" style={{ color: 'var(--muted)' }}>
            <div className="flex justify-between">
              <span>ค่าอาหาร/บริการ</span>
              <span className="text-fg">฿{fmt(data.subtotal)}</span>
            </div>
            {data.vatPct > 0 && (
              <div className="flex justify-between">
                <span>VAT {data.vatPct}%</span>
                <span className="text-fg">฿{fmt(data.subtotal * data.vatPct / 100)}</span>
              </div>
            )}
            {data.servicePct > 0 && (
              <div className="flex justify-between">
                <span>Service {data.servicePct}%</span>
                <span className="text-fg">฿{fmt(data.subtotal * data.servicePct / 100)}</span>
              </div>
            )}
          </div>
          <hr className="divider" style={{ margin: '1rem 0' }} />
          <div className="flex justify-between items-center">
            <span className="text-base font-bold">ยอดรวมสุทธิ</span>
            <span className="text-4xl font-black text-primary">฿{fmt(data.total)}</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="card flex flex-col items-center gap-6 py-8">
          {paid ? (
            <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl shadow-inner">
                ✓
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">บันทึกเรียบร้อย!</p>
                <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                  ขอบคุณ {data.name} สำหรับการชำระเงิน
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-sm font-bold mb-1">แสกนเพื่อจ่าย</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  เปิดแอปธนาคารเพื่อแสกน QR
                </p>
              </div>
              
              <div
                id="qr-code-container"
                className="p-4 bg-white rounded-2xl shadow-md border-4 border-slate-50"
                style={{ display: 'inline-flex' }}
              >
                <QRCode
                  value={data.payload}
                  size={220}
                  level="H"
                  fgColor="#0f172a"
                  bgColor="#ffffff"
                />
              </div>

              <div className="flex flex-col items-center gap-1">
                <p className="text-lg font-bold text-primary">฿{fmt(data.total)}</p>
                <p className="text-xs font-medium px-2 py-0.5 bg-slate-100 rounded" style={{ color: 'var(--muted)' }}>
                  {data.promptpayNo}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {!paid && (
          <button
            id="mark-paid-btn"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.65rem' }}
            onClick={handleMarkPaid}
            disabled={markingPaid}
          >
            {markingPaid ? 'กำลังบันทึก…' : '✓ ยืนยันจ่ายแล้ว (เจ้าบิลกด)'}
          </button>
        )}

        <Link
          href={`/session/${id}/summary`}
          className="btn btn-outline"
          id="go-summary-from-pay"
          style={{ width: '100%', textAlign: 'center' }}
        >
          ดูสรุปการจ่าย →
        </Link>
      </main>
    </div>
  )
}
