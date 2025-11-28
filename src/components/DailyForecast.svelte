<script>
  import { getWeatherIcon, getWeatherDescription, formatDay } from '../utils/weatherApi.js';
  
  export let dailyData;
  
  // Extract daily forecast data
  $: days = dailyData?.daily?.time || [];
  $: maxTemps = dailyData?.daily?.temperature_2m_max || [];
  $: minTemps = dailyData?.daily?.temperature_2m_min || [];
  $: weatherCodes = dailyData?.daily?.weather_code || [];
  
  // Determines if it's day or night for the weather icon
  function getIcon(code, day) {
    const dayDate = new Date(day);
    dayDate.setHours(12, 0, 0, 0);
    const hour = dayDate.getHours();
    const isDay = hour >= 6 && hour < 20;
    return getWeatherIcon(code, isDay);
  }
</script>

{#if days.length > 0}
  <div class="bg-white/25 backdrop-blur-lg rounded-3xl p-4 md:p-6 mb-4 border border-white/40 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
    <h3 class="detail-box-label text-white text-xl mb-4 tracking-tight">7-Day Forecast</h3>
    <div class="space-y-2 md:space-y-3">
      {#each days as day, index}
        <div class="forecast-item flex items-center justify-between text-white rounded-xl p-2 -mx-2 transition-all duration-300 gap-2">
          <div class="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <p class="detail-box-label w-20 md:w-24 text-sm md:text-base flex-shrink-0">{formatDay(day)}</p>
            <div class="flex-shrink-0">
              <span class="text-2xl md:text-3xl select-none inline-block">{getIcon(weatherCodes[index], day)}</span>
            </div>
            <p class="detail-box-description text-xs md:text-sm text-white/70 flex-1 min-w-0 break-words whitespace-normal leading-relaxed">{getWeatherDescription(weatherCodes[index])}</p>
          </div>
          <div class="flex items-center gap-3 md:gap-4 flex-shrink-0">
            <span class="detail-box-number text-sm md:text-base text-white/70">{Math.round(minTemps[index])}°</span>
            <span class="detail-box-number text-sm md:text-base text-white">{Math.round(maxTemps[index])}°</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .forecast-item {
    animation: slideInFade 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    opacity: 0;
    transform: translateX(-20px) translateY(10px) scale(0.95);
  }
  
  .forecast-item:nth-child(1) { animation-delay: 0s; }
  .forecast-item:nth-child(2) { animation-delay: 0.08s; }
  .forecast-item:nth-child(3) { animation-delay: 0.16s; }
  .forecast-item:nth-child(4) { animation-delay: 0.24s; }
  .forecast-item:nth-child(5) { animation-delay: 0.32s; }
  .forecast-item:nth-child(6) { animation-delay: 0.4s; }
  .forecast-item:nth-child(7) { animation-delay: 0.48s; }
  
  @keyframes slideInFade {
    from {
      opacity: 0;
      transform: translateX(-20px) translateY(10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(0) translateY(0) scale(1);
    }
  }
  
</style>
