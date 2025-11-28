<script>
  import { searchLocation } from '../utils/weatherApi.js';
  import { savedLocations } from '../stores/locations.js';
  
  export let onLocationSelect;
  
  // Search state
  let searchQuery = '';
  let searchResults = [];
  let isSearching = false;
  let showResults = false;
  
  // Searches for locations as user types
  async function handleSearch() {
    if (searchQuery.length < 2) {
      searchResults = [];
      showResults = false;
      return;
    }
    
    isSearching = true;
    try {
      const results = await searchLocation(searchQuery);
      searchResults = results;
      showResults = results.length > 0;
    } catch (error) {
      console.error('Search error:', error);
      searchResults = [];
      showResults = false;
    } finally {
      isSearching = false;
    }
  }
  
  function clearSearch() {
    searchQuery = '';
    searchResults = [];
    showResults = false;
  }
  
  // Check if location is already saved
  function isLocationSaved(location) {
    return $savedLocations.some(loc => 
      Math.abs(loc.latitude - location.latitude) < 0.001 &&
      Math.abs(loc.longitude - location.longitude) < 0.001
    );
  }
  
  // Toggle save/unsave location
  function toggleSaveLocation(location, event) {
    event.stopPropagation();
    if (isLocationSaved(location)) {
      savedLocations.remove(location);
    } else {
      savedLocations.add(location);
    }
  }
  
  // Handle location selection
  function selectLocation(location) {
    onLocationSelect(location);
    searchQuery = '';
    searchResults = [];
    showResults = false;
  }
  
  // Close results when clicking outside
  function handleClickOutside(event) {
    if (!event.target.closest('.search-container')) {
      showResults = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="search-container" style="position: relative; z-index: 1; isolation: isolate;">
  <div class="relative">
    <div class="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
      <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      type="text"
      bind:value={searchQuery}
      on:input={handleSearch}
      placeholder="Search for a city..."
      class="w-full pl-12 pr-12 h-12 rounded-2xl bg-white/10 backdrop-blur-lg text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/30 text-base md:text-lg transition-all duration-150 hover:bg-white/15 focus:bg-white/15 relative z-10 shadow-lg search-input"
      style="text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);"
    />
    <div class="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 z-10">
      {#if isSearching}
        <div class="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
      {:else if searchQuery.length > 0}
        <button
          on:click={clearSearch}
          class="p-1 hover:bg-white/20 rounded-lg transition-all duration-150"
          aria-label="Clear search"
        >
          <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}
    </div>
  </div>
  
  {#if showResults && searchResults.length > 0}
    <div class="absolute w-full mt-2 rounded-2xl overflow-hidden shadow-2xl border border-white/20 pointer-events-auto search-results-container" style="z-index: 2; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px) saturate(150%); -webkit-backdrop-filter: blur(20px) saturate(150%);">
      {#each searchResults as result, index}
        <button
          class="search-result-item w-full px-5 py-4 text-left text-white hover:bg-white/30 active:bg-white/35 transition-all duration-150 border-b border-white/10 last:border-0 flex items-center justify-between group cursor-pointer relative"
          style="animation-delay: {index * 20}ms;"
          on:click={() => selectLocation(result)}
          type="button"
        >
          <div class="flex-1 text-left min-w-0 pointer-events-none">
            <p class="font-medium text-base truncate">{result.name}</p>
            <p class="text-sm text-white/70 mt-1 truncate">{result.admin1}, {result.country}</p>
          </div>
          <button
            on:click|stopPropagation={(e) => toggleSaveLocation(result, e)}
            class="p-2.5 hover:bg-white/50 rounded-xl transition-all duration-150 ml-3 hover:scale-110 active:scale-95 min-w-[48px] min-h-[48px] flex items-center justify-center flex-shrink-0 relative z-20 pointer-events-auto"
            style="will-change: transform, background-color; transform: translateZ(0);"
            type="button"
            aria-label={$savedLocations.some(loc => Math.abs(loc.latitude - result.latitude) < 0.001 && Math.abs(loc.longitude - result.longitude) < 0.001) ? "Remove from saved" : "Save location"}
          >
            {#if $savedLocations.some(loc => Math.abs(loc.latitude - result.latitude) < 0.001 && Math.abs(loc.longitude - result.longitude) < 0.001)}
              <svg class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            {:else}
              <svg class="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            {/if}
          </button>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  /* Lightweight search animations */
  .search-results-container {
    animation: slideDown 0.2s ease-out;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .search-result-item {
    animation: fadeIn 0.2s ease-out forwards;
    opacity: 0;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>

