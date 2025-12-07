// =====================================================
// 1. Auto-run on page load: Get location + weather
// =====================================================
window.onload = () => {
    console.log("Page loaded");
    getUserLocationAndWeather();
};

// =====================================================
// 2. Get user's latitude & longitude
// =====================================================
function getUserLocationAndWeather() {
    if (!navigator.geolocation) {
        alert("Your browser does not support location access.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            console.log("User Location:", lat, lon);

            // Fetch weather automatically
            await updateWeather(lat, lon);
        },
        (error) => {
            console.log("Location Error:", error);
            alert("Please allow location access to fetch weather.");
        }
    );
}

// =====================================================
// 3. Fetch temperature, humidity, rainfall from Open-Meteo
// =====================================================
async function updateWeather(lat, lon) {
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&hourly=temperature_2m,relative_humidity_2m,rain`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        const temp = data.hourly.temperature_2m[0];
        const humidity = data.hourly.relative_humidity_2m[0];
        const rain = data.hourly.rain[0];

        console.log("Weather Data:", temp, humidity, rain);

        // Update your HTML inputs
        document.getElementById("temp").value = temp;
        document.getElementById("humidity").value = humidity;
        document.getElementById("rain").value = rain;

    } catch (err) {
        console.error("Weather API Error:", err);
    }
}

// =====================================================
// 4. Call Gemini AI for water requirement prediction
// =====================================================
async function callGemini(temp, humidity, rainfall, crop, area, unit) {

    const apiKey = "AIzaSyB8WJpCVXClm9kSxRBZ7UdpCp9vHJS8ISY";

    const prompt = `
You are an agricultural irrigation expert.

Given:
Crop: ${crop}
Land Area: ${area} ${unit}
Temperature: ${temp} °C
Humidity: ${humidity} %
Rainfall: ${rainfall} mm

Return ONLY in this format:

Water Requirement Per Day: X mm/day
Total Water Needed: Y litres
`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }]
    };

    try {
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" + apiKey,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            }
        );

        const data = await response.json();
        console.log("Gemini Output:", data);

        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response.";

    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Error contacting Gemini API.";
    }
}

// =====================================================
// 5. Predict Button Handler
// =====================================================
async function predict() {
    console.log("Predict button clicked");

    const crop = document.getElementById("crop").value;
    const area = document.getElementById("area").value;
    const unit = document.getElementById("areaUnit").value;

    const temp = document.getElementById("temp").value;
    const humidity = document.getElementById("humidity").value;
    const rainfall = document.getElementById("rain").value;

    // Call Gemini
    const resultText = await callGemini(temp, humidity, rainfall, crop, area, unit);

    // Show result
    document.getElementById("resultBox").style.display = "block";

    // Extract results
    const lines = resultText.split("\n");
    document.getElementById("output").innerText = lines[0]; // Water Requirement Per Day
    document.getElementById("totalOutput").innerText = lines[1]; // Total Water Needed
}
