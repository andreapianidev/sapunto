export function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-6 animate-pulse">
      {/* Title */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-muted rounded" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>
      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>
      {/* Chart area */}
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-xl border bg-card p-6">
          <div className="h-5 w-40 bg-muted rounded mb-4" />
          <div className="h-64 bg-muted rounded" />
        </div>
        <div className="lg:col-span-3 rounded-xl border bg-card p-6">
          <div className="h-5 w-32 bg-muted rounded mb-4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-36 bg-muted rounded" />
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
      {/* Filter bar */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex gap-3">
          <div className="h-9 flex-1 bg-muted rounded" />
          <div className="h-9 w-40 bg-muted rounded" />
          <div className="h-9 w-40 bg-muted rounded" />
        </div>
      </div>
      {/* Table */}
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <div className="flex gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-24 bg-muted rounded" />
            ))}
          </div>
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex gap-8 p-4 border-b last:border-0">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="h-4 w-24 bg-muted rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
