import { Construction } from 'lucide-react'
import { Card, EmptyState } from '../../components/ui/Primitives'

/** Routes reachable from the menu but not part of this build's scope. */
export default function Placeholder({ title }) {
  return (
    <Card>
      <EmptyState icon={Construction} title={`${title} is not part of this build`}
        body="The route, navigation entry and permissions are wired up — the module screen itself is still to be built." />
    </Card>
  )
}
