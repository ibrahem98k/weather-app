<script>
  import { getWeatherIcon } from '../utils/weatherApi.js';
  
  export let weatherData;
  
  // Get hourly data from weather API
  $: hourly = weatherData?.hourly;
  $: hourlyTimes = hourly?.time || [];
  $: hourlyTemps = hourly?.temperature_2m || [];
  $: hourlyCodes = hourly?.weather_code || [];
  
  // Filter to show next 24 hours starting from current hour
  $: next24Hours = (() => {
    if (!hourlyTimes || hourlyTimes.length === 0) return [];
    
    const now = new Date();
    // Find the closest hour to now
    let currentIndex = hourlyTimes.findIndex(time => {
      const timeDate = new Date(time);
      return timeDate >= now;
    });
    
    if (currentIndex === -1) {
      currentIndex = hourlyTimes.length - 1;
    }
    
    // Check if previous hour is actually closer
    if (currentIndex > 0) {
      const nextHour = new Date(hourlyTimes[currentIndex]);
      const prevHour = new Date(hourlyTimes[currentIndex - 1]);
      const nextDiff = Math.abs(nextHour - now);
      const prevDiff = Math.abs(prevHour - now);
      if (prevDiff < nextDiff) {
        currentIndex = currentIndex - 1;
      }
    }
    
    if (currentIndex === -1) return [];
    
    // Return next 24 hours of data
    return Array.from({ length: Math.min(24, hourlyTimes.length - currentIndex) }, (_, i) => {
      const idx = currentIndex + i;
      return {
        time: hourlyTimes[idx],
        temp: hourlyTemps[idx],
        code: hourlyCodes[idx],
        isDay: new Date(hourlyTimes[idx]).getHours() >= 6 && new Date(hourlyTimes[idx]).getHours() < 20
      };
    });
  })();
  
  // Format hour label - shows "Now" for current hour
  function formatHour(timeString) {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = date - now;
    const hoursDiff = Math.floor(diffMs / (1000 * 60 * 60));
    const minutesDiff = Math.floor(diffMs / (1000 * 60));
    
    if (Math.abs(minutesDiff) <= 60) return 'Now';
    if (hoursDiff === 1) return 'In 1h';
    
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  }
</script>

{#if next24Hours.length > 0}
  <div class="bg-white/25 backdrop-blur-lg rounded-3xl p-4 md:p-6 mb-4 border border-white/40 shadow-lg hover:shadow-xl transition-shadow duration-200" data-aos="fade-up" data-aos-delay="150" data-aos-duration="400">
    <h3 class="detail-box-label text-white text-xl mb-4 tracking-tight">24-Hour Forecast</h3>
    <div class="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
      <div class="flex gap-4 min-w-max">
        {#each next24Hours as hour, index}
          <div class="hourly-item flex flex-col items-center gap-2 min-w-[70px] text-center" data-aos="fade-left" data-aos-delay={300 + (index * 50)}>
            <p class="detail-box-label text-white/80 text-xs whitespace-nowrap">{formatHour(hour.time)}</p>
            <div class="flex-shrink-0">
              <span class="text-2xl md:text-3xl select-none inline-block">{getWeatherIcon(hour.code, hour.isDay)}</span>
            </div>
            <p class="detail-box-number text-white text-base md:text-lg">{Math.round(hour.temp)}°</p>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>

