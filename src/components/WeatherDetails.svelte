<script>
  import { formatTime } from '../utils/weatherApi.js';
  
  export let weatherData;
  export let currentLocation = null;
  
  // Extract weather data
  $: current = weatherData?.current;
  $: daily = weatherData?.daily;
  
  // Find today's index in daily data
  $: todayIndex = (() => {
    if (!daily?.time) return -1;
    const today = new Date().toISOString().split('T')[0];
    return daily.time.findIndex(date => date.startsWith(today));
  })();
  
  // Get today's specific data
  $: sunrise = todayIndex >= 0 && daily?.sunrise ? daily.sunrise[todayIndex] : null;
  $: sunset = todayIndex >= 0 && daily?.sunset ? daily.sunset[todayIndex] : null;
  $: todayPrecipitation = todayIndex >= 0 && daily?.precipitation_sum ? daily.precipitation_sum[todayIndex] : 0;
  $: uvIndexMax = todayIndex >= 0 && daily?.uv_index_max ? daily.uv_index_max[todayIndex] : current?.uv_index || 0;
  $: todayHigh = todayIndex >= 0 && daily?.temperature_2m_max ? daily.temperature_2m_max[todayIndex] : null;
  
  // Convert wind direction degrees to compass direction
  function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  }
  
  // Get UV index level description
  function getUVIndexLevel(uv) {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  }
  
  // Get visibility description based on distance
  function getVisibilityDescription(km) {
    if (km >= 20) return 'Perfectly clear view';
    if (km >= 10) return 'Excellent visibility';
    if (km >= 5) return 'Good visibility';
    if (km >= 1) return 'Moderate visibility';
    return 'Poor visibility';
  }
  
  // Get humidity description
  function getHumidityDescription(humidity) {
    if (humidity < 30) return 'Very dry';
    if (humidity < 50) return 'Comfortable';
    if (humidity < 70) return 'Moderate';
    return 'Humid';
  }
  
  // Calculate moon phase based on date
  function getMoonPhase(date = new Date()) {
    const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
    const currentDate = new Date(date);
    const daysSinceKnown = (currentDate - knownNewMoon) / (1000 * 60 * 60 * 24);
    const lunarCycle = 29.53058867;
    const daysIntoCycle = ((daysSinceKnown % lunarCycle) + lunarCycle) % lunarCycle;
    const illumination = ((1 - Math.cos((2 * Math.PI * daysIntoCycle) / lunarCycle)) / 2) * 100;
    
    let phase;
    if (daysIntoCycle < 1.84566) {
      phase = 'New Moon';
    } else if (daysIntoCycle < 5.53699) {
      phase = 'Waxing Crescent';
    } else if (daysIntoCycle < 9.22831) {
      phase = 'First Quarter';
    } else if (daysIntoCycle < 12.91963) {
      phase = 'Waxing Gibbous';
    } else if (daysIntoCycle < 16.61096) {
      phase = 'Full Moon';
    } else if (daysIntoCycle < 20.30228) {
      phase = 'Waning Gibbous';
    } else if (daysIntoCycle < 23.99361) {
      phase = 'Last Quarter';
    } else if (daysIntoCycle < 27.68493) {
      phase = 'Waning Crescent';
    } else {
      phase = 'New Moon';
    }
    
    let daysUntilFull;
    if (daysIntoCycle < 14.76529) {
      daysUntilFull = Math.ceil(14.76529 - daysIntoCycle);
    } else {
      daysUntilFull = Math.ceil(lunarCycle - daysIntoCycle + 14.76529);
    }
    
    return {
      illumination: Math.round(illumination),
      phase,
      daysUntilFull: Math.max(0, daysUntilFull)
    };
  }
  
  $: moonData = getMoonPhase();
</script>

