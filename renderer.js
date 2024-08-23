const { ipcRenderer } = require("electron");
// renderer.js
const { Chart } = require("chart.js/auto");

// Initialize Charts
const memoryCtx = document.getElementById("memoryChart").getContext("2d");
const cpuCtx = document.getElementById("cpuChart").getContext("2d");
const storageCtx = document.getElementById("storageChart").getContext("2d");

const memoryLimit = document.getElementById("memoryLimit");

const memoryDetails = document.getElementById("memoryDetails");
const cpuDetails = document.getElementById("cpuDetails");
const storageDetails = document.getElementById("storageDetails");

const memoryUsageData = [];
const cpuUsageData = [];
const storageUsageData = [50, 50];

const memoryChart = new Chart(memoryCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Memory Usage (%)",
        data: memoryUsageData,
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        fill: false,
      },
    ],
  },
  options: {
    responsive: true,
  },
});

const cpuChart = new Chart(cpuCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "CPU Usage (%)",
        data: cpuUsageData,
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        fill: false,
      },
    ],
  },
  options: {
    responsive: true,
  },
});

const storageChart = new Chart(storageCtx, {
  type: "doughnut",
  data: {
    labels: [],
    datasets: [
      {
        label: "Storage Usage (%)",
        data: storageUsageData,
        backgroundColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          // "rgba(255, 206, 86, 1)",
          // "rgba(75, 192, 192, 1)",
          // "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 2,
      },
    ],
  },
  options: {
    responsive: true,
  },
});

// Fetch real-time system data
function fetchData() {
  ipcRenderer.send("get-system-data");
}

ipcRenderer.on("system-data", (event, data) => {
  const timestamp = new Date().toLocaleTimeString();

  if (memoryUsageData.length >= 20) {
    memoryUsageData.shift();
    cpuUsageData.shift();
    memoryChart.data.labels.shift();
    cpuChart.data.labels.shift();
  }

  memoryUsageData.push(data.memoryUsage);
  cpuUsageData.push(data.cpuUsage);

  memoryChart.data.labels.push(timestamp);
  cpuChart.data.labels.push(timestamp);

  memoryDetails.innerText = `Used: ${data.memoryDetails}`;
  cpuDetails.innerText = `Overall Used: ${data.cpuUsage}%`;
  let hr = document.createElement("hr");
  cpuDetails.appendChild(hr);

  data.cpuData.cpus.forEach((cpu, index) => {
    let li = document.createElement("li");
    li.innerText = `CPU ${index}: ${cpu.load.toFixed(2)}%`;
    cpuDetails.appendChild(li);
  });

  memoryChart.update();
  cpuChart.update();
});

// Fetch Storage Data
function fetchStorageData() {
  ipcRenderer.send("get-storage-data");
}

ipcRenderer.on("storage-data", (event, data) => {
  const timestamp = new Date().toLocaleTimeString();

  storageDetails.innerText = `Total: ${data.storageUsage.totalGb} GB | Used: ${data.storageUsage.usedGb} GB | Used (%): ${data.storageUsage.usedPercentage}%`;

  // if (storageUsageData.length >= 20) {
  //   storageUsageData.shift();
  //   storageChart.data.labels.shift();
  // }

  const freePercentage = data.storageUsage.totalGb - data.storageUsage.usedGb;
  const usedPercentage = data.storageUsage.totalGb - freePercentage;
  storageUsageData[0] = usedPercentage;
  storageUsageData[1] = freePercentage;

  // storageUsageData.push(data.storageUsage.freePercentage);
  // storageChart.data.labels.push(timestamp);

  storageChart.update();
});

// Fetch StartUp Data
function fetchStartUpData() {
  ipcRenderer.send("get-systemDetails");
}

ipcRenderer.on("systemDetails", (event, data) => {
  // console.log(data);
  const startUpList = document.getElementById("systemDetails");
  startUpList.innerHTML = "";
  let list = document.createElement("ol");
  list.className = "ps-5 mt-2 space-y-1 list-decimal list-inside"

  console.log(data.batteryData);

  let li = document.createElement("li");
  li.innerText = "Manufacturer: " + data.system.manufacturer;
  list.appendChild(li);
  li = document.createElement("li");
  li.innerText = "Model: " + data.system.model;
  list.appendChild(li);
  li = document.createElement("li");
  li.innerText = "Version: " + data.system.version;
  list.appendChild(li);
  li = document.createElement("li");
  li.innerText = "Serial: " + data.system.serial;
  list.appendChild(li);
  li = document.createElement("li");
  li.innerText = "Battery: " + data.batteryData.percent;
  list.appendChild(li);
  li = document.createElement("li");
  li.innerText = "Battery Status: " + data.batteryData.isCharging;
  list.appendChild(li);
  li = document.createElement("li");
  li.innerText = "Battery Time: " + data.batteryData.timeRemaining;
  list.appendChild(li);



  
  
  startUpList.appendChild(list);
} );

// Fetch data on load
fetchStartUpData();
fetchStorageData();

// Fetch storage data every 5 seconds
setInterval(fetchStorageData, 5000);

// Fetch data every second
setInterval(fetchData, 1000);

document.getElementById("boostButton").addEventListener("click", () => {
  console.log("Boosting system...");
  // ipcRenderer.send('optimizeMemory');
  ipcRenderer.send("boost-system", memoryLimit.value);
  
});

ipcRenderer.on("boost-complete", (event, message) => {
  ipcRenderer.send("completionMessage");
});
