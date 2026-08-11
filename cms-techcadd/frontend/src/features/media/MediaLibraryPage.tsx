import { Card } from '../../components/common/Card'
import { PageHeader } from '../../components/layout/PageHeader'
import { MediaBrowser } from './MediaBrowser'

export default function MediaLibraryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="Images reused across courses, blogs, banners and the gallery"
      />

      <Card flush className="flex flex-col">
        <MediaBrowser mode="library" />
      </Card>
    </div>
  )
}
