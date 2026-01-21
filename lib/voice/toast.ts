// Toast notification wrappers with voice-safe messages

import toast from 'react-hot-toast'
import { VOICE_COPY } from './voice'

export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 2000,
    position: 'bottom-center',
  })
}

export function showErrorToast(message: string) {
  toast.error(message, {
    duration: 3000,
    position: 'bottom-center',
  })
}

export function showCopiedToast() {
  showSuccessToast(VOICE_COPY.UI.status.copied)
}

export function showSavedToast() {
  showSuccessToast(VOICE_COPY.UI.status.saved)
}
