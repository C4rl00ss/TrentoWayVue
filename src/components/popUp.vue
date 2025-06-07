<template>
  <div class="overlay" @click.self="$emit('chiudi')">
    <div class="modale">
        <h2>{{ segnaposto.nome }}</h2>
        <h5> Descrizione: </h5>
        <p>{{ segnaposto.descrizione }}</p>

        <h5> Quiz: </h5>
        

        <h5> Punti: </h5>
        <p>{{ segnaposto.punti }}</p>
        <h5> Recensioni: </h5>
        

      <button @click="$emit('chiudi')">Chiudi</button>
    </div>
  </div>
</template>

<script setup>
defineProps({ segnaposto: Object });
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
}
.modale {
  background: white;
  padding: 2rem;
  border-radius: 10px;
}
</style>
