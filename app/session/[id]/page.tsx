'use client'
export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/* ─── Types ────────────────────────────────────────────── */
type Person = { id: string; name: string; paid: boolean }
type ItemPerson = { personId: string; person: Person }
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

/* ─── Helpers ───────────────────────────────────────────── */
const fmt = (n: number) =>
  n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function SessionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Item form
  const [itemName, setItemName] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([])
  const [addingItem, setAddingItem] = useState(false)

  // Person form
  const [newPersonName, setNewPersonName] = useState('')
  const [addingPerson, setAddingPerson] = useState(false)

  // Edit session state
  const [isEditingSession, setIsEditingSession] = useState(false)
  const [editSessionData, setEditSessionData] = useState({
    name: '',
    promptpayNo: '',
    vatPct: 0,
    servicePct: 0
  })

  // Edit item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  // Edit person state
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null)
  const [editPersonName, setEditPersonName] = useState('')

  // Resolve params
  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  const load = useCallback(async () => {
    if (!id) return
    try {
      const res = await fetch(`/api/sessions/${id}`)
      if (!res.ok) throw new Error('Session not found')
      setSession(await res.json())
    } catch {
      setError('ไม่พบ session นี้')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  /* ─── Item actions ─────────────────────────────────── */
  const togglePerson = (pid: string) =>
    setSelectedPersonIds(prev =>
      prev.includes(pid) ? prev.filter(x => x !== pid) : [...prev, pid]
    )

  const selectAll = () =>
    setSelectedPersonIds(session?.persons.map(p => p.id) ?? [])

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName.trim() || !itemPrice) return
    setAddingItem(true)
    try {
      await fetch(`/api/sessions/${id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: itemName.trim(),
          price: Number(itemPrice),
          personIds: selectedPersonIds,
        }),
      })
      setItemName('')
      setItemPrice('')
      setSelectedPersonIds([])
      await load()
    } finally {
      setAddingItem(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    await fetch(`/api/sessions/${id}/items?itemId=${itemId}`, { method: 'DELETE' })
    await load()
  }

  /* ─── Person actions ───────────────────────────────── */
  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPersonName.trim()) return
    setAddingPerson(true)
    try {
      await fetch(`/api/sessions/${id}/persons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPersonName.trim() }),
      })
      setNewPersonName('')
      await load()
    } finally {
      setAddingPerson(false)
    }
  }

  const handleDeletePerson = async (personId: string) => {
    if (!confirm('ยืนยันลบคนนี้? รายการอาหารที่คนนี้หารอยู่จะหายไปด้วย')) return
    await fetch(`/api/sessions/${id}/persons?personId=${personId}`, { method: 'DELETE' })
    await load()
  }

  const handleUpdatePerson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editPersonName.trim() || !editingPersonId) return
    try {
      await fetch(`/api/sessions/${id}/persons`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId: editingPersonId, name: editPersonName.trim() }),
      })
      setEditingPersonId(null)
      setEditPersonName('')
      await load()
    } catch {
      alert('แก้ไขไม่สำเร็จ')
    }
  }

  /* ─── Session actions ──────────────────────────────── */
  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch(`/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editSessionData.name,
          promptpayNo: editSessionData.promptpayNo,
          vatPct: Number(editSessionData.vatPct),
          servicePct: Number(editSessionData.servicePct),
        }),
      })
      setIsEditingSession(false)
      await load()
    } catch (err) {
      alert('แก้ไขไม่สำเร็จ')
    }
  }

  const handleDeleteSession = async () => {
    if (!confirm('ยืนยันลบบิลนี้ถาวร? ข้อมูลทั้งหมดจะหายไป')) return
    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
      router.push('/')
    } catch {
      alert('ลบไม่สำเร็จ')
    }
  }

  const handleEditItem = (item: Item) => {
    setEditingItemId(item.id)
    setItemName(item.name)
    setItemPrice(item.price.toString())
    setSelectedPersonIds(item.persons.map(ip => ip.personId))
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName.trim() || !itemPrice || !editingItemId) return
    setAddingItem(true)
    try {
      await fetch(`/api/sessions/${id}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItemId,
          name: itemName.trim(),
          price: Number(itemPrice),
          personIds: selectedPersonIds,
        }),
      })
      setEditingItemId(null)
      setItemName('')
      setItemPrice('')
      setSelectedPersonIds([])
      await load()
    } finally {
      setAddingItem(false)
    }
  }

  const cancelEdit = () => {
    setEditingItemId(null)
    setItemName('')
    setItemPrice('')
    setSelectedPersonIds([])
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('คัดลอกลิงก์แล้ว!')
  }

  /* ─── Totals ───────────────────────────────────────── */
  const subtotal = session
    ? session.items.reduce((s, it) => s + Number(it.price), 0)
    : 0
  const multiplier = session ? 1 + session.vatPct / 100 + session.servicePct / 100 : 1
  const grandTotal = subtotal * multiplier

  /* ─── Render ───────────────────────────────────────── */
  if (loading) return <LoadingShell />
  if (error || !session) return <ErrorShell msg={error} />

  return (
    <div className="page-shell">
      {/* Top nav */}
      <header className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
            ← กลับหน้าหลัก
          </Link>
          <div className="flex gap-2">
            <button onClick={copyLink} className="btn btn-outline btn-sm">
              🔗 คัดลอกลิงก์
            </button>
            <Link
              href={`/session/${id}/summary`}
              className="btn btn-primary btn-sm"
              id="go-summary-btn"
            >
              ดูสรุปบิล →
            </Link>
          </div>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{session.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm" style={{ color: 'var(--muted)' }}>
              {session.promptpayNo && (
                <span className="flex items-center gap-1">
                  💳 PromptPay: <span className="font-medium text-fg">{session.promptpayNo}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                🧾 VAT {session.vatPct}% | Service {session.servicePct}%
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setEditSessionData({
                name: session.name,
                promptpayNo: session.promptpayNo ?? '',
                vatPct: session.vatPct,
                servicePct: session.servicePct
              })
              setIsEditingSession(true)
            }}
            className="btn btn-outline btn-sm"
            style={{ marginTop: '0.25rem' }}
          >
            ⚙️ ตั้งค่า
          </button>
        </div>
      </header>

      <main className="w-full max-w-2xl flex flex-col gap-5">
        {/* Settings Form (Inline) */}
        {isEditingSession && (
          <section className="card bg-blue-50/50 border-blue-100 animate-fade-in-up">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              ⚙️ ตั้งค่าบิล
            </h2>
            <form onSubmit={handleUpdateSession} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">ชื่อโต๊ะ / โอกาส</label>
                  <input
                    className="input"
                    value={editSessionData.name}
                    onChange={e => setEditSessionData({ ...editSessionData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">PromptPay (เจ้าบิล)</label>
                  <input
                    className="input"
                    value={editSessionData.promptpayNo}
                    onChange={e => setEditSessionData({ ...editSessionData, promptpayNo: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">VAT (%)</label>
                  <input
                    className="input"
                    type="number"
                    value={editSessionData.vatPct}
                    onChange={e => setEditSessionData({ ...editSessionData, vatPct: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Service Charge (%)</label>
                  <input
                    className="input"
                    type="number"
                    value={editSessionData.servicePct}
                    onChange={e => setEditSessionData({ ...editSessionData, servicePct: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleDeleteSession}
                >
                  🗑️ ลบบิลนี้ถาวร
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setIsEditingSession(false)}
                  >
                    ยกเลิก
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    บันทึกการตั้งค่า
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        {/* Persons section */}
        <section className="card">
          <h2 className="font-medium mb-3">👥 คนในโต๊ะ ({session.persons.length} คน)</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {session.persons.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-1.5 tag"
                style={{ paddingRight: '0.375rem' }}
              >
                {editingPersonId === p.id ? (
                  <form onSubmit={handleUpdatePerson} className="flex items-center gap-1">
                    <input
                      className="input py-0 px-1 text-xs"
                      style={{ width: '80px', height: '24px' }}
                      value={editPersonName}
                      onChange={e => setEditPersonName(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="text-[10px]">✅</button>
                    <button type="button" onClick={() => setEditingPersonId(null)} className="text-[10px]">❌</button>
                  </form>
                ) : (
                  <>
                    <span
                      onClick={() => {
                        setEditingPersonId(p.id)
                        setEditPersonName(p.name)
                      }}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      {p.name}
                    </span>
                    <button
                      onClick={() => handleDeletePerson(p.id)}
                      className="btn-ghost btn-sm"
                      style={{
                        padding: '0 0.2rem',
                        fontSize: '0.7rem',
                        lineHeight: 1,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: 'var(--muted)',
                      }}
                      aria-label={`ลบ ${p.name}`}
                      title={`ลบ ${p.name}`}
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            ))}
            {session.persons.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>ยังไม่มีคน</p>
            )}
          </div>
          <form onSubmit={handleAddPerson} className="flex gap-2">
            <input
              className="input"
              placeholder="ชื่อคนใหม่"
              value={newPersonName}
              onChange={e => setNewPersonName(e.target.value)}
              id="new-person-input"
            />
            <button
              type="submit"
              className="btn btn-outline btn-sm"
              disabled={addingPerson}
              id="add-person-btn"
              style={{ whiteSpace: 'nowrap' }}
            >
              + เพิ่มคน
            </button>
          </form>
        </section>

        {/* Add/Edit item form */}
        <section className={`card ${editingItemId ? 'border-primary ring-1 ring-primary/20' : ''}`}>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            {editingItemId ? '✏️ แก้ไขรายการ' : '➕ เพิ่มรายการ'}
          </h2>
          <form onSubmit={editingItemId ? handleUpdateItem : handleAddItem} className="flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="label" htmlFor="item-name">ชื่อรายการ</label>
                <input
                  id="item-name"
                  className="input"
                  placeholder="เช่น ไก่ทอด"
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  required
                />
              </div>
              <div style={{ width: '120px' }}>
                <label className="label" htmlFor="item-price">ราคา (บาท)</label>
                <input
                  id="item-price"
                  className="input"
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="0"
                  value={itemPrice}
                  onChange={e => setItemPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Person assignment */}
            {session.persons.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="label" style={{ marginBottom: 0 }}>แบ่งให้ใคร</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={selectAll}
                  >
                    เลือกทุกคน
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {session.persons.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className={`tag tag-btn ${selectedPersonIds.includes(p.id) ? 'active' : ''}`}
                      onClick={() => togglePerson(p.id)}
                      id={`assign-${p.id}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                {selectedPersonIds.length === 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    ยังไม่ได้เลือกคน (จะไม่แบ่งบิล)
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-2">
              {editingItemId && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={cancelEdit}
                >
                  ยกเลิกการแก้ไข
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={addingItem}
                id="add-item-btn"
              >
                {addingItem ? 'กำลังบันทึก…' : editingItemId ? 'บันทึกการแก้ไข' : '+ เพิ่มรายการ'}
              </button>
            </div>
          </form>
        </section>

        {/* Item list */}
        <section className="card">
          <h2 className="font-medium mb-3">🧾 รายการทั้งหมด ({session.items.length})</h2>
          {session.items.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>ยังไม่มีรายการ</p>
          ) : (
            <div className="flex flex-col gap-0">
              {session.items.map((item, i) => (
                <div key={item.id}>
                  {i > 0 && <hr className="divider" style={{ margin: '0.75rem 0' }} />}
                  <div className="flex items-start justify-between gap-3 list-item-hover p-2 -mx-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.persons.length === 0 ? (
                          <span className="text-xs" style={{ color: 'var(--muted)' }}>ไม่ได้แบ่ง</span>
                        ) : (
                          item.persons.map(ip => (
                            <span key={ip.personId} className="tag" style={{ fontSize: '0.7rem', padding: '0.125rem 0.45rem' }}>
                              {ip.person.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ whiteSpace: 'nowrap' }}>
                        ฿{fmt(Number(item.price))}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.25rem 0.5rem' }}
                          title="แก้ไข"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.25rem 0.5rem' }}
                          aria-label={`ลบ ${item.name}`}
                          id={`delete-item-${item.id}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          {session.items.length > 0 && (
            <>
              <hr className="divider" />
              <div className="flex flex-col gap-1 text-sm" style={{ color: 'var(--muted)' }}>
                <div className="flex justify-between">
                  <span>ยอดก่อนภาษี</span>
                  <span>฿{fmt(subtotal)}</span>
                </div>
                {session.vatPct > 0 && (
                  <div className="flex justify-between">
                    <span>VAT {session.vatPct}%</span>
                    <span>฿{fmt(subtotal * session.vatPct / 100)}</span>
                  </div>
                )}
                {session.servicePct > 0 && (
                  <div className="flex justify-between">
                    <span>ค่าบริการ {session.servicePct}%</span>
                    <span>฿{fmt(subtotal * session.servicePct / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold" style={{ color: 'var(--fg)', marginTop: '0.25rem' }}>
                  <span>รวมทั้งหมด</span>
                  <span>฿{fmt(grandTotal)}</span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Pay links */}
        {session.persons.length > 0 && session.items.length > 0 && (
          <section className="card">
            <h2 className="font-medium mb-3">💳 ลิงก์จ่ายเงินรายคน</h2>
            <div className="flex flex-col gap-2">
              {session.persons.map(p => (
                <Link
                  key={p.id}
                  href={`/session/${id}/pay/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border text-sm hover:bg-gray-50 transition-colors"
                  style={{ borderColor: 'var(--border)' }}
                  id={`pay-link-${p.id}`}
                >
                  <span className="font-medium">{p.name}</span>
                  <span style={{ color: 'var(--muted)' }}>ดู QR →</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function LoadingShell() {
  return (
    <div className="page-shell items-center justify-center">
      <p style={{ color: 'var(--muted)' }}>กำลังโหลด…</p>
    </div>
  )
}

function ErrorShell({ msg }: { msg: string }) {
  return (
    <div className="page-shell items-center justify-center">
      <div className="card text-center">
        <p className="font-medium mb-2">เกิดข้อผิดพลาด</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>{msg || 'ไม่พบ session'}</p>
        <Link href="/" className="btn btn-outline btn-sm mt-4 inline-block">กลับหน้าหลัก</Link>
      </div>
    </div>
  )
}
