"use client";

import { useEffect } from "react";

// App version - CHANGE THIS when deploying major updates to force cache refresh
const APP_VERSION = "1.0.1";

export default function CacheBuster() {
  useEffect(() => {
    const clearAllCaches = async () => {
      try {
        // Check if version changed
        const storedVersion = localStorage.getItem("app_version");
        
        if (storedVersion !== APP_VERSION) {
          console.log("[CacheBuster] New version detected:", APP_VERSION);
          
          // Clear localStorage except user session
          const userSession = localStorage.getItem("currentUser");
          localStorage.clear();
          if (userSession) {
            localStorage.setItem("currentUser", userSession);
          }
          localStorage.setItem("app_version", APP_VERSION);
          
          // Clear sessionStorage
          sessionStorage.clear();
          
          // Clear service worker caches
          if ("caches" in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map((cacheName) => caches.delete(cacheName))
            );
            console.log("[CacheBuster] Service Worker caches cleared");
          }
          
          // Unregister service workers
          if ("serviceWorker" in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(
              registrations.map((registration) => registration.unregister())
            );
            console.log("[CacheBuster] Service Workers unregistered");
          }
          
          // Reload to apply changes (only once)
          if (!sessionStorage.getItem("cache_cleared")) {
            sessionStorage.setItem("cache_cleared", "true");
            console.log("[CacheBuster] Reloading to apply changes...");
            window.location.reload();
          }
        }
      } catch (error) {
        console.error("[CacheBuster] Error clearing cache:", error);
      }
    };

    clearAllCaches();
  }, []);

  return null;
}
