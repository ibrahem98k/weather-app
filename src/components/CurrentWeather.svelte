<script>
  import { getWeatherIcon, getWeatherDescription, formatDate } from '../utils/weatherApi.js';
  
  export let weatherData;
  export let locationName = '';
  
  // Extract current weather data
  $: current = weatherData?.current;
  $: currentDate = current ? formatDate(current.time) : '';
  $: isDay = current?.is_day ?? true;
  $: weatherIcon = current ? getWeatherIcon(current.weather_code, isDay) : '☀️';
  $: temperature = current ? Math.round(current.temperature_2m) : 0;
  
  // Get today's high temperature
  $: todayHigh = (() => {
    if (!weatherData?.daily?.time || !weatherData?.daily?.temperature_2m_max || weatherData.daily.temperature_2m_max.length === 0) return null;
    
    if (weatherData.daily.temperature_2m_max[0] !== undefined && weatherData.daily.temperature_2m_max[0] !== null) {
      return Math.round(weatherData.daily.temperature_2m_max[0]);
    }
    
    const today = new Date().toISOString().split('T')[0];
    const todayIndex = weatherData.daily.time.findIndex(date => date.startsWith(today));
    if (todayIndex !== -1 && weatherData.daily.temperature_2m_max[todayIndex] !== undefined) {
      return Math.round(weatherData.daily.temperature_2m_max[todayIndex]);
    }
    
    return null;
  })();
  
  // Get today's low temperature
  $: todayLow = (() => {
    if (!weatherData?.daily?.time || !weatherData?.daily?.temperature_2m_min || weatherData.daily.temperature_2m_min.length === 0) return null;
    
    if (weatherData.daily.temperature_2m_min[0] !== undefined && weatherData.daily.temperature_2m_min[0] !== null) {
      return Math.round(weatherData.daily.temperature_2m_min[0]);
    }
    
    const today = new Date().toISOString().split('T')[0];
    const todayIndex = weatherData.daily.time.findIndex(date => date.startsWith(today));
    if (todayIndex !== -1 && weatherData.daily.temperature_2m_min[todayIndex] !== undefined) {
      return Math.round(weatherData.daily.temperature_2m_min[todayIndex]);
    }
    
    return null;
  })();
  
</script>

{#if current}
  <div class="text-center py-2 md:py-4 overflow-visible" data-aos="fade-up" data-aos-duration="800">
    <h2 class="text-4xl md:text-5xl mb-0.5 text-white city-name-font" data-aos="fade-up" data-aos-delay="100">{locationName}</h2>
    <p class="detail-box-description text-lg md:text-xl text-white/90 mb-4 md:mb-6" data-aos="fade-up" data-aos-delay="200">{currentDate}</p>
    
    <div class="flex items-center justify-center mb-4 md:mb-6" data-aos="zoom-in" data-aos-delay="300">
      <span class="text-[7rem] md:text-[10rem] lg:text-[12rem] select-none inline-block transition-transform duration-300 hover:scale-105 leading-none">{weatherIcon}</span>
    </div>
    
    <div class="mb-4 md:mb-6" data-aos="fade-up" data-aos-delay="400">
      <span class="text-6xl md:text-7xl text-white leading-none temp-number-font">{temperature}°</span>
    </div>
    
    <p class="detail-box-description text-2xl md:text-3xl lg:text-4xl text-white/90 mb-4" data-aos="fade-up" data-aos-delay="500">{getWeatherDescription(current.weather_code)}</p>
    
    {#if todayHigh !== null && todayLow !== null}
      <div class="flex justify-center gap-3 md:gap-4 mt-6 mb-4 relative z-20 overflow-visible" data-aos="fade-up" data-aos-delay="600">
        <div class="bg-white/25 backdrop-blur-lg rounded-2xl px-4 md:px-5 py-3 border border-white/40 min-w-[100px] md:min-w-[120px] text-center transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-xl relative z-20 shadow-lg" data-aos="fade-right" data-aos-delay="700">
          <p class="detail-box-label text-white/70 text-xs mb-1 uppercase tracking-wider">High</p>
          <p class="detail-box-number text-white text-xl md:text-2xl">{todayHigh}°</p>
        </div>
        <div class="bg-white/25 backdrop-blur-lg rounded-2xl px-4 md:px-5 py-3 border border-white/40 min-w-[100px] md:min-w-[120px] text-center transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-xl relative z-20 shadow-lg" data-aos="fade-left" data-aos-delay="700">
          <p class="detail-box-label text-white/70 text-xs mb-1 uppercase tracking-wider">Low</p>
          <p class="detail-box-number text-white text-xl md:text-2xl">{todayLow}°</p>
        </div>
      </div>
    {/if}
  </div>
{/if}

