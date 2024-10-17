let backgroundMap = new Image();
backgroundMap.src = 'usa_map.jpg'; 
let cityInput;
let weatherSprite;
let canvas, context;


const mapGeoLeft = -125.0;  
const mapGeoRight = -67.0;  
const mapGeoTop = 50.0;     
const mapGeoBottom = 24.0;  

class WeatherSprite {
  constructor(x, y, city, temperature) {
    this.x = x;
    this.y = y;
    this.city = city;
    this.temperature = temperature;
  }

  display() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.drawImage(backgroundMap, 0, 0, canvas.width, canvas.height);

    context.fillStyle = "#FF0000";
    context.font = "17px Comic Sans MS";
    context.textAlign = "center";

    context.fillText(this.city, this.x, this.y - 30);
    
    context.font = "28px Comic Sans MS";
    context.fillText(this.temperature + "°C", this.x, this.y);
  }

  animate() {
    
    gsap.fromTo(this, { y: this.y - 20 }, { y: this.y + 20, duration: 2, yoyo: true, repeat: -1 });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById('weatherCanvas');
  context = canvas.getContext('2d');

  // Input for the user-defined city
  cityInput = document.getElementById('city-input');
  cityInput.addEventListener('change', () => {
    const cityName = cityInput.value;
    loadWeather(cityName);
  });
});

function loadWeather(cityName) {
  const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        const lat = data.results[0].latitude;
        const lon = data.results[0].longitude;
        const city = data.results[0].name;

        
        fetchWeather(lat, lon, city);
      } else {
        console.error('City not found');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#ff1e00";
        context.font = "25px Comic Sans MS";
        context.fillText("City not found.", canvas.width / 2, canvas.height / 2);
      }
    })
    .catch(error => {
      console.error('Error fetching city coordinates:', error);
    });
}


function fetchWeather(lat, lon, city) {
  const weatherUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;

  fetch(weatherUrl)
    .then(response => response.json())
    .then(data => {
      const temperature = data.properties.timeseries[0].data.instant.details.air_temperature;

      
      let xgeo = mapCoordinates(lon, mapGeoLeft, mapGeoRight, 0, canvas.width);
      let ygeo = mapCoordinates(lat, mapGeoBottom, mapGeoTop, canvas.height, 0);

      
      weatherSprite = new WeatherSprite(xgeo, ygeo, city, temperature);
      weatherSprite.display();
      weatherSprite.animate();
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#FF0000";
      context.font = "20px Comic Sans MS";
      context.fillText("Failed to load weather data.", canvas.width / 2, canvas.height / 2);
    });
}


function mapCoordinates(value, minGeo, maxGeo, minScreen, maxScreen) {
  return ((value - minGeo) / (maxGeo - minGeo)) * (maxScreen - minScreen) + minScreen;
}
