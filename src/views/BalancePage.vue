<template>
<ion-page>
    <ion-content :fullscreen="true">
      <ion-fab slot="fixed" vertical="top" horizontal="start" :edge="true">
        <ion-fab-button @click="goBack()">
          <ion-icon :icon="chevronBack" ></ion-icon>
        </ion-fab-button>    
    </ion-fab>
    <h2 class="d-flex justify-content-center">Egyenleg</h2>
    <div class="container">
      <h3 class="mb-4">Egyenleg: {{ currentBalance }}$</h3>
      <button @click="topUpVisible = !topUpVisible" class="btn btn-success">{{ !topUpVisible ? "Egyenleg feltöltése" : "Bezárás"}}</button>
      <div class="topUpDiv" v-if="topUpVisible">
        <input type="number" v-model="amount" class="form-control mt-3" placeholder="Összeg" min="1" max="500">
        <button @click="topUp(amount)" class="btn btn-success mt-3">Feltöltés</button>
      </div>
    </div>
    </ion-content>
</ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonFab, IonFabButton, IonIcon } from '@ionic/vue';
import { chevronBack} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { onMounted, ref } from 'vue';
import api from '@/components/refreshToken.js'
import VueCookies from 'vue-cookies'
const router = useRouter()
const toast = useToast()
var topUpVisible = ref(false)
const amount = ref(1)
const currentBalance = ref({})
const goBack = () => {
    router.push("/main");
};
onMounted(async () => {
    await getBalance()
})
const getBalance = async () => {
    try {
        const response = await api.get(`Passenger/${VueCookies.get("passengerID")}`);
        currentBalance.value = response.data.balance
    } catch (error) {
        console.error(error)
    }
}
const topUp = async (amount) => {
    if(amount < 5)
    {
        toast.error("Legalább 5$-t kell hozzáadnia!")
        return
    }      
    else if(amount > 500)
    { 
        toast.error("Legfeljebb 500$-t tud hozzáadni!")
        return
    }
    else{
    try {
        var addBalance = currentBalance.value + amount
        const data = [
            { "op": "replace", "path": "/balance", "value": `${addBalance}` },
        ];
        const response = await api.patch(`Passenger/${VueCookies.get("passengerID")}`, data, {
            headers: {
                "Content-Type": "application/json-patch+json"
            }
        });
        currentBalance.value = response.data.balance;
    } catch (error) {
        console.error(error);
    }
    topUpVisible.value = false; 
}
};
</script>
<style scoped>
ion-fab-button {
  margin-top: 1rem;
}
.container{
  margin-top: 2rem;
}
input{
    width: 50%;
}
</style>