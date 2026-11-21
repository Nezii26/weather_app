
function loadWeatherInfo(location) {

    fetch('https://api.weatherapi.com/v1/current.json?key=1bc1cfb20247456c83d92034261311&q=' + location)
        .then(res => res.json())
        .then(data => {

            console.log(data);

            document.getElementById("lblDisplay").innerHTML = `

                <div>

                    <h2>${data.location.name}</h2>
                    <h4>${data.location.country}</h4>
                    <img src="https:${data.current.condition.icon}" alt="Weather Icon">
                    <h1>${data.current.temp_c}°C</h1>
                    <h3>${data.current.condition.text}</h3>
                    <p>Feels Like: ${data.current.feelslike_c}°C</p>
                    <p>Local Time: ${data.location.localtime}</p>
                    <p>Humidity: ${data.current.humidity}%</p>
                    <p>Wind Speed: ${data.current.wind_kph} km/h</p>
                    <p>Wind Direction: ${data.current.wind_dir}</p>
                    <p>Pressure: ${data.current.pressure_mb} mb</p>
                    <p>Cloud: ${data.current.cloud}%</p>
                    <p>UV Index: ${data.current.uv}</p>

                </div>

            `;

        })
        .catch(error => {
            document.getElementById("lblDisplay").innerHTML =
                "<h3>City not found! Please try again.</h3>";

            console.log(error);
        });

}


function searchWeather() {

    let txtCity = document.getElementById("txtCity").value;

    console.log(txtCity);

    if (txtCity.trim() === "") {
        alert("Please enter a city name!");
        return;
    }

    loadWeatherInfo(txtCity);

}
