const { ipcRenderer } = require("electron");
// renderer.js
const { Chart } = require("chart.js/auto");

// Initialize Charts
const memoryCtx = document.getElementById("memoryChart").getContext("2d");
const cpuCtx = document.getElementById("cpuChart").getContext("2d");
const storageCtx = document.getElementById("storageChart").getContext("2d");

const memoryDetails = document.getElementById("memoryDetails");
const cpuDetails = document.getElementById("cpuDetails");
const storageDetails = document.getElementById("storageDetails");

const memoryUsageData = [];
const cpuUsageData = [];
const storageUsageData = [];

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
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Storage Usage (%)",
        data: storageUsageData,
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
        fill: false,
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
  cpuDetails.innerText = `Used: ${data.cpuUsage}%`;

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

  if (storageUsageData.length >= 20) {
    storageUsageData.shift();
    storageChart.data.labels.shift();
  }

  storageUsageData.push(data.storageUsage.freePercentage);
  storageChart.data.labels.push(timestamp);

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

  let li = document.createElement("li");
  li.innerText = "Manufacturer: " + data.manufacturer;
  list.appendChild(li);
  li = document.createElement("li");
  li.innerText = "Model: " + data.model;
  list.appendChild(li);
  li = document.createElement("li");
  li.innerText = "Version: " + data.version;
  list.appendChild(li);
  li = document.createElement("li");
  li.innerText = "Serial: " + data.serial;
  list.appendChild(li);
  
  
  startUpList.appendChild(list);
} );

// Fetch data on load
fetchStartUpData();

// Fetch storage data every 5 seconds
setInterval(fetchStorageData, 5000);

// Fetch data every second
setInterval(fetchData, 1000);

document.getElementById("boostButton").addEventListener("click", () => {
  console.log("Boosting system...");
  ipcRenderer.send('optimizeMemory');
  ipcRenderer.send("boost-system");
  
});

ipcRenderer.on("boost-complete", (event, message) => {
  ipcRenderer.send("completionMessage");
});
