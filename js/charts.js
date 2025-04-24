class ChartManager {
    constructor() {
        this.stackedChart = null;
        this.mmChart = null;
        this.newCondition = null;
        this.idealCondition = null;
        
        // Register Chart.js plugins
        Chart.register(ChartDataLabels);
        
        this.setupEventListeners();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Condition input buttons
        document.getElementById('newConditionBtn').addEventListener('click', () => this.showConditionModal('new'));
        document.getElementById('idealConditionBtn').addEventListener('click', () => this.showConditionModal('ideal'));
        
        // Condition form
        document.getElementById('conditionForm').addEventListener('submit', (e) => this.handleConditionSubmit(e));
        document.getElementById('cancelCondition').addEventListener('click', () => this.hideConditionModal());
    }

    initializeCharts() {
        // Initialize Stacked Bar Chart
        const stackedCtx = document.getElementById('stackedChart').getContext('2d');
        this.stackedChart = new Chart(stackedCtx, {
            type: 'bar',
            data: {
                labels: ['Current', 'New', 'Ideal'],
                datasets: [
                    {
                        label: 'Value',
                        backgroundColor: '#4CAF50',
                        data: [0, 0, 0]
                    },
                    {
                        label: 'Semi Value',
                        backgroundColor: '#2196F3',
                        data: [0, 0, 0]
                    },
                    {
                        label: 'Check',
                        backgroundColor: '#FFC107',
                        data: [0, 0, 0]
                    },
                    {
                        label: 'Non Value',
                        backgroundColor: '#F44336',
                        data: [0, 0, 0]
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: { stacked: true },
                    y: { 
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Time (seconds)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Process Analysis Comparison'
                    },
                    datalabels: {
                        display: true,
                        color: 'white',
                        font: {
                            weight: 'bold'
                        },
                        formatter: (value) => {
                            if (value > 0) {
                                return value.toFixed(1) + 's';
                            }
                            return '';
                        }
                    }
                }
            }
        });

        // Initialize Gantt Chart
        const mmCtx = document.getElementById('mmChart').getContext('2d');
        this.mmChart = new Chart(mmCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Process Timeline',
                    backgroundColor: '#2196F3',
                    data: [],
                    barPercentage: 0.8,
                    categoryPercentage: 0.9
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',  // Horizontal bars
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Timeline (seconds)'
                        },
                        position: 'top',  // Show time scale on top
                        grid: {
                            color: '#e2e8f0'  // Light gray grid lines
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Process'
                        },
                        reverse: true  // Latest process at top
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Process Timeline Analysis'
                    },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'right',
                        color: '#2196F3',
                        font: {
                            weight: 'bold'
                        },
                        formatter: (value) => value.toFixed(1) + 's'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const process = window.dataHandler.processes[context.dataIndex];
                                return [
                                    `Duration: ${process.timeDifference.toFixed(1)}s`,
                                    `Status: ${process.status}`,
                                    `Category: ${process.category}`
                                ];
                            }
                        }
                    }
                }
            }
        });
    }

    updateCurrentCondition(totals) {
        // Update current condition data
        this.stackedChart.data.datasets[0].data[0] = totals['Value'];
        this.stackedChart.data.datasets[1].data[0] = totals['Semi Value'];
        this.stackedChart.data.datasets[2].data[0] = totals['Check'];
        this.stackedChart.data.datasets[3].data[0] = totals['Non Value'];

        // If new condition exists, update it
        if (this.newCondition) {
            this.stackedChart.data.datasets[0].data[1] = this.newCondition.Value;
            this.stackedChart.data.datasets[1].data[1] = this.newCondition['Semi Value'];
            this.stackedChart.data.datasets[2].data[1] = this.newCondition.Check;
            this.stackedChart.data.datasets[3].data[1] = this.newCondition['Non Value'];
        }

        // If ideal condition exists, update it
        if (this.idealCondition) {
            this.stackedChart.data.datasets[0].data[2] = this.idealCondition.Value;
            this.stackedChart.data.datasets[1].data[2] = this.idealCondition['Semi Value'];
            this.stackedChart.data.datasets[2].data[2] = this.idealCondition.Check;
            this.stackedChart.data.datasets[3].data[2] = this.idealCondition['Non Value'];
        }

        this.stackedChart.update();
    }

    updateMMChart(processes) {
        // Calculate cumulative start times for each process
        let cumulativeTime = 0;
        const processData = processes.map(p => {
            const startTime = cumulativeTime;
            cumulativeTime += p.timeDifference;
            return {
                x: startTime,  // Start position
                y: `Process ${p.no}: ${p.detail}`,  // Process label
                duration: p.timeDifference,  // Bar width
                status: p.status  // For color coding
            };
        });

        // Update chart configuration
        this.mmChart.data = {
            labels: processData.map(p => p.y),
            datasets: [{
                label: 'Process Duration',
                data: processData.map(p => ({
                    x: p.x,
                    y: p.y,
                    duration: p.duration
                })),
                backgroundColor: processData.map(p => {
                    switch(p.status) {
                        case 'Value': return '#4CAF50';
                        case 'Semi Value': return '#2196F3';
                        case 'Check': return '#FFC107';
                        case 'Non Value': return '#F44336';
                        default: return '#2196F3';
                    }
                }),
                barPercentage: 0.8,
                categoryPercentage: 0.9
            }]
        };

        // Update chart options
        this.mmChart.options = {
            responsive: true,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time (seconds)'
                    },
                    position: 'top'
                },
                y: {
                    title: {
                        display: true,
                        text: 'Process'
                    },
                    reverse: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const data = context.raw;
                            return [
                                `Start Time: ${data.x.toFixed(1)}s`,
                                `Duration: ${data.duration.toFixed(1)}s`,
                                `End Time: ${(data.x + data.duration).toFixed(1)}s`
                            ];
                        }
                    }
                }
            }
        };

        this.mmChart.update();
    }

    showConditionModal(type) {
        this.currentConditionType = type;
        document.getElementById('conditionModal').classList.remove('hidden');
    }

    hideConditionModal() {
        document.getElementById('conditionModal').classList.add('hidden');
    }

    handleConditionSubmit(e) {
        e.preventDefault();
        
        const condition = {
            'Value': parseFloat(document.getElementById('valueInput').value) || 0,
            'Semi Value': parseFloat(document.getElementById('semiValueInput').value) || 0,
            'Check': parseFloat(document.getElementById('checkInput').value) || 0,
            'Non Value': parseFloat(document.getElementById('nonValueInput').value) || 0
        };

        // Calculate total time
        const totalTime = Object.values(condition).reduce((sum, val) => sum + val, 0);

        // Create table row data
        const rowData = {
            no: window.dataHandler.processes.length + 1,
            detail: this.currentConditionType === 'new' ? 'Kondisi Baru' : 'Kondisi Ideal',
            timeSeconds: totalTime,
            timeDifference: totalTime,
            timeDM: totalTime * 0.6,
            status: Object.entries(condition).reduce((a, b) => b[1] > a[1] ? b : a)[0], // Get status with highest value
            category: this.currentConditionType === 'new' ? 'New' : 'Ideal'
        };

        // Add to processes
        window.dataHandler.processes.push(rowData);
        window.dataHandler.updateTable();

        if (this.currentConditionType === 'new') {
            this.newCondition = condition;
        } else {
            this.idealCondition = condition;
        }

        // Update charts
        this.updateCurrentCondition(window.dataHandler.calculateStatusTotals());
        
        // Hide modal and reset form
        this.hideConditionModal();
        document.getElementById('conditionForm').reset();
    }
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chartManager = new ChartManager();
});
