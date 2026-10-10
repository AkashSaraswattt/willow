const axios = require('axios');

async function getWeather(location = null) {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('Weather API key not configured');
  }

  const city = location || process.env.DEFAULT_WEATHER_LOCATION || 'Mumbai,IN';
  
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
      { timeout: 3000 }
    );
    
    const { weather, main, name } = response.data;
    return `${weather[0].main}, ${Math.round(main.temp)}°C in ${name}`;
  } catch (error) {
    throw new Error(`Weather fetch failed: ${error.message}`);
  }
}

module.exports = { getWeather };