# System Booster

**System Booster** is a cross-platform desktop application designed to optimize system performance by monitoring and managing system resources such as memory, CPU, and storage. Built using Electron, Chart.js, and TailwindCSS, this application provides a user-friendly dashboard to visualize system metrics and perform optimization tasks with a single click.

## Features

- **Real-time Monitoring**: Track memory, CPU, and storage usage in real-time with dynamic charts.
- **System Optimization**: Optimize memory, clean temporary files, clear DNS cache, and remove crash dumps with a single click.
- **Cross-Platform Support**: Compatible with Windows, macOS, and Linux.
- **Detailed System Information**: View detailed information about your system's hardware and software.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com))
- [Git](https://git-scm.com)

### Steps

1. **Clone the repository**:
    ```bash
    git clone https://github.com/Rahul-Sahani04/universal-system-booster.git
    cd universal-system-booster
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Run the application**:
    ```bash
    npm start
    ```

## Project Structure

```plaintext
.
├── bun.lockb
├── index.html
├── LICENSE.md
├── main.js
├── package.json
├── pyvenv.cfg
├── README.md
├── renderer.js
├── styles.css
├── tailwind.config.js
```

- **index.html**: The main HTML file that serves as the application's dashboard.
- **main.js**: The main process script for Electron, responsible for creating the application window and handling system data fetching.
- **renderer.js**: The renderer process script for Electron, responsible for updating the UI with real-time data.
- **styles.css**: Custom styles for the application.
- **tailwind.config.js**: Configuration file for TailwindCSS.
- **package.json**: Contains metadata about the project and its dependencies.
- **LICENSE.md**: License information for the project.
- **README.md**: This file.

## Usage

### Dashboard

The dashboard provides a comprehensive view of your system's performance metrics:

- **Memory Usage**: Displays real-time memory usage percentage and details.
- **CPU Usage**: Displays real-time CPU usage percentage and details.
- **Storage Usage**: Displays real-time storage usage percentage and details.
- **System Details**: Displays detailed information about your system's hardware and software.

### Optimization

To optimize your system, simply click the "Boost" button. This will:

- Optimize memory by terminating processes consuming excessive memory.
- Clean temporary files.
- Clear DNS cache.
- Remove crash dumps.

### Fetching Data

The application fetches system data at regular intervals:

- **Memory and CPU Data**: Every second.
- **Storage Data**: Every 5 seconds.
- **System Details**: On application load.

## Development

### Scripts

- **Start the application**:
    ```bash
    npm start
    ```

- **Package the application**:
    ```bash
    npm run package
    ```

### Dependencies

- **Electron**: Framework for building cross-platform desktop applications.
- **Chart.js**: Library for creating charts.
- **TailwindCSS**: Utility-first CSS framework.
- **systeminformation**: Library for fetching system information.
- **ps-node**: Library for managing processes.
- **node-os-utils**: Library for fetching OS-related information.

## License

This project is licensed under the [CC0 1.0 Universal (Public Domain)](LICENSE.md).

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## Acknowledgements

- [Electron](https://www.electronjs.org/)
- [Chart.js](https://www.chartjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [systeminformation](https://systeminformation.io/)
- [ps-node](https://github.com/neekey/ps)
- [node-os-utils](https://github.com/SunilWang/node-os-utils)

## Contact

For any inquiries or feedback, please contact [Rahul Sahani](mailto:rahul@example.com).

---

Thank you for using **System Booster**! We hope it helps you keep your system running smoothly.