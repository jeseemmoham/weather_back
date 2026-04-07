const Alert = require('../models/Alert');

// Realistic mock alert templates
const alertTemplates = {
  weather: [
    {
      severity: 'high',
      title: 'Severe Thunderstorm Warning',
      description: 'The National Weather Service has issued a severe thunderstorm warning for your area. Expect damaging winds up to 70 mph, large hail up to 1.5 inches, and dangerous lightning. Seek shelter in a sturdy building immediately. Avoid windows and doors.'
    },
    {
      severity: 'critical',
      title: 'Tornado Watch Active',
      description: 'A tornado watch has been issued for your region until 10:00 PM. Conditions are favorable for tornado development. Monitor local weather updates, identify shelter locations, and be prepared to take cover immediately if a warning is issued.'
    },
    {
      severity: 'medium',
      title: 'Winter Storm Advisory',
      description: 'A winter storm advisory is in effect. Expect 4-8 inches of snow accumulation with freezing rain possible. Road conditions will deteriorate. Reduce travel speed and increase following distance. Stock up on essential supplies.'
    },
    {
      severity: 'low',
      title: 'Dense Fog Advisory',
      description: 'Dense fog is expected through mid-morning with visibility dropping below 1/4 mile in some areas. Use low-beam headlights and reduce speed. Allow extra time for your commute.'
    },
    {
      severity: 'high',
      title: 'Extreme Heat Warning',
      description: 'Dangerously hot conditions expected with temperatures reaching 110°F (43°C). Heat stroke risk is very high. Stay in air-conditioned spaces, drink plenty of water, and limit outdoor activities during peak hours (10 AM - 6 PM).'
    },
    {
      severity: 'medium',
      title: 'Air Quality Alert',
      description: 'Air quality has reached unhealthy levels due to wildfire smoke. Sensitive groups should avoid prolonged outdoor exertion. Consider wearing N95 masks outdoors. Keep windows and doors closed.'
    }
  ],
  flood: [
    {
      severity: 'critical',
      title: 'Flash Flood Emergency',
      description: 'FLASH FLOOD EMERGENCY for your area. Life-threatening flooding is imminent or occurring. Move to higher ground immediately. Do NOT attempt to cross flooded roads. If trapped, call 911. Turn around, don\'t drown.'
    },
    {
      severity: 'high',
      title: 'Flood Warning',
      description: 'Major flooding expected along rivers and streams in your area. Rising water levels threaten properties near waterways. Prepare for possible evacuation. Move valuables to upper floors and secure important documents.'
    },
    {
      severity: 'medium',
      title: 'Coastal Flood Advisory',
      description: 'Minor coastal flooding expected during high tide cycles. Water may reach 1-2 feet above normal levels in low-lying coastal areas. Relocate vehicles from flood-prone parking areas.'
    },
    {
      severity: 'low',
      title: 'Flood Watch Issued',
      description: 'Heavy rainfall over the next 24-48 hours may lead to flooding in flood-prone areas. Monitor weather conditions and be prepared to move to higher ground if conditions worsen.'
    }
  ],
  earthquake: [
    {
      severity: 'critical',
      title: 'Major Earthquake Detected',
      description: 'A magnitude 6.5 earthquake has been detected near your area. Expect strong aftershocks. If indoors, take cover under sturdy furniture. If outdoors, move away from buildings and power lines. Check for gas leaks and structural damage.'
    },
    {
      severity: 'high',
      title: 'Earthquake Advisory - Aftershocks Expected',
      description: 'Following today\'s earthquake, significant aftershocks are expected over the next 72 hours. Some may reach magnitude 4.0+. Stay alert, secure heavy objects, and have an emergency kit ready.'
    },
    {
      severity: 'medium',
      title: 'Minor Earthquake Activity',
      description: 'A series of minor earthquakes (magnitude 2.5-3.5) have been detected in your region. No significant damage expected, but residents should review earthquake preparedness plans.'
    },
    {
      severity: 'low',
      title: 'Seismic Activity Monitoring',
      description: 'Increased seismic activity has been detected in your region. The USGS is monitoring the situation. No immediate threat, but review your earthquake preparedness plan and ensure emergency supplies are readily available.'
    }
  ],
  emergency: [
    {
      severity: 'critical',
      title: 'Evacuation Order Issued',
      description: 'MANDATORY EVACUATION ORDER for your ZIP code area. Immediate danger threatens life and property. Follow designated evacuation routes. Take essential items only: medications, documents, water, and phone chargers. Shelters are open at designated locations.'
    },
    {
      severity: 'high',
      title: 'Wildfire Approaching - Prepare to Evacuate',
      description: 'A fast-moving wildfire is approaching your area. An evacuation warning has been issued. Pack essential belongings, prepare your vehicle, and be ready to leave on short notice. Follow official evacuation routes when instructed.'
    },
    {
      severity: 'medium',
      title: 'Power Grid Emergency',
      description: 'Rolling blackouts expected in your area over the next 24 hours due to extreme energy demand. Conserve electricity, charge devices, and prepare flashlights and battery-powered radios. Keep refrigerator and freezer doors closed.'
    },
    {
      severity: 'low',
      title: 'Water Main Break - Boil Water Advisory',
      description: 'A water main break has been reported in your area. A precautionary boil water advisory is in effect until further notice. Boil water for at least 1 minute before drinking or cooking. Bottled water is recommended for vulnerable populations.'
    },
    {
      severity: 'high',
      title: 'Hazardous Material Spill',
      description: 'A hazardous material spill has been reported near your area. Shelter in place: close all windows and doors, turn off HVAC systems, and seal gaps with wet towels. Avoid the affected area. Follow instructions from emergency services.'
    }
  ]
};

