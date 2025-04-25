<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-fab slot="fixed" vertical="top" horizontal="start" :edge="true">
        <ion-fab-button @click="goBack()" class="mt-1">
          <ion-icon :icon="chevronBack"></ion-icon>
        </ion-fab-button>    
      </ion-fab>
      
      <h2 class="text-center my-3">Összes útvonal</h2>
      
      <div class="search-container mx-auto px-4 py-3 bg-light rounded shadow-sm">
        <div class="row mb-3">
          <div class="col-12">
            <div class="btn-group w-100">
              <button 
                class="btn" 
                :class="searchMethod === 'text' ? 'btn-primary' : 'btn-outline-primary'"
                @click="searchMethod = 'text'">
                <ion-icon :icon="textOutline" class="me-1"></ion-icon>
                Szöveges keresés
              </button>
              <button 
                class="btn" 
                :class="searchMethod === 'map' ? 'btn-primary' : 'btn-outline-primary'"
                @click="searchMethod = 'map', getUserLocation(true)">
                <ion-icon :icon="mapOutline" class="me-1"></ion-icon>
                Térképes keresés
              </button>
            </div>
          </div>
        </div>

        <div v-if="searchMethod === 'text'" class="row g-3">
          <div class="col-12 col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-primary text-white">
                <ion-icon :icon="locationOutline"></ion-icon>
              </span>
              <input type="text" placeholder="Honnan szeretnél indulni?" v-on:change="searchRoutes()" v-model="start" class="form-control">
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-primary text-white">
                <ion-icon :icon="flagOutline"></ion-icon>
              </span>
              <input type="text" placeholder="Hova szeretnél menni?" v-on:change="searchRoutes()" v-model="end" class="form-control">
            </div>
          </div>
        </div>

        <div v-if="searchMethod === 'location'" class="row g-3">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <p class="mb-1">
                  <span class="badge bg-primary me-2">Jelenlegi helyzet</span>
                  <span v-if="userLocation">{{ userLocation }}</span>
                  <span v-else class="text-muted">Helyzet meghatározása...</span>
                </p>
              </div>
              <button 
                class="btn btn-outline-primary" 
              >
                <ion-icon :icon="refreshOutline" class="me-1"></ion-icon>
                Frissítés
              </button>
            </div>
            <div class="input-group">
              <span class="input-group-text bg-primary text-white">
                <ion-icon :icon="flagOutline"></ion-icon>
              </span>
              <input type="text" placeholder="Hova szeretnél menni?" v-model="end" class="form-control">
            </div>
            <div class="mt-3">
              <button 
                class="btn btn-primary w-100" 
                @click="searchFromCurrentLocation()" 
                :disabled="!userLocation || !end">
                <ion-icon :icon="searchOutline" class="me-1"></ion-icon>
                Keresés
              </button>
            </div>
          </div>
        </div> 

        <div v-if="searchMethod === 'map'" class="row g-3">
  <div class="col-12">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <p class="mb-1">
          <span class="badge bg-primary me-2">Jelenlegi helyzet</span>
          <span v-if="userLocation">{{ userLocation.lat }}, {{ userLocation.lng }}</span>
          <span v-else class="text-muted">Helyzet meghatározása...</span>
        </p>
      </div>
      <button 
        class="btn btn-outline-primary"
        @click="getUserLocation(true)">
        <ion-icon :icon="refreshOutline" class="me-1"></ion-icon>
        Frissítés
      </button>
    </div>

    <button 
      class="btn btn-primary w-100" 
      @click="openMapModal">
      <ion-icon :icon="mapOutline" class="me-1"></ion-icon>
      Térkép megnyitása
    </button>

    <div class="mt-3">
      <div class="d-flex justify-content-between align-items-center">
        <div class="map-coordinates">
          <p class="mb-0" v-if="!VueCookies.get('lat') && !VueCookies.get('lng')">
            <span class="badge bg-success me-2">Cél</span>
            {{ VueCookies.get("lat") }} , {{ VueCookies.get("lng") }}
          </p>
          <p v-if="!VueCookies.get('lat') && !VueCookies.get('lng')" class="text-muted mb-0">
            <ion-icon :icon="informationCircleOutline" class="me-1"></ion-icon>
            Nyisd meg a térképet a célpont kiválasztásához
          </p>
        </div>
      </div>
    </div>

    <div class="mt-3" v-if="VueCookies.get('lat') && VueCookies.get('lng') && userLocation">
      <button 
        class="btn btn-primary w-100" 
        @click="searchOptimalRoutes()" 
        :disabled="!VueCookies.get('lat') ||  !VueCookies.get('lng') || !userLocation">
        <ion-icon :icon="searchOutline" class="me-1"></ion-icon>
        Optimális útvonalak keresése
      </button>
    </div>
  </div>
