async function getWeatherDetails(lat, lon) {
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&hourly=temperature_2m,relative_humidity_2m,rain`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const temps = data.hourly.temperature_2m;
        const humidity = data.hourly.relative_humidity_2m;
        const rainfall = data.hourly.rain;

        return {
            temperature: temps[0],          // Current hour temp
            humidity: humidity[0],          // Current hour humidity
            rainfall: rainfall[0],          // Current hour rainfall (mm)
            raw: data                       // Full API response (optional)
        };

    } catch (error) {
        console.error("Weather fetch failed:", error);
        return null;
    }
}
