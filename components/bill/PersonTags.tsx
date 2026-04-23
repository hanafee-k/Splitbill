"use client";

import React from 'react';

export default function PersonTags({ people, onToggle } : { people: any[]; onToggle?: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {people.map(p => (
        <button key={p.id} onClick={() => onToggle && onToggle(p.id)}>{p.name}</button>
      ))}
    </div>
  );
}
