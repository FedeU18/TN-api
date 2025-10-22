// import fetch from 'node-fetch';

export async function getWeatherFromAPI({ q }) {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) throw new Error("No WEATHER_API_KEY set");
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${q}&hours=2&lang=es`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("No se pudo obtener el clima");
  const data = await response.json();
  return {
    actual: {
      temp: data.current.temp_c,
      condition: data.current.condition.text,
      icon: data.current.condition.icon,
    },
    en1hora: {
      temp: data.forecast.forecastday[0].hour[1].temp_c,
      condition: data.forecast.forecastday[0].hour[1].condition.text,
      icon: data.forecast.forecastday[0].hour[1].condition.icon,
    },
  };
}
