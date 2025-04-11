<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title class="ion-text-start text-2xl font-bold px-4 py-3">Szia {{ userName }}!</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div class="section-title text-xl font-bold mb-4 mt-2">Lehetőségeid:</div>
      <ion-grid>
        <ion-row>
          <ion-col size="6">
            <ion-card class="service-card ion-text-center" button @click="myRidesOpen" id="myRides">
              <div class="icon-container">
                <img src="../../public/myRides_car.png" alt="My Rides" class="service-icon" />
              </div>
              <ion-card-content>
                <div class="service-label">Utaim</div>
              </ion-card-content>
            </ion-card>
          </ion-col>
          
          <ion-col size="6">
            <ion-card class="service-card ion-text-center" button @click="listOpen" id="allRides">
              <div class="icon-container">
                <img src="../../public/allRides_cars.png" alt="All Rides" class="service-icon" />
              </div>
              <ion-card-content>
                <div class="service-label">Összes út</div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
        
        <ion-row>
          <ion-col size="6">
            <ion-card class="service-card ion-text-center" button @click="balanceOpen" id="balance">
              <div class="icon-container">
                <img src="../../public/balance_wallet.png" alt="Balance" class="service-icon" />
              </div>
              <ion-card-content>
                <div class="service-label">Egyenleg</div>
              </ion-card-content>
            </ion-card>
          </ion-col>
          
          <ion-col size="6">
            <ion-card class="service-card ion-text-center" button @click="settingsOpen" id="settings">
              <div class="icon-container">
                <img :src="`https://api.pointtopoint.hu/api/Passenger/profile-picture/${VueCookies.get('passengerID')}`" alt="Settings" class="service-icon rounded-circle" />
              </div>
              <ion-card-content>
                <div class="service-label">Adataim</div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
        
        <ion-row>
          <ion-col size="6" offset="3">
            <ion-card class="service-card ion-text-center" button @click="supportOpen" id="support">
              <div class="icon-container">
                <img src="../../public/support_car.png" alt="Support" class="service-icon" />
              </div>
              <ion-card-content>
                <div class="service-label">Ügyfélszolgálat</div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="js">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardContent,
  IonIcon, IonFab, IonFabButton, IonFabList} from '@ionic/vue';
import { useRouter } from 'vue-router';
import VueCookies from 'vue-cookies'
import {
    chevronUpCircle,
    colorPalette,
    document,
    globe,
    settings,
    build,
  } from 'ionicons/icons';
import { onMounted, onUnmounted, defineComponent } from 'vue';
const router = useRouter()
import api from '@/components/refreshToken.js'
onUnmounted(() => {
  defineComponent({
    components: { IonContent, IonFab, IonFabButton, IonFabList, IonHeader, IonIcon, IonTitle, IonToolbar },
    setup() {
      return { settings, build, chevronUpCircle, colorPalette, document, globe};
    },
  });
});
var userName = ""
const getUserName = async() =>{
  const response = await api.get(`Passenger/${VueCookies.get("passengerID")}`)
  userName = response.data.firstName
}
const settingsOpen = () =>{
  router.push("/settings")
}

const myRidesOpen = () =>
{
  router.push("/myrides")
}

const listOpen = () =>{
  router.push("/ridelist")
}

const balanceOpen = () =>{
  router.push("/balance")
}

const supportOpen = () =>{
  router.push("/support")
}

onMounted(() => {
  getUserName()
})
</script>

<style scoped>
.section-title {
  padding-left: 8px;
}

.service-card {
  height: 100%;
  margin: 8px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
}

.icon-container {
  padding: 16px 0 8px 0;
  display: flex;
  justify-content: center;
}

.service-icon {
  height: 80px;
  margin: 0 auto;
}

.service-label {
  font-weight: 600;
  font-size: 16px;
  padding-bottom: 8px;
  margin-top: -20px;
}

.custom-button {
  --border-radius: 12px;
  --padding-top: 16px;
  --padding-bottom: 16px;
}
ion-title{
  background-color: #f0f2f5;
}
</style>
