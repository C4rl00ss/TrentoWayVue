<template>
  <div>
    <header class="header">
      <h1>Admin - Gestione Segnaposti</h1>
      <button @click="nuovoSegnaposto" class="button">Nuovo Segnaposto</button>
    </header>

    <div id="map"></div>

    <!-- Modal aggiungi/modifica segnaposto -->
    <div v-if="showForm" class="overlay" @click.self="closeForm">
      <div class="modale">
        <h2>{{ formMode === 'edit' ? 'Modifica Segnaposto' : 'Nuovo Segnaposto' }}</h2>
        <form @submit.prevent="submitForm">
          <label>Nome:</label>
          <input v-model="form.nome" required />

          <label>Descrizione:</label>
          <textarea v-model="form.descrizione" required></textarea>

          <label>Punti:</label>
          <input v-model.number="form.punti" type="number" required />

          <label>Latitudine:</label>
          <input v-model.number="form.coordinate.lat" type="number" step="any" required />

          <label>Longitudine:</label>
          <input v-model.number="form.coordinate.lng" type="number" step="any" required />

          <button type="submit">{{ formMode === 'edit' ? 'Salva' : 'Aggiungi' }}</button>
          <button type="button" @click="closeForm">Annulla</button>
          <button v-if="formMode === 'edit'" type="button" @click="eliminaSegnaposto">Elimina</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const HOST = import.meta.env.VITE_API_BASE_URL

const segnaposti = ref([])
const map = ref(null)
const markers = ref([])

const showForm = ref(false)
const formMode = ref('add') // 'add' o 'edit'
const form = ref({
  id: null,
  nome: '',
  descrizione: '',
  punti: 0,
  coordinate: { lat: 46.0704, lng: 11.1196 },
})

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve()
      return
    }
    window.initMap = () => resolve()
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  })
}

async function caricaSegnaposti() {
  try {
    const res = await fetch(`${HOST}/api/v1/segnaposti`)
    if (!res.ok) throw new Error('Errore caricamento segnaposti')
    segnaposti.value = await res.json()

    // Rimuovi marker vecchi
    markers.value.forEach(m => m.setMap(null))
    markers.value = []

    // Aggiungi nuovi marker
    segnaposti.value.forEach(s => {
      const marker = new google.maps.Marker({
        position: { lat: s.coordinate.lat, lng: s.coordinate.lng },
        map: map.value,
        title: s.nome,
        icon: {
          url: `${HOST}/target.svg`,
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20),
        },
      })
      marker.addListener('click', () => {
        modificaSegnaposto(s)
      })
      markers.value.push(marker)
    })
  } catch (e) {
    console.error(e)
  }
}

function nuovoSegnaposto() {
  formMode.value = 'add'
  form.value = {
    id: null,
    nome: '',
    descrizione: '',
    punti: 0,
    coordinate: { lat: 46.0704, lng: 11.1196 },
  }
  showForm.value = true
}

function modificaSegnaposto(segnaposto) {
  formMode.value = 'edit'
  form.value = JSON.parse(JSON.stringify(segnaposto)) // copia profonda
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

async function submitForm() {
  try {
    const url =
      formMode.value === 'add'
        ? `${HOST}/api/v1/segnaposti`
        : `${HOST}/api/v1/segnaposti/${form.value.id}`
    const method = formMode.value === 'add' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })

    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.message || 'Errore nel salvataggio')
    }

    await caricaSegnaposti()
    closeForm()
  } catch (e) {
    alert(e.message)
  }
}

async function eliminaSegnaposto() {
  if (!form.value.id) return
  if (!confirm('Sei sicuro di voler eliminare questo segnaposto?')) return

  try {
    const res = await fetch(`${HOST}/api/v1/segnaposti/${form.value.id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.message || 'Errore nell\'eliminazione')
    }

    await caricaSegnaposti()
    closeForm()
  } catch (e) {
    alert(e.message)
  }
}

onMounted(async () => {
  try {
    await loadScript(`${HOST}/api/maps-config.js`)
    await loadGoogleMapsScript(window.GOOGLE_MAPS_API_KEY)

    map.value = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 46.0704, lng: 11.1196 },
      zoom: 13,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    })

    await caricaSegnaposti()
  } catch (error) {
    console.error(error)
  }
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

#map {
  width: 100%;
  height: 75vh;
  margin-top: 20px;
  border-radius: 10px;
  border: 1px solid #ccc;
}

.button {
  background-color: #0077cc;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.button:hover {
  background-color: #005fa3;
}

.overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modale {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 350px;
  max-width: 90vw;
  box-shadow: 0 0 10px rgba(0,0,0,0.25);
}

.modale form label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
}

.modale form input,
.modale form textarea {
  width: 100%;
  padding: 6px 8px;
  margin-top: 4px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modale form textarea {
  resize: vertical;
  min-height: 60px;
}

.modale form button {
  margin-top: 15px;
  margin-right: 10px;
}
</style>
