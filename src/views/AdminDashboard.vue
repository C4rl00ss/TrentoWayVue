<template>
  <div>
    <h1>Dashboard Amministratore</h1>
    <p>Benvenuto, qui potrai gestire i segnaposto della mappa.</p>

    <section>
      <h2>Segnaposti</h2>
      <div>
        <label>Ordina per: </label>
        <select v-model="sortKey" @change="ordinaSegnaposti">
          <option value="nome">Nome</option>
          <option value="visite">Numero di visite</option>
        </select>
      </div>
      <ul>
        <li v-for="segnaposto in segnaposti" :key="segnaposto._id">
          <strong>{{ segnaposto.nome }}</strong> - visite: {{ segnaposto.visite }}
          <button @click="apriModaleModifica(segnaposto)">Modifica</button>
          <button @click="confermaEliminazione(segnaposto._id)">Elimina</button>
        </li>
      </ul>
    </section>

    <section>
      <h2>Aggiungi nuovo segnaposto</h2>
      <form @submit.prevent="creaSegnaposto">
        <input v-model="nuovoSegnaposto.nome" placeholder="Nome" required />
        <input v-model.number="nuovoSegnaposto.visite" placeholder="Visite iniziali" type="number" min="0" />
        <button type="submit">Crea</button>
      </form>
    </section>

    <!-- Modale per modifica -->
    <div v-if="modaleVisibile" class="modale">
      <div class="modale-contenuto">
        <h3>Modifica Segnaposto</h3>
        <form @submit.prevent="salvaModifica">
          <input v-model="segnapostoInModifica.nome" placeholder="Nome" required />
          <input v-model.number="segnapostoInModifica.visite" placeholder="Visite" type="number" min="0" />
          <button type="submit">Salva</button>
          <button type="button" @click="chiudiModale">Annulla</button>
        </form>
      </div>
    </div>

    <!-- Notifica -->
    <div v-if="notifica" class="notifica">
      {{ notifica }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  data() {
    return {
      segnaposti: [],
      sortKey: 'nome',
      nuovoSegnaposto: { nome: '', visite: 0 },
      modaleVisibile: false,
      segnapostoInModifica: null,
      notifica: ''
    }
  },
  async mounted() {
    await this.caricaSegnaposti();
  },
  methods: {
    // Carica tutti i segnaposti dal server e li ordina secondo il criterio selezionato
    async caricaSegnaposti() {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/api/v1/segnaposti', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Errore nel recupero dei segnaposti');
        const data = await response.json();
        this.segnaposti = data;
        this.ordinaSegnaposti();
      } catch (error) {
        console.error('Errore nel recupero dei segnaposti:', error);
        this.$router.push('/');
      }
    },
    // Ordina i segnaposti per nome o numero di visite
    ordinaSegnaposti() {
      if (this.sortKey === 'nome') {
        this.segnaposti.sort((a, b) => a.nome.localeCompare(b.nome));
      } else if (this.sortKey === 'visite') {
        this.segnaposti.sort((a, b) => b.visite - a.visite);
      }
    },
    // Crea un nuovo segnaposto e aggiorna la lista
    async creaSegnaposto() {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/api/v1/segnaposti', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(this.nuovoSegnaposto)
        });
        if (!response.ok) throw new Error('Errore nella creazione');
        this.nuovoSegnaposto = { nome: '', visite: 0 };
        await this.caricaSegnaposti();
        this.mostraNotifica('Segnaposto creato con successo');
      } catch (error) {
        console.error('Errore nella creazione del segnaposto:', error);
      }
    },
    // Elimina un segnaposto tramite ID e aggiorna la lista
    async eliminaSegnaposto(id) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`/api/v1/segnaposti/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Errore eliminazione');
        await this.caricaSegnaposti();
        this.mostraNotifica('Segnaposto eliminato con successo');
      } catch (error) {
        console.error("Errore nell'eliminazione del segnaposto:", error);
      }
    },
    // Mostra una conferma prima di eliminare definitivamente un segnaposto
    confermaEliminazione(id) {
      if (confirm('Sei sicuro di voler eliminare questo segnaposto?')) {
        this.eliminaSegnaposto(id);
      }
    },
    // Apre la modale per modificare un segnaposto esistente
    apriModaleModifica(segnaposto) {
      this.segnapostoInModifica = { ...segnaposto };
      this.modaleVisibile = true;
    },
    // Chiude la modale di modifica e azzera i dati temporanei
    chiudiModale() {
      this.modaleVisibile = false;
      this.segnapostoInModifica = null;
    },
    // Salva le modifiche apportate a un segnaposto e aggiorna la lista
    async salvaModifica() {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`/api/v1/segnaposti/${this.segnapostoInModifica._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(this.segnapostoInModifica)
        });
        if (!response.ok) throw new Error('Errore modifica');
        this.chiudiModale();
        await this.caricaSegnaposti();
        this.mostraNotifica('Segnaposto modificato con successo');
      } catch (error) {
        console.error('Errore nella modifica del segnaposto:', error);
      }
    },
    // Mostra un messaggio temporaneo in basso a destra per confermare l'azione
    mostraNotifica(messaggio) {
      this.notifica = messaggio;
      setTimeout(() => { this.notifica = ''; }, 3000);
    }
  }
}
</script>

<style scoped>
section {
  margin-top: 2rem;
}
button {
  margin-left: 0.5rem;
}
form {
  margin-top: 1rem;
}
input {
  margin-right: 0.5rem;
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
</style>

