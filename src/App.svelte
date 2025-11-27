<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { getWeatherForecast } from './utils/weatherApi.js';
  import LocationSearch from './components/LocationSearch.svelte';
  import SavedLocations from './components/SavedLocations.svelte';
  import CurrentWeather from './components/CurrentWeather.svelte';
  import WeatherAnimation from './components/WeatherAnimation.svelte';
  import HourlyForecast from './components/HourlyForecast.svelte';
  import DailyForecast from './components/DailyForecast.svelte';
  import WeatherDetails from './components/WeatherDetails.svelte';
  import { savedLocations } from './stores/locations.js';
  
  let headerEl;
  let mainEl;
  
  let weatherData = null;
  let backgroundGradient = 'from-blue-400 via-blue-500 to-blue-600';
  
  function getWeatherBackground(weatherCode, isDay, timezone = null) {
    let hour;
    if (timezone) {
      const now = new Date();
      const locationTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      hour = locationTime.getHours();
    } else {
      hour = new Date().getHours();
    }
    
    const isNight = hour >= 20 || hour < 5;
    const isDawn = hour >= 5 && hour < 7;
    const isSunrise = hour >= 7 && hour < 9;
    const isMorning = hour >= 9 && hour < 12;
    const isAfternoon = hour >= 12 && hour < 17;
    const isEvening = hour >= 17 && hour < 20;
    
    if (weatherCode >= 95) {
      return isNight 
        ? 'from-slate-600 via-slate-700 to-slate-800'
        : 'from-slate-500 via-slate-600 to-slate-700';
    } else if (weatherCode >= 80 && weatherCode <= 82) {
      return isNight
        ? 'from-slate-500 via-slate-600 to-slate-700'
        : 'from-slate-400 via-slate-500 to-slate-600';
    } else if (weatherCode >= 66 && weatherCode <= 67) {
      return isNight
        ? 'from-slate-500 via-blue-700 to-slate-600'
        : 'from-slate-300 via-blue-400 to-slate-500';
    } else if (weatherCode >= 61 && weatherCode <= 65) {
      return isNight
        ? 'from-slate-500 via-slate-600 to-slate-700'
        : 'from-slate-400 via-slate-500 to-slate-600';
    } else if (weatherCode >= 56 && weatherCode <= 57) {
      return isNight
        ? 'from-slate-500 via-blue-700 to-slate-600'
        : 'from-slate-300 via-blue-400 to-slate-500';
    } else if (weatherCode >= 51 && weatherCode <= 55) {
      return isNight
        ? 'from-slate-500 via-slate-600 to-slate-700'
        : 'from-slate-400 via-slate-500 to-slate-600';
    } else if (weatherCode === 77) {
      return isNight
        ? 'from-slate-500 via-blue-700 to-slate-600'
        : 'from-slate-200 via-blue-300 to-slate-400';
    } else if (weatherCode >= 85 && weatherCode <= 86) {
      return isNight
        ? 'from-slate-500 via-blue-700 to-slate-600'
        : 'from-slate-300 via-blue-400 to-slate-500';
    } else if (weatherCode >= 71 && weatherCode <= 75) {
      return isNight
        ? 'from-slate-500 via-blue-700 to-slate-600'
        : 'from-slate-300 via-blue-400 to-slate-500';
    } else if (weatherCode >= 45 && weatherCode <= 48) {
      return isNight
        ? 'from-slate-500 via-slate-600 to-slate-700'
        : 'from-slate-300 via-slate-400 to-slate-500';
    } else if (weatherCode === 3) {
      return isNight
        ? 'from-slate-500 via-slate-600 to-slate-700'
        : 'from-slate-400 via-slate-500 to-slate-600';
    } else if (weatherCode === 2) {
      return isNight
        ? 'from-slate-500 via-slate-600 to-slate-700'
        : 'from-slate-300 via-blue-400 to-slate-500';
    } else if (weatherCode === 1) {
      if (isNight) {
        return 'from-slate-600 via-slate-700 to-slate-800';
      } else if (isDawn) {
        return 'from-sky-200 via-sky-300 to-blue-300';
      } else if (isSunrise) {
        return 'from-sky-300 via-sky-400 to-blue-400';
      } else if (isMorning) {
        return 'from-sky-300 via-sky-400 to-blue-400';
      } else if (isAfternoon) {
        return 'from-blue-400 via-sky-400 to-blue-500';
      } else if (isEvening) {
        return 'from-orange-300 via-rose-300 via-pink-300 to-violet-400';
      } else {
        return 'from-sky-300 via-sky-400 to-blue-400';
      }
    } else {
      if (isNight) {
        return 'from-slate-600 via-slate-700 to-slate-800';
      } else if (isDawn) {
        return 'from-sky-200 via-sky-300 to-blue-300';
      } else if (isSunrise) {
        return 'from-sky-300 via-sky-400 to-blue-400';
      } else if (isMorning) {
        return 'from-sky-300 via-sky-400 to-blue-400';
      } else if (isAfternoon) {
        return 'from-blue-400 via-sky-400 to-blue-500';
      } else if (isEvening) {
        return 'from-orange-300 via-rose-300 via-pink-300 to-violet-400';
      } else {
        return 'from-sky-300 via-sky-400 to-blue-400';
      }
    }
  }
  
  function updateBackground() {
    if (weatherData?.current) {
      const weatherCode = weatherData.current.weather_code;
      const isDay = weatherData.current.is_day;
      const timezone = weatherData?.timezone || null;
      backgroundGradient = getWeatherBackground(weatherCode, isDay, timezone);
    } else {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 7) {
        backgroundGradient = 'from-sky-200 via-sky-300 to-blue-300';
      } else if (hour >= 7 && hour < 9) {
        backgroundGradient = 'from-sky-300 via-sky-400 to-blue-400';
      } else if (hour >= 9 && hour < 12) {
        backgroundGradient = 'from-sky-300 via-sky-400 to-blue-400';
      } else if (hour >= 12 && hour < 17) {
        backgroundGradient = 'from-blue-400 via-sky-400 to-blue-500';
      } else if (hour >= 17 && hour < 20) {
        backgroundGradient = 'from-orange-300 via-rose-300 via-pink-300 to-violet-400';
      } else {
        backgroundGradient = 'from-slate-600 via-slate-700 to-slate-800';
      }
    }
  }
  
  let backgroundInterval;
  let locationName = 'Loading...';
  let isLoading = true;
  let error = null;
  let currentLocation = null;
  
  async function loadWeather(latitude, longitude, name = null) {
    isLoading = true;
    error = null;
    
    try {
      const data = await getWeatherForecast(latitude, longitude);
      weatherData = data;
      updateBackground();
      
      if (name) {
        locationName = name;
      } else {
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const geoData = await response.json();
          if (geoData.locality || geoData.city) {
            locationName = geoData.locality || geoData.city;
            if (geoData.principalSubdivision && geoData.locality !== geoData.principalSubdivision) {
              locationName += `, ${geoData.principalSubdivision}`;
            }
          } else if (geoData.principalSubdivision) {
            locationName = geoData.principalSubdivision;
          } else if (geoData.countryName) {
            locationName = geoData.countryName;
          } else {
            locationName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          }
        } catch {
          locationName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        }
      }
    } catch (err) {
      error = 'Failed to load weather data. Please try again.';
      console.error(err);
    } finally {
      isLoading = false;
    }
  }
  
  function handleLocationSelect(location) {
    currentLocation = location;
    loadWeather(location.latitude, location.longitude, location.name);
  }
  
  function getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: 'My Location'
          };
          currentLocation = location;
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const geoData = await response.json();
            if (geoData.locality || geoData.city) {
              location.name = geoData.locality || geoData.city;
              if (geoData.principalSubdivision && geoData.locality !== geoData.principalSubdivision) {
                location.name += `, ${geoData.principalSubdivision}`;
              }
            } else if (geoData.principalSubdivision) {
              location.name = geoData.principalSubdivision;
            } else if (geoData.countryName) {
              location.name = geoData.countryName;
            }
          } catch (err) {
            console.error('Error fetching location name:', err);
          }
          loadWeather(position.coords.latitude, position.coords.longitude, location.name || 'My Location');
        },
        (err) => {
          savedLocations.subscribe(locations => {
            if (locations.length > 0) {
              const firstLocation = locations[0];
              currentLocation = firstLocation;
              loadWeather(firstLocation.latitude, firstLocation.longitude, firstLocation.name);
            } else {
              console.error('Geolocation error:', err);
              loadWeather(40.7128, -74.0060, 'New York');
            }
          })();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      savedLocations.subscribe(locations => {
        if (locations.length > 0) {
          const firstLocation = locations[0];
          currentLocation = firstLocation;
          loadWeather(firstLocation.latitude, firstLocation.longitude, firstLocation.name);
        } else {
          loadWeather(40.7128, -74.0060, 'New York');
        }
      })();
    }
  }
  
  onMount(() => {
    savedLocations.load();
    updateBackground();
    
    setTimeout(() => {
      if (headerEl && mainEl) {
        // Clear any existing animations
        gsap.killTweensOf([headerEl, mainEl]);
        gsap.set([headerEl, mainEl], { clearProps: 'all' });
        
        gsap.fromTo([headerEl, mainEl],
          {
            opacity: 0,
            y: 15
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'expo.out',
            stagger: 0.08
          }
        );
      }
    }, 50);
    
    getCurrentLocation();
    
    // Update background every minute
    backgroundInterval = setInterval(() => {
      updateBackground();
    }, 60000);
    
    return () => {
      if (backgroundInterval) {
        clearInterval(backgroundInterval);
      }
    };
  });
