<script>
  import { onMount, onDestroy } from 'svelte';
  
  export let weatherCode = 0;
  export let isDay = true;
  export let timezone = null;
  
  function getCurrentHour() {
    if (timezone) {
      const now = new Date();
      const locationTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      return locationTime.getHours();
    }
    return new Date().getHours();
  }
  
  $: hour = getCurrentHour();
  $: isNight = hour >= 20 || hour < 5;
  $: isMorning = hour >= 7 && hour < 12;
  $: isDawn = hour >= 5 && hour < 7;
  
  let timeInterval;
  
  onMount(() => {
    timeInterval = setInterval(() => {
      hour = getCurrentHour();
    }, 60000);
  });
  
  onDestroy(() => {
    if (timeInterval) clearInterval(timeInterval);
  });
  
  $: showRain = weatherCode >= 51 && weatherCode <= 67 || weatherCode >= 80 && weatherCode <= 82;
  $: showSnow = weatherCode >= 71 && weatherCode <= 77 || weatherCode >= 85 && weatherCode <= 86;
  $: showThunder = weatherCode >= 95;
  $: showClouds = weatherCode >= 1 && weatherCode <= 3;
  $: showFog = weatherCode >= 45 && weatherCode <= 48;
  $: showClear = weatherCode === 0;
  
  $: showMorningLight = showClear && (isMorning || isDawn || (hour >= 5 && hour < 12));
  $: showNightEffects = showClear && isNight;
  $: showSunrise = showClear && (isDawn || (hour >= 7 && hour < 9));
  
</script>

