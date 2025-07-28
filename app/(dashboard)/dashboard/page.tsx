'use client';

import { TeamDataWithMembers } from '@/lib/db/schema';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Settings } from './settings';

// Declare fbq for TypeScript
declare global {
  interface Window {
    fbq: any;
  }
}

function DashboardContent() {
  const [teamData, setTeamData] = useState<TeamDataWithMembers | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle Facebook Pixel Purchase tracking from Stripe checkout
    const fromCheckout = searchParams.get('from_checkout');
    const purchaseValue = searchParams.get('purchase_value');
    const subscriptionStatus = searchParams.get('subscription_status');
    const planInterval = searchParams.get('plan_interval');

    if (fromCheckout === 'true' && purchaseValue) {
      // Track the purchase completion
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Purchase', {
          value: parseFloat(purchaseValue),
          currency: 'EUR',
          content_type: 'subscription',
          content_category: planInterval === 'year' ? 'annual_plan' : 'monthly_plan'
        });

        console.log('Facebook Pixel Purchase tracked:', {
          value: parseFloat(purchaseValue),
          currency: 'EUR',
          subscription_status: subscriptionStatus,
          plan_interval: planInterval
        });
      }

      // Clean up URL parameters to avoid re-tracking on page refresh
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, '', '/dashboard');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchTeamData() {
      const response = await fetch('/api/team');
      if (response.ok) {
        const data = await response.json();
        setTeamData(data);
      }
    }
    fetchTeamData();
  }, []);

  if (!teamData) {
    return <div>Loading...</div>;
  }

  return <Settings teamData={teamData} />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}