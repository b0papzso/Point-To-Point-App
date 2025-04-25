<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-fab slot="fixed" vertical="top" horizontal="start" :edge="true">
        <ion-fab-button @click="goBack()" class="mt-1">
          <ion-icon :icon="chevronBack"></ion-icon>
        </ion-fab-button>    
      </ion-fab>
      
      <h2 class="text-center my-3">Saját útjaim</h2>
      
      <div class="container py-4">
        <div class="row g-4">
          <div v-for="ride in userRides" :key="ride.id" class="col-12 col-lg-6">
            <div class="card route-card h-100 shadow-sm">
              <div class="card-header bg-gradient d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0 text-dark">
                  <ion-icon :icon="navigateOutline" class="me-2"></ion-icon>
                  {{ ride.startName }} - {{ ride.endName }}
                </h5>
                <div class="d-flex gap-2 align-items-center">
                  <span class="badge" :class="ride.isRegular ? 'bg-success' : 'bg-warning'">
                    {{ ride.isRegular ? "Ismétlődő" : "Egyszeri" }}
                  </span>
                  <button class="btn-close btn-close-danger" @click="showDeleteConfirm = true" aria-label="Delete"></button>
                </div>
              </div>
              
              <div class="card-body">
                <div v-if="ride.isRegular" class="d-flex flex-row align-items-center mb-1">
                  <div v-for="n in 7" :key="n" >
                    <span class="badge bg-success me-1">{{ ride.repetitions[n - 1] ? days[n - 1] : "" }}</span>
                  </div>
                </div>
                <div v-if="showDeleteConfirm" class="modal fade show d-flex align-items-center" tabindex="-1" id="deleteModal">
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">Út törlése: {{ ride.startName }} - {{ ride.endName }}</h5>
                        <button type="button" class="btn-close btn-close-white" @click="showDeleteConfirm = false" aria-label="Close"></button>
                      </div>
                      <div class="modal-body" id="deleteModalBody">
                        <div class="alert alert-warning">
                          <ion-icon :icon="warningOutline" class="me-2 fs-4"></ion-icon>
                          <p>Biztosan törölni szeretnéd az útvonalat a listából? Ez a művelet nem visszavonható!</p>
                        </div>
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="showDeleteConfirm = false">
                          <ion-icon :icon="closeOutline" class="me-1"></ion-icon>
                          Mégsem
                        </button>
                        <button type="button" class="btn btn-danger" @click="deleteRide(ride.tripId)">
                          <ion-icon :icon="trashOutline" class="me-1"></ion-icon>
                          Törlés
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="route-info mb-3">
                  <p class="d-flex align-items-center mb-2" >
                    <ion-icon :icon="calendarOutline" class="me-2 text-primary" :style="ride.isRegular ? 'display: none' : 'display : block'"></ion-icon>
                    <span class="fw-bold me-2" :style="ride.isRegular ? 'display: none' : 'display : block'">Időpont: {{ ride.date }}</span> 
                  </p>
                  <p class="d-flex align-items-center mb-2">
                    <ion-icon :icon="timeOutline" class="me-2 text-primary"></ion-icon>
                    <span class="fw-bold me-2">Indulás-érkezés:</span> {{ ride.start }} - {{ ride.end }}
                  </p>
                  <div class="d-flex align-items-center mb-2">
                    <ion-icon :icon="personOutline" class="me-2 text-primary"></ion-icon>
                    <span class="fw-bold me-2">Sofőr:</span>
                    <button class="driver-btn text-primary" @click="showDriverInfo(ride.driverId)">
                      {{ ride.driverName }}
                      <ion-icon :icon="informationCircleOutline" class="ms-1"></ion-icon>
                    </button>
                  </div>
                  <p class="d-flex align-items-center mb-0">
                    <ion-icon :icon="checkmarkCircleOutline" class="me-2" :class="ride.status ? 'text-success' : 'text-warning'"></ion-icon>
                    <span class="fw-bold me-2">Állapot:</span>
                    <span :class="ride.status ? 'text-success' : 'text-warning'">
                      {{ ride.status ? "Elfogadva" : "Még nincs elfogadva" }}
                    </span>
                  </p>
                </div>
                
                <div class="route-actions d-flex flex-wrap gap-2 mb-3">
                  <button class="btn btn-outline-primary" @click="showStops(ride.id)">
                    <ion-icon :icon="visibleStops[ride.id] ? 'chevron-up' : 'chevron-down'" class="me-1"></ion-icon>
                    {{ visibleStops[ride.id] ? "Elrejtés" : "Megállók" }}
                  </button>
                  <button 
                    class="btn btn-success ms-auto" 
                    @click="lathato(ride.id)" 
                    :disabled="!ride.status">
                    <ion-icon :icon="starOutline" class="me-1"></ion-icon>
                    {{ visibleRating[ride.id] ? "Bezárás" : "Sofőr értékelése" }}
                  </button>
                </div>
                
                <div v-if="visibleStops[ride.id]" class="stops-container mt-3 p-3 bg-light rounded">
                  <h6 class="d-flex align-items-center mb-3">
                    <ion-icon :icon="pinOutline" class="me-2 text-primary"></ion-icon>
                    Útvonal megállói
                  </h6>
                  
                  <div v-if="rideStops[ride.id] && rideStops[ride.id].length" class="stops-list">
                    <div v-for="stop in rideStops[ride.id]" :key="stop.id" class="stop-item d-flex align-items-center mb-2">
                      <span
                        class="stop-marker me-2"
                        :style="{ backgroundColor: stop.markerColor }"
                      ></span>
                      <span :class="{'stop-accepted': stop.isAccepted, 'stop-suggested': !stop.isAccepted}">
                        {{ stop.stopName }}
                        <span v-if="!stop.isAccepted" class="badge bg-info ms-2">Javasolt</span>
                      </span>
                    </div>
                  </div>
                  <p v-else class="text-muted fst-italic">Nincsenek megállók.</p>
                  
                  <div class="stops-actions mt-3">
                    <button class="btn btn-info" @click="handleShowAddStops(ride.id)">
                      <ion-icon :icon="mapOutline" class="me-1"></ion-icon>
                      Megállók megtekintése
                    </button>
                  </div>
                </div>
                
                <div v-if="visibleRating[ride.id]" class="rating-container mt-3 p-3 bg-light rounded">
                  <h6 class="d-flex align-items-center mb-3">
                    <ion-icon :icon="starOutline" class="me-2 text-warning"></ion-icon>
                    Sofőr értékelése
                  </h6>
                  
                  <div class="rating-stars mb-3">
                    <div class="d-flex align-items-center justify-content-center">
                      <div class="star-container" v-for="n in 5" :key="n" @click="ertekelSzam(n)">
                        <span :id="n" class="star-icon">★</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="rating-form">
                    <div class="mb-3">
                      <input 
                        type="text" 
                        class="form-control" 
                        placeholder="Foglald össze a véleményed" 
                        v-model="eCim"
                      >
                    </div>
                    <div class="mb-3">
                      <textarea 
                        class="form-control" 
                        rows="3" 
                        placeholder="Ide írd az véleményed" 
                        v-model="eSzoveg"
                      ></textarea>
                    </div>
                    <button class="btn btn-success w-100" @click="kuldes(ride.driverIndex)">
                      <ion-icon :icon="sendOutline" class="me-1"></ion-icon>
                      Értékelés küldése
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="showAddStops" class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">Megállók megtekintése</h5>
              <button type="button" class="btn-close btn-close-white" @click="showAddStops = !showAddStops" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
              <div class="modal-window"><MapView /></div> 
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" @click="showAddStops = !showAddStops">
                <ion-icon :icon="checkmarkOutline" class="me-1"></ion-icon>
                Kész
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="showSelectedDriver" class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">Sofőr adatai</h5>
              <button type="button" class="btn-close btn-close-white" @click="closeDriverModal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="driver-profile text-center">
                <div class="profile-avatar mb-3">
                  <img :src="`https://api.pointtopoint.hu/api/Driver/profile-picture/${selectedDriver.id}`" alt="Profile Picture" class="rounded-circle shadow">
                </div>
                <h4 class="mb-3 fw-bold">{{ selectedDriver?.firstName }} {{ selectedDriver?.lastName }}</h4>
                <div class="driver-info">
                  <div class="info-item mb-2 p-2">
                    <strong>Email:</strong> {{ selectedDriver?.email }}
                  </div>
                  <div class="info-item mb-2 p-2">
                    <strong>Férőhely:</strong> {{ selectedDriver?.carCapacity }}
                    <ion-icon :icon="peopleOutline" class="ms-1"></ion-icon>
                  </div>
                  <div class="info-item p-2" :class="selectedDriver?.rating >= 4 ? 'bg-success text-white' : selectedDriver?.rating >= 3 ? 'bg-warning' : 'bg-danger text-white'">
                    <strong>Értékelés:</strong> 
                    <span class="ms-1">{{ selectedDriver?.rating || 'Nincs értékelés' }}</span>
                    <div class="rating-stars">
                      <ion-icon 
                        v-for="i in 5" 
                        :key="i"
                        :icon="i <= Math.round(selectedDriver?.rating || 0) ? 'star' : 'star-outline'"
                        class="ms-1">
                      </ion-icon>
                    </div>
                  </div>
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
import { 
  chevronBack,
  navigateOutline,
  calendarOutline,
  timeOutline,
  personOutline,
  checkmarkCircleOutline,
  pinOutline,
  informationCircleOutline,
  peopleOutline,
  starOutline,
  star,
  closeOutline,
  trashOutline,
  warningOutline,
  mapOutline,
  sendOutline,
  checkmarkOutline
} from 'ionicons/icons';
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
const days = ref(['H' , 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'])
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

const closeDriverModal = () => {
  showSelectedDriver.value = false;
  selectedDriver.value = null;
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
    showDeleteConfirm.value = false;
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
            star.style.fontSize = "1.5rem";
        }
    }
    for (let index = szam; index < 5; index++) {
        const star = document.getElementById(index + 1);
        if (star) {
            star.style.color = "#6c757d";
            star.style.fontSize = "1.5rem";
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
        if (!ertekelesSzam.value) {
            toast.error("Kérjük, adj értékelést a sofőrnek!");
            return;
        }
        
        const data = ref({
            reviewingUserId: VueCookies.get("passengerID"),
            reviewedUserId: userRides.value[soforSzam].driverId,
            rating: ertekelesSzam.value,
            title: eCim.value,
            reviewMessage: eSzoveg.value
        })
        const response = await api.post(`review`, data.value)
        toast.success("Sikeres értékelés!")
        visibleRating.value = {};
        getUserRides();
    }
    catch(error){
        console.log(error);
        toast.error("Hiba történt az értékelés küldése során!");
    }
}
</script>

<style scoped>
ion-content {
  --background: #f0f2f5;
}

h2 {
  font-weight: 700;
  margin-top: 2rem;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}

.route-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
}

