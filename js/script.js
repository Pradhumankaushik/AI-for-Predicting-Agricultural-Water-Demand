// ==========================================
// 1. Get user location automatically
// ==========================================
window.onload = () => {
    getUserLocationAndWeather();
};

// get user's latitude & longitude
function getUserLocationAndWeather() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            // fetch weather automatically
            await getWeatherDetails(lat, lon);
        },
        () => {
            alert("Location access denied. Please enable location for auto weather.");
        }
    );
}

// ==========================================
// 2. Fetch weather from Open-Meteo
// ==========================================
async function getWeatherDetails(lat, lon) {
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&hourly=temperature_2m,relative_humidity_2m,rain`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const temperature = data.hourly.temperature_2m[0];
        const humidity = data.hourly.relative_humidity_2m[0];
        const rainfall = data.hourly.rain[0];

        // update UI
        document.getElementById("temperature").value = temperature;
        document.getElementById("humidity").value = humidity;
        document.getElementById("rainfall").value = rainfall;

        return { temperature, humidity, rainfall };

    } catch (error) {
        console.error("Weather fetch failed:", error);
        return null;
    }
}

// ==========================================
// 3. Call Gemini API for water demand
// ==========================================
async function getWaterPrediction(temp, humidity, rain, crop, area) {

    const apiKey = "YOUR_API_KEY";

    const prompt = `
You are an agricultural irrigation expert.
Using the data below, calculate:

1. Water Requirement Per Day (mm/day)
2. Total Water Needed (litres/day)

Crop: ${crop}
Land Area: ${area} hectares
Temperature: ${temp}°C
Humidity: ${humidity}%
Rainfall: ${rain}mm
    `;

    try {
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" + apiKey,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.json();

        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response.";

    } catch (err) {
        console.error("Gemini API Error:", err);
        return "Error: Could not get prediction.";
    }
}

// ==========================================
// 4. Handle Calculate Button Click
// ==========================================
async function calculateWater() {
    const crop = document.getElementById("crop").value;
    const area = document.getElementById("area").value;

    const temp = document.getElementById("temperature").value;
    const humidity = document.getElementById("humidity").value;
    const rainfall = document.getElementById("rainfall").value;

    const result = await getWaterPrediction(temp, humidity, rainfall, crop, area);

    document.getElementById("result").style.display = "block";
    document.getElementById("result").innerText = result;
}

