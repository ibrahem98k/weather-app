import { writable } from 'svelte/store';

// Store for managing saved locations with localStorage persistence
function createLocationsStore() {
  const { subscribe, set, update } = writable([]);
  
  // Load saved locations from localStorage on init
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
    // Add a new location (prevents duplicates)
    add: (location) => {
      update(locations => {
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
    // Remove a location
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
    // Reload from localStorage
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

