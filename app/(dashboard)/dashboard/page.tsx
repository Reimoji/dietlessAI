'use client';

import { Settings } from './settings';
import { useEffect, useState } from 'react';
import { TeamDataWithMembers } from '@/lib/db/schema';

export default function SettingsPage() {
  const [teamData, setTeamData] = useState<TeamDataWithMembers | null>(null);

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
