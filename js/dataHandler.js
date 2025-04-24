class DataHandler {
    constructor() {
        this.processes = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Process form submission
        document.getElementById('processForm').addEventListener('submit', (e) => this.handleProcessSubmit(e));
        
        // Cancel process button
        document.getElementById('cancelProcess').addEventListener('click', () => this.hideProcessModal());
        
        // Export to Excel button
        document.getElementById('exportExcel').addEventListener('click', () => this.exportToExcel());
    }

    handleProcessSubmit(e) {
        e.preventDefault();
        
        const processDetail = document.getElementById('processDetail').value.trim();
        if (!processDetail) {
            alert('Please enter process details');
            return;
        }

        const currentTime = window.videoPlayer.video.currentTime;
        const previousTime = this.processes.length > 0 ? this.processes[this.processes.length - 1].timeSeconds : 0;
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        
        try {
            const process = {
                no: this.processes.length + 1,
                detail: processDetail,
                timeSeconds: currentTime,
                timeDifference: currentTime - previousTime,
                timeDM: (currentTime - previousTime) * 0.6,
                status: document.getElementById('processStatus').value,
                category: document.getElementById('processCategory').value
            };

            this.processes.push(process);
            this.updateTable();
            
            // Update current condition in charts
            const statusTotals = this.calculateStatusTotals();
            window.chartManager.updateCurrentCondition(statusTotals);
            
            // Update MM chart
            window.chartManager.updateMMChart(this.processes);
            
            // Hide modal and clear form
            this.hideProcessModal();
            document.getElementById('processForm').reset();
            
            // Keep video paused after saving
            window.videoPlayer.video.pause();
        } catch (error) {
            console.error('Error processing data:', error);
            alert('An error occurred while processing the data');
        } finally {
            submitBtn.classList.remove('loading');
        }
    }

    updateTable() {
        const tableBody = document.getElementById('processTable');
        tableBody.innerHTML = '';

        let totalSeconds = 0;
        
        this.processes.forEach(process => {
            totalSeconds += process.timeDifference;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${process.no}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${process.detail}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${process.timeDifference.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${process.timeDM.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${process.status}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${process.category}</td>
            `;
            tableBody.appendChild(row);
        });

        // Update total time
        const totalDM = totalSeconds * 0.6;
        document.getElementById('totalTime').textContent = 
            `${totalSeconds.toFixed(2)}s (${totalDM.toFixed(2)} dm)`;
    }

    hideProcessModal() {
        document.getElementById('processModal').classList.add('hidden');
    }

    exportToExcel() {
        const exportBtn = document.getElementById('exportExcel');
        exportBtn.classList.add('loading');

        try {
            const data = this.processes.map(process => ({
                'No': process.no,
                'Process Detail': process.detail,
                'Time (s)': process.timeDifference.toFixed(2),
                'Time (dm)': process.timeDM.toFixed(2),
                'Status': process.status,
                'Category': process.category
            }));

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(data);
            
            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Process Analysis');
            
            // Generate Excel file
            XLSX.writeFile(wb, 'process_analysis.xlsx');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('An error occurred while exporting to Excel');
        } finally {
            exportBtn.classList.remove('loading');
        }
    }

    getProcessData() {
        return this.processes;
    }

    calculateStatusTotals() {
        const totals = {
            'Value': 0,
            'Semi Value': 0,
            'Check': 0,
            'Non Value': 0
        };

        this.processes.forEach(process => {
            totals[process.status] += process.timeDifference;
        });

        return totals;
    }

    calculateCategoryTotals() {
        const totals = {
            'OK': 0,
            'Improve': 0,
            'Buang': 0
        };

        this.processes.forEach(process => {
            totals[process.category] += process.timeDifference;
        });

        return totals;
    }
}

// Initialize data handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dataHandler = new DataHandler();
});
