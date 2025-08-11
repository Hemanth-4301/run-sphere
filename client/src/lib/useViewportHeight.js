"use client"

import { useEffect } from "react"

// Sets CSS variable --app-vh to 1% of the viewport height to get stable mobile heights
export function useViewportHeight() {
  useEffect(() => {
    const set = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--app-vh", `${vh}px`)
    }
    set()
    window.addEventListener("resize", set)
    window.addEventListener("orientationchange", set)
    return () => {
      window.removeEventListener("resize", set)
      window.removeEventListener("orientationchange", set)
    }
  }, [])
}
