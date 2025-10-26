<script setup lang="ts">
import { sendMail } from '@/services/contactApi'
import { ref } from 'vue'
import Input from '@/components/UI/Input.vue'
import Textarea from '@/components/UI/Textarea.vue'
import Button from '@/components/UI/Button.vue'

const name = ref('')
const email = ref('')
const message = ref('')
const submitted = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  error.value = null
  loading.value = true
  try {
    await sendMail({ name: name.value, email: email.value, message: message.value })
    submitted.value = true
    name.value = ''
    email.value = ''
    message.value = ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    error.value = e?.response?.data?.error || "Erreur lors de l'envoi du message."
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div class="contact-page">
    <div class="page-content">
      <div class="contact-container">
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-content">
            <h1 class="page-title">CONTACT</h1>
            <div class="hero-subtitle">Any questions, ideas, or just want to talk about music? Drop me a message
            </div>
          </div>
        </section>
        <form v-if="!submitted" class="contact-form" @submit.prevent="handleSubmit">
          <Input
            id="name"
            v-model="name"
            label="Nom"
            type="text"
            placeholder="Votre nom"
            required
            autocomplete="name"
          />
          <Input
            id="email"
            v-model="email"
            label="Email"
            type="email"
            placeholder="votre@email.com"
            required
            autocomplete="email"
          />
          <Textarea
            id="message"
            v-model="message"
            label="Message"
            placeholder="Votre message..."
            :rows="5"
            required
          />
          <Button variant="primary" size="lg" type="submit" :disabled="loading" class="w-full mt-2">
            <span v-if="loading">Envoi...</span>
            <span v-else>Envoyer</span>
          </Button>
          <p v-if="error" class="text-red-600 text-sm mt-2 text-center">{{ error }}</p>
        </form>
        <div v-else class="contact-success">
          <p>Merci pour votre message !</p>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.contact-page {
  min-height: 100vh;
  background: var(--color-background)
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 0 0 3rem 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 4rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 3vw, 1.4rem);
  color: var(--color-text);
  font-weight: 300;
  letter-spacing: 0.02em;
  opacity: 0.8;
}

.page-content {
  min-height: calc(100vh - 80px);
}

@media (min-width: 1024px) {
  .contact-container {
    min-height: calc(100vh - 80px);
    /* display: flex; */
    /* flex-direction: column; */
    align-items: center;
    /* justify-content: center; */
  }
}

.page-title {
  font-family: 'Inter', 'ui-sans-serif', 'system-ui', sans-serif;
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 900;
  color: var(--color-heading);
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
  line-height: 1.1;
}

.contact-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  overflow: hidden;
}

.contact-desc {
  color: var(--color-text);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.contact-form {
  background: var(--color-background-soft);
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 rgba(44, 62, 80, 0.07);
  padding: 2rem 2.5rem;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.contact-success {
  margin-top: 2rem;
  color: var(--color-heading);
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
}

@media (max-width: 480px) {
  .hero-section {
    padding: 2rem 0 1.5rem 0;
    margin-bottom: 2rem;
  }
}
</style>
