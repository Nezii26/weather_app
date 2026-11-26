
// API KEY
const API_KEY = "1bc1cfb20247456c83d92034261311";


// Load Weather Information
function loadWeatherInfo(location) {

    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=6&aqi=no&alerts=no`+location;

    fetch(url)

        .then(res => {

            if (!res.ok) {
                throw new Error("Unable to get weather information");
            }

            return res.json();

        })

        .then(data => {

            if (data.error) {
                throw new Error(data.error.message);
            }

            document.getElementById("msg").innerText = "";

            showCurrent(data);

            showDetails(data);

            showDays(data);

            showDateTime(data);

            showTemperatureChart(data);

        })

        .catch(error => {

            document.getElementById("msg").innerText =
                "City not found! Please try again.";

            console.log(error);

        });
}



// Show Current Weather
function showCurrent(data) {

    const c = data.current;

    document.getElementById("current").innerHTML = `

        <h2>${data.location.name}</h2>

        <small>${data.location.country}</small>

        <img src="https:${c.condition.icon}" alt="Weather Icon">

        <div class="temp">${c.temp_c}°C</div>

        <h3>${c.condition.text}</h3>

        <p>Feels Like: ${c.feelslike_c}°C</p>

    `;

}



// Show Weather Details
function showDetails(data) {

    const c = data.current;

    const items = [

        ["Humidity", c.humidity + "%"],
        ["Cloud", c.cloud + "%"],
        ["Pressure", c.pressure_mb + " mb"],
        ["Wind Speed", c.wind_kph + " km/h " + c.wind_dir],
        ["UV Index", c.uv]

    ];


    document.getElementById("details").innerHTML = items

        .map(i => `

            <div class="bar">
                <span>${i[0]}</span>
                <span>${i[1]}</span>
            </div>

        `)

        .join("");

}



// Show Date and Time
function showDateTime(data) {

    document.getElementById("dateTime").innerHTML = `

        <h3>Local Date & Time</h3>
        <p>${data.location.localtime}</p>
        <p>${data.location.tz_id}</p>

    `;

}




function showDays(data) {

    const forecastDays = data.forecast.forecastday;

    document.getElementById("hours").innerHTML = forecastDays

        .map(day => `

            <div class="hour-card">

                <h3>${day.date}</h3>
                <img src="https:${day.day.condition.icon}"alt="Weather Icon"
                <h3>${day.day.avgtemp_c}°C</h3>
                <p>${day.day.condition.text}</p>
                <p>Max: ${day.day.maxtemp_c}°C</p>
                <p>Min: ${day.day.mintemp_c}°C</p>
                <p>Humidity: ${day.day.avghumidity}%</p>
                <p>Rain: ${day.day.daily_chance_of_rain}%</p>

            </div>

        `)

        .join("");

}




// Gradient Variables
let gradient;
let width, height;
let weatherChart;



// Create Gradient
function getGradient(ctx, chartArea) {

    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;


    if (!gradient || width !== chartWidth || height !== chartHeight) {
        width = chartWidth;
        height = chartHeight;


        gradient = ctx.createLinearGradient(
            0, chartArea.bottom,
            0, chartArea.top
        );


        gradient.addColorStop(0, "#3B82F6");
        gradient.addColorStop(0.5, "#FACC15");
        gradient.addColorStop(1, "#EF4444");

    }


    return gradient;

}



// Next 24 Hours Temperature Chart
function showTemperatureChart(data) {

    const now = data.location.localtime_epoch;


    // Get All Hours
    const allHours = data.forecast.forecastday.flatMap(d => d.hour);


    // Get Next 24 Hours
    const next24 = allHours

        .filter(h => h.time_epoch > now)
        .slice(0, 24);


    // Get Chart Labels
    const labels = next24.map(h => h.time.split(" ")[1]);


    // Get Temperatures
    const temperatures = next24.map(h => h.temp_c);


    // Remove Previous Chart
    if (weatherChart) {
        weatherChart.destroy();
    }


    const ctx = document.getElementById("weatherChart").getContext("2d");
    const tooltipBox = document.getElementById("weatherTooltip");


    const config = {
        type: "line",

        data: {

            labels: labels,
            datasets: [{

                label: "Temperature",
                data: temperatures,
                borderWidth: 3,


                borderColor: function (context) {

                    const chart = context.chart;
                    const area = chart.chartArea;


                    if (!area) {

                        return "#3B82F6";

                    }


                    return getGradient(chart.ctx, area);

                },


                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 8,
                pointBackgroundColor: "#FFFFFF",
                pointBorderColor: "#3B82F6",
                pointBorderWidth: 2

            }]

        },


        options: {

            responsive: true,
            maintainAspectRatio: false,
            interaction: {

                intersect: false,
                mode: "index"

            },


            plugins: {

                legend: {
                    display: false
                },


                tooltip: {
                    enabled: false,
                    external: function (context) {
                        const tooltip = context.tooltip:

                        if (tooltip.opacity === 0) {

                            tooltipBox.style.display = "none";

                            return;

                        }


                        const index = tooltip.dataPoints[0].dataIndex;


                        const hour = next24[index];


                        tooltipBox.innerHTML = `

                            <p>${labels[index]}</p>

                            <img src="https:${hour.condition.icon}">

                            <h3>${hour.temp_c}°C</h3>

                            <p>${hour.condition.text}</p>

                        `;


                        tooltipBox.style.display = "block";


                        // Tooltip Position
                        tooltipBox.style.left = tooltip.caretX + "px";

                        tooltipBox.style.top = tooltip.caretY + "px";

                    }

                }

            },


            scales: {

                x: {

                    ticks: {

                        color: "#FFFFFF",

                        maxTicksLimit: 12

                    },


                    grid: {

                        display: false

                    }

                },


                y: {

                    ticks: {

                        color: "#FFFFFF",

                        callback: function (value) {

                            return value + "°C";

                        }

                    },


                    grid: {

                        color: "rgba(255,255,255,0.1)"

                    }

                }

            }

        }

    };


    // Create New Chart
    weatherChart = new Chart(ctx, config);

}



// Search Weather Function
function searchWeather() {

    const txtCity = document.getElementById("txtCity").value.trim();


    if (txtCity === "") {

        alert("Please enter a city name!");

        return;

    }


    loadWeatherInfo(txtCity);

}



// Search Using Enter Key
document.getElementById("txtCity").addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        searchWeather();

    }

});
