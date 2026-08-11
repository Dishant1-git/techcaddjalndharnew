import { MediaBrowser } from '../../features/media/MediaBrowser'
import type { MediaRef } from '../../types'
import { Modal } from '../common/Modal'

interface MediaPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (items: MediaRef[]) => void
  multiple?: boolean
}

/** The media library in picker mode, wrapped in a dialog. */
export function MediaPicker({ open, onOpenChange, onSelect, multiple = false }: MediaPickerProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Media library"
      description={multiple ? 'Choose one or more files.' : 'Choose a file.'}
      size="xl"
      className="h-[calc(100dvh-6rem)]"
    >
      <MediaBrowser
        mode="picker"
        multiple={multiple}
        onConfirm={(items) => {
          onSelect(items)
          onOpenChange(false)
        }}
      />
    </Modal>
  )
}
