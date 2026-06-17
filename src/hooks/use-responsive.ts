import { useEffect, useState } from 'react'

// Tailwind breakpoints
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

export function useBreakpoint(breakpoint: Breakpoint = 'md') {
  const [isAtBreakpoint, setIsAtBreakpoint] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`)
    setIsAtBreakpoint(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => {
      setIsAtBreakpoint(e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [breakpoint])

  return isAtBreakpoint
}

export function useIsMobile() {
  return !useBreakpoint('md')
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkTablet = () => {
      const mdQuery = window.matchMedia(`(min-width: ${BREAKPOINTS.md}px)`)
      const lgQuery = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`)
      setIsTablet(mdQuery.matches && !lgQuery.matches)
    }

    checkTablet()
    const handler = () => checkTablet()

    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return isTablet
}

export function useIsDesktop() {
  return useBreakpoint('lg')
}

export function useScreenSize() {
  const [size, setSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth

      if (width < BREAKPOINTS.md) {
        setSize('mobile')
      } else if (width < BREAKPOINTS.lg) {
        setSize('tablet')
      } else {
        setSize('desktop')
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return size
}
