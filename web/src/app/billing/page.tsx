'use client';
import { useState } from 'react';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  
  const handleSubscribe = async (tier: string) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4201/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, orgId: 'mock-org-123' })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-24 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Billing & Plans</h1>
      <div className="grid grid-cols-2 gap-8">
        <div className="border p-8 rounded-lg shadow-sm bg-white">
          <h2 className="text-2xl font-bold">Pro Plan</h2>
          <p className="mt-4 text-gray-600">$49/month. Advanced reporting and 5 users.</p>
          <button 
            onClick={() => handleSubscribe('pro')}
            disabled={loading}
            className="mt-6 w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition"
          >
            Upgrade to Pro
          </button>
        </div>
        <div className="border p-8 rounded-lg shadow-sm bg-white">
          <h2 className="text-2xl font-bold">Enterprise</h2>
          <p className="mt-4 text-gray-600">$199/month. Unlimited users, API access, RAG search.</p>
          <button 
            onClick={() => handleSubscribe('enterprise')}
            disabled={loading}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Upgrade to Enterprise
          </button>
        </div>
      </div>
    </div>
  );
}
