import * as React from "react"

const TABLET_MIN_WIDTH = 768
const TABLET_MAX_WIDTH = 1024 // Adjusted to properly separate tablets from desktop

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${TABLET_MIN_WIDTH}px) and (max-width: ${TABLET_MAX_WIDTH - 1}px)`)
    const onChange = () => {
      setIsTablet(window.innerWidth >= TABLET_MIN_WIDTH && window.innerWidth < TABLET_MAX_WIDTH)
    }
    mql.addEventListener("change", onChange)
    console.log('📱 TABLET DEBUG:', { 
      width: window.innerWidth, 
      isTablet: window.innerWidth >= TABLET_MIN_WIDTH && window.innerWidth < TABLET_MAX_WIDTH,
      minWidth: TABLET_MIN_WIDTH,
      maxWidth: TABLET_MAX_WIDTH
    });
    setIsTablet(window.innerWidth >= TABLET_MIN_WIDTH && window.innerWidth < TABLET_MAX_WIDTH)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTablet
}