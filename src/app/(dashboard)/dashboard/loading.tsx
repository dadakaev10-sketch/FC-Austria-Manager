export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page header skeleton */}
      <div>
        <div className="h-8 w-40 rounded-lg bg-gray-200" />
        <div className="mt-2 h-4 w-72 rounded-lg bg-gray-200" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-gray-200" />
                <div className="h-7 w-16 rounded bg-gray-200" />
                <div className="h-3 w-20 rounded bg-gray-200" />
              </div>
              <div className="h-11 w-11 rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Two-column skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Training card skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="h-5 w-36 rounded bg-gray-200" />
          </div>
          <div className="space-y-4 px-6 py-4">
            <div className="h-5 w-48 rounded bg-gray-200" />
            <div className="h-4 w-20 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="h-4 w-28 rounded bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Matches card skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="h-5 w-40 rounded bg-gray-200" />
          </div>
          <div className="divide-y divide-gray-100 px-6 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="space-y-1">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-24 rounded bg-gray-200" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-10 rounded-full bg-gray-200" />
                  <div className="h-5 w-14 rounded-full bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements card skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="h-5 w-36 rounded bg-gray-200" />
        </div>
        <div className="divide-y divide-gray-100 px-6 py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex-1 space-y-1">
                <div className="h-4 w-64 rounded bg-gray-200" />
                <div className="h-3 w-40 rounded bg-gray-200" />
              </div>
              <div className="h-5 w-20 rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
