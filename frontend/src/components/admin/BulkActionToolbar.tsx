// frontend/src/components/admin/BulkActionToolbar.tsx
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '../ui/Button'

interface BulkActionToolbarProps {
  selectedCount: number
  onApprove: () => void
  onReject: () => void
  disabled: boolean
}

export function BulkActionToolbar({
  selectedCount,
  onApprove,
  onReject,
  disabled,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 py-3 bg-sbg-navy-light border border-sbg-purple/30 rounded-[8px] mb-4">
      <span className="text-sm font-mono text-sbg-text">
        {selectedCount} selected
      </span>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="primary"
          icon={<CheckCircle className="w-4 h-4" />}
          disabled={disabled}
          onClick={onApprove}
        >
          Approve Selected
        </Button>
        <Button
          size="sm"
          variant="danger"
          icon={<XCircle className="w-4 h-4" />}
          disabled={disabled}
          onClick={onReject}
        >
          Reject Selected
        </Button>
      </div>
    </div>
  )
}
