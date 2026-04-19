'use client'

import { useEffect } from 'react'

export function KeepAlive() {
  useEffect(() => {
    // Keep alive interval: 5 minutes (300,000 ms)
    const INTERVAL = 5 * 60 * 1000
    
    const ping = async () => {
      try {
        await fetch('/api/health')
      } catch (err) {
        // Silent fail, just a background task
      }
    }

    // Initial ping
    ping()

    const timer = setInterval(ping, INTERVAL)
    return () => clearInterval(timer)
  }, [])

  return null // Non-visual component
}
