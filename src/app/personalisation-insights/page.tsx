"use client";

import AuthGate from "@/components/AuthGate";
import PersonalisationInsightsView from "@/components/personalisation/PersonalisationInsightsView";

export default function PersonalisationInsightsPage() {
  return (
    <AuthGate>
      <PersonalisationInsightsView />
    </AuthGate>
  );
}
