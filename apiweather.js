import * as dom from "./dom.js";
getDataWeather();

async function getLocation() {
  let res = await fetch(
    "https://api.openweathermap.org/geo/1.0/direct?q=Hanoi&limit=1&appid=75949933bea2f141091be31cbbb60d9f",
  );
  let data = await res.json();
  return data;
}

async function getDataWeather() {
  let Location = await getLocation();
  if (Location.length === 0 || !Location) return;
  let resWeatherCurrent = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${Location[0].lat}&lon=${Location[0].lon}&units=metric&appid=75949933bea2f141091be31cbbb60d9f`,
  );
  let dataWeatherCurrent = await resWeatherCurrent.json();

  let resWeatherWeek = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${Location[0].lat}&lon=${Location[0].lon}&units=metric&appid=75949933bea2f141091be31cbbb60d9f`,
  );
  let dataWeatherWeek = await resWeatherWeek.json();

  return { dataWeatherCurrent, dataWeatherWeek };
}

async function getMinMaxToday() {
  let data = await getDataWeather();
  let timezone = data.dataWeatherCurrent.timezone;
  let Today = new Date((data.dataWeatherCurrent.dt + timezone) * 1000)
    .toISOString()
    .split("T")[0];
  let Week = data.dataWeatherWeek;
  let DayOnWeek = Week.list.filter((d) => {
    let day = new Date((d.dt + timezone) * 1000).toISOString().split("T")[0];
    if (Today === day) {
      return true;
    }
  });
  let MinTemp = DayOnWeek[0].main.temp;
  let MaxTemp = DayOnWeek[0].main.temp;
  DayOnWeek.forEach((d) => {
    if (d.main.temp >= MaxTemp) {
      MaxTemp = d.main.temp;
    }
    if (d.main.temp <= MinTemp) {
      MinTemp = d.main.temp;
    }
  });
  return { MaxTemp, MinTemp };
}

function getWindDirection(deg) {
  if (deg >= 337.5 || deg < 22.5) return "N";
  if (deg < 67.5) return "NE";
  if (deg < 112.5) return "E";
  if (deg < 157.5) return "SE";
  if (deg < 202.5) return "S";
  if (deg < 247.5) return "SW";
  if (deg < 292.5) return "W";
  return "NW";
}

async function getToday() {
  let data = await getDataWeather();
  let timezone = data.dataWeatherCurrent.timezone;
  let Today = new Date((data.dataWeatherCurrent.dt + timezone) * 1000);
  let day = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  // muốn lấy theo local thì bỏ UTC còn lấy theo time UTC của api thì thêm UTC vào trc
  return {
    day: day[Today.getUTCDay()],
    date: Today.getUTCDate(),
    month: month[Today.getUTCMonth()],
  };
}

const weatherIcons = {
  "01d": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun-icon lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  "01n": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon-icon lucide-moon"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/></svg>`,

  "02d": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-sun-icon lucide-cloud-sun"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>`,
  "02n": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-moon-icon lucide-cloud-moon"><path d="M13 16a3 3 0 0 1 0 6H7a5 5 0 1 1 4.9-6z"/><path d="M18.376 14.512a6 6 0 0 0 3.461-4.127c.148-.625-.659-.97-1.248-.714a4 4 0 0 1-5.259-5.26c.255-.589-.09-1.395-.716-1.248a6 6 0 0 0-4.594 5.36"/></svg>`,

  "03d": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-icon lucide-cloud"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
  "03n": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-icon lucide-cloud"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,

  "04d": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloudy-icon lucide-cloudy"><path d="M17.5 12a1 1 0 1 1 0 9H9.006a7 7 0 1 1 6.702-9z"/><path d="M21.832 9A3 3 0 0 0 19 7h-2.207a5.5 5.5 0 0 0-10.72.61"/></svg>`,
  "04n": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloudy-icon lucide-cloudy"><path d="M17.5 12a1 1 0 1 1 0 9H9.006a7 7 0 1 1 6.702-9z"/><path d="M21.832 9A3 3 0 0 0 19 7h-2.207a5.5 5.5 0 0 0-10.72.61"/></svg>`,

  "09d": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-sun-rain-icon lucide-cloud-sun-rain"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24"/><path d="M11 20v2"/><path d="M7 19v2"/></svg>`,
  "09n": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-moon-rain-icon lucide-cloud-moon-rain"><path d="M11 20v2"/><path d="M18.376 14.512a6 6 0 0 0 3.461-4.127c.148-.625-.659-.97-1.248-.714a4 4 0 0 1-5.259-5.26c.255-.589-.09-1.395-.716-1.248a6 6 0 0 0-4.594 5.36"/><path d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24"/><path d="M7 19v2"/></svg>`,

  "10d": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-rain-icon lucide-cloud-rain"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  "10n": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-rain-icon lucide-cloud-rain"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,

  "11d": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-lightning-icon lucide-cloud-lightning"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>`,
  "11n": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-lightning-icon lucide-cloud-lightning"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>`,

  "13d": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-snow-icon lucide-cloud-snow"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/></svg>`,
  "13n": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-snow-icon lucide-cloud-snow"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/></svg>`,

  "50d": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-fog-icon lucide-cloud-fog"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 17H7"/><path d="M17 21H9"/></svg>`,
  "50n": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-fog-icon lucide-cloud-fog"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 17H7"/><path d="M17 21H9"/></svg>`,
};

