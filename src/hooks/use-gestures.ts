import { useEffect, useRef, useState } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

const SWIPE_THRESHOLD = 50
const SWIPE_TIME_THRESHOLD = 300

export function useSwipeGestures(handlers: SwipeHandlers, enabled = true) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)

  useEffect(() => {
    if (!enabled) return

    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now(),
      }

      const diffX = touchStart.current.x - touchEnd.x
      const diffY = touchStart.current.y - touchEnd.y
      const timeDiff = touchEnd.time - touchStart.current.time

      if (timeDiff > SWIPE_TIME_THRESHOLD) {
        touchStart.current = null
        return
      }

      // Horizontal swipes
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > SWIPE_THRESHOLD && handlers.onSwipeLeft) {
          handlers.onSwipeLeft()
        } else if (diffX < -SWIPE_THRESHOLD && handlers.onSwipeRight) {
          handlers.onSwipeRight()
        }
      }
      // Vertical swipes
      else {
        if (diffY > SWIPE_THRESHOLD && handlers.onSwipeUp) {
          handlers.onSwipeUp()
        } else if (diffY < -SWIPE_THRESHOLD && handlers.onSwipeDown) {
          handlers.onSwipeDown()
        }
      }

      touchStart.current = null
    }

    document.addEventListener('touchstart', handleTouchStart, false)
    document.addEventListener('touchend', handleTouchEnd, false)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, false)
      document.removeEventListener('touchend', handleTouchEnd, false)
    }
  }, [handlers, enabled])
}

export function useTouchPosition() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      setPosition({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      })
    }

    const handleTouchEnd = () => {
      setPosition(null)
    }

    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  return position
}
