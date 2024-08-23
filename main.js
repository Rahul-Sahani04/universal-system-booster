const { app, BrowserWindow, ipcMain } = require("electron");
const os = require("os");
const si = require("systeminformation");
const fs = require("fs");
const path = require("path");
const ps = require("ps-node");
const { exec } = require("child_process");

const osName = os.type();

console.log("OS Name:", osName);

function createWindow() {
  const win = new BrowserWindow({
    icon: path.join(__dirname, "assets", "Icon.png"),
    width: 1280,
    height: 780,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");
}

// Fetch system data
ipcMain.on("get-system-data", async (event) => {
  const memData = await si.mem();
  const cpuData = await si.currentLoad();

  const memoryUsage = ((memData.active / memData.total) * 100).toFixed(2);

  const cpuUsage = cpuData.currentLoad.toFixed(2);



  event.reply("system-data", {
    memoryUsage: parseFloat(memoryUsage),
    cpuUsage: parseFloat(cpuUsage),
    cpuData: cpuData,
    memoryDetails: `${(memData.active / 1024 ** 3).toFixed(2)} GB | Total: ${(
      memData.total /
      1024 ** 3
    ).toFixed(2)} GB`,
  });
});

// Fetch storage data
ipcMain.on("get-storage-data", async (event) => {
  let diskData = await si.fsSize();

  if (os.platform() === "win32" || osName === "Windows_NT") {
    // Filter out non-removable drives
    diskData = diskData.filter((disk) => !disk.mount.includes("Removable"));
  } else if (os.platform() === "darwin" || osName === "Darwin") {
    // Filter out system drives
    diskData = diskData.filter(
      (disk) => disk.mount.includes("/System/Volumes/Data")
    );
  } else if (os.platform() === "linux") {
    // Filter out system drives
    diskData = diskData.filter((disk) => disk.mount.includes("/boot"));

    // Filter out removable drives
    diskData = diskData.filter((disk) => !disk.mount.includes("/media"));
  }

  else {
    console.log("Unsupported platform for storage data fetching.");
    return;
  }

  // console.log(diskData);
  const used = diskData[0].used;
  const total = diskData[0].size;
  const usedPercentage = ((used / total) * 100).toFixed(2);

  event.reply("storage-data", {
    storageUsage: {
      usedGb: (used / 1024 ** 3).toFixed(2),
      totalGb: (total / 1024 ** 3).toFixed(2),
      usedPercentage: parseFloat(usedPercentage),
      freePercentage: (100 - usedPercentage).toFixed(2),
    },
  });
});


ipcMain.on("get-systemDetails", async (event) => {
    const startUp = await si.system();

    const batteryData = await si.battery();

    // console.log(startUp);
    event.reply("systemDetails", {
      system: startUp,
      batteryData: batteryData,
  })

});



ipcMain.on("optimizeMemory", async (event, memoryLimit) => {
  try {
    // Fetch all processes
    const processes = await si.processes();


    console.log("Memory Limit:", memoryLimit);

    console.log("Optimizing memory...");
    console.log(`Processes consuming more than ${memoryLimit}MB of memory:`);
    console.log("----------------------------------------------");

    if (osName === "Windows_NT") {
      // Kill processes consuming more than 500MB of memory
      processes.list.forEach((process) => {
        if (process.memRss > memoryLimit  * 1024) {
          console.log(`Killing process ${process.name} (PID: ${process.pid})`);
          ps.kill(process.pid, (err) => {
            if (err) {
              console.error(
                `Error killing process ${process.name} (PID: ${process.pid}):`,
                err
              );
            }
          });
        }
      });
    } else if (osName === "Darwin") {
      // Kill processes consuming more than 500MB of memory

      processes.list.forEach((process, index) => {
        // console.log(`PID: ${process.pid}, Name: ${process.name}, Memory Used: ${(process.memRss / (1024 )).toFixed(2)} MB`);
        // Check if process is consuming more than 500MB of memory (converted to bytes)
        if (process.memRss > memoryLimit * 1024) {
          // memRss is the resident set size (actual memory used)
          if (process.name === "Electron" || process.name === "Google Chrome" || process.name === "Code Helper" || process.name === "Code Helper (Renderer)" || process.name === "Code Helper (GPU Process)" || process.name === "system-booster" || process.name === "Electron Helper"){
            return;
          }
          console.log(
            `Process to kill: PID: ${process.pid}, Name: ${
              process.name
            }, Memory Used: ${(process.memRss / 1024).toFixed(2)} MB`
          );

          // Kill the process (be cautious when killing processes)
          try {
            ps.kill(process.pid, (err) => {
              if (err) {
                console.error(
                  `Error killing process ${process.name} (PID: ${process.pid}):`,
                  err
                );
              } else {
                console.log(
                  `Process ${process.name} (PID: ${process.pid}) killed.`
                );
              }
            });
          } catch (err) {
            console.error(
              `Error killing process ${process.name} (PID: ${process.pid}):`,
              err
            );
          }
        }
      });
    } else {
      console.log("Unsupported platform for memory optimization.");
      return;
    }

    event.reply("optimizeMemory-response", "Memory optimized!");
  } catch (error) {
    console.error("Error optimizing memory:", error);
    event.reply("optimizeMemory-response", "Failed to optimize memory.");
  }
});

// Clean Temporary Files
ipcMain.on("cleanTempFiles", (event) => {
  let tempDir;
  const platform = os.platform();
  if (platform === "win32" || osName === "Windows_NT") {
    tempDir = process.env.TEMP;

    // Clean temporary files using cleanmgr.exe
    exec("cleanmgr.exe /autoclean", (error, stdout, stderr) => {
      if (error) {
        console.error("Error cleaning temporary files:", error);
        event.reply("cleanTempFiles-response", "Failed to clean temporary files.");
      } else {
        console.log(stdout);
        console.error(stderr);
        event.reply("cleanTempFiles-response", "Temporary files cleaned!");
      }
    });

  } else if (platform === "darwin" || osName === "Darwin") {
    tempDir = "/private/tmp";
  } else if (platform === "linux") {
    tempDir = "/tmp";
  }

  if (tempDir && fs.existsSync(tempDir)) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
      event.reply("cleanTempFiles-response", "Temporary files cleaned!");
    } catch (error) {
      event.reply("cleanTempFiles-response", `Failed to clean temporary files: ${error.message}`);
    }
  } else {
    event.reply("cleanTempFiles-response", "Temporary directory not found.");
  }
});

