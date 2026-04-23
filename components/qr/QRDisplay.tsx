"use client";

import React from 'react';

export default function QRDisplay({ payload } : { payload: string }) {
  return (
    <div>
      <h3>QR Payload</h3>
      <pre style={{ background: '#f5f5f5', padding: 8 }}>{payload}</pre>
    </div>
  );
}
