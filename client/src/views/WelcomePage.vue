<script setup lang="ts">
import MainTitle from "@/components/UI/MainTitle.vue"
import BaseButton from "@/components/UI/BaseButton.vue"
import { useRouter } from 'vue-router'
import { VApp, VContainer } from 'vuetify/components'

const router = useRouter()

const navigateToCollection = () => {
  router.push('/collection')
}
</script>

<template>
  <v-app>
    <v-container class="d-flex flex-column align-center justify-center fill-height pa-4">
      <MainTitle text="Space Is The Place" align="center" />
      <p class="text-center text-body-1 my-8">
        Space is the place where we can escape the limitations of our earthly
        existence
      </p>
      <BaseButton @click="navigateToCollection">
        Enter My Universe
      </BaseButton>
    </v-container>
  </v-app>
</template>