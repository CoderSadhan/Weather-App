const API_KEY = '04f20ab352ef6948c5dfd715155d244c'; // Replace with your OpenWeatherMap API Key
const GEO_API_KEY = 'e86b79b30f244d01836307e48c4526d1'; // Replace with a Geocoding API Key

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const suggestions = document.getElementById('suggestions');

// Fetch weather data
async function fetchWeather(cityOrCoords) {
  const url =
    typeof cityOrCoords === 'string'
      ? `https://api.openweathermap.org/data/2.5/weather?q=${cityOrCoords}&units=metric&appid=${API_KEY}`
      : `https://api.openweathermap.org/data/2.5/weather?lat=${cityOrCoords.lat}&lon=${cityOrCoords.lon}&units=metric&appid=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.cod === 200) {
      displayWeather(data);
    } else {
      alert(data.message);
    }
  } catch (error) {
    
  }
}

// Display weather data
function displayWeather(data) {
  document.getElementById('city-name').textContent = data.name;
  document.getElementById('temp').textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById('description').textContent =
    data.weather[0].description.charAt(0).toUpperCase() +
    data.weather[0].description.slice(1);
  document.getElementById('humidity').textContent = data.main.humidity;
  document.getElementById('wind-speed').textContent = Math.round(data.wind.speed * 3.6);
  document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

  const currentDate = new Date().toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  document.getElementById('date').textContent = currentDate;
}

// Geolocation fetch
function getLocation() {
  if (navigator.geolocation) {
    // Try to fetch location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Fetch weather based on the user's location
        fetchWeather({ lat: latitude, lon: longitude });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          alert('Location access denied. You can search manually.');
        } else {
          alert('Error fetching location.');
        }
      }
    );
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}

// Fetch city suggestions
async function fetchCitySuggestions(query) {
  if (!query) {
    suggestions.innerHTML = '';
    return;
  }
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${GEO_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  const cities = data.features.map((feature) => feature.properties.city);
  displaySuggestions(cities);
}

// Display city suggestions
function displaySuggestions(cities) {
  suggestions.innerHTML = cities
    .map((city) => `<li>${city}</li>`)
    .join('');
  suggestions.querySelectorAll('li').forEach((li) => {
    li.addEventListener('click', () => {
      cityInput.value = li.textContent;
      suggestions.innerHTML = '';
      fetchWeather(cityInput.value);
    });
  });
}

// Event listeners
searchBtn.addEventListener('click', () => {
  fetchWeather(cityInput.value);
});

cityInput.addEventListener('input', () => {
  fetchCitySuggestions(cityInput.value);
});

// Initialize app with default location
// Check if it's the first visit
if (!localStorage.getItem('hasVisitedBefore')) {
  localStorage.setItem('hasVisitedBefore', 'true');
  // Try fetching the location immediately on the first visit
  getLocation(); // Try to get the user location on the first visit
} else {
  // After the first visit, show weather for Kolkata by default
  fetchWeather("Kolkata");
}
