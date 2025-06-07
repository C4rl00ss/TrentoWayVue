<template>
  <div class="overlay" @click.self="$emit('chiudi')">
    <div class="modale">
      <h2>{{ segnaposto.nome }}</h2>
      <p>{{ segnaposto.descrizione }}</p>
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