async function getDayOnWeek() {
  let data = await getDataWeather();
  let dataWeek = data.dataWeatherWeek;
  let dataCurrent = data.dataWeatherCurrent;
  let timezone = dataCurrent.timezone;
  let Today = new Date((dataCurrent.dt + timezone) * 1000)
    .toISOString()
    .split("T")[0];
  let Days = dataWeek.list.filter((d) => {
    let day = new Date((d.dt + timezone) * 1000).toISOString().split("T")[0];
    if (Today == day) {
      return true;
    }
  });

  return Days;
}

async function DAY_FORECAST_DATA() {
  let data = await getDataWeather();
  let dataCurrent = data.dataWeatherCurrent;
  let dataWeek = data.dataWeatherWeek;
  let timezone = dataCurrent.timezone;
  let Today = new Date((dataCurrent.dt + timezone) * 1000)
    .toISOString()
    .split("T")[0];
  let Days = dataWeek.list.filter((d) => {
    let day = new Date((d.dt + timezone) * 1000).toISOString().split("T")[0];
    if (Today !== day) {
      return true;
    }
  });
  let nextDay = new Date((Days[0].dt + timezone) * 1000);
  let Data_day_forecast = [];
  let MinTempDay = null;
  let MaxTempDay = null;
  let icon = "";
  let pop = null;
  Days.forEach((d, i = 0) => {
    let day = new Date((d.dt + timezone) * 1000);
    if (day.getUTCDay() == nextDay.getUTCDay()) {
      if (
        MinTempDay == null ||
        MaxTempDay == null ||
        icon == null ||
        pop == null
      ) {
        MinTempDay = d.main.temp;
        MaxTempDay = d.main.temp;
        icon = d.weather[0].icon;
        pop = d.pop;
      }
      if (d.main.temp > MaxTempDay) {
        MaxTempDay = d.main.temp;
      }
      if (d.main.temp < MinTempDay) {
        MinTempDay = d.main.temp;
      }
      if (d.pop > pop) {
        pop = d.pop;
        icon = d.weather[0].icon;
      }
      i++;
    } else {
      Data_day_forecast.push({
        day: nextDay.getUTCDay(),
        MinTempDay: MinTempDay,
        MaxTempDay: MaxTempDay,
        pop: pop,
        icon: icon,
      });
      MinTempDay = null;
      MaxTempDay = null;
      icon = "";
      pop = null;
      nextDay = new Date((Days[i].dt + timezone) * 1000);
    }
  });
  let MinTempWeek = dataCurrent.main.temp;
  let MaxTempWeek = dataCurrent.main.temp;
  dataWeek.list.forEach((d) => {
    if (d.main.temp > MaxTempWeek) {
      MaxTempWeek = d.main.temp;
    }
    if (d.main.temp < MinTempWeek) {
      MinTempWeek = d.main.temp;
    }
  });
  let MinMaxTempWeek = {
    MaxTempWeek: MaxTempWeek,
    MinTempWeek: MinTempWeek,
  };
  return { Data_day_forecast, MinMaxTempWeek };
}

