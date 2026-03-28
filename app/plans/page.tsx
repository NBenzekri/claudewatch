'use client';

import { useState } from 'react';
import { usePlans } from '@/hooks/use-claude-data';
import PlanViewer from '@/components/plans/plan-viewer';
import type { PlanFile } from '@/lib/types';

export default function PlansPage() {
  const { data: plans } = usePlans();
  const [selectedPlan, setSelectedPlan] = useState<PlanFile | null>(null);

  const isRecent = (modifiedAt: number) => Date.now() - modifiedAt < 3600000;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Plans</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          {(plans || []).map((plan: PlanFile) => (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan(plan)}
              className={`rounded-lg bg-card p-3 cursor-pointer hover:bg-secondary/30 transition-colors ${
                selectedPlan?.name === plan.name ? 'ring-1 ring-primary' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate flex-1">{plan.name}</p>
                {isRecent(plan.modifiedAt) && (
                  <div className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(plan.modifiedAt).toLocaleDateString()} · {(plan.sizeBytes / 1024).toFixed(1)}KB
              </p>
            </div>
          ))}
          {(!plans || plans.length === 0) && (
            <p className="text-sm text-muted-foreground">No plans found</p>
          )}
        </div>

        <div className="md:col-span-2">
          {selectedPlan ? (
            <PlanViewer content={selectedPlan.content} />
          ) : (
            <div className="rounded-lg bg-card p-8 text-center text-sm text-muted-foreground">
              Select a plan to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
