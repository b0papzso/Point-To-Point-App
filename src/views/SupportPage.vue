<template>
  <ion-page>
    <ion-fab slot="fixed" vertical="top" horizontal="start" :edge="true">
      <ion-fab-button @click="goBack()">
        <ion-icon :icon="chevronBack" ></ion-icon>
      </ion-fab-button>
  </ion-fab>
  <h2 class="d-flex justify-content-center text-light">Ügyfélszolgálat</h2>
    <ion-content class="ion-padding">
      <div class="container">
        <h2 class="mb-4">Írja meg, mi a panasza</h2>
        <form @submit.prevent="sendSupport">
          <div class="mb-3">
            <label for="title" class="form-label">Cím</label>
            <input type="text" v-model="supportTitle" id="title" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="message" class="form-label">Hiba</label>
            <textarea v-model="supportMessage" id="message" class="form-control" rows="4" required></textarea>
          </div>
          <button type="submit" class="btn btn-success" @click="sendSupport()" id="sendBtn">Küldés</button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>
  
    
<script setup>
import { IonPage, IonContent,IonFab, IonFabButton, IonIcon} from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import VueCookies from 'vue-cookies'
import { chevronBack } from 'ionicons/icons';
import { useToast } from 'vue-toastification';
import api from '@/components/refreshToken.js'
const router = useRouter()
var supportTitle = ref()
const toast = useToast()
var supportMessage = ref()
const goBack = () => {
    router.push("/main");
};
const sendSupport = async() =>{
    try{
        const date = new Date().toISOString().split('.')[0];
        const data = ref({
            userId: VueCookies.get("passengerID"),
            created: date,
            name: supportTitle.value,
            description: supportMessage.value,
            status: "Open"
        })
        if(!supportTitle.value || !supportMessage.value){
            toast.error("Kérjük, töltse ki az összes mezőt!")
            return
        }
        await api.post( `Support`, data.value)
        toast.success("Sikeresen elküldve!")
        supportTitle.value = ""
        supportMessage.value = ""
    }
    catch(error){
        console.log(error)
    }
}
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: auto;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-top: 4rem;
}
ion-fab-button{
    margin-top: 1rem;
}
</style>