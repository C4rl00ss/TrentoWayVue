<template>
  <div>
    <h1>Gestione Segnaposti Avanzata</h1>
    <button class="btn-torna" @click="$router.push('/admin/home')">🏠 Torna alla Home</button>
    <button class="btn-nuovo" @click="apriModaleNuovo">➕ Crea Nuovo Segnaposto</button>

    <div>
      <label>Ordina per: </label>
      <select v-model="sortKey" @change="ordinaSegnaposti">
        <option value="nome">Nome</option>
        <option value="visite">Numero di visite</option>
      </select>
    </div>

    <ul>
      <li v-for="segnaposto in segnaposti" :key="segnaposto._id">
        <strong>{{ segnaposto.nome }}</strong> - visite: {{ segnaposto.visite ?? '—' }}
        <span class="azioni">
          <button @click="apriModaleModifica(segnaposto)">Modifica</button>
          <button @click="confermaEliminazione(segnaposto._id)">Elimina</button>
          <button @click="mostraDettagli(segnaposto)">Info</button>
        </span>
      </li>
    </ul>

    <div v-if="modaleVisibile" class="modale">
      <div class="modale-contenuto">
        <h3>{{ segnapostoInModifica._id ? 'Modifica' : 'Crea' }} Segnaposto</h3>
        <form @submit.prevent="salvaModifica">
          <label>Nome</label>
          <input v-model="segnapostoInModifica.nome" placeholder="Nome" required />

          <label>Descrizione</label>
          <textarea v-model="segnapostoInModifica.descrizione" required></textarea>

          <label>Punti</label>
          <input v-model.number="segnapostoInModifica.punti" type="number" required />

          <label>Latitudine</label>
          <input v-model.number="segnapostoInModifica.coordinate.lat" type="number" step="any" required />

          <label>Longitudine</label>
          <input v-model.number="segnapostoInModifica.coordinate.lng" type="number" step="any" required />

          <button type="submit">Salva</button>
          <button type="button" @click="chiudiModale">Annulla</button>
        </form>
      </div>
    </div>

    <div v-if="dettagliSegnaposto" class="info-box">
      <h3>Dettagli Segnaposto</h3>
      <p><strong>Nome:</strong> {{ dettagliSegnaposto.nome }}</p>
      <p><strong>Descrizione:</strong> {{ dettagliSegnaposto.descrizione }}</p>
      <p><strong>Punti:</strong> {{ dettagliSegnaposto.punti }}</p>
      <p><strong>Coordinate:</strong> {{ dettagliSegnaposto.coordinate.lat }}, {{ dettagliSegnaposto.coordinate.lng }}</p>
      <button @click="dettagliSegnaposto = null">Chiudi</button>
    </div>

    <div v-if="notifica" class="notifica">{{ notifica }}</div>
  </div>
</template>

<script>
const HOST = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export default {
  name: 'AdminGestioneSegnaposto',
  data() {
    return {
      segnaposti: [],
      sortKey: 'nome',
      modaleVisibile: false,
      segnapostoInModifica: null,
      dettagliSegnaposto: null,
      notifica: ''
    }
  },
  async mounted() {
    await this.caricaSegnaposti()
  },
  methods: {
    async caricaSegnaposti() {
      const token = localStorage.getItem('token')
      try {
        const response = await fetch(`${HOST}/api/v1/segnaposti`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Errore nel recupero dei segnaposti')
        const data = await response.json()
        this.segnaposti = data
        this.ordinaSegnaposti()
      } catch (error) {
        console.error(error)
      }
    },
    ordinaSegnaposti() {
      if (this.sortKey === 'nome') {
        this.segnaposti.sort((a, b) => a.nome.localeCompare(b.nome))
      } else if (this.sortKey === 'visite') {
        this.segnaposti.sort((a, b) => (b.visite ?? 0) - (a.visite ?? 0))
      }
    },
    confermaEliminazione(id) {
      if (confirm('Sei sicuro di voler eliminare questo segnaposto?')) {
        this.eliminaSegnaposto(id)
      }
    },
    async eliminaSegnaposto(id) {
      const token = localStorage.getItem('token')
      try {
        const response = await fetch(`${HOST}/api/v1/segnaposti/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Errore eliminazione')
        await this.caricaSegnaposti()
        this.mostraNotifica('Segnaposto eliminato')
      } catch (error) {
        console.error(error)
      }
    },
    apriModaleModifica(segnaposto) {
      this.segnapostoInModifica = {
        _id: segnaposto._id,
        nome: segnaposto.nome,
        descrizione: segnaposto.descrizione || '',
        punti: segnaposto.punti || 0,
        coordinate: {
          lat: segnaposto.coordinate.lat,
          lng: segnaposto.coordinate.lng
        }
      }
      this.modaleVisibile = true
    },
    apriModaleNuovo() {
      this.segnapostoInModifica = {
        nome: '',
        descrizione: '',
        punti: 0,
        coordinate: { lat: 0, lng: 0 }
      }
      this.modaleVisibile = true
    },
    chiudiModale() {
      this.modaleVisibile = false
      this.segnapostoInModifica = null
    },
    async salvaModifica() {
      const token = localStorage.getItem('token')
      const isNuovo = !this.segnapostoInModifica._id
      const url = isNuovo
        ? `${HOST}/api/v1/segnaposti`
        : `${HOST}/api/v1/segnaposti/${this.segnapostoInModifica._id}`
      const method = isNuovo ? 'POST' : 'PUT'

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(this.segnapostoInModifica)
        })
        if (!response.ok) throw new Error('Errore salvataggio')
        this.chiudiModale()
        await this.caricaSegnaposti()
        this.mostraNotifica(isNuovo ? 'Segnaposto creato' : 'Segnaposto modificato')
      } catch (error) {
        console.error(error)
      }
    },
    mostraDettagli(segnaposto) {
      this.dettagliSegnaposto = segnaposto
    },
    mostraNotifica(msg) {
      this.notifica = msg
      setTimeout(() => { this.notifica = '' }, 3000)
    }
  }
}
</script>

<style scoped>
button {
  margin-left: 0.5rem;
}
.btn-torna, .btn-nuovo {
  margin: 10px 0 10px 10px;
  padding: 10px 15px;
  background-color: #607d8b;
  color: white;
  border-radius: 6px;
  font-weight: bold;
}
.btn-nuovo {
  background-color: #4caf50;
}
.azioni {
  display: inline-block;
  margin-left: 1rem;
}
.modale {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modale-contenuto {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 500px;
  max-width: 90vm;
}
.notifica {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #4caf50;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.info-box {
  margin-top: 20px;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

form label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
}

form input,
form textarea {
  display: block;
  width: 100%;
  margin-top: 5px;
  padding: 8px;
  box-sizing: border-box;
}
</style>
