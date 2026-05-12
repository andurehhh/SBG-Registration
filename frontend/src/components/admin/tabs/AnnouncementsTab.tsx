// frontend/src/components/admin/tabs/AnnouncementsTab.tsx
import { AnnouncementComposer } from '../AnnouncementComposer'

export function AnnouncementsTab() {
  return (
    <div className="p-6 flex flex-col gap-6 h-full">
      <div>
        <h1 className="font-mono text-white text-2xl font-bold">Announcements</h1>
        <p className="text-sbg-text-muted text-sm mt-1">
          Compose and send email announcements to members
        </p>
      </div>
      <div className="flex-1">
        <AnnouncementComposer />
      </div>
    </div>
  )
}
