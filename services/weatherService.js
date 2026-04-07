const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  // Check if API key is available
  isConfigured() {
    return this.apiKey && this.apiKey !== 'your_openweathermap_api_key';
  }

  // Get weather data by ZIP code
  async getWeatherByZip(zipCode, countryCode = 'us') {
    if (!this.isConfigured()) {
      console.log('⚠️  OpenWeatherMap API key not configured, using mock data');
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          zip: `${zipCode},${countryCode}`,
          appid: this.apiKey,
          units: 'metric'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Weather API error for ZIP ${zipCode}:`, error.message);
      return null;
    }
  }

  // Get weather alerts by coordinates
  async getAlertsByCoords(lat, lon) {
    if (!this.isConfigured()) return null;

    try {
      const response = await axios.get(`${this.baseUrl}/onecall`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          exclude: 'minutely,hourly'
        }
      });
      return response.data.alerts || [];
    } catch (error) {
      console.error(`Weather alerts API error:`, error.message);
      return null;
    }
  }

  // Helper function to handle Indian pincodes
  formatPincode(pin) {
    return `${pin},IN`;
  }

  // Fetch precise location mapping using OpenWeather Geocoding API
  async getGeoLocationByZip(zipCode) {
    if (!this.isConfigured()) return null;

    try {
      const geoUrl = `${this.baseUrl.replace('/data/2.5', '/geo/1.0')}/zip`;
      const response = await axios.get(geoUrl, {
        params: {
          zip: this.formatPincode(zipCode),
          appid: this.apiKey
        }
      });
      
      return {
        lat: response.data.lat,
        lon: response.data.lon,
        city: response.data.name
      };
    } catch (error) {
      console.error(`Geo API error for ZIP ${zipCode}:`, error.message);
      return null;
    }
  }

  // Convert OpenWeatherMap data to our alert format
  convertToAlert(weatherData, zipCode) {
    if (!weatherData) return null;

    const alerts = [];
    const { weather, main, wind } = weatherData;
    const condition = weather[0];

    // Check for severe conditions
    if (main.temp > 40) {
      alerts.push({
        type: 'weather',
        severity: main.temp > 45 ? 'critical' : 'high',
        title: 'Extreme Heat Warning',
        description: `Temperature has reached ${main.temp}°C (${(main.temp * 9/5 + 32).toFixed(1)}°F). Stay hydrated and avoid prolonged outdoor exposure. Seek air-conditioned shelter.`,
        zipCode,
        source: 'openweathermap'
      });
    }

    if (main.temp < -10) {
      alerts.push({
        type: 'weather',
        severity: main.temp < -20 ? 'critical' : 'high',
        title: 'Extreme Cold Warning',
        description: `Temperature has dropped to ${main.temp}°C (${(main.temp * 9/5 + 32).toFixed(1)}°F). Risk of frostbite and hypothermia. Dress warmly and limit outdoor exposure.`,
        zipCode,
        source: 'openweathermap'
      });
    }

    if (wind.speed > 20) {
      alerts.push({
        type: 'weather',
        severity: wind.speed > 30 ? 'critical' : 'high',
        title: 'High Wind Advisory',
        description: `Wind speeds of ${wind.speed} m/s (${(wind.speed * 2.237).toFixed(1)} mph) detected. Secure loose objects and avoid unnecessary travel.`,
        zipCode,
        source: 'openweathermap'
      });
    }

    // Thunderstorm
    if (condition.id >= 200 && condition.id < 300) {
      alerts.push({
        type: 'weather',
        severity: condition.id >= 210 && condition.id <= 221 ? 'high' : 'medium',
        title: 'Thunderstorm Warning',
        description: `${condition.description.charAt(0).toUpperCase() + condition.description.slice(1)} in your area. Seek shelter immediately. Avoid open areas and tall isolated objects.`,
        zipCode,
        source: 'openweathermap'
      });
    }

    // Heavy rain / flood risk
    if (condition.id >= 502 && condition.id <= 531) {
      alerts.push({
        type: 'flood',
        severity: condition.id >= 502 ? 'high' : 'medium',
        title: 'Heavy Rain - Flood Risk',
        description: `Heavy rainfall detected: ${condition.description}. Flash flooding possible in low-lying areas. Avoid driving through flooded roads.`,
        zipCode,
        source: 'openweathermap'
      });
    }

    return alerts;
  }
}

module.exports = new WeatherService();
