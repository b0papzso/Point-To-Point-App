<template>
<ion-page>
    
    <ion-content :fullscreen="true">
      <ion-fab slot="fixed" vertical="top" horizontal="start" :edge="true">
        <ion-fab-button @click="goBack()">
          <ion-icon :icon="chevronBack" ></ion-icon>
        </ion-fab-button>    
    </ion-fab>
    <h2 class="d-flex justify-content-center text-light">Összes útvonal</h2>
    <div class="container-fluid d-flex justify-content-center">
    <div class="p-4">
      <input type="text" placeholder="Honnan szeretnél indulni?" v-on:change="searchStart()" v-model="start" class="form-control mb-3">
    <input type="text" placeholder="Hova szeretnél menni?" v-on:change="searchEnd()" v-model="end" class="form-control">
    </div>
  </div>
      <div v-for="ride in allRides" class="d-flex flex-wrap container justify-content-around mt-5">
        <div class="card mt-3">
          <div class="card-body" >
          <h5 class="card-title">Útvonal: {{ ride.startName }} - {{ ride.endName }}</h5>
          <p class="card-text">Időpont: {{ ride.date }}, {{ ride.start }} - {{ ride.end }}</p>
          <p class="card-text">Ismétlődő: {{ ride.isRegular ? "Igen" : "Nem" }}</p>
          <p class="card-text">Sofőr:<p id="drivertext" @click="showDriverInfo(ride.driverId)">{{ ride.driverName }}</p></p>
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
              <button class="btn btn-info m-2" @click="handleShowAddStops(ride.id)" :disabled="ride.hasJoined">Megálló ajánlása</button>
              <button class="btn btn-success" @click="signUp(ride.id)" :disabled="ride.hasJoined">Jelentkezés</button>
            </div>
        </div>
        </div> 
        </div>
        <div v-if="showAddStops" class="modal fade show d-block" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="modal-window"><MapView /></div> 
          </div>
          <div class="modal-footer">
            <input type="text" class="form-control" placeholder="Megálló neve" v-model="stopName"/>
            <button class="btn btn-success" @click="addStop()">
              Hozzáadás és jelentkezés
            </button>
          </div>
      </div>
    </div>
    </div>
    <div v-if="showSelectedDriver" class="modal fade show d-flex align-items-center" tabindex="-1">
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
import { IonButton, IonIcon, IonPage, IonContent, IonFab, IonFabButton } from '@ionic/vue';
import { shallowRef, markRaw, watch, onUnmounted } from 'vue';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { chevronBack, key } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { Marker } from 'maplibre-gl';
import { onMounted, ref } from 'vue';
import VueCookies from 'vue-cookies'
import "maplibre-gl/dist/maplibre-gl.css";
import MapView from './MapView.vue';
import {useToast} from 'vue-toastification'
import { useMapStore } from "@/stores/mapStore";
const map = shallowRef(null);
const router = useRouter()
const allRides = ref([])
const rideStops = ref([])
const visibleStops = ref({})
const mapStore = useMapStore();
const selectedRideId = ref(null);
var start = ref()
var stopName = ref()
var showAddStops = ref(false)
const selectedDriver = ref(null);
var showSelectedDriver = ref(false)
const toast = useToast()
var end = ref()
import api from '@/components/refreshToken.js'
const selectedRoute = ref(null);
const goBack = () => {
  if (showAddStops.value) {
    closeModal();
  }
  router.push("/main");
  getAllRides();
  visibleStops.value = {};
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

const closeDriverModal = () => {
  showSelectedDriver.value = false;
  selectedDriver.value = null;
};

const addStop = async () => {
  await signUp(selectedRideId.value);
  try {
    const data = ref({
      routeId: selectedRideId.value,
      stopName: stopName.value,
      lat: VueCookies.get("lat"),
      long: VueCookies.get("lng")
    })
    const response = await api.post(`StoppingPoint`, data.value)
    closeModal();
    console.log(data)
    signUp(selectedRideId.value);
  } catch (error) {
    console.log(error)
  }
}
const getAllRides = async () => {
    try {
        const response = await api.get(`Route`);
        const passengerTripsResponse = await api.get(`Trip/getTripByPassenger?passengerId=${VueCookies.get("passengerID")}`);
        if (Array.isArray(response.data)) {
            allRides.value = response.data
        } else {
            allRides.value = [response.data.routeId];
        }

        for (let index = 0; index < allRides.value.length; index++) {
          passengerTripsResponse.data.forEach(trip => {
            if(trip.routeId == allRides.value[index].id)
            {
              allRides.value[index].hasJoined = true
            }
            else
              allRides.value[index].hasJoined = false
          })
            const driverResponse = await api.get(`driver/${allRides.value[index].driverId}`);
            allRides.value[index].driverName = `${driverResponse.data.firstName} ${driverResponse.data.lastName}`;
        }
    } catch (error) {
        console.error("Error fetching user rides:", error);
    }
};
onMounted(async () => {
    await getAllRides();
}),
onUnmounted(() => {
    map.value?.remove();
})

const handleShowAddStops = (routeId) => {
  showAddStops.value = true;
  loadCurrentMap(routeId);
  selectedRideId.value = routeId
};

const loadCurrentMap = async (routeId) => {
  if (mapStore.map) {
    console.warn("Map already initialized. Skipping reinitialization.");
    return;
  }
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
      const colors = ['#00ff00', '#ff0000', '#ffa500', '#800080'];
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
      } catch (error) {
        console.error("Error fetching stopping points:", error);
      }
    }
    visibleStops.value[id] = true;
  }
}

