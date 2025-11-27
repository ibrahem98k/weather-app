<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { getWeatherIcon, formatTime } from '../utils/weatherApi.js';
  
  export let weatherData;
  
  let hourlyContainer;
  let scrollContainer;
  let hasAnimated = false;
  
  $: hourly = weatherData?.hourly;
  $: hourlyTimes = hourly?.time || [];
  $: hourlyTemps = hourly?.temperature_2m || [];
  $: hourlyCodes = hourly?.weather_code || [];
  
  $: next24Hours = (() => {
    if (!hourlyTimes || hourlyTimes.length === 0) return [];
    
    const now = new Date();
    const currentIndex = hourlyTimes.findIndex(time => {
      const timeDate = new Date(time);
      return timeDate > now;
    });
    
    if (currentIndex === -1) return [];
    
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
  
  $: if (next24Hours.length > 0 && !hasAnimated) {
    hasAnimated = true;
    setTimeout(() => {
      animateHourly();
    }, 200);
  }
  
  $: if (next24Hours.length === 0) {
    hasAnimated = false;
  }
  
  function animateHourly() {
    if (!hourlyContainer) return;
    
    const items = hourlyContainer.querySelectorAll('.hourly-item');
    if (items.length === 0) return;
    
    gsap.killTweensOf(items);
    gsap.set(items, { clearProps: 'all' });
    
    gsap.fromTo(Array.from(items),
      {
        opacity: 0,
        y: 25,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.04,
        ease: 'expo.out'
      }
    );
  }
  
  function formatHour(timeString) {
    const date = new Date(timeString);
    const now = new Date();
    const hoursDiff = Math.floor((date - now) / (1000 * 60 * 60));
    
    if (hoursDiff === 0) return 'Now';
    if (hoursDiff === 1) return 'In 1h';
    
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  }
</script>

{#if next24Hours.length > 0}
  <div bind:this={hourlyContainer} class="bg-white/25 backdrop-blur-2xl rounded-3xl p-4 md:p-6 mb-4 border border-white/40 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <h3 class="detail-box-label text-white text-xl mb-4 tracking-tight">24-Hour Forecast</h3>
    <div bind:this={scrollContainer} class="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
      <div class="flex gap-4 min-w-max">
        {#each next24Hours as hour, index}
          <div class="hourly-item flex flex-col items-center gap-2 min-w-[70px] text-center">
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

