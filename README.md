
Built by https://www.blackbox.ai

---

```markdown
# Video Analysis Tool

## Project Overview
The **Video Analysis Tool** is a web-based application designed for analyzing video content. It allows users to upload videos, control playback, and manage process analysis through an interactive interface. Users can also visualize the data with charts and export analysis results to Excel.

## Installation
To run the Video Analysis Tool locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd <project-directory>
   ```
3. Open `index.html` in your web browser to access the application.

## Usage
1. **Upload a Video**: Click on the "Upload Video" button to select and upload your video file.
2. **Playback Control**: Use the buttons to play, pause, fast forward, or slow down the video.
3. **Process Analysis**: Fill out the process analysis form to track and log video events. Submit, view, and export the analysis results in real-time.
4. **Charts**: Visualize data trends and timelines using the integrated charts.

## Features
- Video upload and playback with adjustable speed.
- An interactive control panel for managing video events.
- Process analysis with an editable data table.
- Charts for process analysis representation (stacked chart and Gantt chart).
- Excel export functionality for data management.

## Dependencies
The application leverages the following libraries:
- **Tailwind CSS** for styling: [Tailwind CSS](https://tailwindcss.com/)
- **Font Awesome** for icons: [Font Awesome](https://fontawesome.com/)
- **xlsx** for Excel file export: [SheetJS xlsx](https://github.com/SheetJS/sheetjs)
- **Chart.js** for data visualization: [Chart.js](https://www.chartjs.org/)
- **chartjs-plugin-datalabels** for enhancing charts: [Chart.js Plugin](https://chartjs-plugin-datalabels.netlify.app/)

## Project Structure
```
/project-directory
│
├── index.html                # Main HTML file for the application.
├── styles                    # Directory containing CSS files.
│   └── main.css              # Custom styles for the application.
├── js                        # Directory containing JavaScript files.
│   ├── videoPlayer.js        # Logic for controlling the video player.
│   ├── dataHandler.js        # Functions for managing data.
│   └── charts.js             # Code for rendering charts.
```

## License
This project is open-source and available under the MIT License.
```