.route-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}

.card-header {
  background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
  color: white;
  padding: 15px;
  border-bottom: none;
}

.btn-close-danger {
  filter: invert(25%) sepia(100%) saturate(2000%) hue-rotate(345deg) brightness(80%);
}

.driver-btn {
  background: none;
  border: none;
  padding: 0;
  text-decoration: underline;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s;
}

.driver-btn:hover {
  color: #0056b3;
}

.stop-marker {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  border: 2px solid white;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.2);
}

.stops-container, .rating-container {
  border-radius: 8px;
  border-left: 4px solid #4e73df;
}

.stop-suggested {
  font-style: italic;
}

.stop-accepted {
  font-weight: 500;
}

.star-container {
  cursor: pointer;
  padding: 0 5px;
}

.star-icon {
  font-size: 1.5rem;
  color: #6c757d;
  transition: color 0.2s, transform 0.2s;
}

.star-container:hover .star-icon {
  transform: scale(1.2);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.driver-info {
  max-width: 500px;
  margin: 0 auto;
}

.info-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.rating-stars {
  display: block;
  width: 100%;
  margin-top: 5px;
  font-size: 1.2rem;
  color: #ffc107;
}

.modal {
  background-color: rgba(0,0,0,0.5);
  backdrop-filter: blur(5px);
}

.modal-window {
  height: 60vh;
  border-radius: 8px;
  overflow: hidden;
}

</style>