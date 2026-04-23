"use client";

import React from 'react';

export default function PaymentStatus({ sessionId } : { sessionId: string }) {
  const [status, setStatus] = React.useState<any>(null);
  React.useEffect(() => {
    async function load() {
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();
      setStatus(data);
    }
    load();
  }, [sessionId]);
  return (
    <div>
      <h3>Payment status</h3>
      <pre>{JSON.stringify(status?.people || [], null, 2)}</pre>
    </div>
  );
}
