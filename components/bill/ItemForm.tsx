"use client";

import React, { useState } from 'react';

export default function ItemForm({ sessionId, onSaved } : { sessionId: string; onSaved?: () => void }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, amount: Number(amount) };
    await fetch(`/api/sessions/${sessionId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setName('');
    setAmount('');
    if (onSaved) onSaved();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      <input placeholder="Item name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Amount" type="number" value={amount as any} onChange={e => setAmount(e.target.value ? Number(e.target.value) : '')} />
      <button type="submit">Add</button>
    </form>
  );
}
