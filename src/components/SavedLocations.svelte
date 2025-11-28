<script>
  import { savedLocations } from '../stores/locations.js';
  
  export let onLocationSelect;
  export let currentLocation = null;
  
  // Component state
  let locations = [];
  let isOpen = false;
  
  // Subscribe to saved locations store
  savedLocations.subscribe(value => {
    locations = value;
  });
  
  // Handle location selection from dropdown
  function selectLocation(location) {
    onLocationSelect(location);
    isOpen = false;
  }
  
  // Remove location from saved list
  function removeLocation(location, event) {
    event.stopPropagation();
    savedLocations.remove(location);
  }
  
  // Toggle dropdown visibility
  function toggleOpen() {
    isOpen = !isOpen;
  }
  
  // Check if location is currently selected
  function isCurrentLocation(location) {
    if (!currentLocation) return false;
    return Math.abs(location.latitude - currentLocation.latitude) < 0.001 &&
           Math.abs(location.longitude - currentLocation.longitude) < 0.001;
  }
  
  // Close dropdown when clicking outside
  function handleClickOutside(event) {
    if (!event.target.closest('.saved-locations-container')) {
      isOpen = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="saved-locations-container" style="position: relative; z-index: 90; isolation: isolate; display: inline-block;">
  <button
    on:click={toggleOpen}
    class="bg-white/10 backdrop-blur-lg rounded-2xl px-3 md:px-4 py-0 border border-white/30 text-white hover:bg-white/15 active:bg-white/20 transition-all duration-150 flex items-center gap-2 h-12 flex-shrink-0 shadow-lg hover:shadow-xl hover:scale-105"
    style="text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); will-change: transform, background-color; transform: translateZ(0); position: relative; z-index: 91;"
    title="Saved Locations"
  >
    <svg class="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <span class="font-medium text-xs md:text-sm min-w-[20px] text-center">{locations.length}</span>
    <svg 
      class="w-4 h-4 flex-shrink-0 transform transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" 
      style="will-change: transform; transform: translateZ(0);"
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
  
  {#if isOpen}
    <div class="w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white/10 backdrop-blur-lg rounded-2xl p-3 border border-white/30 overflow-hidden shadow-xl max-h-[400px] overflow-y-auto" style="position: absolute; z-index: 92; isolation: isolate; pointer-events: auto; top: calc(100% + 0.5rem); right: 0; left: auto;">
      {#if locations.length > 0}
        {#each locations as location, index}
          <div
            on:click={() => selectLocation(location)}
            class="flex items-center justify-between p-3 rounded-xl hover:bg-white/15 transition-all duration-150 cursor-pointer mb-1.5 last:mb-0 {isCurrentLocation(location) ? 'bg-white/15 ring-1 ring-white/20' : ''}"
            style="will-change: background-color; transform: translateZ(0);"
          >
            <div class="flex-1 min-w-0 pr-2">
              <p class="text-white font-semibold truncate text-sm mb-0.5">{location.name}</p>
              {#if location.admin1}
                <p class="text-white/70 text-xs truncate">{location.admin1}, {location.country}</p>
              {:else}
                <p class="text-white/70 text-xs truncate">{location.country}</p>
              {/if}
            </div>
            <button
              on:click={(e) => removeLocation(location, e)}
              class="p-2 hover:bg-white/25 rounded-lg transition-all duration-150 flex-shrink-0 active:scale-95"
              style="will-change: transform, background-color; transform: translateZ(0);"
              aria-label="Remove location"
            >
              <svg class="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        {/each}
      {:else}
        <div class="p-5 text-center text-white/70">
          <p class="text-sm font-medium mb-1">No saved locations yet</p>
          <p class="text-xs">Search and add locations to save them</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

