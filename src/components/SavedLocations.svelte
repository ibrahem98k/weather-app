<script>
  import { savedLocations } from '../stores/locations.js';
  
  export let onLocationSelect;
  export let currentLocation = null;
  
  let locations = [];
  let isOpen = false;
  
  savedLocations.subscribe(value => {
    locations = value;
  });
  
  function selectLocation(location) {
    onLocationSelect(location);
    isOpen = false;
  }
  
  function removeLocation(location, event) {
    event.stopPropagation();
    savedLocations.remove(location);
  }
  
  function toggleOpen() {
    isOpen = !isOpen;
  }
  
  function isCurrentLocation(location) {
    if (!currentLocation) return false;
    return Math.abs(location.latitude - currentLocation.latitude) < 0.001 &&
           Math.abs(location.longitude - currentLocation.longitude) < 0.001;
  }
  
  function handleClickOutside(event) {
    if (!event.target.closest('.saved-locations-container')) {
      isOpen = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="relative saved-locations-container z-[90]">
  <button
    on:click={toggleOpen}
    class="bg-white/35 backdrop-blur-2xl rounded-2xl px-3 md:px-4 py-0 border border-white/50 text-white hover:bg-white/25 active:bg-white/30 transition-all duration-200 flex items-center gap-2 h-12 flex-shrink-0 shadow-xl hover:shadow-2xl hover:scale-105"
    style="text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);"
    title="Saved Locations"
  >
    <svg class="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <span class="font-medium text-xs md:text-sm min-w-[20px] text-center">{locations.length}</span>
    <svg 
      class="w-4 h-4 flex-shrink-0 transform transition-transform duration-300 {isOpen ? 'rotate-180' : ''}" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
  
  {#if isOpen}
    <div class="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white/30 backdrop-blur-2xl rounded-2xl p-3 border border-white/50 overflow-hidden shadow-2xl z-[90] max-h-[400px] overflow-y-auto" style="animation: fadeInDropdown 0.3s ease-out forwards;">
      {#if locations.length > 0}
        {#each locations as location, index}
          <div
            on:click={() => selectLocation(location)}
            class="flex items-center justify-between p-3 rounded-xl hover:bg-white/15 transition-all duration-200 cursor-pointer mb-1.5 last:mb-0 {isCurrentLocation(location) ? 'bg-white/15 ring-1 ring-white/20' : ''}"
            style="animation: slideDown 0.3s ease-out {index * 0.05}s both;"
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
              class="p-2 hover:bg-white/25 rounded-lg transition-all duration-200 flex-shrink-0 active:scale-95"
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

