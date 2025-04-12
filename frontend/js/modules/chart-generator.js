/**
 * Chart Generator Module for GigGatek Rent-to-Own Calculator
 * This module handles the generation of data visualization charts for the rent-to-own calculator.
 * It's designed to be lazy-loaded to improve initial page load performance.
 */

/**
 * Generate a comparison chart for rent-to-own cost analysis
 * 
 * @param {Object} config - Configuration options
 * @param {HTMLElement} config.container - Container element to render the chart
 * @param {number} config.purchasePrice - One-time purchase price
 * @param {number} config.totalRental - Total cost over rental period
 * @param {number} config.term - Rental term in months
 * @param {number} config.monthlyRate - Monthly payment amount
 * @returns {Promise<void>}
 */
export async function generateComparisonChart(config) {
    const { container, purchasePrice, totalRental, term, monthlyRate } = config;
    
    if (!container || typeof purchasePrice !== 'number' || typeof term !== 'number' || typeof monthlyRate !== 'number') {
        throw new Error('Invalid chart configuration');
    }
    
    // Calculate for visualization with point coordinates
    const buyOutPoints = [];
    
    // Generate monthly data points
    for (let month = 1; month <= term; month++) {
        const paidSoFar = month * monthlyRate;
        const remainingToPay = Math.max(0, totalRental - paidSoFar);
        
        buyOutPoints.push({
            month: month,
            totalPaid: paidSoFar,
            buyoutAmount: remainingToPay,
            cumulativeTotal: paidSoFar + remainingToPay
        });
    }
    
    // Create chart container
    container.innerHTML = '';
    
    // Create canvas for chart
    const canvas = document.createElement('canvas');
    canvas.id = 'costComparisonChart';
    container.appendChild(canvas);
    
    // Initialize chart
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: buyOutPoints.map(point => `Month ${point.month}`),
            datasets: [
                {
                    label: 'Purchase Price',
                    data: buyOutPoints.map(() => purchasePrice),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: 'Amount Paid',
                    data: buyOutPoints.map(point => point.totalPaid),
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Buyout Amount',
                    data: buyOutPoints.map(point => point.buyoutAmount),
                    borderColor: '#fd7e14',
                    backgroundColor: 'rgba(253, 126, 20, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.1
                },
                {
                    label: 'Total Cost (Paid + Buyout)',
                    data: buyOutPoints.map(point => point.cumulativeTotal),
                    borderColor: '#6f42c1',
                    backgroundColor: 'rgba(111, 66, 193, 0.1)',
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Cost Comparison Over Time',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'USD' 
                            }).format(context.raw);
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
    
    // Add chart description
    const chartDescription = document.createElement('div');
    chartDescription.className = 'chart-description';
    chartDescription.innerHTML = `
        <p>This chart shows:
            <ul>
                <li><span class="color-dot purchase"></span> <strong>Purchase Price</strong>: One-time upfront cost to buy the item ($${purchasePrice.toFixed(2)})</li>
                <li><span class="color-dot paid"></span> <strong>Amount Paid</strong>: Your cumulative rental payments over time</li>
                <li><span class="color-dot buyout"></span> <strong>Buyout Amount</strong>: The remaining amount to pay if you decide to buy the item at that month</li>
                <li><span class="color-dot total"></span> <strong>Total Cost</strong>: The total you would pay if you buy out at that month (Amount Paid + Buyout Amount)</li>
            </ul>
        </p>
    `;
    container.appendChild(chartDescription);
    
    return Promise.resolve();
}

/**
 * Create a pie chart showing cost breakdown
 * 
 * @param {Object} config - Configuration options
 * @param {HTMLElement} config.container - Container element to render the chart
 * @param {number} config.purchasePrice - One-time purchase price
 * @param {number} config.totalRental - Total cost over rental period
 * @returns {Promise<void>}
 */
export async function generateCostBreakdownChart(config) {
    const { container, purchasePrice, totalRental } = config;
    
    if (!container || typeof purchasePrice !== 'number' || typeof totalRental !== 'number') {
        throw new Error('Invalid chart configuration');
    }
    
    // Calculate rental premium
    const premium = totalRental - purchasePrice;
    const premiumPercentage = ((premium / purchasePrice) * 100).toFixed(1);
    
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'cost-breakdown-chart';
    chartContainer.style.height = '250px';
    
    // Create canvas for chart
    const canvas = document.createElement('canvas');
    canvas.id = 'costBreakdownChart';
    chartContainer.appendChild(canvas);
    
    container.appendChild(chartContainer);
    
    // Initialize chart
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Purchase Price', 'Rental Premium'],
            datasets: [{
                data: [purchasePrice, premium],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(253, 126, 20, 0.7)'
                ],
                borderColor: [
                    'rgb(40, 167, 69)',
                    'rgb(253, 126, 20)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'USD' 
                            }).format(context.raw);
                            return label;
                        }
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Add explanation text
    const explanationText = document.createElement('div');
    explanationText.className = 'breakdown-explanation';
    explanationText.innerHTML = `
        <p>The rental premium of <strong>$${premium.toFixed(2)}</strong> represents 
        a <strong>${premiumPercentage}%</strong> increase over the purchase price,
        which covers our warranty service, risk, and financing costs.</p>
    `;
    container.appendChild(explanationText);
    
    return Promise.resolve();
}

/**
 * Create an amortization schedule chart showing payment distribution
 * 
 * @param {Object} config - Configuration options
 * @param {HTMLElement} config.container - Container element to render the chart
 * @param {number} config.monthlyRate - Monthly payment amount
 * @param {number} config.term - Rental term in months
 * @returns {Promise<void>}
 */
export async function generateAmortizationChart(config) {
    const { container, monthlyRate, term } = config;
    
    if (!container || typeof monthlyRate !== 'number' || typeof term !== 'number') {
        throw new Error('Invalid chart configuration');
    }
    
    // Create table for amortization schedule
    const tableContainer = document.createElement('div');
    tableContainer.className = 'amortization-schedule';
    
    // Create table header
    const table = document.createElement('table');
    table.className = 'amortization-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Month</th>
                <th>Payment</th>
                <th>Total Paid</th>
                <th>Ownership Progress</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    // Generate monthly data
    for (let month = 1; month <= Math.min(term, 12); month++) {
        const totalPaid = month * monthlyRate;
        const progress = (month / term) * 100;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${month}</td>
            <td>$${monthlyRate.toFixed(2)}</td>
            <td>$${totalPaid.toFixed(2)}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${progress.toFixed(1)}%</span>
            </td>
        `;
        
        tbody.appendChild(row);
    }
    
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);
    
    return Promise.resolve();
}
