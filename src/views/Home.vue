<template>
  <div>
    <header class="header">
      <h1 class="title">TrentoWay</h1>

      <nav class="tasti_autenticazione">
        <template v-if="!loggedUser">
          <RouterLink to="/login" class="button">Login</RouterLink>
          <RouterLink to="/register" class="button">Registrati</RouterLink>
        </template>
        <template v-else>
          <span class="welcome-msg">Benvenuto, {{ loggedUser.username }}!</span>
          <button @click="logout" class="button logout">Logout</button>
        </template>
      </nav>

    </header>


    <div id="map"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loggedUser = ref(null)

onMounted(() => {

  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    loggedUser.value = JSON.parse(storedUser)
    console.log("Utente loggato:", loggedUser.value)
  }

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

// Funzione per fare logout
function logout() {
  localStorage.removeItem('user')  //rimuove l'utente 
  localStorage.removeItem('token')  //rimuove il token
  loggedUser.value = null
  router.push('/') // Ritorna alla home
}


</script>




<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.title {
  margin: 0;
  font-size: 2rem;
}

.nav-buttons {
  display: flex;
  gap: 10px;
}

.button {
  padding: 8px 12px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
  margin-right: 0.2rem;
  margin-right: 0.2rem;
}

.button:hover {
  background-color: #45a049;
}

.welcome-msg {
  font-weight: bold;
  font-size: 1rem;
  color: #333;
}

#map {
  width: 100%;
  height: calc(100vh - 80px);
}
</style>
