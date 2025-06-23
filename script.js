const searchBtn = document.getElementById('search-btn');
const currentLocationBtn = document.getElementById('current-location-btn');
const cityInput = document.getElementById('city-input');
const locationDisplay = document.getElementById('location');
const temperatureDisplay = document.getElementById('temperature');
const descriptionDisplay = document.getElementById('description');
const humidityDisplay = document.getElementById('humidity');
const windSpeedDisplay = document.getElementById('wind-speed');
const minMaxTempDisplay = document.getElementById('min-max-temp'); // New element
const weatherIcon = document.getElementById('weather-icon');
const errorMessage = document.getElementById('error-message');

// Function to fetch weather data
async function fetchWeatherData(cityOrCoords) {
    let geoApiUrl;
    let weatherApiUrl;
    let cityName = ''; // To store the city name for display

    clearWeatherDisplay(); // Clear previous data
    errorMessage.textContent = 'Loading...'; // Show loading message

    try {
        if (typeof cityOrCoords === 'string') { // If it's a city name, use Nominatim for geocoding
            cityName = cityOrCoords;
            // Nominatim (OpenStreetMap) for geocoding. Check their usage policy for higher volumes.
            geoApiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityOrCoords)}&format=json&limit=1`;
            const geoResponse = await fetch(geoApiUrl);
            if (!geoResponse.ok) {
                throw new Error(`HTTP error! status: ${geoResponse.status}`);
            }
            const geoData = await geoResponse.json();

            if (!geoData || geoData.length === 0) {
                errorMessage.textContent = 'City not found. Please check the spelling or try another location.';
                return;
            }
            const { lat, lon, display_name } = geoData[0];
            // Nominatim's display_name can be very long; simplify for location display
            const parts = display_name.split(', ');
            cityName = parts[0] + (parts[parts.length - 1] ? `, ${parts[parts.length - 1]}` : ''); // e.g., "Chennai, India"

            // Open-Meteo API URL
            weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius&windspeed_unit=ms&timezone=auto&daily=weathercode,temperature_2m_max,temperature_2m_min`;

        } else { // If it's coordinates (from Geolocation API)
            const { latitude, longitude } = cityOrCoords;
            // Use Nominatim's reverse geocoding to get a city name from coordinates
            geoApiUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
            const geoResponse = await fetch(geoApiUrl);
            if (!geoResponse.ok) {
                throw new Error(`HTTP error! status: ${geoResponse.status}`);
            }
            const geoData = await geoResponse.json();
            if (geoData && geoData.address) {
                cityName = geoData.address.city || geoData.address.town || geoData.address.village || 'Unknown Location';
                if (geoData.address.country) {
                    cityName += `, ${geoData.address.country}`;
                }
            } else {
                cityName = 'Current Location'; // Fallback
            }

            // Open-Meteo API URL
            weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius&windspeed_unit=ms&timezone=auto&daily=weathercode,temperature_2m_max,temperature_2m_min`;
        }

        const weatherResponse = await fetch(weatherApiUrl);
        if (!weatherResponse.ok) {
            throw new Error(`HTTP error! status: ${weatherResponse.status}`);
        }
        const weatherData = await weatherResponse.json();

        if (weatherData && weatherData.current_weather) {
            displayWeather(weatherData, cityName);
            errorMessage.textContent = ''; // Clear error message on success
        } else {
            errorMessage.textContent = weatherData.reason || 'Could not fetch weather data for this location.';
            clearWeatherDisplay();
        }

    } catch (error) {
        errorMessage.textContent = 'Failed to fetch weather data. Please try again later.';
        console.error('Error fetching weather data:', error);
        clearWeatherDisplay();
    }
}

// Function to display weather data from Open-Meteo
function displayWeather(data, cityName) {
    const { current_weather, daily } = data;

    locationDisplay.textContent = cityName;
    temperatureDisplay.textContent = `${Math.round(current_weather.temperature)}°C`;
    windSpeedDisplay.textContent = `Wind Speed: ${current_weather.windspeed} m/s`;

    // Humidity is not directly available in current_weather for Open-Meteo's free tier.
    // We'll indicate it's not available or remove it if you prefer.
    humidityDisplay.textContent = `Humidity: N/A`;

    // Daily min/max temperature from the 'daily' object for today (index 0)
    if (daily && daily.temperature_2m_max && daily.temperature_2m_min) {
        const todayMax = Math.round(daily.temperature_2m_max[0]);
        const todayMin = Math.round(daily.temperature_2m_min[0]);
        minMaxTempDisplay.textContent = `Min/Max: ${todayMin}°C / ${todayMax}°C`;
    } else {
        minMaxTempDisplay.textContent = ''; // Clear if not available
    }


    const weatherCode = current_weather.weathercode;
    const description = getWeatherDescription(weatherCode);
    descriptionDisplay.textContent = description;

    // Set weather icon
    weatherIcon.src = getOpenMeteoWeatherIcon(weatherCode);
    weatherIcon.alt = description;
    weatherIcon.classList.remove('hidden'); // Show the icon
}

// Function to clear weather display
function clearWeatherDisplay() {
    locationDisplay.textContent = '';
    temperatureDisplay.textContent = '';
    descriptionDisplay.textContent = '';
    humidityDisplay.textContent = '';
    windSpeedDisplay.textContent = '';
    minMaxTempDisplay.textContent = '';
    weatherIcon.src = '';
    weatherIcon.alt = '';
    weatherIcon.classList.add('hidden'); // Hide the icon
    errorMessage.textContent = '';
}

// Helper function to map Open-Meteo weather codes to descriptions
// (Based on WMO Weather interpretation codes (WWMO) - see Open-Meteo docs)
function getWeatherDescription(code) {
    switch (code) {
        case 0: return 'Clear sky';
        case 1: return 'Mainly clear';
        case 2: return 'Partly cloudy';
        case 3: return 'Overcast';
        case 45: return 'Fog';
        case 48: return 'Depositing rime fog';
        case 51: return 'Drizzle: Light';
        case 53: return 'Drizzle: Moderate';
        case 55: return 'Drizzle: Dense intensity';
        case 56: return 'Freezing Drizzle: Light';
        case 57: return 'Freezing Drizzle: Dense intensity';
        case 61: return 'Rain: Slight';
        case 63: return 'Rain: Moderate';
        case 65: return 'Rain: Heavy intensity';
        case 66: return 'Freezing Rain: Light';
        case 67: return 'Freezing Rain: Heavy intensity';
        case 71: return 'Snow fall: Slight';
        case 73: return 'Snow fall: Moderate';
        case 75: return 'Snow fall: Heavy intensity';
        case 77: return 'Snow grains';
        case 80: return
