<template>
<ion-page>
    
    <ion-content :fullscreen="true">
      <ion-fab slot="fixed" vertical="top" horizontal="start" :edge="true">
        <ion-fab-button @click="goBack()">
          <ion-icon :icon="chevronBack" ></ion-icon>
        </ion-fab-button>    
    </ion-fab>
    <h2 class="d-flex justify-content-center text-light">Saját útjaim</h2>
    <div v-for="ride in userRides" :key="ride.id" class="d-flex flex-wrap container justify-content-around mt-5">
    <div class="card mt-3">
      <div class="card-body">
        <button class="btn btn-outline-danger d-flex float-end" @click="showDeleteConfirm = true">X</button>
        <div v-if="showDeleteConfirm" class="modal fade show d-flex align-items-center" tabindex="-1" id="deleteModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Út törlése: {{ ride.startName }} - {{ ride.endName }}</h5>
              <button type="button" class="btn-close" @click="showDeleteConfirm = false" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="deleteModalBody">
              <p>Biztosan törölni szeretnéd az útvonalat a listából? Ez a művelet nem visszavonható!</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showDeleteConfirm = false">Mégsem</button>
              <button type="button" class="btn btn-danger" @click="deleteRide(ride.tripId)">Törlés</button>
            </div>
          </div>
        </div>
      </div>
        <h5 class="card-title">Útvonal: {{ ride.startName }} - {{ ride.endName }}</h5>
        <p class="card-text">Időpont:{{ ride.date }}, {{ ride.start }} - {{ ride.end }}</p>
        <p class="card-text">Ismétlődő: {{ ride.isRegular ? "Igen" : "Nem" }}</p>
        <p class="card-text">Sofőr:<p id="drivertext" @click="showDriverInfo(ride.driverId)">{{ ride.driverName }}</p></p>
        <p class="card-text">Állapot: {{ ride.status ? "Elfogadva" : "Még nincs elfogadva" }}</p>
        <button class="btn btn-warning mb-2" @click="showStops(ride.id)" id="soforGomb">
            {{ visibleStops[ride.id] ? "Elrejtés" : "Megállók megtekintése" }}
          </button>
          <div v-if="visibleStops[ride.id]">
              <p class="card-text">Útvonal megállói:</p>
              <ul v-if="rideStops[ride.id] && rideStops[ride.id].length">
                <li v-for="stop in rideStops[ride.id]" :key="stop.id">
                  <span
                    :style="{ 
                      display: 'inline-block', 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: stop.markerColor, 
                      borderRadius: '50%', 
                      marginRight: '8px' 
                    }"
                  ></span>
                  {{ stop.isAccepted ? stop.stopName : stop.stopName + " (Javasolt)" }}
                </li>
              </ul>
              <p v-else class="text-muted">Nincsenek megállók.</p>
              <button class="btn btn-info mb-2" @click="handleShowAddStops(ride.id)">Megállók megtekintése</button>
            </div>
            <div v-if="showAddStops" class="modal fade show d-block" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="btn-close" @click="showAddStops = !showAddStops" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="modal-window"><MapView /></div> 
          </div>
          <div class="modal-footer">
            <button class="btn btn-success" @click="showAddStops = !showAddStops">
              Kész
            </button>
          </div>
      </div>
    </div>
  </div>
        <button class="btn btn-success mb-2" @click="lathato(ride.id)" id="soforGomb" :disabled="!ride.status">
          {{visibleRating[ride.id] ? "Bezárás" : "Sofőr értékelése"}}
        </button>
        <div v-if="visibleRating[ride.id]">
            <div class="d-flex flex-row">
            <div class="csillag" v-for="n in 5" :key="n" @click="ertekelSzam(n)">
              <p :id="n">★</p>
            </div>
          </div>
          <input type="text" placeholder="Foglald össze a véleményed" v-model="eCim">
          <textarea type="text" placeholder="Ide írd az véleményed" v-model="eSzoveg"/><br>
          <button id="ertekelesGomb" class="btn btn-success mt-2 d-flex" @click="kuldes(ride.driverIndex)">
            Küldés
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showSelectedDriver" class="modal fade show d-block mt-5" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Sofőr adatai</h5>
            <button type="button" class="btn-close" @click="closeDriverModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="driver-profile text-center">
              <div class="profile-avatar mb-3">
                <img :src="`https://api.pointtopoint.hu/api/Driver/profile-picture/${selectedDriver.id}`" alt="Profile Picture">
              </div>
              <h4 class="mb-3">{{ selectedDriver?.firstName }} {{ selectedDriver?.lastName }}</h4>
              <div class="driver-info">
                <p><strong>Email:</strong> {{ selectedDriver?.email }}</p>
                <p><strong>Férőhely:</strong> {{ selectedDriver?.carCapacity }}</p>
                <p><strong>Értékelés:</strong> {{ selectedDriver?.rating || 'Nincs értékelés' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
   </ion-content>
  </ion-page>
</template>

<script setup>
import { IonIcon, IonPage, IonContent, IonFab, IonFabButton } from '@ionic/vue';
import { chevronBack } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import api from '@/components/refreshToken.js'
import { Marker } from 'maplibre-gl';
import VueCookies from 'vue-cookies'
import { useToast } from 'vue-toastification';
import { onMounted, ref, shallowRef } from 'vue';
import "maplibre-gl/dist/maplibre-gl.css";
import MapView from './MapView.vue';
import { useMapStore } from "@/stores/mapStore";
const map = shallowRef(null);
const userRoutes = ref([]);
const toast = useToast();
const userRides = ref([]);
var showSelectedDriver = ref(false)
const ertekelesSzam = ref(0);
var showDeleteConfirm = ref(false)
const eCim = ref("");
const eSzoveg = ref("");
const router = useRouter();
const visibleStops = ref({})
const visibleRating = ref({})
var showAddStops = ref(false)
const rideStops = ref([])
const mapStore = useMapStore();
const selectedRideId = ref(null);
const selectedDriver = ref(null);
const isVisible = ref("none")
const colors = ['#00ff00', '#ff0000', '#ffa500', '#800080'];
const selectedRoute = ref(null);
const drivers = ref([])
const goBack = () => {
    router.push("/main");
};

const handleShowAddStops = (routeId) => {
  showAddStops.value = true;
  loadCurrentMap(routeId);
  selectedRideId.value = routeId
};

const closeModal = () => {
  showAddStops.value = false;
};

const showDriverInfo = async (driverId) => {
  try {
    const response = await api.get(`driver/${driverId}`);
    selectedDriver.value = response.data;
    showSelectedDriver.value = true;
    const ratingsResponse = await api.get(`Review/AvgRating/${driverId}`);
    selectedDriver.value.rating = parseFloat(ratingsResponse.data).toFixed(2);
    
  } catch (error) {
    console.error("Error fetching driver info:", error);
  }
};

const deleteRide = async(rideId) =>{
  try {
    const response = await api.delete(`Trip/${rideId}`);
    toast.success("Útsikeresen törölve!");
    getUserRides();
    showDeleteConfirm = false
  }
  catch (error) {
    toast.error("Hiba történt a törlés során!");
  }
}
 
const loadCurrentMap = async (routeId) => {
  try {
    const routeResponse = await api.get(`StoppingPoint/getByRouteId?routeId=${routeId}`);
    selectedRoute.value = routeResponse.data;
    var centerLng = 0
    var centerLat = 0
    var counter = 0
    selectedRoute.value.forEach(stop => {
      centerLng += stop.long
      centerLat += stop.lat
      counter++
    }, 0);
    centerLat = centerLat / counter
    centerLng = centerLng / counter
    mapStore.setView(centerLng, centerLat, 3);
    if(mapStore.map){
      for (let index = 0; index < selectedRoute.value.length; index++) {
        const stop = selectedRoute.value[index];
        const color = colors[index % colors.length];

        new Marker({ color })
          .setLngLat([stop.long, stop.lat])
          .addTo(mapStore.map);

        stop.markerColor = color;

        console.log(stop.long, stop.lat, color);
      }
    };
  } catch (error) {
    console.error('Error loading route:', error);
  }
};

const showStops = async (id) => {
  if (visibleStops.value[id]) {
    visibleStops.value[id] = false;
  } else {
    if (!rideStops.value[id]) {
      try {
        const response = await api.get(`StoppingPoint/getByRouteId?routeId=${id}`);
        rideStops.value[id] = response.data;
        console.log(rideStops.value[id].length)
      } catch (error) {
        console.error("Error fetching stopping points:", error);
      }
    }
    visibleStops.value[id] = true;
  }
}

const getUserRides = async () => {
    try {
        const response = await api.get(`Trip/getTripByPassenger?passengerId=${VueCookies.get("passengerID")}`);
        if (Array.isArray(response.data)) {
            userRoutes.value.id = response.data.map(trip => trip.routeId);
            userRoutes.value.status = response.data.map(trip => trip.isAccepted);
        } else {
            userRoutes.value = [response.data.routeId];
        }

        userRides.value = await Promise.all(
            userRoutes.value.id.map(async (routeId) => {
                try {
                    const routeResponse = await api.get(`Route/${routeId}`);
                    var allData = routeResponse.data
                    const statusResponse = await api.get(`Trip/getTripByPassenger?passengerId=${VueCookies.get("passengerID")}`);
                    var status = statusResponse.data.filter(trip => trip.routeId == routeId)
                    for (let index = 0; index < status.length; index++) {
                        allData.isAccepted = status[index].isAccepted
                        allData.tripId = status[index].id
                    }
                    return allData;
                } catch (error) {
                    console.error(`Error fetching route ${routeId}:`, error);
                    return null;
                }
            }),
        );

        for (let index = 0; index < userRides.value.length; index++) {
            const driverResponse = await api.get(`driver/${userRides.value[index].driverId}`);
            drivers.value[index] = driverResponse.data.id
            userRides.value[index].driverName = `${driverResponse.data.firstName} ${driverResponse.data.lastName}`;
            userRides.value[index].driverIndex = index
            userRides.value[index].driverId = driverResponse.data.id
            userRides.value[index].status = userRoutes.value.status[index]
        }
    } catch (error) {
        console.error("Error fetching user rides:", error);
    }
};

onMounted(async () => {
    await getUserRides();
    isVisible.value = "none"
});

const ertekelSzam = (szam) => {
    ertekelesSzam.value = szam;
    for (let index = 0; index < szam; index++) {
  const star = document.getElementById(index + 1);
        if (star) {
            star.style.color = "gold";
            star.style.fontSize = "1rem";
        }
    }
for (let index = szam; index < 5; index++) {
        const star = document.getElementById(index + 1);
        if (star) {
            star.style.color = "black";
            star.style.fontSize = "1rem";
        }
    }
};

const lathato = (id) => {
    ertekelSzam.value = 0;
    eCim.value = "";
    eSzoveg.value = "";
  if (visibleRating.value[id]) {
    visibleRating.value = {};
  } else {
    visibleRating.value = {};
    visibleRating.value[id] = true;
  }
};
const kuldes = async(soforSzam) =>{
    try{
        
        const data = ref({
            reviewingUserId: VueCookies.get("passengerID"),
            reviewedUserId: userRides.value[soforSzam].driverId,
            rating: ertekelesSzam,
            title: eCim,
            reviewMessage: eSzoveg
        })
        const response = await api.post(`review`, data.value)
        toast.success("Sikeres értékelés!")
        getUserRides()
    }
    catch(error){
        console.log(error)
    }
}
</script>

<style scoped>
ion-fab-button{
    margin-top: 1rem;
}

#ertekeles, #ertekelesGomb, #csillagok, #ertekelesCim{
    display: none;
    margin-top: 5px;
    width: fit-content;
}
#ertekeles{
    height: 50px;
}
.csillag{
    height: 3vh;
    width: 10vw
}
.card-body{
  width: 90vw;
}
.modal-window{
  height: 70vh;
}
.modal-body{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 75vh;
}
#deleteModal{
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
#deleteModalBody{
  height: 15vh;
}
#drivertext{
  color: blue;
  text-decoration: underline;
}
</style>