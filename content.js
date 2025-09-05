// YouTube Ad Hider Content Script
// This script hides, mutes, and skips YouTube ads for a seamless experience.
// It uses MutationObserver to detect ads dynamically and handles edge cases.

(function () {
  // --- Optional: Toast notification for ad skipping ---
  function showToast(message) {
    // Only show if user wants (set to false to disable)
    const ENABLE_TOAST = false; // Change to true to enable notification
    if (!ENABLE_TOAST) return;
    if (document.getElementById('yt-ad-toast')) return; // Prevent duplicates
    const toast = document.createElement('div');
    toast.id = 'yt-ad-toast';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '40px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(0,0,0,0.85)';
    toast.style.color = '#fff';
    toast.style.padding = '10px 24px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '16px';
    toast.style.zIndex = 99999;
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 1200);
  }

  // --- Core Ad Handling Logic ---
  function isAdPlaying() {
    // YouTube adds .ad-showing to the main player during ads
    const player = document.querySelector('.html5-video-player');
    if (player && player.classList.contains('ad-showing')) return true;
    // Fallback: check body (rare)
    if (document.body.classList.contains('ad-showing')) return true;
    return false;
  }

  function handleAds() {
    const video = document.querySelector('video');
    const skipButton = document.querySelector('.ytp-ad-skip-button');
    const adDuration = document.querySelector('.ytp-ad-duration-remaining');

    if (isAdPlaying()) {
      if (video) {
        video.muted = true;
        video.playbackRate = 16;
      }
      if (skipButton && skipButton.offsetParent !== null) {
        skipButton.click();
        showToast('Ad skipped!');
      } else if (video && adDuration) {
        // Try to jump to end of ad
        try {
          video.currentTime = video.duration;
          showToast('Ad skipped!');
        } catch (e) {}
      }
    } else {
      // Always restore normal playback if not in ad
      if (video) {
        video.muted = false;
        video.playbackRate = 1;
      }
    }
  }

  // --- MutationObserver to detect DOM changes ---
  const observer = new MutationObserver(() => {
    try {
      handleAds();
    } catch (e) {
      // Fail silently to avoid breaking YouTube
    }
  });

  function startObserver() {
    if (!document.body) return;
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    handleAds(); // Initial check
  }

  // Wait for body to be available
  if (document.body) {
    startObserver();
  } else {
    window.addEventListener('DOMContentLoaded', startObserver);
  }

  // Clean up observer on unload
  window.addEventListener('unload', () => {
    observer.disconnect();
  });

  // --- Guide for updating ad selectors (for non-technical users) ---
  // If ads are not being hidden/skipped, YouTube may have changed their ad element class names.
  // To update:
  // 1. Right-click on the ad or ad banner and select "Inspect" in Chrome.
  // 2. Look for elements with class names like .ytp-ad-*, .ad-container, .video-ads, etc.
  // 3. Add new class names to styles.css (for hiding) or to the selectors in this script (for detection/skipping).
})(); 