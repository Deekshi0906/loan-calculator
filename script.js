// DOM Elements
const principalInput = document.getElementById('principal');
const principalRange = document.getElementById('principalRange');
const interestRateInput = document.getElementById('interestRate');
const interestRateRange = document.getElementById('interestRateRange');
const tenureInput = document.getElementById('tenure');
const tenureRange = document.getElementById('tenureRange');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');

// Result Elements
const emiValue = document.getElementById('emiValue');
const totalInterest = document.getElementById('totalInterest');
const totalPayment = document.getElementById('totalPayment');
const loanTenure = document.getElementById('loanTenure');
const amortizationBody = document.getElementById('amortizationBody');

// Chart variable
let paymentChart = null;

// Initialize event listeners
function initializeEventListeners() {
    // Input and range synchronization
    principalInput.addEventListener('input', () => syncInputWithRange(principalInput, principalRange));
    principalRange.addEventListener('input', () => syncRangeWithInput(principalRange, principalInput));
    
    interestRateInput.addEventListener('input', () => syncInputWithRange(interestRateInput, interestRateRange));
    interestRateRange.addEventListener('input', () => syncRangeWithInput(interestRateRange, interestRateInput));
    
    tenureInput.addEventListener('input', () => syncInputWithRange(tenureInput, tenureRange));
    tenureRange.addEventListener('input', () => syncRangeWithInput(tenureRange, tenureInput));
    
    // Calculate and reset buttons
    calculateBtn.addEventListener('click', calculateEMI);
    resetBtn.addEventListener('click', resetCalculator);
    
    // Calculate on page load with default values
    calculateEMI();
}

// Sync input field with range slider
function syncInputWithRange(input, range) {
    range.value = input.value;
    calculateEMI();
}

// Sync range slider with input field
function syncRangeWithInput(range, input) {
    input.value = range.value;
    calculateEMI();
}

// Calculate EMI using the formula
function calculateEMI() {
    const principal = parseFloat(principalInput.value);
    const annualInterestRate = parseFloat(interestRateInput.value);
    const years = parseInt(tenureInput.value);
    
    // Validate inputs
    if (isNaN(principal) || isNaN(annualInterestRate) || isNaN(years) || 
        principal <= 0 || annualInterestRate < 0 || years <= 0) {
        showError('Please enter valid positive numbers for all fields');
        return;
    }
    
    // Convert annual rate to monthly and percentage to decimal
    const monthlyInterestRate = (annualInterestRate / 12) / 100;
    
    // Convert years to months
    const months = years * 12;
    
    let emi;
    if (monthlyInterestRate === 0) {
        // Handle zero interest case
        emi = principal / months;
    } else {
        // Standard EMI formula: EMI = [P * R * (1+R)^N] / [(1+R)^N - 1]
        const numerator = principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months);
        const denominator = Math.pow(1 + monthlyInterestRate, months) - 1;
        emi = numerator / denominator;
    }
    
    // Calculate totals
    const totalPaymentAmount = emi * months;
    const totalInterestAmount = totalPaymentAmount - principal;
    
    // Display results
    displayResults(emi, totalInterestAmount, totalPaymentAmount, months);
    
    // Generate amortization schedule
    generateAmortizationSchedule(principal, monthlyInterestRate, months, emi);
    
    // Create chart
    createPaymentChart(principal, totalInterestAmount);
}

// Display calculated results
function displayResults(emi, totalInterest, totalPayment, months) {
    emiValue.textContent = `₹ ${emi.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    totalInterest.textContent = `₹ ${totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    totalPayment.textContent = `₹ ${totalPayment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    loanTenure.textContent = `${months} Months`;
}

// Generate amortization schedule for first 12 months
function generateAmortizationSchedule(principal, monthlyRate, months, emi) {
    let balance = principal;
    let scheduleHTML = '';
    
    for (let month = 1; month <= Math.min(12, months); month++) {
        const interestComponent = balance * monthlyRate;
        const principalComponent = emi - interestComponent;
        balance -= principalComponent;
        
        // Ensure balance doesn't go negative
        const finalBalance = Math.max(0, balance);
        
        scheduleHTML += `
            <tr>
                <td>${month}</td>
                <td>₹ ${emi.toFixed(2)}</td>
                <td>₹ ${principalComponent.toFixed(2)}</td>
                <td>₹ ${interestComponent.toFixed(2)}</td>
                <td>₹ ${finalBalance.toFixed(2)}</td>
            </tr>
        `;
    }
    
    amortizationBody.innerHTML = scheduleHTML;
}

// Create payment breakdown chart
function createPaymentChart(principal, totalInterest) {
    const ctx = document.getElementById('paymentChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (paymentChart) {
        paymentChart.destroy();
    }
    
    paymentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal Amount', 'Total Interest'],
            datasets: [{
                data: [principal, totalInterest],
                backgroundColor: ['#667eea', '#764ba2'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `₹ ${value.toLocaleString('en-IN')} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Show error message
function showError(message) {
    alert(`Error: ${message}`);
}

// Reset calculator to default values
function resetCalculator() {
    principalInput.value = '500000';
    principalRange.value = '500000';
    interestRateInput.value = '8.5';
    interestRateRange.value = '8.5';
    tenureInput.value = '20';
    tenureRange.value = '20';
    
    calculateEMI();
}

// Format number with Indian comma system
function formatIndianNumber(number) {
    return number.toLocaleString('en-IN');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});