<div class="weather-animation-container">
  {#if showRain}
    <!-- Rain Animation -->
    <div class="rain-container">
      {#each Array(500) as _, i}
        {@const randomLeft = Math.random() * 100}
        {@const randomDelay = Math.random() * 3}
        {@const randomDuration = 0.4 + Math.random() * 0.6}
        {@const randomWidth = 1 + Math.random() * 0.5}
        {@const randomHeight = 15 + Math.random() * 25}
        <div 
          class="rain-drop"
          style="left: {randomLeft}%; top: -150px; animation-delay: {randomDelay}s; animation-duration: {randomDuration}s; width: {randomWidth}px; height: {randomHeight}px;"
        ></div>
      {/each}
    </div>
  {/if}
  
  {#if showSnow}
    <!-- Snow Animation -->
    <div class="snow-container">
      {#each Array(150) as _, i}
        {@const randomLeft = Math.random() * 100}
        {@const randomSize = 3 + Math.random() * 4}
        <div 
          class="snowflake"
          style="left: {randomLeft}%; top: -200px; animation-delay: {Math.random() * 4}s; animation-duration: {4 + Math.random() * 3}s; width: {randomSize}px; height: {randomSize}px;"
        ></div>
      {/each}
    </div>
  {/if}
  
  {#if showThunder}
    <!-- Thunderstorm with Lightning -->
    <div class="lightning-container fixed inset-0 w-full h-full">
      <!-- Lightning bolts -->
      {#each Array(3) as _, i}
        <div 
          class="lightning-bolt absolute"
          style="left: {20 + Math.random() * 60}%; top: 0; width: 2px; height: 100%; animation-delay: {Math.random() * 5}s;"
        ></div>
      {/each}
      <!-- Lightning flash overlay -->
      <div class="lightning-flash absolute inset-0 bg-white/30"></div>
    </div>
  {/if}
  
  {#if showClouds}
    <!-- Cloud Animation -->
    <div class="clouds-container fixed inset-0 w-full h-full overflow-hidden">
      {#each Array(12) as _, i}
        {@const cloudSize = 180 + Math.random() * 250}
        {@const cloudTop = 10 + Math.random() * 50}
        {@const cloudDelay = (i * 8) % 40}
        {@const cloudSpeed = 40 + Math.random() * 20}
        {@const startPos = -600 - (i * 200)}
        {@const opacity = 0.15 + Math.random() * 0.15}
        <div 
          class="cloud-group absolute"
          style="left: {startPos}px; top: {cloudTop}%; animation-delay: {cloudDelay}s; animation-duration: {cloudSpeed}s;"
        >
          <!-- Main cloud base - wider and flatter -->
          <div 
            class="cloud-part cloud-base absolute bg-white/20"
            style="width: {cloudSize * 1.2}px; height: {cloudSize * 0.4}px; left: 0; top: {cloudSize * 0.3}px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; filter: blur(50px); opacity: {opacity};"
          ></div>
          <!-- Large cloud mass 1 -->
          <div 
            class="cloud-part cloud-mass absolute bg-white/20"
            style="width: {cloudSize * 0.9}px; height: {cloudSize * 0.8}px; left: {cloudSize * 0.1}px; top: -{cloudSize * 0.1}px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; filter: blur(60px); opacity: {opacity};"
          ></div>
          <!-- Large cloud mass 2 -->
          <div 
            class="cloud-part cloud-mass absolute bg-white/20"
            style="width: {cloudSize * 0.85}px; height: {cloudSize * 0.75}px; left: {cloudSize * 0.4}px; top: -{cloudSize * 0.15}px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; filter: blur(55px); opacity: {opacity * 0.9};"
          ></div>
          <!-- Medium cloud mass 3 -->
          <div 
            class="cloud-part cloud-mass absolute bg-white/20"
            style="width: {cloudSize * 0.6}px; height: {cloudSize * 0.6}px; left: {cloudSize * 0.7}px; top: {cloudSize * 0.05}px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; filter: blur(50px); opacity: {opacity * 0.8};"
          ></div>
          <!-- Small cloud puff 4 -->
          <div 
            class="cloud-part cloud-puff absolute bg-white/20"
            style="width: {cloudSize * 0.45}px; height: {cloudSize * 0.45}px; left: -{cloudSize * 0.15}px; top: {cloudSize * 0.2}px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; filter: blur(45px); opacity: {opacity * 0.7};"
          ></div>
          <!-- Small cloud puff 5 -->
          <div 
            class="cloud-part cloud-puff absolute bg-white/20"
            style="width: {cloudSize * 0.5}px; height: {cloudSize * 0.5}px; left: {cloudSize * 0.85}px; top: -{cloudSize * 0.05}px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; filter: blur(48px); opacity: {opacity * 0.75};"
          ></div>
          <!-- Additional layer for depth -->
          <div 
            class="cloud-part cloud-layer absolute bg-white/15"
            style="width: {cloudSize * 1.1}px; height: {cloudSize * 0.5}px; left: {cloudSize * 0.05}px; top: {cloudSize * 0.25}px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; filter: blur(70px); opacity: {opacity * 0.6};"
          ></div>
        </div>
      {/each}
    </div>
  {/if}
  
  {#if showFog}
    <!-- Fog Animation -->
    <div class="fog-container fixed inset-0 w-full h-full">
      {#each Array(3) as _, i}
        <div 
          class="fog absolute bg-white/10 blur-3xl"
          style="left: {Math.random() * 100}%; bottom: 0; animation-delay: {Math.random() * 5}s; animation-duration: {15 + Math.random() * 10}s; width: {200 + Math.random() * 300}px; height: {100 + Math.random() * 150}px;"
        ></div>
      {/each}
    </div>
  {/if}
  
  {#if showMorningLight}
    <!-- Morning Light for Clear Weather - Reaches Header -->
    <div class="corner-light-container fixed inset-0 w-full h-full"></div>
  {/if}
  
  {#if showNightEffects}
    <!-- Night Stars and Moon -->
    <div class="night-effects-container fixed inset-0 w-full h-full">
      <!-- Stars -->
      {#each Array(150) as _, i}
        {@const randomX = Math.random() * 100}
        {@const randomY = Math.random() * 100}
        {@const randomSize = 1 + Math.random() * 2}
        {@const randomDelay = Math.random() * 3}
        <div 
          class="star absolute bg-white rounded-full"
          style="left: {randomX}%; top: {randomY}%; width: {randomSize}px; height: {randomSize}px; animation-delay: {randomDelay}s; opacity: {0.3 + Math.random() * 0.7};"
        ></div>
      {/each}
      
      <!-- Moon -->
      <div class="moon-container absolute" style="top: 15%; right: 15%;">
        <div class="moon relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/90 shadow-lg">
          <div class="absolute inset-0 rounded-full bg-gradient-to-br from-white/80 to-gray-200/60"></div>
          <div class="absolute top-1/4 left-1/4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-300/40"></div>
          <div class="absolute top-1/3 right-1/4 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300/30"></div>
        </div>
        <!-- Moon glow -->
        <div class="moon-glow absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 blur-2xl"></div>
      </div>
    </div>
  {/if}
  
  
  
</div>

<style>
  @keyframes rain {
    0% {
      transform: translateY(-100px) translateX(0);
      opacity: 0;
    }
    5% {
      opacity: 1;
    }
    100% {
      transform: translateY(calc(100vh + 1000px)) translateX(15px);
      opacity: 0.9;
    }
  }
  
  @keyframes snow {
    0% {
      transform: translateY(-100px) translateX(0) rotate(0deg);
      opacity: 0;
    }
    5% {
      opacity: 1;
    }
    100% {
      transform: translateY(calc(100vh + 1000px)) translateX(30px) rotate(360deg);
      opacity: 0.8;
    }
  }
  
  .weather-animation-container {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    min-height: 100vh;
    height: 100%;
    pointer-events: none;
    z-index: 8;
    margin: 0;
    padding: 0;
    overflow: visible;
  }
  
  .clouds-container,
  .fog-container,
  .lightning-container {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    min-height: 100vh;
    height: 100%;
    margin: 0;
    padding: 0;
  }
  
  .rain-container,
  .snow-container {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    min-height: 100vh;
    height: 100%;
    max-height: none;
    pointer-events: none;
    z-index: 8;
    margin: 0;
    padding: 0;
    overflow: visible;
  }
  
  .rain-drop,
  .snowflake {
    position: absolute;
    margin: 0;
    padding: 0;
  }
  
  .rain-drop {
    background-color: rgba(147, 197, 253, 0.5);
  }
  
  .snowflake {
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
  }
  
  @keyframes lightning {
    0%, 100% {
      opacity: 0;
    }
    1% {
      opacity: 1;
    }
    1.5% {
      opacity: 0;
    }
    2% {
      opacity: 0.8;
    }
    2.5% {
      opacity: 0;
    }
    3% {
      opacity: 0.6;
    }
    3.5% {
      opacity: 0;
    }
    8%, 12%, 16% {
      opacity: 0.3;
    }
    9%, 13% {
      opacity: 0.5;
    }
  }
  
  @keyframes lightningBolt {
    0% {
      opacity: 0;
      transform: translateY(-100%);
    }
    0.5% {
      opacity: 1;
      transform: translateY(0);
    }
    1% {
      opacity: 0.8;
      transform: translateY(10%);
    }
    1.5% {
      opacity: 0;
      transform: translateY(20%);
    }
    100% {
      opacity: 0;
      transform: translateY(100%);
    }
  }
  
  @keyframes cloudFloat {
    0% {
      transform: translateX(0) translateY(0);
      opacity: 0;
    }
    5% {
      opacity: 1;
    }
    95% {
      opacity: 1;
    }
    100% {
      transform: translateX(calc(100vw + 600px)) translateY(0);
      opacity: 0;
    }
  }
  
  @keyframes cloudPuff {
    0%, 100% {
      transform: scale(1) translateY(0);
      opacity: 0.25;
    }
    50% {
      transform: scale(1.1) translateY(-5px);
      opacity: 0.3;
    }
  }
  
  @keyframes fogMove {
    0% {
      transform: translateX(-300px);
      opacity: 0.1;
    }
    50% {
      opacity: 0.2;
    }
    100% {
      transform: translateX(calc(100vw + 300px));
      opacity: 0.1;
    }
  }
  
  
  @keyframes starTwinkle {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }
  
  @keyframes sunGlow {
    0%, 100% {
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.5;
      transform: translate(-50%, -50%) scale(1.15);
    }
  }
  
  @keyframes sunGlowSecondary {
    0%, 100% {
      opacity: 0.2;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.35;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }
  
  .rain-drop {
    animation: rain linear infinite;
  }
  
  .snowflake {
    animation: snow linear infinite;
  }
  
  .lightning-flash {
    animation: lightning 4s infinite;
  }
  
  .lightning-bolt {
    background: linear-gradient(to bottom, 
      transparent 0%, 
      rgba(255, 255, 255, 0.9) 20%, 
      rgba(200, 220, 255, 0.8) 40%, 
      rgba(255, 255, 255, 0.9) 60%, 
      transparent 100%);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.8),
                0 0 40px rgba(200, 220, 255, 0.6),
                0 0 60px rgba(150, 200, 255, 0.4);
    animation: lightningBolt 0.3s ease-out infinite;
    transform-origin: top;
  }
  
  .cloud-group {
    animation: cloudFloat linear infinite;
  }
  
  .cloud-part {
    will-change: transform;
  }
  
  .cloud-base {
    transform-origin: center;
  }
  
  .cloud-mass {
    animation: cloudPuff 12s ease-in-out infinite;
  }
  
  .cloud-puff {
    animation: cloudPuff 10s ease-in-out infinite;
  }
  
  .cloud-layer {
    animation: cloudPuff 15s ease-in-out infinite;
  }
  
  .cloud-mass:nth-of-type(2) {
    animation-delay: 0s;
  }
  
  .cloud-mass:nth-of-type(3) {
    animation-delay: 3s;
  }
  
  .cloud-mass:nth-of-type(4) {
    animation-delay: 6s;
  }
  
  .cloud-puff:nth-of-type(5) {
    animation-delay: 2s;
  }
  
  .cloud-puff:nth-of-type(6) {
    animation-delay: 4s;
  }
  
  .cloud-layer {
    animation-delay: 1s;
  }
  
  .fog {
    animation: fogMove linear infinite;
  }
  
  .sun-ray {
    width: 4px;
    height: 200px;
    animation: sunRay 4s ease-in-out infinite;
  }
  
  .sun-glow {
    animation: sunGlow 8s ease-in-out infinite;
  }
  
  .sun-glow-secondary {
    animation: sunGlowSecondary 10s ease-in-out infinite;
    animation-delay: 1s;
  }
  
  .star {
    animation: starTwinkle 3s ease-in-out infinite;
  }
  
  .moon {
    box-shadow: 0 0 40px rgba(255, 255, 255, 0.3), inset -20px 0 0 rgba(0, 0, 0, 0.1);
  }
  
  .night-effects-container {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    min-height: 100vh;
    height: 100%;
    pointer-events: none;
    z-index: 7;
    margin: 0;
    padding: 0;
    overflow: visible;
  }
  
  .moon-container {
    pointer-events: none;
  }
  
  .corner-light-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(ellipse 200% 150% at top left, 
        rgba(255, 220, 120, 0.45) 0%,
        rgba(255, 200, 100, 0.35) 20%,
        rgba(255, 180, 80, 0.25) 40%,
        rgba(255, 160, 60, 0.15) 60%,
        rgba(255, 140, 40, 0.08) 80%,
        transparent 100%
      ),
      linear-gradient(to bottom,
        rgba(255, 230, 140, 0.2) 0%,
        rgba(255, 210, 120, 0.15) 25%,
        rgba(255, 190, 100, 0.1) 50%,
        rgba(255, 170, 80, 0.05) 75%,
        transparent 100%
      );
    pointer-events: none;
    z-index: 5;
  }
</style>