const signUp = async (utId) => {  
  const response = await api.get(`Route/${utId}`)
  const date = response.data.date
  try {
    const data = ref({
      passengerId: VueCookies.get("passengerID"),
      routeId: utId,
      time: date
    })
    const response = await api.post(`Trip`, data.value)
    toast.success("Jelentkezés sikeres!")
    getAllRides()
    
  } catch (error) {
    console.log(error)
    toast.error("Jelentkezés sikertelen!")
  }
}

const searchStart = async () => {
  try {
    if (start.value) {
      allRides.value = []
      const routeResponse = await api.get(`Route/getRouteByStart?start=${start.value}`)
      const stopResponse = await api.get(`StoppingPoint/getByStopName?stop=${start.value}`)
      routeResponse.data.forEach(async routeData => {
        allRides.value.push(routeData)
      })
      stopResponse.data.forEach(async rId => {
        if (!allRides.value.find(route => route.id === rId.routeId)) {
          const routeStopResponse = await api.get(`Route/${rId.routeId}`)
          allRides.value.push(routeStopResponse.data)
        }
      });

      for (let index = 0; index < allRides.value.length; index++) {
        const driverResponse = await api.get(`driver/${allRides.value[index].driverId}`);
        allRides.value[index].driverName = `${driverResponse.data.firstName} ${driverResponse.data.lastName}`;
      }
    } else {
      getAllRides()
    }
  } catch (error) {
    console.log(error)
  }
}

const searchEnd = async () => {
  try {
    if (end.value) {
      allRides.value = []
      const routeResponse = await api.get(`Route/getRouteByEnd?end=${end.value}`)
      const stopResponse = await api.get(`StoppingPoint/getByStopName?stop=${end.value}`)
      routeResponse.data.forEach(async routeData => {
        allRides.value.push(routeData)
      })
      stopResponse.data.forEach(async rId => {
        if (!allRides.value.find(route => route.id === rId.routeId)) {
          const routeStopResponse = await api.get(`Route/${rId.routeId}`)
          allRides.value.push(routeStopResponse.data)
        }
      });
      const driverResponse = await api.get(`driver`);
        driverResponse.data.forEach(driver => {
          if (driver.id === allRides.value[index].driverId) {
            allRides.value[index].driverName = `${driver.firstName} ${driver.lastName}`;
          }
        });
        
    } else {
      getAllRides()
    }
  } catch (error) {
    console.log(error)
  }
}

</script>

<style scoped>
ion-fab-button {
  margin-top: 1rem;
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

.modal{
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.modal-input{
  display: flex;
  justify-content: center;
  align-items: center;
}
.card-body{
  width: 90vw;
}
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
.driver-profile {
  padding: 20px;
}

.driver-info {
  text-align: left;
  width: 75vw;
  margin: 0 auto;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.driver-info p {
  margin-bottom: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

#drivertext{
  color: blue;
  text-decoration: underline;
}
.car-animation{
  display: none;
}
</style>