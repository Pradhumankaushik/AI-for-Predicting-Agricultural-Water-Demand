async function getWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Extract hourly temperature array
        const temps = data.hourly.temperature_2m;
        const times = data.hourly.time;

        // Current temperature = first entry
        const currentTemp = temps[0];

        return {
            temperature: currentTemp,
            allTemperatures: temps,
            times: times,
            raw: data
        };

    } catch (error) {
        console.error("Weather fetch failed:", error);
        return null;
    }
}
