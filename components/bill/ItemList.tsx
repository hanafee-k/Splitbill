"use client";

import React, { useEffect, useState } from 'react';

export default function ItemList({ sessionId } : { sessionId: string }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();
      setItems(data?.items || []);
    }
    load();
  }, [sessionId]);
  return (
    <ul>
      {items.map((it: any) => (
        <li key={it.id}>{it.name} — {it.amount}</li>
      ))}
    </ul>
  );
}
