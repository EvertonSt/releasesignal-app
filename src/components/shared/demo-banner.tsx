'use client';

export function DemoBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-warning/10 border-b border-warning/20 px-4 py-1.5 text-center">
      <p className="text-xs font-medium text-warning">
        Demo mode — synthetic test data; production integrations are not enabled.
      </p>
    </div>
  );
}
