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
    <popUp 
       v-if ="SegnapostoSelezionato"
       :segnaposto = "SegnapostoSelezionato"
        @chiudi="SegnapostoSelezionato = null"
    />

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { posizionaSegnaposti } from '@/utils/funzioniSegnaposti.js'
import popUp  from '@/components/popUp.vue'

const HOST = import.meta.env.VITE_API_BASE_URL

const router = useRouter()

const loggedUser = ref(null)

const SegnapostoSelezionato = ref(null)

let map = null


function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }


function loadGoogleMapsScript(apiKey) {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }



onMounted(async () => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    loggedUser.value = JSON.parse(storedUser)
    console.log("Utente loggato:", loggedUser.value)
  }

  try {
    await loadScript(`${HOST}/api/maps-config.js`)
    await loadGoogleMapsScript(window.GOOGLE_MAPS_API_KEY)
    // Posso chiamare posizionaSegnaposti solo dopo che la mappa è pronta
   
  } catch (err) {
    console.error('Errore caricamento config o mappa:', err)
  }

  window.initMap = () => {
    const centerCoords = { lat: 46.0704, lng: 11.1196 }

    map = new google.maps.Map(document.getElementById('map'), {
      center: centerCoords,
      zoom: 13,
      styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
  ]

    })
 
    // chiamata alla funzione per posizionare i segnaposti e anche per gestire il click sui segnaposti
    // questa funzione prende come secondo parametro un'altra funzione che ha come input segnaposto e viene chiamata
    // nel file funzioniSegnaposti.js qunando si clicca su un segnaposto
     posizionaSegnaposti(map, (segnaposto) => {
      SegnapostoSelezionato.value = segnaposto;
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
  margin-right: 0.5rem;
  margin-right: 0.5rem;
}

.button:hover {
  background-color: #45a049;
}

.welcome-msg {
  font-weight: bold;
  font-size: 1rem;
  color: #333;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

#map {
  width: 100%;
  height: calc(100vh - 80px);
}
</style>
