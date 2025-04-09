<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="logo-container ion-text-center">
        <img src="../../public/logo.png" alt="Logo" class="app-logo" />
      </div>
      
      <div class="form-container">
        <ion-card class="login-card">
          <ion-card-content>
            <h2 class="ion-text-center form-title">Üdvözlünk</h2>
            
            <ion-item class="custom-input">
              <input v-model="email" type="email" class="form-control" id="email"></input>
              <ion-icon name="mail-outline" slot="start"></ion-icon>
            </ion-item>
            
            <ion-item class="custom-input">
              <input v-model="password" :type="passwordVisible ? 'text' : 'password'" class="form-control" id="password"></input>
              <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
              <ion-icon 
                name="eye-outline" 
                slot="end" 
                class="password-toggle"
                @click="togglePasswordVisibility"
              ></ion-icon>
            </ion-item>
            
            <div class="forgot-password ion-text-right">
              <ion-item lines="none" class="stay-logged-in">
                <ion-checkbox v-model="stayLoggedIn" slot="start"></ion-checkbox>
                <ion-label>Maradjak bejelentkezve</ion-label>
              </ion-item>
            </div>
            
            <ion-button expand="block" class="login-button" @click="login">
              Bejelentkezés
            </ion-button>
            <div v-if="errorMessage" class="error-container">
              <p class="error-text">{{ errorMessage }}</p>
            </div>
          </ion-card-content>
        </ion-card>
        <div class="signup-link ion-text-center">
          <p class="text-light">
           Nincs fiókod?
           <a href="/register" id="register" class="text-info">Regisztrálj</a>
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { 
  IonPage, 
  IonContent, 
  IonCard, 
  IonCardContent, 
  IonItem, 
  IonButton,
  IonIcon,
  IonCheckbox,
  IonLabel
} from '@ionic/vue';
import { addIcons } from 'ionicons';
import { 
  mailOutline, lockClosedOutline, eyeOutline, 
} from 'ionicons/icons';
import VueCookies from 'vue-cookies'
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const email = ref("");
const password = ref("");
const stayLoggedIn = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const passwordVisible = ref(false);
const userId = ref("");
const status = ref("");
import api from '@/components/refreshToken.js'

const login = async () => {
  loading.value = true;
  errorMessage.value = "";
  status.value = "";
  if(!email.value || !password.value) {
    errorMessage.value = "Minden mező kitöltése kötelező!";
    loading.value = false;
    return;
  }
  try {
    const response = await api.post("Auth/passenger/login", {
      email: email.value,
      password: password.value,
    });
      localStorage.setItem('token', response.data.token );
      localStorage.setItem('refreshToken', response.data.refreshToken );
      

      if (stayLoggedIn.value) {
        localStorage.setItem('stayLoggedIn', 'true' );
      } else {
        localStorage.setItem('stayLoggedIn', 'false' );
      }

      const passengerResponse = await api.get(`Passenger/getByEmail?email=${email.value}`);
      userId.value = passengerResponse.data.id;
      VueCookies.set("passengerID", userId.value);
      VueCookies.set("token", response.data.token);
      VueCookies.set("refreshToken", response.data.refreshToken);
      localStorage.setItem('passengerID', userId.value);

        router.push("/main");
  
  } catch (error) {
    errorMessage.value = "Hibás email cím vagy jelszó";
  } finally {
    loading.value = false;
  }
};

const autoLogin = async () => {
  const stayLoggedInValue = localStorage.getItem('stayLoggedIn');
  if (stayLoggedInValue === 'true') {
    stayLoggedIn.value = true;
    const passengerID  = localStorage.getItem('passengerID');
    const refreshToken = localStorage.getItem('refreshToken');

    const data = await api.post('/auth/refresh-token', {
      Id: passengerID,
      refreshToken: refreshToken,
    });
    if (data.status === 200) {
      router.push("/main");
    }
  } else {
    return;
  }
};

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
  const inputElements = document.querySelectorAll('ion-input[type="password"]');
  inputElements.forEach(el => {
    el.type = passwordVisible.value ? 'text' : 'password';
  });
};



onMounted(() => {
 autoLogin();
});
addIcons({
  'mail-outline': mailOutline,
  'lock-closed-outline': lockClosedOutline,
  'eye-outline': eyeOutline,
});
</script>
  <style>
  .logo-container {
  margin-top: 40px;
  margin-bottom: 30px;
}

.app-logo {
  margin: 0 auto;
  border-radius: 20px;
}

.app-name {
  margin-top: 12px;
  font-size: 28px;
  font-weight: bold;
}

.form-container {
  margin-top: 10px;
}

.login-card {
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

.password-toggle {
  cursor: pointer;
}

.forgot-password {
  margin-bottom: 16px;
}

.forgot-btn {
  font-size: 14px;
  --color: #666;
  text-transform: none;
}

.login-button {
  margin-top: 10px;
  border-radius: 12px;
  padding-top: 16px;
  padding-bottom: 16px;
  font-weight: 600;
}

.alternative-login {
  margin-top: 24px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 16px 0;
}

.divider:before,
.divider:after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.divider-text {
  padding: 0 10px;
  color: #777;
  font-size: 14px;
}

.social-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.signup-link {
  margin-top: 30px;
  font-size: 15px;
  color: #666;
}

.signup-btn {
  font-weight: 600;
  text-transform: none;
}
.error-container {
  margin: 10px 0;
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(255, 0, 0, 0.1);
}

.error-text {
  color: #dc3545;
  font-size: 14px;
  margin: 0;
  text-align: center;
}
  </style>
