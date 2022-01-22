var citiesListArr = [];
var numOfCities = 6;
var apiKey = "appid=527ffaa472a4d0f2c605827e181f11a6";
var unit= "units=imperial";
var dailyWeatherStart = "https://api.openweathermap.org/data/2.5/weather?q=";
var UVIIndexApi =  "https://api.openweathermap.org/data/2.5/uvi?";
var forecastWeather = "https://api.openweathermap.org/data/2.5/onecall?";
var searchCityForm = $('#searchCitForm');
var searchedCities = $("#searchCityLi");

var getWeather = function (searchCityName) {
    var apiUrl = dailyWeatherStart + searchCityName + "&" + apiKey + "&" + unit;
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            return response.json().then(function (response) {
                $("#cityName").html(response.name);
                var unixTime = response.dt;
                var date = moment.unix(unixTime).format("MM/DD/YY");
                $("#currentdate").html(date);

                var weatherIcon = "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";
                $("#weatherIconToday").attr("src", weatherIcon);
                $("#tempToday").html(response.main.temp + " \u00B0F");
                $("#humidityToday").html(response.main.humidity + " %");
                $("#windSpeedToday").html(response.wind.speed + " MPH");

                var lat = response.coord.lat;
                var lon = response.coord.lon;
                getUVIndex(lat, lon);
                getForecast(lat, lon);
            });
        } else {
            alert("Not a valid city name.");
        }
    });
};

var getUVIndex = function (lat, lon) {
    var apiUrl = UVIIndexApi + apiKey + "&lat=" + lat + "&lon=" + lon + "&" + unit;
    fetch(apiUrl).then(function (response) {
        return response.json();
    })

    .then(function (response) {
        $("#UVIndexToday").removeClass();
        $("#UVIndexToday").html(response.value);
        if (response.value < 3) {
            $("#UVIndexToday").addClass("p-1 rounded success text-white");
        } else if (response.value < 8) {
            $("#UVIndexToday").addClass("p-1 rounded bg-warning text-white");
        } else {
            $("#UVIndexToday").addClass("p-1 bg-danger text-white");
        }
    });
};

var getForecast = function (lat, lon) {
    var apiUrl = forecastWeather + "lat=" + lat + "&lon=" + lon + "&exclude=current,minutely,hourly" + "&" + apiKey + "&" + unit;
    fetch(apiUrl).then(function (response) {
        return response.json();
    }) 
    .then(function (response) {
        for(var i = 1; i < 6; i++) {
            var unixTime = response.daily[i].dt;
            var date = moment.unix(unixTime).format("MM/DD/YY");
            $("#Date" + i).html(date);

            var weatherIconUrl = "http://openweathermap.org/img/wn/" + response.daily[i].weather[0].icon + "@2x.png";
            $("#weatherIconDay" + i).attr("src", weatherIconUrl);

            var temp = response.daily[i].temp.day + " /u00B0F";
            $("#tempDay" + i).html(temp);

            var humidity = response.daily[i].humidity;
            $("#humidityDay" + i).html(humidity + " %");

            var wind = response.daily[i].windspeed;
            $("#windSpeedToday" + 1).html(wind + " MPH");
        }
    });
};

var createBtn = function (btnText) {
    var btn = $("<button>").text(btnText).addClass("list-group-item list-group-item-action").attr("type", "submit");
    return btn;
};

var loadSavedCity = function () {
    citiesListArr = JSON.parse(localStorage.getItem(weatherInfo));
    if (citiesListArr == null) {
        citiesListArr = [];
    }
    for (var i = 0; i < citiesListArr.length; i++) {
        var cityNameBtn = createBtn(citiesListArr[i]);
        searchedCities.append(cityNameBtn);
    }
};

var saveCityName = function (searchCityName) {
    var newcity = 0;
    citiesListArr = JSON.parse(localStorage.getItem("weatherInfo"));
    if(citiesListArr == null) {
        citiesListArr = [];
        citiesListArr.unshift(searchCityName);
    } else {
        for(var i = 0; i < citiesListArr.length; i++) {
            if(searchCityName.toLowerCase() == citiesListArr[i].toLowerCase()) {
                return newcity;
            }
        }
        if(citiesListArr.length < numOfCities) {
            citiesListArr.unshift(searchCityName);
        } else {
            citiesListArr.pop();
            citiesListArr.unshift(searchCityName);
        }
    }
    localStorage.setItem("weatherInfo", JSON.stringify(citiesListArr));
    newcity = 1;
    return newcity;
};

var createCityNameBtn = function (searchCityName) {
    var saveCities = JSON.parse(localStorage.getItem("weatherInfo"));

    if (saveCities.length == 1) {
        var cityNameBtn = createBtn(searchCityName);
        searchedCities.prepend(cityNameBtn);
    } else {
        for (var i = 1; i < saveCities.length; i++) {
            if(searchCityName.toLowerCase() == saveCities[i].toLowerCase()) {
                return;
            }
        }
        if (searchedCities[0].childElementCount < numOfCities) {
            var cityNameBtn = createBtn(searchCityName);
        } else {
            searchedCities[0].removeChild(searchedCities[0].lastChild);
            var cityNameBtn = createBtn(searchCityName);
        }
        searchedCities.prepend(cityNameBtn);
        $(":button.list-group-item-action").on("click", function () {
            BtnClickHandler(event);
        });
    }
};

loadSavedCity();

var formSubmitHandler = function (event) {
    event.preventDefault();

    var searchCityName = $("#searchCity").val().trim();
    var newcity = saveCityName(searchCityName);
    getCityWeather(searchCityName);
    if (newcity == 1) {
        createCityNameBtn(searchCityName);
    }
};

var BtnClickHandler = function (event) {
    event.preventDefault();

    var searchCityName = event.target.textContent.trim();
    getCityWeather(searchCityName);
};

$("searchCityForm").on("submit", function () {
    formSubmitHandler(event);
});
$(":button.list-group-item-action").on("click", function () {
    BtnClickHandler(event);
});