</div>
      </div>
      
      <div class="container py-4">
        <div class="row g-4">
          <div v-for="ride in allRides" :key="ride.id" class="col-12 col-lg-6">
            <div class="card route-card h-100 shadow-sm">
              <div class="card-header bg-gradient d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0 text-dark">
                  <ion-icon :icon="navigateOutline" class="me-2"></ion-icon>
                  {{ ride.startName }} - {{ ride.endName }}
                </h5>
                <span class="badge m-2" :class="ride.isRegular ? 'bg-success' : 'bg-warning'">
                  {{ ride.isRegular ? "Ismétlődő" : "Egyszeri" }}
                </span>
                
              </div>
              
              <div class="card-body">
                <div v-if="ride.isRegular" class="d-flex flex-row align-items-center mb-1">
                  <div v-for="n in 7" :key="n" >
                    <span class="badge bg-success me-1">{{ ride.repetitions[n - 1] ? days[n - 1] : "" }}</span>
                  </div>
                </div>
                <div class="route-info mb-3">
                  <p class="d-flex align-items-center mb-2">
                    <ion-icon :icon="calendarOutline" class="me-2 text-primary" :style="ride.isRegular ? 'display: none' : 'display : block'"></ion-icon>
                    <span class="fw-bold me-2" :style="ride.isRegular ? 'display: none' : 'display : block'">Időpont: {{ ride.date }}</span> 
                  </p>
                  <p class="d-flex align-items-center mb-2">
                    <ion-icon :icon="timeOutline" class="me-2 text-primary"></ion-icon>
                    <span class="fw-bold me-2">Indulás-érkezés:</span> {{ ride.start }} - {{ ride.end }}
                  </p>
                  <div class="d-flex align-items-center mb-0">
                    <ion-icon :icon="personOutline" class="me-2 text-primary"></ion-icon>
                    <span class="fw-bold me-2">Sofőr:</span>
                    <button class="driver-btn text-primary" @click="showDriverInfo(ride.driverId)">
                      {{ ride.driverName }}
                      <ion-icon :icon="informationCircleOutline" class="ms-1"></ion-icon>
                    </button>
                  </div>
                  
                  <p v-if="ride.distance !== undefined" class="d-flex align-items-center mb-0 mt-2">
                    <ion-icon :icon="speedometerOutline" class="me-2 text-primary"></ion-icon>
                    <span class="fw-bold me-2">Távolság:</span> 
                    {{ formatDistance(ride.distance) }} km
                  </p>
                </div>
                
                <div class="stop-actions d-flex flex-wrap gap-2">
                  <button class="btn btn-outline-primary" @click="showStops(ride.id)">
                    <ion-icon :icon="visibleStops[ride.id] ? 'chevronUp' : 'chevronDown'" class="me-1"></ion-icon>
                    {{ visibleStops[ride.id] ? "Elrejtés" : "Megállók" }}
                  </button>
                  <button 
                    class="btn btn-primary ms-auto" 
                    @click="signUp(ride.id)" 
                    :disabled="ride.hasJoined">
                    {{ ride.hasJoined ? "Jelentkezve" : "Jelentkezés" }}
                    <ion-icon :icon="logInOutline" class="ms-1"></ion-icon>
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
                  
                  <div class="stops-actions mt-3 d-flex gap-2">
                    <button 
                      class="btn btn-outline-info" 
                      @click="handleShowAddStops(ride.id)" 
                      :disabled="ride.hasJoined">
                      <ion-icon :icon="addOutline" class="me-1"></ion-icon>
                      Megálló ajánlása
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showAddStops" class="modal fade show d-flex align-items-center" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">Megálló hozzáadása</h5>
              <button type="button" class="btn-close btn-close-white" @click="closeModal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
              <div class="modal-window"><MapView /></div> 
            </div>
            <div class="modal-footer d-flex">
              <div class="input-group">
                <span class="input-group-text bg-primary text-white">
                  <ion-icon :icon="pinOutline"></ion-icon>
                </span>
                <input type="text" class="form-control" placeholder="Megálló neve" v-model="stopName"/>
                <button class="btn btn-primary" @click="addStop()">
                  <ion-icon :icon="addOutline" class="me-1"></ion-icon>
                  Hozzáadás és jelentkezés
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="showMapModal" class="modal fade show d-flex align-items-center" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title">Célpont kiválasztása</h5>
        <button type="button" class="btn-close btn-close-white" @click="closeMapModal" aria-label="Close"></button>
      </div>
      <div class="modal-body p-0">
        <div class="modal-window">
          <MapView />
        </div>
      </div>
      <div class="modal-footer d-flex justify-content-between">
        <div>
          <button class="btn btn-success" @click="confirmMapSelection" :disabled="!VueCookies.get('lat') && VueCookies.get('lng')">
            <ion-icon :icon="checkmarkOutline" class="me-1"></ion-icon>
            Kiválasztás
          </button>
        </div>
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
                    <strong>Email: &nbsp;</strong> {{ selectedDriver?.email }}
                  </div>
                  <div class="info-item mb-2 p-2">
                    <strong>Férőhely: &nbsp;</strong> {{ selectedDriver?.carCapacity }}
                    <ion-icon :icon="peopleOutline" class="ms-1"></ion-icon>
                  </div>
                  <div class="info-item p-2" :class="selectedDriver?.rating >= 4 ? 'bg-success text-white' : selectedDriver?.rating >= 3 ? 'bg-warning' : 'bg-danger text-white'">
                    <strong>Értékelés: &nbsp;</strong> 
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
import { IonButton, IonIcon, IonPage, IonContent, IonFab, IonFabButton } from '@ionic/vue';
import { shallowRef, markRaw, watch, onUnmounted } from 'vue';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { 
  chevronBack, 
  addOutline,
  navigateOutline,
  calendarOutline,
  timeOutline,
  personOutline, 
  locationOutline,
  flagOutline,
  pinOutline,
  informationCircleOutline,
  peopleOutline,
  logInOutline,
  chevronDown,
  star,
  starOutline,
  textOutline,
  mapOutline,
  closeOutline,
  searchOutline,
  speedometerOutline,
  refreshOutline,
  locateOutline,
  trashOutline,
  checkmarkOutline
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { Marker } from 'maplibre-gl';
import { onMounted, ref } from 'vue';
import VueCookies from 'vue-cookies'
import "maplibre-gl/dist/maplibre-gl.css";
import MapView from './MapView.vue';
import {useToast} from 'vue-toastification'
import { useMapStore } from "@/stores/mapStore";
import { Geolocation } from '@capacitor/geolocation';

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
const days = ref(['H' , 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'])
const searchMethod = ref('text')
const endPoint = ref(null)
const showMapModal = ref(false)
const userLocation = ref(null)
const isGettingLocation = ref(false)

const goBack = () => {
  if (showAddStops.value) {
    closeModal();
  }
  if (showMapModal.value) {
    closeMapModal();
  }
  router.push("/main");
  getAllRides();
  visibleStops.value = {};
};

const closeModal = () => {
  showAddStops.value = false;
};

const closeMapModal = () => {
  showMapModal.value = false;
};

const openMapModal = () => {
  showMapModal.value = true;
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
            console.log(allRides.value)
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
    await getUserLocation();
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

const searchRoutes = async () => {
  try {
    if (start.value && end.value) {
      allRides.value = [];
      
      const startRouteResponse = await api.get(`Route/getRouteByStart?start=${start.value}`);
      const startStopResponse = await api.get(`StoppingPoint/getByStopName?stop=${start.value}`);
      

      const endRouteResponse = await api.get(`Route/getRouteByEnd?end=${end.value}`);
      const endStopResponse = await api.get(`StoppingPoint/getByStopName?stop=${end.value}`);
      

      const startRouteIds = new Set(startRouteResponse.data.map(route => route.id));
      

      startStopResponse.data.forEach(stop => {
        startRouteIds.add(stop.routeId);
      });
      

      const endRouteIds = new Set(endRouteResponse.data.map(route => route.id));
      

      endStopResponse.data.forEach(stop => {
        endRouteIds.add(stop.routeId);
      });
      

      const matchingRouteIds = [...startRouteIds].filter(id => endRouteIds.has(id));
      
      const routesMap = {};
      
      startRouteResponse.data.forEach(route => {
        if (matchingRouteIds.includes(route.id)) {
          routesMap[route.id] = route;
        }
      });
      
      endRouteResponse.data.forEach(route => {
        if (matchingRouteIds.includes(route.id)) {
          routesMap[route.id] = route;
        }
      });
      
      for (const routeId of matchingRouteIds) {
        if (!routesMap[routeId]) {
          const routeResponse = await api.get(`Route/${routeId}`);
          routesMap[routeId] = routeResponse.data;
        }
      }
      
      allRides.value = Object.values(routesMap);
      
      const driverResponse = await api.get('driver');
      const driverMap = {};
      driverResponse.data.forEach(driver => {
        driverMap[driver.id] = `${driver.firstName} ${driver.lastName}`;
      });
      
      for (let i = 0; i < allRides.value.length; i++) {
        const driverId = allRides.value[i].driverId;
        allRides.value[i].driverName = driverMap[driverId] || 'Unknown Driver';
      }
    } 

    else if (start.value) {
      allRides.value = [];
      const routeResponse = await api.get(`Route/getRouteByStart?start=${start.value}`);
      const stopResponse = await api.get(`StoppingPoint/getByStopName?stop=${start.value}`);
      
      routeResponse.data.forEach(routeData => {
        allRides.value.push(routeData);
      });
      

      const routeIdSet = new Set(allRides.value.map(route => route.id));
      for (const stop of stopResponse.data) {
        if (!routeIdSet.has(stop.routeId)) {
          const routeStopResponse = await api.get(`Route/${stop.routeId}`);
          allRides.value.push(routeStopResponse.data);
          routeIdSet.add(stop.routeId);
        }
      }
      
      for (let index = 0; index < allRides.value.length; index++) {
        const driverResponse = await api.get(`driver/${allRides.value[index].driverId}`);
        allRides.value[index].driverName = `${driverResponse.data.firstName} ${driverResponse.data.lastName}`;
      }
    }

    else if (end.value) {
      allRides.value = [];
      const routeResponse = await api.get(`Route/getRouteByEnd?end=${end.value}`);
      const stopResponse = await api.get(`StoppingPoint/getByStopName?stop=${end.value}`);
      
      routeResponse.data.forEach(routeData => {
        allRides.value.push(routeData);
      });
      

      const routeIdSet = new Set(allRides.value.map(route => route.id));
      for (const stop of stopResponse.data) {
        if (!routeIdSet.has(stop.routeId)) {
          const routeStopResponse = await api.get(`Route/${stop.routeId}`);
          allRides.value.push(routeStopResponse.data);
          routeIdSet.add(stop.routeId);
        }
      }
      

      const driverResponse = await api.get('driver');
      for (let index = 0; index < allRides.value.length; index++) {
        const driver = driverResponse.data.find(driver => driver.id === allRides.value[index].driverId);
        if (driver) {
          allRides.value[index].driverName = `${driver.firstName} ${driver.lastName}`;
        }
      }
    }

    else {
      getAllRides();
    }
  } catch (error) {
    console.log(error);
    toast.error("Hiba történt a keresés során!");
  }
};

const getUserLocation = async () => {
  if (userLocation.value) {
    return userLocation.value;
  }

  isGettingLocation.value = true;
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });
    
    userLocation.value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    
    isGettingLocation.value = false;
    return userLocation.value;
  } catch (error) {
    console.error('Error getting location:', error);
    toast.error("Nem sikerült meghatározni a helyzetedet. Ellenőrizd a helymeghatározási jogosultságokat!");
    isGettingLocation.value = false;
    return null;
  }
};

const formatDistance = (distance) => {
  return parseFloat(distance).toFixed(2);
};


const confirmMapSelection = () => {
  if (VueCookies.get("lat") && VueCookies.get("lng")) {
    closeMapModal();
    toast.success("Pont kiválasztva!");
  } else {
    toast.error("Válaszd ki a célpontot!");
  }
};

const searchOptimalRoutes = async () => {
  if (!userLocation.value || !VueCookies.get("lat") || !VueCookies.get("lng")) {
    toast.error("Hiányzó helyadatok!");
    return;
  }
  
  await searchOptimalRoutesWithCoordinates(
    userLocation.value.lat,
    userLocation.value.lng,
    VueCookies.get("lat"),
    VueCookies.get("lng")
  );
};


const searchOptimalRoutesWithCoordinates = async (lat1, lng1, lat2, lng2) => {
  try {
    
    const response = await api.get(`Route/getOptimalRoutes`, {
      params: {
        startLat: lat1,
        startLng: lng1,
        endLat: lat2,
        endLng: lng2
      }
    });
    
    if (!response.data || response.data.length === 0) {
      toast.info("Nem találtunk optimális útvonalakat.");
      return;
    }
    
    allRides.value = response.data.map(item => ({
      ...item.route,
      distance: item.distance
    }));
    
    for (let index = 0; index < allRides.value.length; index++) {
      const driverResponse = await api.get(`driver/${allRides.value[index].driverId}`);
      allRides.value[index].driverName = `${driverResponse.data.firstName} ${driverResponse.data.lastName}`;
      
      const passengerTripsResponse = await api.get(`Trip/getTripByPassenger?passengerId=${VueCookies.get("passengerID")}`);
      allRides.value[index].hasJoined = passengerTripsResponse.data.some(trip => trip.routeId === allRides.value[index].id);
    }
    
  } catch (error) {
    console.error('Error searching optimal routes:', error);
    toast.error("Hiba történt az optimális útvonalak keresése során!");
  }
};

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

.search-container {
  max-width: 900px;
  border-radius: 10px;
  margin-bottom: 1.5rem;
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

.stops-container {
  border-radius: 8px;
  border-left: 4px solid #4e73df;
}

.stop-suggested {
  font-style: italic;
}

.stop-accepted {
  font-weight: 500;
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

.modal-content{
  width: 96vw;
}
</style>