import { Card, Skeleton } from './Primitives'

/** Shown while a route chunk downloads — mirrors the dashboard's real shape. */
export default function RouteFallback() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading">
      <div><Skeleton className="h-6 w-56 mb-2" /><Skeleton className="h-4 w-80" /></div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4"><Skeleton className="h-3 w-24 mb-3" /><Skeleton className="h-7 w-16" /></Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 h-72"><Skeleton className="h-full w-full" /></Card>
        <Card className="p-5 h-72 lg:col-span-2"><Skeleton className="h-full w-full" /></Card>
      </div>
    </div>
  )
}
