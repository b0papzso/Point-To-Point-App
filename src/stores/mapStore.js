import { defineStore } from "pinia";
import { ref, markRaw } from "vue";

export const useMapStore = defineStore("mapStore", () => {
  const map = ref(null); 

  const setMap = (newMap) => {
    if (map.value) {
      try {
        map.value.remove();
      } catch (error) {
        console.error("Sikertelen térkép törlés: ", error);
      }
    }
    map.value = newMap ? markRaw(newMap) : null;
  };

  const setView = (lng, lat, zoom) => {
    if (map.value) {
        map.value.setCenter([lng, lat]);
        map.value.setZoom(zoom);
    }
}

  return { map, setMap, setView };
});