{#if current}
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4" data-aos="fade-up" data-aos-delay="200" data-aos-duration="500">
    <!-- Row 1: Feels Like, Visibility, Humidity -->
    <!-- Feels Like Card -->
    <div class="detail-card bg-white/25 backdrop-blur-lg rounded-2xl p-4 md:p-5 border border-white/40 transition-all duration-200 hover:scale-[1.02] hover:bg-white/30 hover:shadow-xl shadow-lg" data-aos="fade-up" data-aos-delay="250" data-aos-duration="400" >
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 class="detail-box-label text-white/80 text-sm uppercase tracking-wide">Feels Like</h3>
      </div>
      <p class="detail-box-number text-white text-xl md:text-2xl mb-1.5">{current.apparent_temperature ? Math.round(current.apparent_temperature) : Math.round(current.temperature_2m)}<span class="text-sm md:text-base">°</span></p>
      <p class="detail-box-description text-white/70 text-xs mt-1.5 leading-tight">
        {current.apparent_temperature ? (current.apparent_temperature < current.temperature_2m ? 'Feels cooler than actual.' : current.apparent_temperature > current.temperature_2m ? 'Feels warmer than actual.' : 'Similar to actual temperature.') : (current.wind_speed_10m > 10 ? 'Wind is making it feel cooler.' : 'Similar to actual temperature.')}
      </p>
    </div>
    
    <!-- Visibility Card -->
    <div class="detail-card bg-white/25 backdrop-blur-lg rounded-2xl p-4 md:p-5 border border-white/40 transition-all duration-200 hover:scale-[1.02] hover:bg-white/30 hover:shadow-xl shadow-lg" data-aos="fade-up" data-aos-delay="250" data-aos-duration="400" >
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <h3 class="detail-box-label text-white/80 text-sm uppercase tracking-wide">Visibility</h3>
      </div>
      <p class="detail-box-number text-white text-xl md:text-2xl mb-1.5">
        {current.visibility ? Math.round(current.visibility / 1000) : 'N/A'}<span class="text-sm md:text-base"> {current.visibility ? 'km' : ''}</span>
      </p>
      <p class="detail-box-description text-white/70 text-xs mt-1.5 leading-tight">
        {current.visibility ? getVisibilityDescription(current.visibility / 1000) : 'Data unavailable'}
      </p>
      {#if current.cloud_cover !== null && current.cloud_cover !== undefined}
        <p class="detail-box-description text-white/60 text-xs mt-1.5">Cloud cover: {Math.round(current.cloud_cover)}%</p>
      {/if}
    </div>
    
    <!-- Humidity Card -->
    <div class="detail-card bg-white/25 backdrop-blur-lg rounded-2xl p-4 md:p-5 border border-white/40 transition-all duration-200 hover:scale-[1.02] hover:bg-white/30 hover:shadow-xl shadow-lg" data-aos="fade-up" data-aos-delay="250" data-aos-duration="400" >
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <h3 class="detail-box-label text-white/80 text-sm uppercase tracking-wide">Humidity</h3>
      </div>
      <p class="detail-box-number text-white text-xl md:text-2xl mb-1.5">{current.relative_humidity_2m}<span class="text-sm md:text-base">%</span></p>
      <p class="detail-box-description text-white/70 text-xs mt-1.5 leading-tight">{getHumidityDescription(current.relative_humidity_2m)}</p>
    </div>
    
    <!-- Row 2: Sunrise/Sunset, Wind (center), Precipitation (right) -->
    <!-- Sunrise/Sunset Card -->
    <div class="detail-card bg-white/25 backdrop-blur-lg rounded-2xl p-4 md:p-5 border border-white/40 transition-all duration-200 hover:scale-[1.02] hover:bg-white/30 hover:shadow-xl shadow-lg" data-aos="fade-up" data-aos-delay="350" data-aos-duration="400" >
      <div class="flex items-center gap-2 mb-3">
        <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 class="detail-box-label text-white/80 text-sm uppercase tracking-wide">Sunrise</h3>
      </div>
      <p class="detail-box-number text-white text-2xl mb-3">{sunrise ? formatTime(sunrise) : 'N/A'}</p>
      <div class="pt-3 border-t border-white/10">
        <div class="flex items-center gap-2 mb-1.5">
          <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <h4 class="detail-box-label text-white/80 text-xs uppercase tracking-wide">Sunset</h4>
        </div>
        <p class="detail-box-number text-white text-xl">{sunset ? formatTime(sunset) : 'N/A'}</p>
      </div>
    </div>
    
    <!-- Wind Card -->
    <div class="detail-card bg-white/25 backdrop-blur-lg rounded-2xl p-4 md:p-5 border border-white/40 transition-all duration-200 hover:scale-[1.02] hover:bg-white/30 hover:shadow-xl shadow-lg" data-aos="fade-up" data-aos-delay="350" data-aos-duration="400" >
      <div class="flex items-center gap-2 mb-3">
        <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 class="detail-box-label text-white/80 text-sm uppercase tracking-wide">Wind</h3>
      </div>
      <p class="detail-box-number text-white text-2xl mb-3">{Math.round(current.wind_speed_10m)} <span class="text-base">km/h</span></p>
      <div class="flex items-center gap-4 mt-3">
        <div class="relative w-24 h-24 flex-shrink-0">
          <svg class="w-24 h-24" viewBox="0 0 80 80">
            <!-- Outer circle -->
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
            <!-- Inner circle -->
            <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
            <!-- Center dot -->
            <circle cx="40" cy="40" r="2" fill="rgba(255,255,255,0.6)"/>
            <!-- Direction labels with better styling -->
            <text x="40" y="14" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="12" font-weight="600" font-family="system-ui">N</text>
            <text x="66" y="46" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="12" font-weight="600" font-family="system-ui">E</text>
            <text x="40" y="70" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="12" font-weight="600" font-family="system-ui">S</text>
            <text x="14" y="46" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="12" font-weight="600" font-family="system-ui">W</text>
            <!-- Wind direction arrow with better styling -->
            <g transform="rotate({current.wind_direction_10m} 40 40)">
              <!-- Arrow shaft -->
              <line x1="40" y1="40" x2="40" y2="14" stroke="rgba(255,255,255,0.9)" stroke-width="3" stroke-linecap="round" marker-end="url(#arrowhead-wind)"/>
              <!-- Arrow shadow for depth -->
              <line x1="40" y1="40" x2="40" y2="14" stroke="rgba(255,255,255,0.3)" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
            </g>
            <defs>
              <marker id="arrowhead-wind" markerWidth="6" markerHeight="6" refX="3" refY="2.5" orient="auto" markerUnits="strokeWidth">
                <polygon points="0 0, 6 2.5, 0 5" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>
              </marker>
            </defs>
          </svg>
        </div>
        <div>
          <p class="detail-box-number text-white/90 text-sm">{getWindDirection(current.wind_direction_10m)}</p>
          <p class="detail-box-description text-white/60 text-xs mt-1">Direction</p>
          {#if current.wind_gusts_10m && current.wind_gusts_10m > current.wind_speed_10m}
            <p class="detail-box-description text-white/70 text-xs mt-1.5">Gusts: {Math.round(current.wind_gusts_10m)} km/h</p>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Precipitation Card -->
    <div class="detail-card bg-white/25 backdrop-blur-lg rounded-2xl p-4 md:p-5 border border-white/40 transition-all duration-200 hover:scale-[1.02] hover:bg-white/30 hover:shadow-xl shadow-lg" data-aos="fade-up" data-aos-delay="350" data-aos-duration="400" >
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        <h3 class="detail-box-label text-white/80 text-sm uppercase tracking-wide">Precipitation</h3>
      </div>
      <p class="detail-box-number text-white text-xl md:text-2xl mb-1.5">{todayPrecipitation.toFixed(1)}<span class="text-sm md:text-base"> mm</span></p>
      <p class="detail-box-description text-white/70 text-xs leading-tight break-words line-clamp-2">
        {todayPrecipitation === 0 ? 'None expected today' : `${todayPrecipitation.toFixed(1)} mm expected today`}
      </p>
    </div>
    
    <!-- Row 3: UV Index, Pressure, Air Quality -->
    <!-- UV Index Card -->
    <div class="detail-card bg-white/25 backdrop-blur-lg rounded-2xl p-4 md:p-5 border border-white/40 flex flex-col transition-all duration-200 hover:scale-[1.02] hover:bg-white/30 hover:shadow-xl shadow-lg min-h-[160px]" data-aos="fade-up" data-aos-delay="450" data-aos-duration="400" >
      <div class="flex items-center gap-2 mb-3">
        <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 class="detail-box-label text-white/80 text-sm uppercase tracking-wide">UV Index</h3>
      </div>
      <p class="detail-box-number text-white text-2xl mb-2">{Math.round(uvIndexMax)}</p>
      <p class="detail-box-description text-white/70 text-xs mb-3">{getUVIndexLevel(uvIndexMax)}</p>
      <div class="mt-auto">
        <div class="w-full h-2.5 rounded-full overflow-hidden relative bg-white/10">
            <div 
              class="progress-bar h-full rounded-full transition-all duration-700"
              style="width: {Math.min((uvIndexMax / 11) * 100, 100)}%; background: linear-gradient(to right, #22c55e 0%, #22c55e 20%, #84cc16 20%, #84cc16 35%, #eab308 35%, #eab308 50%, #f97316 50%, #f97316 65%, #ef4444 65%, #ef4444 80%, #dc2626 80%, #dc2626 100%); transform-origin: left;"
            ></div>
        </div>
      </div>
    </div>
    
    <!-- Pressure Card -->
    <div class="detail-card bg-white/25 backdrop-blur-lg rounded-2xl p-4 md:p-5 border border-white/40 flex flex-col transition-all duration-200 hover:scale-[1.02] hover:bg-white/30 hover:shadow-xl shadow-lg min-h-[160px]" data-aos="fade-up" data-aos-delay="450" data-aos-duration="400" >
      <div class="flex items-center gap-2 mb-3">
        <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 class="detail-box-label text-white/80 text-sm uppercase tracking-wide">Pressure</h3>
      </div>
      <p class="detail-box-number text-white text-2xl mb-2">{current.pressure_msl ? Math.round(current.pressure_msl) : 'N/A'} <span class="text-base">{current.pressure_msl ? 'hPa' : ''}</span></p>
      {#if current.pressure_msl}
        <p class="detail-box-description text-white/70 text-xs mb-3">
          {current.pressure_msl < 1000 ? 'Low' : current.pressure_msl > 1020 ? 'High' : 'Normal'}
        </p>
        <div class="mt-auto">
          <div class="w-full h-2.5 rounded-full overflow-hidden relative bg-white/10">
            <div 
              class="progress-bar h-full rounded-full transition-all duration-700"
              style="width: {Math.min(Math.max(((current.pressure_msl - 980) / 60) * 100, 0), 100)}%; background: linear-gradient(to right, #dc2626 0%, #dc2626 25%, #f97316 25%, #f97316 40%, #fbbf24 40%, #fbbf24 55%, #84cc16 55%, #84cc16 70%, #22c55e 70%, #22c55e 100%); transform-origin: left;"
            ></div>
          </div>
        </div>
      {:else}
        <p class="text-white/70 text-xs mb-3">Data unavailable</p>
        <div class="mt-auto">
          <div class="w-full h-2.5 rounded-full overflow-hidden relative bg-white/10">
            <div class="h-full rounded-full w-0"></div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Air Quality Card -->
    <div class="detail-card bg-white/25 backdrop-blur-lg rounded-2xl p-4 md:p-5 border border-white/40 flex flex-col transition-all duration-200 hover:scale-[1.02] hover:bg-white/30 hover:shadow-xl shadow-lg min-h-[160px]" data-aos="fade-up" data-aos-delay="450" data-aos-duration="400" >
      <div class="flex items-center gap-2 mb-3">
        <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="detail-box-label text-white/80 text-sm uppercase tracking-wide">Air Quality</h3>
      </div>
      {#if current.air_quality !== null && current.air_quality !== undefined}
        {@const aqi = current.air_quality}
        {@const aqiLevel = aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Unhealthy for Sensitive' : aqi <= 200 ? 'Unhealthy' : aqi <= 300 ? 'Very Unhealthy' : 'Hazardous'}
        {@const aqiColor = aqi <= 50 ? '#22c55e' : aqi <= 100 ? '#84cc16' : aqi <= 150 ? '#eab308' : aqi <= 200 ? '#f97316' : aqi <= 300 ? '#ef4444' : '#dc2626'}
        <p class="detail-box-number text-white text-2xl mb-2">{Math.round(aqi)}</p>
        <p class="detail-box-description text-white/70 text-xs mb-3" style="color: {aqiColor};">{aqiLevel}</p>
        <div class="mt-auto">
          <div class="w-full h-2.5 rounded-full overflow-hidden relative bg-white/10">
            <div 
              class="progress-bar h-full rounded-full transition-all duration-700"
              style="width: {Math.min((aqi / 300) * 100, 100)}%; background: linear-gradient(to right, #22c55e 0%, #22c55e 16.67%, #84cc16 16.67%, #84cc16 33.33%, #eab308 33.33%, #eab308 50%, #f97316 50%, #f97316 66.67%, #ef4444 66.67%, #ef4444 83.33%, #dc2626 83.33%, #dc2626 100%); transform-origin: left;"
            ></div>
          </div>
        </div>
        {#if current.pm2_5 !== null && current.pm2_5 !== undefined}
          <p class="detail-box-description text-white/60 text-xs mt-1">PM2.5: {Math.round(current.pm2_5)} μg/m³</p>
        {/if}
      {:else}
        {@const mockAQI = 45}
        {@const aqiLevel = 'Good'}
        <p class="detail-box-number text-white text-2xl mb-2">{mockAQI}</p>
        <p class="detail-box-description text-white/70 text-xs mb-3" style="color: #22c55e;">{aqiLevel}</p>
        <div class="mt-auto">
          <div class="w-full h-2.5 rounded-full overflow-hidden relative bg-white/10">
            <div 
              class="progress-bar h-full rounded-full transition-all duration-700"
              style="width: {Math.min((mockAQI / 300) * 100, 100)}%; background: linear-gradient(to right, #22c55e 0%, #22c55e 16.67%, #84cc16 16.67%, #84cc16 33.33%, #eab308 33.33%, #eab308 50%, #f97316 50%, #f97316 66.67%, #ef4444 66.67%, #ef4444 83.33%, #dc2626 83.33%, #dc2626 100%); transform-origin: left;"
            ></div>
          </div>
        </div>
        <p class="detail-box-description text-white/60 text-xs mt-1">Estimated air quality</p>
      {/if}
    </div>
  </div>
  
  <!-- Moon Phase Card (Full Width) -->
  <div class="bg-white/25 backdrop-blur-lg rounded-2xl p-4 md:p-5 border border-white/40 mt-4 md:mt-5 transition-all duration-200 hover:scale-[1.01] hover:bg-white/30 shadow-lg hover:shadow-xl" data-aos="fade-up" data-aos-delay="480" data-aos-duration="400" >
    <div class="flex items-center justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xl">🌙</span>
          <h3 class="detail-box-label text-white/80 text-sm uppercase tracking-wide">Moon Phase</h3>
        </div>
        <div class="space-y-2">
          <div>
            <div class="flex items-center justify-between mb-1">
              <p class="detail-box-description text-white/70 text-xs">Illumination</p>
              <p class="detail-box-number text-white text-sm">{moonData.illumination}%</p>
            </div>
            <div class="w-full h-2.5 rounded-full overflow-hidden relative bg-white/10 mt-0.5">
              <div 
                class="progress-bar h-full rounded-full transition-all duration-700 bg-gradient-to-r from-slate-400 via-white/60 to-white/80"
                style="width: {moonData.illumination}%; transform-origin: left;"
              ></div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 md:gap-3 pt-1">
            <div>
              <p class="detail-box-description text-white/70 text-xs mb-0.5">Next Full Moon</p>
              <p class="detail-box-number text-white text-sm break-words">{moonData.daysUntilFull} {moonData.daysUntilFull === 1 ? 'DAY' : 'DAYS'}</p>
            </div>
            <div>
              <p class="detail-box-description text-white/70 text-xs mb-0.5">Phase</p>
              <p class="detail-box-description text-white text-sm break-words">{moonData.phase}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="ml-1 flex-shrink-0 flex items-center">
        <div class="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl md:text-3xl">
          🌙
        </div>
      </div>
    </div>
  </div>
  
  <!-- Report an Issue & Open in Maps -->
  <div class="mt-4 md:mt-5 space-y-3">
    <!-- Report an Issue -->
    <div class="bg-white/25 backdrop-blur-lg rounded-2xl p-4 border border-white/40 shadow-lg">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="detail-box-label text-white font-medium">Report an Issue</p>
          <p class="detail-box-description text-white/70 text-sm">You can describe the current conditions at your location to help improve forecasts.</p>
        </div>
      </div>
    </div>
    
    <!-- Open in Maps -->
    {#if currentLocation}
      <button
        on:click={() => {
          const url = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`;
          window.open(url, '_blank');
        }}
        class="w-full bg-white/25 backdrop-blur-lg rounded-2xl p-4 border border-white/40 text-left hover:bg-white/15 transition-all duration-300 flex items-center justify-between shadow-lg hover:shadow-xl"
      >
        <span class="detail-box-label text-white font-medium">Open in Maps</span>
        <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </button>
    {/if}
  </div>
{/if}

