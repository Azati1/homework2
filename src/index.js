import "babel-polyfill";
import Chart from "chart.js";

const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";

class WeatherData {
  constructor(realTemperature, feltTemperature, measurementTime) {
    this.realTemperature = realTemperature;
    this.feltTemperature = feltTemperature;
    this.measurementTime = measurementTime;
  }
}

async function loadWeatherData() {
  const response = await fetch(meteoURL);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const weatherDataXML = parser.parseFromString(xmlTest, "text/xml");

  const measurementTimes = weatherDataXML.getElementsByTagName("FORECAST");
  const realTemperatures = weatherDataXML.getElementsByTagName("TEMPERATURE");
  const feltTemperatures = weatherDataXML.getElementsByTagName("HEAT");

  const weatherData = new Array();

  for (let i = 0; i < measurementTimes.length; i++) {
    const measurementTime = measurementTimes[i].getAttribute("hour")
    const realTemperature = realTemperatures[i].getAttribute("max");
    const feltTemperature = feltTemperatures[i].getAttribute("max");
    weatherData.push(new WeatherData(realTemperature, feltTemperature, measurementTime));
  }

  return weatherData;
}

const buttonBuild = document.getElementById("load_data_btn");
const canvasCtx = document.getElementById("out").getContext("2d");

buttonBuild.addEventListener("click", async function() {

  const weatherData = await loadWeatherData();
  
  const measurementTimes = weatherData.map((weatherDataItem) => hourConvert(weatherDataItem.measurementTime));
  const realTemperatures = weatherData.map((weatherDataItem) => weatherDataItem.realTemperature);
  const feltTemperatures = weatherData.map((weatherDataItem) => weatherDataItem.feltTemperature);

  const chartConfig = {
    type: "line",

    data: {
      labels: measurementTimes,
      datasets: [
        {
          label: "Реальная температура",
          backgroundColor: "rgba(255, 64, 129, 0.3)",
          borderColor: "rgb(198, 0, 85)",
          data: realTemperatures
        },
        {
          label: "Температура по ощущениям",
          backgroundColor: "rgba(118, 255, 3, 0.3)",
          borderColor: "rgb(50, 203, 0)",
          data: feltTemperatures
        }
      ]
    },
    options: {
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Время',
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Температура, ℃'
          }
        }]
      }
    },
  };

  if (window.chart) {
    chart.data.labels = chartConfig.data.labels;
    chart.data.datasets[0].data = chartConfig.data.datasets[0].data;
    chart.update({
      duration: 800,
      easing: "easeOutBounce"
    });
  } else {
    window.chart = new Chart(canvasCtx, chartConfig);
  }
});

function hourConvert(hour) {
  return hour + ':' + "00";
}