// Clean Crash Dumps
ipcMain.on("cleanCrashDumps", (event) => {
  let crashDumpDir;
  const platform = os.platform();
  if (platform === "win32" || osName === "Windows_NT") {
    crashDumpDir = path.join(process.env.SystemRoot, "Minidump");
  } else if (platform === "darwin" || platform === "linux" || osName === "Darwin") {
    crashDumpDir = path.join(os.homedir(), "Library/Logs/DiagnosticReports");
  }

  if (crashDumpDir && fs.existsSync(crashDumpDir)) {
    fs.rmSync(crashDumpDir, { recursive: true, force: true });
  }
  event.reply("cleanCrashDumps-response", "Crash dumps cleaned!");
});

// Clear DNS Cache
ipcMain.on("clearDNSCache", (event) => {
  const platform = os.platform();
  let command;
  if (platform === "win32" || osName === "Windows_NT") {
    command = "ipconfig /flushdns";
  } else if (platform === "darwin" || osName === "Darwin") {
    command = "sudo killall -HUP mDNSResponder";
  } else if (platform === "linux") {
    command = "sudo systemd-resolve --flush-caches";
  }

  if (command) {
    exec(command, (err) => {
      if (err) {
        console.error("Error clearing DNS cache:", err);
        event.reply("clearDNSCache-response", "Failed to clear DNS cache.");
        return;
      }
      event.reply("clearDNSCache-response", "DNS cache cleared!");
    });
  } else {
    event.reply(
      "clearDNSCache-response",
      "Unsupported platform for DNS cache clearing."
    );
  }
});

// Completion Message
ipcMain.on("completionMessage", (event) => {
  event.reply("completionMessage-response", "System optimized successfully!");
});

// Boost System Functionality (Optimize Memory, Clear Temp Files, etc.)
ipcMain.on("boost-system", async (event, memoryLimit) => {
  // Call other IPC methods as needed
  // For example:
  ipcMain.emit('optimizeMemory', event, memoryLimit);
  ipcMain.emit('cleanTempFiles', event);
  ipcMain.emit('cleanCrashDumps', event);
  ipcMain.emit('clearDNSCache', event);

  event.reply("boost-complete", { message: "System optimized successfully!" });
});

app.whenReady().then(createWindow);
