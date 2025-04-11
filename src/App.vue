<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
  
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>
