<template>
    <ion-page>
      <ion-content class="ion-padding">
        <div class="logo-container ion-text-center">
          <img src="../../public/logo.png" alt="Logo" class="app-logo" />
        </div>
        
        <div class="form-container">
          <ion-card class="register-card">
            <ion-card-content>
              <h2 class="ion-text-center form-title">Regisztráció</h2>
              
              <ion-item class="custom-input">
                <input v-model="firstName" type="text" class="form-control" placeholder="Keresztnév" minlength="3" maxlength="20">
                <ion-icon name="person-outline" slot="start"></ion-icon>
              </ion-item>
              
              <ion-item class="custom-input">
                <input v-model="lastName" type="text" class="form-control" placeholder="Vezetéknév" minlength="3" maxlength="20">
                <ion-icon name="person-outline" slot="start"></ion-icon>
              </ion-item>
  
              <ion-item class="custom-input">
                <input v-model="email" type="email" class="form-control" placeholder="Email" minlength="10" maxlength="50">
                <ion-icon name="mail-outline" slot="start"></ion-icon>
              </ion-item>
              
              <ion-item class="custom-input">
                <input v-model="password" :type="passwordVisible ? 'text' : 'password'" class="form-control" placeholder="Jelszó" minlength="8">
                <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
                <ion-icon 
                  name="eye-outline" 
                  slot="end" 
                  class="password-toggle"
                  @click="togglePasswordVisibility"
                ></ion-icon>
              </ion-item>
  
              <ion-item class="custom-input">
                <input v-model="passwordAgain" :type="passwordVisible ? 'text' : 'password'" class="form-control" placeholder="Jelszó újra" minlength="8">
                <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
              </ion-item>
              
              <ion-button expand="block" class="register-button" @click="authenticate" :disabled="isDisabled">
                Regisztráció
              </ion-button>
            </ion-card-content>
          </ion-card>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { 
    IonPage, 
    IonContent, 
    IonCard, 
    IonCardContent, 
    IonItem, 
    IonButton,
    IonIcon
  } from '@ionic/vue';
  import { addIcons } from 'ionicons';
  import api from '@/components/refreshToken.js';
  import { 
    mailOutline, 
    lockClosedOutline, 
    eyeOutline,
    personOutline 
  } from 'ionicons/icons';
  import { useToast } from 'vue-toastification';
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  
  const firstName = ref('');
  const lastName = ref('');
  const email = ref('');
  const password = ref('');
  const router = useRouter();
  const passwordAgain = ref('');
  const passwordVisible = ref(false);
  const toast = useToast();
  
  const togglePasswordVisibility = () => {
    passwordVisible.value = !passwordVisible.value;
  };
  
  addIcons({
    'mail-outline': mailOutline,
    'lock-closed-outline': lockClosedOutline,
    'eye-outline': eyeOutline,
    'person-outline': personOutline
  });

    const isDisabled = computed(() => {
        return !firstName.value || !lastName.value || !email.value || !password.value || !passwordAgain.value || password.value !== passwordAgain.value;
    });
    const authenticate = async() => {
        try
        {const data = ref({
            "firstName": firstName.value,
            "lastName": lastName.value,
            "email": email.value,
            "password": password.value,
            "balance": 0
        });
        const response = await api.post(`Auth/passenger/register`, data.value,{
            headers: {
                'Content-Type': 'application/json-patch+json'
            }
        });
        toast.success("Sikeres regisztráció")
        router.push("/login")
    }
        catch(error){
            console.log(error)
        }
    };
  </script>
  
  <style scoped>
  .logo-container {
    margin-top: 40px;
    margin-bottom: 30px;
  }
  
  .app-logo {
    margin: 0 auto;
    border-radius: 20px;
  }
  
  .form-container {
    margin-top: 10px;
  }
  
  .register-card {
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 10px;
  }
  
  .form-title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 20px;
    margin-top: 10px;
  }
  
  .custom-input {
    margin-bottom: 16px;
    background: #f7f7f7;
    border-radius: 10px;
    --padding-start: 12px;
    --padding-end: 12px;
  }
  
  .register-button {
    margin-top: 20px;
    border-radius: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    font-weight: 600;
  }
  
  .login-link {
    margin-top: 30px;
    font-size: 15px;
    color: #666;
  }
  
  .login-link a {
    font-weight: 600;
    text-decoration: none;
    color: var(--ion-color-primary);
  }
  </style>