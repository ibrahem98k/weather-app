// API base URL
const BASE_URL = 'https://api.open-meteo.com/v1';

// Search for locations by name
export async function searchLocation(query) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search location');
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching location:', error);
    throw error;
  }
}

// Fetch weather forecast for given coordinates
export async function getWeatherForecast(latitude, longitude) {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day,uv_index,visibility,pressure_msl,precipitation,apparent_temperature,cloud_cover,wind_gusts_10m&hourly=temperature_2m,weather_code,precipitation_probability,precipitation,apparent_temperature,cloud_cover,relative_humidity_2m,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,apparent_temperature_max,apparent_temperature_min,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,sunshine_duration&timezone=auto`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const weatherData = await response.json();
    
    try {
      const airQualityResponse = await fetch(
        `${BASE_URL}/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi&timezone=auto`
      );
      
      if (airQualityResponse.ok) {
        const airQualityData = await airQualityResponse.json();
        if (airQualityData.current) {
          weatherData.current = {
            ...weatherData.current,
            air_quality: airQualityData.current.us_aqi || airQualityData.current.european_aqi || null,
            pm10: airQualityData.current.pm10,
            pm2_5: airQualityData.current.pm2_5,
            carbon_monoxide: airQualityData.current.carbon_monoxide,
            nitrogen_dioxide: airQualityData.current.nitrogen_dioxide,
            sulphur_dioxide: airQualityData.current.sulphur_dioxide,
            ozone: airQualityData.current.ozone
          };
        }
      }
    } catch (airQualityError) {
      console.warn('Air quality data not available:', airQualityError);
    }
    
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}

// Format time string to readable time
export function formatTime(timeString) {
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Get emoji icon for weather code
export function getWeatherIcon(weatherCode, isDay = true) {
  const codes = {
    0: isDay ? '☀️' : '🌙',
    1: isDay ? '🌤️' : '☁️',
    2: isDay ? '⛅' : '☁️',
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌦️',
    53: '🌦️',
    55: '🌦️',
    56: '🌧️',
    57: '🌧️',
    61: '🌧️',
    63: '🌧️',
    65: '🌧️',
    66: '🌧️',
    67: '🌧️',
    71: '🌨️',
    73: '🌨️',
    75: '🌨️',
    77: '🌨️',
    80: '🌦️',
    81: '🌦️',
    82: '⛈️',
    85: '🌨️',
    86: '🌨️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️',
  };
  
  return codes[weatherCode] || (isDay ? '☀️' : '🌙');
}

// Get text description for weather code
export function getWeatherDescription(weatherCode) {
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Cloudy',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Light rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  
  const code = Number(weatherCode);
  
  if (descriptions[code] !== undefined) {
    return descriptions[code];
  }
  
  if (code >= 95 && code <= 99) {
    return 'Thunderstorm';
  } else if (code >= 80 && code <= 82) {
    return 'Rain showers';
  } else if (code >= 85 && code <= 86) {
    return 'Snow showers';
  } else if (code >= 71 && code <= 77) {
    return 'Snow';
  } else if (code >= 61 && code <= 67) {
    return 'Rain';
  } else if (code >= 51 && code <= 57) {
    return 'Drizzle';
  } else if (code >= 45 && code <= 48) {
    return 'Fog';
  } else if (code >= 1 && code <= 3) {
    return 'Cloudy';
  }
  
  return 'Clear';
}

// Format date to full date string
export function formatDate(timeString) {
  const date = new Date(timeString);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// Format day - shows "Today", "Tomorrow", or weekday name
export function formatDay(timeString) {
  const date = new Date(timeString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
}