</script>

<div class="weather-background min-h-screen bg-gradient-to-b {backgroundGradient} fixed inset-0 transition-all duration-[2000ms] ease-in-out z-0">
  <!-- Color animation overlay -->
  <div class="color-animation-overlay absolute inset-0 pointer-events-none"></div>
  <!-- Subtle overlay for depth and atmosphere -->
  <div class="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none opacity-60"></div>
  <!-- Soft vignette effect for focus -->
  <div class="absolute inset-0 bg-radial-gradient pointer-events-none opacity-50"></div>
  <!-- Subtle top glow for sky effect -->
  <div class="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
</div>

<main bind:this={mainEl} class="min-h-screen p-4 md:p-8 max-w-4xl mx-auto relative z-10">
  <div bind:this={headerEl} class="flex items-center gap-3 mb-4 flex-wrap relative z-[100]">
    <div class="flex-shrink-0">
      <SavedLocations onLocationSelect={handleLocationSelect} {currentLocation} />
    </div>
    <div class="flex-1 min-w-0">
      <LocationSearch onLocationSelect={handleLocationSelect} />
    </div>
    {#if currentLocation && weatherData}
      <div class="flex-shrink-0">
        {#if $savedLocations.some(loc => Math.abs(loc.latitude - currentLocation.latitude) < 0.001 && Math.abs(loc.longitude - currentLocation.longitude) < 0.001)}
          <button
            on:click={() => savedLocations.remove(currentLocation)}
            class="bg-white/35 backdrop-blur-2xl rounded-2xl px-3 py-0 text-yellow-400 text-xs hover:bg-white/25 transition-all duration-300 border border-yellow-400/70 flex items-center gap-1.5 h-12 hover:scale-105 hover:shadow-2xl shadow-xl"
            title="Remove from Saved"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="hidden sm:inline text-xs">Saved</span>
          </button>
        {:else}
          <button
            on:click={() => savedLocations.add(currentLocation)}
            class="bg-white/35 backdrop-blur-2xl rounded-2xl px-3 py-0 text-white text-xs hover:bg-white/25 transition-all duration-300 border border-white/50 flex items-center gap-1.5 h-12 hover:scale-105 hover:shadow-2xl shadow-xl"
            title="Save Location"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span class="hidden sm:inline text-xs">Save</span>
          </button>
        {/if}
      </div>
    {/if}
  </div>
  
  {#if isLoading}
    <div class="loading-blur-motion fixed inset-0 w-full h-full z-50">
      <div class="blur-motion-overlay"></div>
    </div>
  {:else if error}
    <div class="bg-white/20 backdrop-blur-xl rounded-2xl p-6 text-center text-white border border-white/30">
      <p class="text-xl mb-4">{error}</p>
      <button
        on:click={getCurrentLocation}
        class="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300"
      >
        Retry
      </button>
    </div>
  {:else if weatherData}
    <div class="weather-content {isLoading ? 'loading-blur' : ''}">
      <CurrentWeather {weatherData} {locationName} {currentLocation} />
      <WeatherAnimation weatherCode={weatherData.current.weather_code} isDay={weatherData.current.is_day} timezone={weatherData.timezone} />
      <HourlyForecast {weatherData} />
      
      {#if weatherData?.current?.precipitation !== undefined && weatherData.current.precipitation !== null && weatherData.current.precipitation >= 0.5}
        {@const hourly = weatherData?.hourly}
        {@const hourlyTimes = hourly?.time || []}
        {@const hourlyPrecip = hourly?.precipitation_probability || []}
        {@const next24HoursPrecip = (() => {
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
              precip: hourlyPrecip[idx] || 0
            };
          });
        })()}
        {@const maxPrecip = Math.max(...next24HoursPrecip.map(h => h.precip), 100)}
        {@const minPrecip = Math.min(...next24HoursPrecip.map(h => h.precip), 0)}
        {@const precipRange = maxPrecip - minPrecip || 100}
        {@const graphHeight = 30}
        {@const graphBottom = 40}
        
        <div class="bg-white/25 backdrop-blur-2xl rounded-3xl p-2.5 md:p-3 mb-4 border border-white/40 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center gap-1.5 mb-2">
            <svg class="w-4 h-4 text-white/80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <h3 class="text-white text-lg font-medium tracking-tight">{weatherData.current.precipitation.toFixed(1)} mm</h3>
          </div>
          
          {#if next24HoursPrecip.length > 0}
            <div class="relative">
              <!-- Graph line and points -->
              <svg class="w-full h-14 md:h-16" viewBox="0 0 400 50" preserveAspectRatio="none">
                <!-- Smooth curved line with area fill -->
                <defs>
                  <linearGradient id="precipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgba(255,255,255,0.2);stop-opacity:1" />
                    <stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:1" />
                  </linearGradient>
                </defs>
                
                <!-- Area fill under curve -->
                <path
                  d={(() => {
                    const points = next24HoursPrecip.map((h, i) => {
                      const x = (i / (next24HoursPrecip.length - 1 || 1)) * 400;
                      const normalizedPrecip = precipRange > 0 ? (h.precip - minPrecip) / precipRange : 0;
                      const y = graphBottom - (normalizedPrecip * graphHeight);
                      return { x, y };
                    });
                    
                    let path = `M ${points[0].x},${graphBottom} L ${points[0].x},${points[0].y}`;
                    for (let i = 1; i < points.length; i++) {
                      const prev = points[i - 1];
                      const curr = points[i];
                      const cp1x = prev.x + (curr.x - prev.x) / 3;
                      const cp1y = prev.y;
                      const cp2x = curr.x - (curr.x - prev.x) / 3;
                      const cp2y = curr.y;
                      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
                    }
                    path += ` L ${points[points.length - 1].x},${graphBottom} Z`;
                    return path;
                  })()}
                  fill="url(#precipGradient)"
                  opacity="0.3"
                />
                
                <!-- Smooth curved line -->
                <path
                  d={(() => {
                    const points = next24HoursPrecip.map((h, i) => {
                      const x = (i / (next24HoursPrecip.length - 1 || 1)) * 400;
                      const normalizedPrecip = precipRange > 0 ? (h.precip - minPrecip) / precipRange : 0;
                      const y = graphBottom - (normalizedPrecip * graphHeight);
                      return { x, y };
                    });
                    
                    let path = `M ${points[0].x},${points[0].y}`;
                    for (let i = 1; i < points.length; i++) {
                      const prev = points[i - 1];
                      const curr = points[i];
                      const cp1x = prev.x + (curr.x - prev.x) / 3;
                      const cp1y = prev.y;
                      const cp2x = curr.x - (curr.x - prev.x) / 3;
                      const cp2y = curr.y;
                      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
                    }
                    return path;
                  })()}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.6)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                
                <!-- Data points (5 evenly spaced) - Better styled dots -->
                {#each Array(5) as _, i}
                  {@const index = Math.round((i / 4) * (next24HoursPrecip.length - 1))}
                  {@const hour = next24HoursPrecip[index]}
                  {@const x = (index / (next24HoursPrecip.length - 1 || 1)) * 400}
                  {@const normalizedPrecip = precipRange > 0 ? (hour.precip - minPrecip) / precipRange : 0}
                  {@const y = graphBottom - (normalizedPrecip * graphHeight)}
                  <!-- Outer glow -->
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="rgba(255, 255, 255, 0.2)"
                  />
                  <!-- Main dot -->
                  <circle
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="white"
                    stroke="rgba(255, 255, 255, 0.5)"
                    stroke-width="1.5"
                  />
                  <!-- Inner highlight -->
                  <circle
                    cx={x}
                    cy={y - 0.8}
                    r="1.2"
                    fill="rgba(255, 255, 255, 0.8)"
                  />
                {/each}
              </svg>
              
              <!-- Labels below (5 points with number, % and droplet) - Centered and no gap -->
              <div class="flex justify-between items-start mt-1">
                {#each Array(5) as _, i}
                  {@const index = Math.round((i / 4) * (next24HoursPrecip.length - 1))}
                  {@const hour = next24HoursPrecip[index]}
                  {@const x = (index / (next24HoursPrecip.length - 1 || 1)) * 100}
                  {@const opacity = 0.5 + (hour.precip / 100) * 0.5}
                  <div class="flex flex-col items-center justify-center" style="width: {100 / 5}%;">
                    <span class="text-white/70 text-sm mb-1" style="opacity: {opacity};">💧</span>
                    <div class="flex items-center justify-center gap-0.5">
                      <p class="text-white/80 text-sm font-semibold">{Math.round(hour.precip)}</p>
                      <p class="text-white/60 text-xs">%</p>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}
      
      <DailyForecast dailyData={weatherData} />
      <WeatherDetails {weatherData} {currentLocation} />
    </div>
  {/if}
</main>

