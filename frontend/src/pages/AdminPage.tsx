// frontend/src/pages/AdminPage.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '../components/admin/AdminLayout'
import { DashboardTab } from '../components/admin/tabs/DashboardTab'
import { MembersTab } from '../components/admin/tabs/MembersTab'
import { DataVizTab } from '../components/admin/tabs/DataVizTab'
import { AnnouncementsTab } from '../components/admin/tabs/AnnouncementsTab'
import { SettingsTab } from '../components/admin/tabs/SettingsTab'

export default function AdminPage() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardTab />} />
        <Route path="members" element={<MembersTab />} />
        <Route path="data-viz" element={<DataVizTab />} />
        <Route path="announcements" element={<AnnouncementsTab />} />
        <Route path="settings" element={<SettingsTab />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  )
}
