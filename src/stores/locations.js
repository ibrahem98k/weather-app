import { writable } from 'svelte/store';

function createLocationsStore() {
  const { subscribe, set, update } = writable([]);
  
  // Load from localStorage on initialization
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      try {
        set(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved locations:', e);
      }
    }
  }
  
  return {
    subscribe,
    add: (location) => {
      update(locations => {
        // Check if location already exists
        const exists = locations.some(loc => 
          Math.abs(loc.latitude - location.latitude) < 0.001 &&
          Math.abs(loc.longitude - location.longitude) < 0.001
        );
        
        if (!exists) {
          const newLocations = [...locations, location];
          if (typeof window !== 'undefined') {
            localStorage.setItem('savedLocations', JSON.stringify(newLocations));
          }
          return newLocations;
        }
        return locations;
      });
    },
    remove: (location) => {
      update(locations => {
        const newLocations = locations.filter(loc => 
          !(Math.abs(loc.latitude - location.latitude) < 0.001 &&
            Math.abs(loc.longitude - location.longitude) < 0.001)
        );
        if (typeof window !== 'undefined') {
          localStorage.setItem('savedLocations', JSON.stringify(newLocations));
        }
        return newLocations;
      });
    },
    load: () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('savedLocations');
        if (saved) {
          try {
            set(JSON.parse(saved));
          } catch (e) {
            console.error('Error loading saved locations:', e);
          }
        }
      }
    }
  };
}

export const savedLocations = createLocationsStore();

