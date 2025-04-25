<template>
  <ion-page>
    <ion-content class="ion-padding">
      <ion-fab slot="fixed" vertical="top" horizontal="start" :edge="true">
        <ion-fab-button @click="goBack()">
          <ion-icon :icon="chevronBack" ></ion-icon>
        </ion-fab-button>    
    </ion-fab>
    <h2 class="d-flex justify-content-center my-3">Adataim</h2>
      <div class="profile-picture-container ion-text-center">
        <ion-avatar class="profile-avatar">
          <img alt="Profile Picture" id="pfp"/>
          <div class="overlay">
            <ion-button fill="clear" size="small" @click="triggerFileInput">
              <ion-icon slot="icon-only" :icon="camera"></ion-icon>
            </ion-button>
            <input 
              type="file" 
              id="profile-picture-upload" 
              accept="image/*" 
              @change="uploadProfilePicture" 
              class="file-input"
              ref="fileInput"
            />
          </div>
        </ion-avatar>
      </div>
      
      <ion-item-divider></ion-item-divider>
      
      <ion-item button @click="toggleForm" detail  class="form rounded">
        <ion-label>
          <h2 class="m-2">Frissítsd az adataidat</h2>
        </ion-label>
        <ion-icon slot="end" :icon="isFormVisible ? chevronUp : chevronDown"/>
      </ion-item>
      
      <div v-show="isFormVisible">
        <form @submit.prevent="saveChanges" class="rounded">
          <ion-list>
            <ion-item>
              <ion-label position="floating" class="m-2">Vezetéknév</ion-label>
              <ion-input 
                v-model="passenger.lastName" 
                type="text" 
                required
                :class="{ 'ion-invalid': errors.lastName, 'ion-valid': !errors.lastName && passenger.lastName }"
                @ionBlur="validateLastName"
                class="m-2"></ion-input>
              <ion-note slot="error" v-if="errors.lastName">{{ errors.lastName }}</ion-note>
            </ion-item>
            
            <ion-item>
              <ion-label position="floating" class="m-2">Keresztnév</ion-label>
              <ion-input 
                v-model="passenger.firstName" 
                type="text" 
                required
                :class="{ 'ion-invalid': errors.firstName, 'ion-valid': !errors.firstName && passenger.firstName }"
                @ionBlur="validateFirstName"
                class="m-2"></ion-input>
              <ion-note slot="error" v-if="errors.firstName">{{ errors.firstName }}</ion-note>
            </ion-item>
            
            <ion-item>
              <ion-label position="floating" class="m-2">Email cím</ion-label>
              <ion-input 
                v-model="passenger.email" 
                type="email" 
                required
                :class="{ 'ion-invalid': errors.email, 'ion-valid': !errors.email && passenger.email }"
                @ionBlur="validateEmail"
                class="m-2"></ion-input>
              <ion-note slot="error" v-if="errors.email">{{ errors.email }}</ion-note>
            </ion-item>          
          <div class="ion-padding ion-text-center">
            <ion-button type="submit" expand="block">Mentés</ion-button>
          </div>
          </ion-list>
        </form>
      </div> 
      <ion-item-divider></ion-item-divider>
      <ion-item button @click="toggleChangePassword" detail  class="form">
        <ion-label>
          <h2 class="m-2">Jelszó megváltoztatása</h2>
        </ion-label>
        <ion-icon slot="end" :icon="isChangePasswordVisible ? chevronUp : chevronDown"/>
      </ion-item>
      <div v-show="isChangePasswordVisible">
        <form @submit.prevent="savePassword">
          <ion-list>
            <ion-item>
              <ion-label position="floating" class="m-2">Új jelszó</ion-label>
              <ion-input 
                v-model="newPassword" 
                type="password" 
                required
                :class="{ 'ion-invalid': errors.password, 'ion-valid': !errors.password&& newPassword }"
                class="m-2"></ion-input>
              <ion-note slot="error" v-if="errors.password">{{ errors.password }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label position="floating" class="m-2">Új jelszó megint</ion-label>
              <ion-input 
                v-model="newPasswordAgain" 
                type="password" 
                required
                :class="{ 'ion-invalid': errors.newPassword, 'ion-valid': !errors.newPassword && newPasswordAgain }"
                @ionBlur="validateNewPassword"
                class="m-2"></ion-input>
              <ion-note slot="error" v-if="errors.newPasswordAgain">{{ errors.newPasswordAgain }}</ion-note>
            </ion-item>
            <div class="ion-padding ion-text-center">
            <ion-button expand="block" @click="savePassword()">Mentés</ion-button>
          </div>
          </ion-list>
        </form>
      </div>
      <ion-item-divider></ion-item-divider>
      <button class="btn btn-warning mb-2 mt-2" id="controlButton" @click="logOut()">Kijelentkezés</button><br>
      <button class="btn btn-danger" id="controlButton" @click="showConfirmationModal = true">Fiók törlése</button>
      <div v-if="showConfirmationModal" class="modal fade show d-flex align-items-center" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Fiók törlése</h5>
              <button type="button" class="btn-close" @click="showConfirmationModal = false" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>Biztosan törölni szeretnéd a fiókodat? Ez a művelet nem visszavonható!</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showConfirmationModal = false">Mégsem</button>
              <button type="button" class="btn btn-danger" @click="deleteAccount()">Törlés</button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { 
  IonPage, IonContent, 
  IonAvatar, IonButton, IonIcon, IonItem, IonLabel, 
  IonInput, IonList, IonNote, IonItemDivider, IonFabButton, IonFab,
} from '@ionic/vue';
import { camera, chevronDown, chevronUp, chevronBack } from 'ionicons/icons';
import VueCookies from 'vue-cookies';
import {useToast} from 'vue-toastification';
import axios from 'axios';
import { useRouter } from 'vue-router';
import api from '@/components/refreshToken.js'
const router = useRouter();
const fileInput = ref(null);
const showConfirmationModal = ref(false);
const URL = "https://ptpservice-434977812465.europe-west1.run.app/api/";
const isFormVisible = ref(false);
var profilePic = ref();
const isChangePasswordVisible = ref(false);
const newPassword = ref('');
const newPasswordAgain = ref('');
const passenger = ref({
  firstName: '',
  lastName: '',
  email: '',
});
const toast = useToast();

const errors = reactive({
  firstName: '',
  lastName: '',
  email: ''
});

const logOut = () => {
  VueCookies.remove("token");
  VueCookies.remove("refreshToken");
  VueCookies.remove("passengerID");
  VueCookies.remove("stayLoggedIn");
  router.push("/login");
};

const isFormValid = (() => {
  return computed(() => !errors.firstName && !errors.lastName && !errors.email && passenger.firstName && passenger.lastName && passenger.email);
});

const toggleForm = () => {
  isFormVisible.value = !isFormVisible.value;
  isChangePasswordVisible.value = false;
};

const toggleChangePassword = () => {
  isChangePasswordVisible.value = !isChangePasswordVisible.value;
  isFormVisible.value = false;
};

const validateNewPassword = () => {
  errors.password = newPassword.value.trim() === '' ? 'A jelszó megadása kötelező' : '';
  errors.password = newPassword.value == newPasswordAgain.value ? '' : 'A két jelszó nem egyezik meg!';
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const deleteAccount = async () => {
  try {
    const response = await api.delete(`Passenger/${VueCookies.get("passengerID")}`);
    toast.success("Fiók sikeresen törölve!");
    setTimeout(() => {
      logOut();
    }, 3000);
    logOut();
  }
  catch (error) {
    toast.error("Hiba történt a törlés során!");
  }
};

const savePassword = async() =>{
  try {
    validateNewPassword();
    const data = ref({
      password: newPassword.value
    });
    const response = await api.patch(`Auth/change-password/${VueCookies.get("passengerID")}`, data.value);
    toast.success("Sikeres jelszóváltoztatás!");
    newPassword.value = '';
    newPasswordAgain.value = '';
    isFormVisible = false;
    isChangePasswordVisible = false;
  } catch (error) {
    toast.error("Hiba történt a jelszóváltoztatás során!");
  }
}


const uploadProfilePicture = async (event) => {
  const filePicture = event.target.files[0];
  if (!filePicture ) return;
  
  const formData = new FormData();
  formData.append('file', filePicture );
  
  try {
    const data = ref({
            file: filePicture 
        })
        const response = await api.post(`Passenger/upload/profile-picture/${VueCookies.get("passengerID")}`, data.value,{
          headers:{
                    "Content-Type": "multipart/form-data"
            }
        })
    toast.success("Sikeres feltöltés!");
    getPassenger();
  } catch (error) {
    toast.error("Hiba történt a feltöltés során!");
  }
};

const validateFirstName = () => {
  errors.firstName = passenger.value.firstName.trim() === '' ? 'A keresztnév megadása kötelező' : '';
};

const validateLastName = () => {
  errors.lastName = passenger.value.lastName.trim() === '' ? 'A vezetéknév megadása kötelező' : '';
};

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  errors.email = passenger.value.email.trim() === '' 
    ? 'Az email cím megadása kötelező' 
    : !emailRegex.test(passenger.email) 
      ? 'Érvénytelen email formátum' 
      : '';
};

const getPassenger = async () => {
  try {
    const response = await axios.get(URL + "Passenger/" + VueCookies.get("passengerID"));
    passenger.value = response.data;
    const timestamp = new Date().getTime();
    document.getElementById("pfp").src = `https://api.pointtopoint.hu/api/Passenger/profile-picture/${VueCookies.get('passengerID')}?t=${timestamp}`;
  } catch (error) {
    console.log(error);
  }
};

const saveChanges = async () => {
  validateFirstName();
  validateLastName();
  validateEmail();
  isFormValid();
  try {

        const data = [
            { "op": "replace", "path": "/firstName", "value": `${passenger.value.firstName}` },
            { "op": "replace", "path": "/lastName", "value": `${passenger.value.lastName}` },
            { "op": "replace", "path": "/email", "value": `${passenger.value.email}` }
      ]
        const response = await axios.patch(URL + `Passenger/` + VueCookies.get("passengerID"), data,{
            headers:{
                    Authorization: `Bearer ${VueCookies.get("token")}`,
                    "Content-Type": "application/json-patch+json"
            }
        }
        )
    
    toast.success("Sikeres változtatás!");
    getPassenger();
    isFormVisible = false;
    isChangePasswordVisible = false;
  } catch (error) {
    toast.error("Hiba történt a mentés során!");
  }
};

onMounted(async() => {
  await getPassenger();
});
const goBack = () => {
    router.push("/main");
};

onUnmounted(() =>{
  //reset page
  isFormVisible.value = false;
  passenger.value = {
    firstName: '',
    lastName: '',
    email: ''
  };
  errors.firstName = '';
  errors.lastName = '';
  errors.email = '';
  
})
</script>


<style scoped>
.profile-avatar {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  width: 100%;
  height: 30%;
  transition: .3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.file-input {
  display: none;
}

ion-item {
  --padding-start: 0;
}

ion-item-divider {
  min-height: 1px;
  --background: var(--ion-color-medium);
  margin: 16px 0;
}
ion-fab-button{
    margin-top: 1rem;
}
#controlButton{
    width: 100%;
}
form, .form{
  padding: 10px;
}
.modal{
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.modal-body{
  height: 10vh;
}
h2 {
  font-weight: 700;
  margin-top: 2rem;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}
</style>