const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key from OpenWeatherMap or similar
const searchBtn = document.getElementById('search-btn');
const currentLocationBtn = document.getElementById('current-location-btn');
const cityInput = document.getElementById('city-input');
const locationDisplay = document.getElementById('location');
const temperatureDisplay = document.getElementById('temperature');
const descriptionDisplay = document.getElementById('description');
const humidityDisplay = document.getElementById('humidity');
const windSpeedDisplay = document.getElementById('wind-speed');
const weatherIcon = document.getElementById('weather-icon');
const errorMessage = document.getElementById('error-message');

// Function to fetch weather data
async function fetchWeatherData(cityOrCoords) {
    let apiUrl;
    if (typeof cityOrCoords === 'string') { // If it's a city name
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=<span class="math-inline">\{cityOrCoords\}&appid\=</span>{apiKey}&units=metric`;
    } else { // If it's coordinates (latitude and longitude)
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=<span class="math-inline">\{cityOrCoords\.latitude\}&lon\=</span>{cityOrCoords.longitude}&appid=${apiKey}&units=metric`;
    }

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok) {
            displayWeather(data);
            errorMessage.textContent = ''; // Clear any previous error
        } else {
            errorMessage.textContent = data.message || 'City not found or an error occurred.';
            clearWeatherDisplay();
        }
    } catch (error) {
        errorMessage.textContent = 'Failed to fetch weather data. Please try again later.';
        console.error('Error fetching weather data:', error);
        clearWeatherDisplay();
    }
}

// Function to display weather data
function displayWeather(data) {
    const { name, main, weather, wind, sys } = data;

    locationDisplay.textContent = `${name}, ${sys.country}`;
    temperatureDisplay.textContent = `${Math.round(main.temp)}°C`;
    descriptionDisplay.textContent = weather[0].description;
    humidityDisplay.textContent = `Humidity: ${main.humidity}%`;
    windSpeedDisplay.textContent = `Wind Speed: ${wind.speed} m/s`;

    // Set weather icon (OpenWeatherMap uses specific icon codes)
    const iconCode = weather[0].icon;
    weatherIcon.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`; // Check API documentation for icon URL
    weatherIcon.alt = weather[0].description;
}

// Function to clear weather display
function clearWeatherDisplay() {
    locationDisplay.textContent = '';
    temperatureDisplay.textContent = '';
    descriptionDisplay.textContent = '';
    humidityDisplay.textContent = '';
    windSpeedDisplay.textContent = '';
    weatherIcon.src = '';
    weatherIcon.alt = '';
}

// Event listener for search button
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    } else {
        errorMessage.textContent = 'Please enter a city name.';
        clearWeatherDisplay();
    }
});

// Event listener for current location button
currentLocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherData({ latitude, longitude });
            },
            (error) => {
                errorMessage.textContent = 'Unable to retrieve your location. Please allow location access or enter a city manually.';
                console.error('Geolocation error:', error);
                clearWeatherDisplay();
            }
        );
    } else {
        errorMessage.textContent = 'Geolocation is not supported by your browser.';
        clearWeatherDisplay();
    }
});

// Optional: Fetch weather for a default location when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData('Chennai'); // Default to Chennai, India
});
