<template>
  <div>
    <h1 class="title">Trento Way</h1>
    <div id="map"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  loadScript('http://localhost:3000/api/maps-config.js')
    .then(() => {
      loadGoogleMapsScript(window.GOOGLE_MAPS_API_KEY)
    })
    .catch((err) => {
      console.error('Errore caricamento config:', err)
    })

  function loadGoogleMapsScript(apiKey) {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // Iniettiamo la funzione globalmente perché Google Maps lo richiede
  window.initMap = () => {
    const centerCoords = { lat: 46.0704, lng: 11.1196 }

    const map = new google.maps.Map(document.getElementById('map'), {
      center: centerCoords,
      zoom: 13,
    })

    new google.maps.Marker({
      position: centerCoords,
      map: map,
      title: 'Centro di Trento',
    })
  }
})
</script>

<style scoped>
.title {
  text-align: center;
  margin: 20px;
}

#map {
  width: 100%;
  height: calc(100vh - 80px);
}
</style>
