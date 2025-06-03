<script setup>
import { ref } from 'vue'
import { setLoggedUser } from '@/states/loggedUser'

const HOST = import.meta.env.VITE_API_HOST || 'http://localhost:3000'
const API_URL = `${HOST}/api/v1/login`

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const emit = defineEmits(['login'])

async function login() {
  errorMessage.value = ''

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.message || 'Errore di autenticazione'
      return
    }

    // Salva l'utente nel reactive store
    setLoggedUser(data)

    emit('login', data) // puoi usarlo nel parent se vuoi fare un redirect

  } catch (error) {
    errorMessage.value = 'Errore di rete o server'
    console.error(error)
  }
}
</script>

<template>
  <div class="login-container">
    <h1>Accedi</h1>
    <form @submit.prevent="login" class="login-form">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Accedi</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.login-form {
  display: flex;
  flex-direction: column;
  width: 300px;
}
input {
  margin: 10px 0;
  padding: 10px;
  font-size: 1rem;
}
button {
  padding: 10px;
  background-color: #0077cc;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #005fa3;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