// ZIP code to location mapping for realistic alerts
const zipLocations = {
  '10001': { city: 'New York', state: 'NY', lat: 40.7484, lng: -73.9967 },
  '90001': { city: 'Los Angeles', state: 'CA', lat: 33.9425, lng: -118.2551 },
  '60601': { city: 'Chicago', state: 'IL', lat: 41.8819, lng: -87.6278 },
  '77001': { city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
  '33101': { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
  '98101': { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
  '80201': { city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
  '30301': { city: 'Atlanta', state: 'GA', lat: 33.749, lng: -84.388 },
  '85001': { city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.074 },
  '02101': { city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
};

// Get a default location based on a ZIP code
function getLocationForZip(zipCode) {
  if (zipLocations[zipCode]) return zipLocations[zipCode];
  
  // Generate pseudo-random but consistent location from ZIP
  const seed = parseInt(zipCode) || 10001;
  const lat = 25 + (seed % 25);
  const lng = -70 - (seed % 50);
  return {
    city: `Area ${zipCode}`,
    state: 'US',
    lat,
    lng
  };
}

// Generate mock alerts for a ZIP code
function generateMockAlerts(zipCode, count = 3) {
  const types = Object.keys(alertTemplates);
  const alerts = [];
  const location = getLocationForZip(zipCode);

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const templates = alertTemplates[type];
    const template = templates[Math.floor(Math.random() * templates.length)];

    alerts.push({
      type,
      severity: template.severity,
      title: template.title,
      description: template.description,
      zipCode,
      location: {
        type: 'Point',
        coordinates: [
          location.lng + (Math.random() - 0.5) * 0.1,
          location.lat + (Math.random() - 0.5) * 0.1
        ],
        city: location.city,
        state: location.state
      },
      source: 'mock',
      active: true,
      expiresAt: new Date(Date.now() + (Math.random() * 48 + 12) * 60 * 60 * 1000)
    });
  }

  return alerts;
}

// Seed initial alerts into database
async function seedAlerts(zipCodes = ['10001', '90001', '60601', '77001', '33101']) {
  try {
    const existingCount = await Alert.countDocuments();
    if (existingCount > 0) {
      console.log(`📋 ${existingCount} alerts already exist in database`);
      return;
    }

    const allAlerts = [];
    for (const zip of zipCodes) {
      const alerts = generateMockAlerts(zip, 4);
      allAlerts.push(...alerts);
    }

    await Alert.insertMany(allAlerts);
    console.log(`🌟 Seeded ${allAlerts.length} mock alerts for ${zipCodes.length} ZIP codes`);
  } catch (error) {
    console.error('Alert seeding error:', error.message);
  }
}

// Generate a random alert for real-time demo
function generateRandomAlert(zipCode) {
  const alerts = generateMockAlerts(zipCode, 1);
  return alerts[0];
}

module.exports = {
  generateMockAlerts,
  seedAlerts,
  generateRandomAlert,
  getLocationForZip,
  alertTemplates
};
