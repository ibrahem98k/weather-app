<script>
  import { onMount, tick } from 'svelte';
  import { gsap } from 'gsap';
  import { getWeatherIcon, getWeatherDescription, formatDate } from '../utils/weatherApi.js';
  
  export let weatherData;
  export let locationName = '';
  
  let locationNameEl;
  let dateEl;
  let iconEl;
  let tempEl;
  let descEl;
  let highLowEl;
  let hasAnimated = false;
  
  onMount(() => {
    if (iconEl) {
      gsap.set(iconEl, { opacity: 0, scale: 0.5, rotation: -10 });
    }
    if (tempEl) {
      gsap.set(tempEl, { opacity: 0, scale: 0.8 });
    }
    if (locationNameEl) {
      gsap.set(locationNameEl, { opacity: 0, y: -30 });
    }
    if (dateEl) {
      gsap.set(dateEl, { opacity: 0, y: -20 });
    }
    if (descEl) {
      gsap.set(descEl, { opacity: 0, y: 20 });
    }
    if (highLowEl?.children) {
      gsap.set(Array.from(highLowEl.children), { opacity: 0, y: 30, scale: 0.9 });
    }
  });
  
  $: current = weatherData?.current;
  $: currentDate = current ? formatDate(current.time) : '';
  $: isDay = current?.is_day ?? true;
  $: weatherIcon = current ? getWeatherIcon(current.weather_code, isDay) : '☀️';
  $: temperature = current ? Math.round(current.temperature_2m) : 0;
  
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
  
  $: if (current) {
    hasAnimated = false;
    tick().then(() => {
      setTimeout(() => {
        animateElements();
      }, 300);
    });
  }
  
  $: if (todayHigh !== null && todayLow !== null) {
    tick().then(() => {
      setTimeout(() => {
        if (highLowEl && highLowEl.children && highLowEl.children.length > 0) {
          const boxes = Array.from(highLowEl.children);
          if (!hasAnimated) {
            gsap.set(boxes, { opacity: 1, y: 0, scale: 1, clearProps: 'all' });
          }
        }
      }, 600);
    });
  }
  
  function animateElements() {
    if (!current) return;
    
    setTimeout(() => {
      if (!iconEl || !tempEl) {
        setTimeout(() => animateElements(), 100);
        return;
      }
      
      gsap.killTweensOf([locationNameEl, dateEl, iconEl, tempEl, descEl]);
      if (highLowEl?.children) {
        gsap.killTweensOf(highLowEl.children);
      }
      if (iconEl) gsap.set(iconEl, { opacity: 0, scale: 0.5, rotation: -10 });
      if (tempEl) gsap.set(tempEl, { opacity: 0, scale: 0.8 });
      if (locationNameEl) gsap.set(locationNameEl, { opacity: 0, y: -30 });
      if (dateEl) gsap.set(dateEl, { opacity: 0, y: -20 });
      if (descEl) gsap.set(descEl, { opacity: 0, y: 20 });
      
    const tl = gsap.timeline({ defaults: { ease: 'sine.out' } });
    
    if (locationNameEl) {
      tl.to(locationNameEl, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'expo.out'
      });
    }
    
    if (dateEl) {
      tl.to(dateEl, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'expo.out'
      }, '-=0.6');
    }
    
    if (iconEl) {
      tl.to(iconEl, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1.1,
        ease: 'back.out(1.2)'
      }, '-=0.5');
    }
    
    if (tempEl) {
      tl.to(tempEl, {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: 'expo.out'
      }, '-=0.7');
    }
    
    if (descEl) {
      tl.to(descEl, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'expo.out'
      }, '-=0.6');
    }
    
    // Animate High/Low boxes separately with delay to ensure they're in DOM
    setTimeout(() => {
      if (todayHigh !== null && todayLow !== null && highLowEl && highLowEl.children && highLowEl.children.length > 0) {
        const boxes = Array.from(highLowEl.children);
        gsap.set(boxes, { opacity: 0, y: 30, scale: 0.9 });
        gsap.to(boxes, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'back.out(1.1)',
          delay: 0.2
        });
      }
    }, 200);
    
    if (tempEl) {
      const targetTemp = temperature;
      const tempObj = { value: 0 };
      gsap.to(tempObj, {
        value: targetTemp,
        duration: 1.4,
        ease: 'expo.out',
        onUpdate: function() {
          const rounded = Math.round(tempObj.value);
          if (tempEl) {
            tempEl.textContent = rounded + '°';
          }
        }
      });
    }
    
    hasAnimated = true;
    }, 50);
  }
</script>

{#if current}
  <div class="text-center py-2 md:py-4 overflow-visible">
    <h2 bind:this={locationNameEl} class="text-4xl md:text-5xl mb-0.5 text-white city-name-font">{locationName}</h2>
    <p bind:this={dateEl} class="detail-box-description text-lg md:text-xl text-white/90 mb-4 md:mb-6">{currentDate}</p>
    
    <div class="flex items-center justify-center mb-4 md:mb-6">
      <span bind:this={iconEl} class="text-[7rem] md:text-[10rem] lg:text-[12rem] select-none inline-block transition-transform duration-300 hover:scale-105 leading-none">{weatherIcon}</span>
    </div>
    
    <div class="mb-4 md:mb-6">
      <span bind:this={tempEl} class="text-6xl md:text-7xl text-white leading-none temp-number-font">{temperature}°</span>
    </div>
    
    <p bind:this={descEl} class="detail-box-description text-2xl md:text-3xl lg:text-4xl text-white/90 mb-4">{getWeatherDescription(current.weather_code)}</p>
    
    {#if todayHigh !== null && todayLow !== null}
      <div bind:this={highLowEl} class="flex justify-center gap-3 md:gap-4 mt-6 mb-4 relative z-20 overflow-visible" style="opacity: 1;">
        <div class="bg-white/25 backdrop-blur-2xl rounded-2xl px-4 md:px-5 py-3 border border-white/40 min-w-[100px] md:min-w-[120px] text-center transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-xl relative z-20 shadow-lg" style="opacity: 1;">
          <p class="detail-box-label text-white/70 text-xs mb-1 uppercase tracking-wider">High</p>
          <p class="detail-box-number text-white text-xl md:text-2xl">{todayHigh}°</p>
        </div>
        <div class="bg-white/25 backdrop-blur-2xl rounded-2xl px-4 md:px-5 py-3 border border-white/40 min-w-[100px] md:min-w-[120px] text-center transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-xl relative z-20 shadow-lg" style="opacity: 1;">
          <p class="detail-box-label text-white/70 text-xs mb-1 uppercase tracking-wider">Low</p>
          <p class="detail-box-number text-white text-xl md:text-2xl">{todayLow}°</p>
        </div>
      </div>
    {/if}
  </div>
{/if}

