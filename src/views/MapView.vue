<template>
    <ion-page>
      <ion-content :fullscreen="true"> 
        <div class="map-wrap">
        <div class="map" ref="mapContainer"></div>
        </div> 
     </ion-content>
    </ion-page>
  </template>
  
  
  <script setup lang="js">
  import { IonPage, IonContent } from '@ionic/vue';
import { Map, config } from '@maptiler/sdk';
import { ref, shallowRef, onMounted, onUnmounted, markRaw } from 'vue';
import { Marker } from 'maplibre-gl';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapStore } from "@/stores/mapStore";
import  VueCookies  from 'vue-cookies';

const coordinates = ref(null);
const marker = shallowRef(null);
const coordinateString = ref("");
const mapStore = useMapStore();
const mapContainer = shallowRef(null);
const map = shallowRef(null);
const isDark = ref(window.matchMedia("(prefers-color-scheme: dark)").matches);
  
onMounted(() => {
  config.apiKey = "Yv2qYZwAthDud0XGfN3l";

    setTimeout(() => {
    const initialState = { lng: 20.14, lat: 46.25, zoom: 12 };
    const newMap = markRaw(
      new Map({
        container: mapContainer.value,
        style: maptilersdk.MapStyle.STREETS,
        center: [initialState.lng, initialState.lat],
        zoom: initialState.zoom,
      })
    );
    mapStore.setMap(newMap);
    map.value = newMap;

    map.value.on("click", (mapsMouseEvent) => {
  if (mapsMouseEvent.originalEvent.target.closest(".maplibregl-marker")) {
    return;
  }
  
  const lngLat = [mapsMouseEvent.lngLat.lng, mapsMouseEvent.lngLat.lat];
  
  coordinates.value = { 
    lat: mapsMouseEvent.lngLat.lat, 
    lng: mapsMouseEvent.lngLat.lng 
  };
  VueCookies.set("lat", mapsMouseEvent.lngLat.lat);
  VueCookies.set("lng", mapsMouseEvent.lngLat.lng);
  coordinateString.value = `${coordinates.value.lat.toFixed(6)}, ${coordinates.value.lng.toFixed(6)}`;
  if (marker.value) {
    marker.value.remove();
  }
  marker.value = new Marker({
    color: isDark.value ? "#ffcc00" : "#007bff",
  })
    .setLngLat(lngLat)
    .addTo(map.value);
});
  }, 0);
}),
onUnmounted(() => {
  if (map.value) {
    try {
      map.value.remove();
    } catch (error) {
      console.error("Sikertelen térkép törlés: ", error);
    }
    mapStore.setMap(null);
    map.value = null;
  }
});
  </script>
  
  <style scoped>
  .map-wrap {
    position: relative;
    width: 100%;
    height: 100vh ;
  }
  
  .map {
    position: absolute;
    width: 100%;
    height: 110%;
    z-index: 0;
  }
  
  ion-fab{
    margin-top: 80px;
    margin-left: 15px;
  }
  </style>
  