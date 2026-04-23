'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [promptpayNo, setPromptpayNo] = useState('')
  const [vatPct, setVatPct] = useState(7)
  const [servicePct, setServicePct] = useState(10)
  const [persons, setPersons] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addPerson = () => setPersons(p => [...p, ''])
  const removePerson = (i: number) => setPersons(p => p.filter((_, idx) => idx !== i))
  const updatePerson = (i: number, v: string) =>
    setPersons(p => p.map((n, idx) => (idx === i ? v : n)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const validPersons = persons.map(p => p.trim()).filter(Boolean)
    if (!name.trim()) { setError('กรุณาระบุชื่อโต๊ะ'); return }
    if (validPersons.length === 0) { setError('กรุณาเพิ่มคนอย่างน้อย 1 คน'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          promptpayNo: promptpayNo.trim() || null,
          vatPct: Number(vatPct),
          servicePct: Number(servicePct),
          persons: validPersons,
        }),
      })
      if (!res.ok) throw new Error('สร้าง session ไม่สำเร็จ')
      const session = await res.json()
      router.push(`/session/${session.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell">
      {/* Header */}
      <header className="w-full max-w-lg mb-12 mt-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 rotate-3">
            <span className="text-3xl">🧾</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-fg to-muted bg-clip-text text-transparent">
            SplitBill
          </h1>
        </div>
        <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>
          หารบิลง่ายๆ แสกนจ่ายสะดวก
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)', opacity: 0.8 }}>
          รองรับ QR PromptPay พร้อมระบุยอดโอนรายคน
        </p>
      </header>

      <main className="w-full max-w-lg">
        <form onSubmit={handleSubmit} className="card flex flex-col gap-6 animate-fade-in-up">
          <h2 className="text-xl font-bold tracking-tight">สร้างบิลใหม่</h2>
          
          {/* Session name */}
          <div>
            <label className="label" htmlFor="session-name">ชื่อโต๊ะ / โอกาส</label>
            <input
              id="session-name"
              className="input"
              placeholder="เช่น ข้าวเย็น วันเกิดแอน"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* PromptPay */}
          <div>
            <label className="label" htmlFor="promptpay-no">เบอร์ PromptPay (ของเจ้าบิล)</label>
            <input
              id="promptpay-no"
              className="input"
              placeholder="0812345678"
              value={promptpayNo}
              onChange={e => setPromptpayNo(e.target.value)}
            />
          </div>

          {/* Tax & Service */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="vat-pct">VAT (%)</label>
              <input
                id="vat-pct"
                className="input"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={vatPct}
                onChange={e => setVatPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label" htmlFor="service-pct">Service (%)</label>
              <input
                id="service-pct"
                className="input"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={servicePct}
                onChange={e => setServicePct(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Persons */}
          <div>
            <label className="label">รายชื่อคนในโต๊ะ</label>
            <div className="flex flex-col gap-3">
              {persons.map((p, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="input"
                    placeholder={`คนที่ ${i + 1}`}
                    value={p}
                    onChange={e => updatePerson(i, e.target.value)}
                    id={`person-${i}`}
                  />
                  {persons.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.5rem' }}
                      onClick={() => removePerson(i)}
                      aria-label="ลบคนนี้"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline btn-sm w-full"
                onClick={addPerson}
              >
                + เพิ่มชื่อเพื่อน
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-shake">
              ⚠️ {error}
            </div>
          )}

          <button
            id="create-session-btn"
            type="submit"
            className="btn btn-primary w-full mt-2"
            disabled={loading}
          >
            {loading ? 'กำลังสร้าง…' : 'เริ่มแบ่งบิลเลย →'}
          </button>
        </form>
      </main>
    </div>
  )
}