async function display() {
  let data = await getDataWeather();
  let dataCurrent = data.dataWeatherCurrent;
  let dataWeek = data.dataWeatherWeek;
  let Today = await getToday();
  let timezone = dataCurrent.timezone;
  dom.UIWeather.Day.innerHTML = `${Today.day}, ${Today.month} ${Today.date}`;
  dom.UIWeather.Temp.innerHTML = `${Math.round(dataCurrent.main.temp)}`;
  if (dataCurrent.weather.length === 0 || !dataCurrent.weather) return;
  dom.UIWeather.Weather__description.innerHTML = `${dataCurrent.weather[0].description}`;

  let MinMaxToday = await getMinMaxToday();

  if (!dom.UIWeather.Hight__temp.innerHTML) {
    dom.UIWeather.Hight__temp.innerHTML = `${Math.round(dataCurrent.main.temp)}`;
    dom.UIWeather.Low__temp.innerHTML = `${Math.round(dataCurrent.main.temp)}`;
  }
  if (Number(dom.UIWeather.Hight__temp.innerHTML) < MinMaxToday.MaxTemp) {
    dom.UIWeather.Hight__temp.innerHTML = `${Math.round(MinMaxToday.MaxTemp)}`;
  }
  if (Number(dom.UIWeather.Low__temp.innerHTML) > MinMaxToday.MinTemp) {
    dom.UIWeather.Low__temp.innerHTML = `${Math.round(MinMaxToday.MinTemp)}`;
  }
  dom.UIWeather.Feels__like.innerHTML = `${Math.round(dataCurrent.main.feels_like)}`;
  dom.UIWeather.Icon__weather__description.innerHTML =
    weatherIcons[dataCurrent.weather[0].icon];
  dom.UIWeather.Humidity.innerHTML = `${Math.round(dataCurrent.main.humidity)} %`;
  dom.UIWeather.Wind.innerHTML = `${Math.round(dataCurrent.wind.speed * 3.6)} km/h`;
  dom.UIWeather.Visibility.innerHTML = `${Math.round(dataCurrent.visibility / 1000)} km`;
  dom.UIWeather.Dew__point.innerHTML = `${Math.round(dataCurrent.main.temp - (100 - dataCurrent.main.humidity) / 5)} °`;
  dom.UIWeather.Pressure.innerHTML = `${Math.round(dataCurrent.main.pressure)} hPa`;
  dom.UIWeather.Wind__direction.innerHTML = `${Math.round(dataCurrent.wind.speed * 3.6)} km/h ${getWindDirection(166)}`;
  dom.UIWeather.Hourly__forecast.innerHTML = "";
  let html_hourly_forecast_now = `<div class="contain_time border border-gray-400/30 bg-blue-400/10">
            <p class="time">Bây giờ</p>
            <div class="icon">${weatherIcons[dataCurrent.weather[0].icon]}</div>
            <p class="index_time">${Math.round(dataCurrent.main.temp)}°</p>
          </div>`;
  let Days = dataWeek.list;
  let html_hourly_forecast = Days.map((d, i = 0) => {
    if (i < 7) {
      let day = new Date((d.dt + timezone) * 1000);
      i++;
      return `<div class="contain_time border border-gray-400/30 bg-blue-400/10">
            <p class="time">${day.getUTCHours()} giờ</p>
            <div class="icon">
              ${weatherIcons[d.weather[0].icon]}
            </div>
            <p class="index_time">${Math.round(d.main.temp)}°</p>
            <p class="percen">${Math.round(d.pop * 100)}%</p>
          </div>`;
    }
  }).join("");
  dom.UIWeather.Hourly__forecast.insertAdjacentHTML(
    "afterbegin",
    html_hourly_forecast_now,
  );
  dom.UIWeather.Hourly__forecast.insertAdjacentHTML(
    "beforeend",
    html_hourly_forecast,
  );

  let Day_forecast_data = await DAY_FORECAST_DATA();
  let Day__forecast__html__now = `<div class="line_day">
            <span class="day">Today</span>
            <div class="flex flex-col items-center">
              <div class="icon">
                ${weatherIcons[dataCurrent.weather[0].icon]}
              </div>
            </div>
            <div class="flex flex-1 items-center gap-2">
              <p class="min_temp">${Math.round(MinMaxToday.MinTemp)}°</p>
              <div class="contain_lim">
                <div class="lim" style="width:${((MinMaxToday.MaxTemp - MinMaxToday.MinTemp) / (Day_forecast_data.MinMaxTempWeek.MaxTempWeek - Day_forecast_data.MinMaxTempWeek.MinTempWeek)) * 100}%; left:${((MinMaxToday.MinTemp - Day_forecast_data.MinMaxTempWeek.MinTempWeek) / (Day_forecast_data.MinMaxTempWeek.MaxTempWeek - Day_forecast_data.MinMaxTempWeek.MinTempWeek)) * 100}%"></div>
              </div>
              <p class="index_time max_temp">${Math.round(MinMaxToday.MaxTemp)}°</p>
            </div>
          </div>`;
  let DayOnForecast = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let Day__forecast__html = Day_forecast_data.Data_day_forecast.map((data) => {
    return `
    <div class="line_day">
            <span class="day">${DayOnForecast[data.day]}</span>
            <div class="flex flex-col items-center">
              <div class="icon">
                ${weatherIcons[data.icon]}
                <p class="percen">${data.pop*100}%</p>
              </div>
            </div>
            <div class="flex flex-1 items-center gap-2">
              <p class="min_temp">${Math.round(data.MinTempDay)}°</p>
              <div class="contain_lim">
                <div class="lim" style="width:${((data.MaxTempDay - data.MinTempDay) /(Day_forecast_data.MinMaxTempWeek.MaxTempWeek - Day_forecast_data.MinMaxTempWeek.MinTempWeek)) * 100}%; left:${((data.MinTempDay - Day_forecast_data.MinMaxTempWeek.MinTempWeek) / (Day_forecast_data.MinMaxTempWeek.MaxTempWeek - Day_forecast_data.MinMaxTempWeek.MinTempWeek)) * 100}%"></div>
              </div>
              <p class="index_time max_temp">${Math.round(data.MaxTempDay)}°</p>
            </div>
          </div>
    `;
  }).join("");
  dom.UIWeather.Day__forecast.innerHTML = "";
  dom.UIWeather.Day__forecast.insertAdjacentHTML(
    "afterbegin",
    Day__forecast__html__now,
  );
  dom.UIWeather.Day__forecast.insertAdjacentHTML(
    "beforeend",
    Day__forecast__html,
  );
  console.log(data);
}
display();
setInterval(
  () => {
    display();
  },
  1000 * 60 * 10,
);
