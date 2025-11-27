<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { getWeatherIcon, getWeatherDescription, formatDay } from '../utils/weatherApi.js';
  
  export let dailyData;
  
  let forecastContainer;
  let hasAnimated = false;
  
  $: days = dailyData?.daily?.time || [];
  $: maxTemps = dailyData?.daily?.temperature_2m_max || [];
  $: minTemps = dailyData?.daily?.temperature_2m_min || [];
  $: weatherCodes = dailyData?.daily?.weather_code || [];
  
  $: if (days.length > 0 && !hasAnimated) {
    hasAnimated = true;
    setTimeout(() => {
      animateForecast();
    }, 250);
  }
  
  $: if (days.length === 0) {
    hasAnimated = false;
  }
  
  function animateForecast() {
    if (!forecastContainer) return;
    
    const items = forecastContainer.querySelectorAll('.forecast-item');
    if (items.length === 0) return;
    
    gsap.killTweensOf(items);
    gsap.set(items, { clearProps: 'all' });
    
    gsap.fromTo(Array.from(items), 
      {
        opacity: 0,
        x: -40,
        scale: 0.95
      },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.06,
        ease: 'expo.out'
      }
    );
  }
  
  function getIcon(code, day) {
    const dayDate = new Date(day);
    dayDate.setHours(12, 0, 0, 0);
    const hour = dayDate.getHours();
    const isDay = hour >= 6 && hour < 20;
    return getWeatherIcon(code, isDay);
  }
  
  function getTempRange(min, max, allMins, allMaxs) {
    if (!allMins || !allMaxs || allMins.length === 0 || allMaxs.length === 0) {
      return { minPos: 0, maxPos: 50, width: 50, centerPos: 25 };
    }
    
    const overallMin = Math.min(...allMins);
    const overallMax = Math.max(...allMaxs);
    const overallRange = overallMax - overallMin;
    
    if (overallRange === 0 || isNaN(overallRange)) {
      return { minPos: 40, maxPos: 60, width: 20, centerPos: 50 };
    }
    
    const minPosition = ((min - overallMin) / overallRange) * 100;
    const maxPosition = ((max - overallMin) / overallRange) * 100;
    const centerPosition = ((min + max) / 2 - overallMin) / overallRange * 100;
    const width = maxPosition - minPosition;
    
    return {
      minPos: Math.max(0, Math.min(100, minPosition)),
      maxPos: Math.max(0, Math.min(100, maxPosition)),
      width: Math.max(8, width),
      centerPos: Math.max(0, Math.min(100, centerPosition))
    };
  }
  
  function getTempColor(temp, allMins, allMaxs) {
    if (!allMins || !allMaxs || allMins.length === 0 || allMaxs.length === 0) {
      const minTemp = -10;
      const maxTemp = 40;
      let normalized = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));
      const r = Math.round(135 + (255 - 135) * normalized);
      const g = Math.round(206 + (215 - 206) * normalized);
      const b = Math.round(250 + (0 - 250) * normalized);
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    const overallMin = Math.min(...allMins);
    const overallMax = Math.max(...allMaxs);
    const overallRange = overallMax - overallMin;
    
    if (overallRange === 0) {
      return `rgb(195, 210, 250)`;
    }
    
    let normalized = (temp - overallMin) / overallRange;
    normalized = Math.max(0, Math.min(1, normalized));
    
    const r = Math.round(135 + (255 - 135) * normalized);
    const g = Math.round(206 + (215 - 206) * normalized);
    const b = Math.round(250 + (0 - 250) * normalized);
    
    return `rgb(${r}, ${g}, ${b})`;
  }
  
</script>

{#if days.length > 0}
  <div bind:this={forecastContainer} class="bg-white/25 backdrop-blur-2xl rounded-3xl p-4 md:p-6 mb-4 border border-white/40 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-visible">
    <h3 class="detail-box-label text-white text-xl mb-4 tracking-tight">7-Day Forecast</h3>
    <div class="space-y-2 md:space-y-3 overflow-visible">
      {#each days as day, index}
        <div class="forecast-item flex items-center justify-between text-white hover:bg-white/10 rounded-xl p-2 -mx-2 transition-all duration-300 gap-2 hover:scale-[1.01] cursor-pointer">
          <div class="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <p class="detail-box-label w-20 md:w-24 text-sm md:text-base flex-shrink-0">{formatDay(day)}</p>
            <div class="flex-shrink-0">
              <span class="text-2xl md:text-3xl select-none inline-block">{getIcon(weatherCodes[index], day)}</span>
            </div>
            <p class="detail-box-description text-xs md:text-sm text-white/70 flex-1 min-w-0 break-words whitespace-normal leading-relaxed">{getWeatherDescription(weatherCodes[index])}</p>
          </div>
          <div class="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <span class="detail-box-number text-sm md:text-base text-white/70 w-10 text-right">{Math.round(minTemps[index])}°</span>
            <div class="w-20 md:w-24 h-2 bg-white/10 rounded-full overflow-hidden relative">
              {#if minTemps && maxTemps && minTemps.length > 0 && maxTemps.length > 0 && minTemps[index] !== undefined && maxTemps[index] !== undefined}
                {@const range = getTempRange(minTemps[index], maxTemps[index], minTemps, maxTemps)}
                {@const avgTemp = (minTemps[index] + maxTemps[index]) / 2}
                {@const smoothColor = getTempColor(avgTemp, minTemps, maxTemps)}
                <div 
                  class="h-full rounded-full transition-all duration-700 absolute"
                  style="left: {range.minPos}%; width: {range.width}%; background: {smoothColor};"
                ></div>
              {:else}
                <div class="h-full bg-white/30 rounded-full w-full"></div>
              {/if}
            </div>
            <span class="detail-box-number text-sm md:text-base w-12 text-right">{Math.round(maxTemps[index])}°</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

