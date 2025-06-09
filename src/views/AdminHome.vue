<script setup>
import { ref, onMounted } from 'vue'
import { posizionaSegnaposti } from '@/utils/funzioniSegnaposti'
import { loadGoogleMaps } from '@/utils/loadGoogleMaps'

const map = ref(null)
const selectedSegnaposto = ref(null)
const showForm = ref(false)
const isEditing = ref(false)

// Campi del form
const nome = ref('')
const descrizione = ref('')
const punti = ref(0)
const lat = ref(0)
const lng = ref(0)

const HOST = import.meta.env.VITE_API_BASE_URL

onMounted(async () => {
  try {
    // Carica la chiave dalle API
    await loadScript(`${HOST}/api/maps-config.js`) // questo definisce window.GOOGLE_MAPS_API_KEY
    await loadGoogleMaps(window.GOOGLE_MAPS_API_KEY)

    const mapOptions = {
      center: { lat: 46.0667, lng: 11.1167 },
      zoom: 13
    }

    map.value = new google.maps.Map(document.getElementById('map'), mapOptions)
    caricaSegnaposti()
  } catch (error) {
    console.error('Errore nel caricamento di Google Maps:', error)
  }
})

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

function caricaSegnaposti() {
  posizionaSegnaposti(map.value, (segnaposto) => {
    selectedSegnaposto.value = segnaposto
    apriFormModifica(segnaposto)
  })
}

function apriFormNuovo() {
  selectedSegnaposto.value = null
  isEditing.value = false
  nome.value = ''
  descrizione.value = ''
  punti.value = 0
  lat.value = map.value.getCenter().lat()
  lng.value = map.value.getCenter().lng()
  showForm.value = true
}

function apriFormModifica(segnaposto) {
  isEditing.value = true
  showForm.value = true
  nome.value = segnaposto.nome
  descrizione.value = segnaposto.descrizione || ''
  punti.value = segnaposto.punti || 0
  lat.value = segnaposto.coordinate.lat
  lng.value = segnaposto.coordinate.lng
}

async function salvaSegnaposto() {
  const token = localStorage.getItem('token')
  const body = {
    nome: nome.value,
    descrizione: descrizione.value,
    punti: punti.value,
    coordinate: {
      lat: lat.value,
      lng: lng.value
    }
  }

  const method = isEditing.value ? 'PUT' : 'POST'
  const url = isEditing.value
    ? `${HOST}/api/v1/segnaposti/${selectedSegnaposto.value._id}`
    : `${HOST}/api/v1/segnaposti`

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    alert('Errore durante il salvataggio')
    return
  }

  showForm.value = false
  caricaSegnaposti()
}

async function eliminaSegnaposto() {
  if (!selectedSegnaposto.value) return

  const token = localStorage.getItem('token')

  const response = await fetch(`${HOST}/api/v1/segnaposti/${selectedSegnaposto.value._id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    alert('Errore durante l\'eliminazione')
    return
  }

  showForm.value = false
  selectedSegnaposto.value = null
  caricaSegnaposti()
}
</script>

<template>
  <div class="admin-home">
    <h1>Admin - Gestione Segnaposti</h1>
    <button class="btn-nuovo" @click="apriFormNuovo">➕ Nuovo Segnaposto</button>
    
    <div id="map" class="map"></div>

    <div v-if="showForm" class="form-overlay">
      <div class="form-container">
        <h2>{{ isEditing ? 'Modifica' : 'Crea' }} Segnaposto</h2>
        <form @submit.prevent="salvaSegnaposto">
          <label>Nome</label>
          <input v-model="nome" type="text" required />

          <label>Descrizione</label>
          <textarea v-model="descrizione" required></textarea>

          <label>Punti</label>
          <input v-model.number="punti" type="number" required />

          <label>Latitudine</label>
          <input v-model.number="lat" type="number" step="any" required />

          <label>Longitudine</label>
          <input v-model.number="lng" type="number" step="any" required />

          <div class="form-buttons">
            <button type="submit">{{ isEditing ? 'Salva Modifiche' : 'Crea' }}</button>
            <button type="button" @click="showForm = false">Annulla</button>
            <button
              v-if="isEditing"
              type="button"
              @click="eliminaSegnaposto"
              class="btn-elimina"
            >
              Elimina
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-home {
  padding: 20px;
}
#map {
  width: 100%;
  height: 70vh;
  margin-top: 10px;
  border: 1px solid #ccc;
}
.btn-nuovo {
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #2e86de;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}
.form-container {
  background: white;
  padding: 25px;
  width: 400px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}
.form-container h2 {
  margin-bottom: 15px;
}
form label {
  margin-top: 10px;
  font-weight: bold;
}
form input, form textarea {
  padding: 8px;
  margin-top: 5px;
  width: 100%;
}
.form-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
.btn-elimina {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}
</style>
