import { useEffect, useState } from 'react'

export const MOBILE_BREAKPOINT = 820

function getWidth(): number {
  if (typeof window === 'undefined') return 1200
  return window.innerWidth
}

export function useViewport() {
  const [width, setWidth] = useState(getWidth)

  useEffect(() => {
    let frame: number | null = null
    function onResize() {
      if (frame !== null) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setWidth(window.innerWidth))
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  return {
    width,
    isMobile: width < MOBILE_BREAKPOINT,
    isDesktop: width >= MOBILE_BREAKPOINT,
  }
}
