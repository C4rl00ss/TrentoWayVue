// utils/loadGoogleMaps.js

let isLoaded = false

export function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (isLoaded || window.google) {
      resolve(window.google)
      return
    }

    window.initMap = () => {
      isLoaded = true
      resolve(window.google)
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`
    script.async = true
    script.defer = true
    script.onerror = reject
    document.head.appendChild(script)
  })
}
