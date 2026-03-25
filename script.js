// ===========================
// STATE MANAGEMENT
// ===========================

// Array to store all project phases
let phases = [];

// Settings
let settings = {
    platformFee: 10,
    hoursPerDay: 8
};

// ===========================
// DOM ELEMENTS
// ===========================

const phaseForm = document.getElementById('phaseForm');
const phaseNameInput = document.getElementById('phaseName');
const hoursInput = document.getElementById('hours');
const rateInput = document.getElementById('rate');
const platformFeeInput = document.getElementById('platformFee');
const hoursPerDayInput = document.getElementById('hoursPerDay');
const phasesList = document.getElementById('phasesList');
const errorMessage = document.getElementById('errorMessage');
const totalHours = document.getElementById('totalHours');
const totalCost = document.getElementById('totalCost');
const totalFee = document.getElementById('totalFee');
const finalEarnings = document.getElementById('finalEarnings');
const estimatedDays = document.getElementById('estimatedDays');
const estimatedWeeks = document.getElementById('estimatedWeeks');
const clearAllBtn = document.getElementById('clearAllBtn');

// ===========================
// INITIALIZATION
// ===========================

// Load data when page loads
window.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderPhases();
    calculateTotals();
    updateSettings();
});

// ===========================
// EVENT LISTENERS
// ===========================

// Form submission
phaseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addPhase();
});

// Settings inputs
platformFeeInput.addEventListener('change', () => {
    updateSettings();
    calculateTotals();
});

hoursPerDayInput.addEventListener('change', () => {
    updateSettings();
    calculateTotals();
});

// Clear all button
clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure? This will delete all phases and settings.')) {
        clearAllData();
    }
});

// ===========================
// MAIN FUNCTIONS
// ===========================

/**
 * Add a new phase to the phases array
 */
function addPhase() {
    // Get input values
    const name = phaseNameInput.value.trim();
    const hours = parseFloat(hoursInput.value);
    const rate = parseFloat(rateInput.value);

    // Validation
    if (!validateInputs(name, hours, rate)) {
        return;
    }

    // Clear error message if valid
    clearErrorMessage();

    // Create phase object
    const phase = {
        id: generateUniqueId(),
        name: name,
        hours: hours,
        rate: rate
    };

    // Add to phases array
    phases.push(phase);

    // Save to localStorage
    saveToLocalStorage();

    // Update UI
    renderPhases();
    calculateTotals();

    // Reset form
    phaseForm.reset();
    phaseNameInput.focus();
}

/**
 * Delete a phase by ID
 */
function deletePhase(id) {
    if (confirm('Delete this phase?')) {
        phases = phases.filter(phase => phase.id !== id);
        saveToLocalStorage();
        renderPhases();
        calculateTotals();
    }
}

/**
 * Edit a phase by ID
 */
function editPhase(id) {
    const phase = phases.find(p => p.id === id);

    if (!phase) return;

    // Populate form with current values
    phaseNameInput.value = phase.name;
    hoursInput.value = phase.hours;
    rateInput.value = phase.rate;

    // Delete the phase
    deletePhase(id);

    // Focus on form
    phaseNameInput.focus();
}

/**
 * Render all phases in the UI
 */
function renderPhases() {
    // Clear the list
    phasesList.innerHTML = '';

    // Check if phases exist
    if (phases.length === 0) {
        phasesList.innerHTML = '<p class="empty-state">No phases added yet. Add a phase to get started!</p>';
        return;
    }

    // Create cards for each phase
    phases.forEach(phase => {
        const phaseCost = phase.hours * phase.rate;
        const phaseCard = document.createElement('div');
        phaseCard.className = 'phase-card';
        phaseCard.innerHTML = `
            <div class="phase-header">
                <h3 class="phase-name">${escapeHtml(phase.name)}</h3>
                <span class="phase-badge">#${phase.id}</span>
            </div>
            
            <div class="phase-details">
                <div class="phase-detail">
                    <span class="phase-detail-label">Hours</span>
                    <span class="phase-detail-value">${formatNumber(phase.hours)}</span>
                </div>
                <div class="phase-detail">
                    <span class="phase-detail-label">Rate</span>
                    <span class="phase-detail-value">${formatCurrency(phase.rate)}/hr</span>
                </div>
            </div>

            <div class="phase-cost">
                ${formatCurrency(phaseCost)}
            </div>

            <div class="phase-actions">
                <button class="btn btn-secondary" onclick="editPhase(${phase.id})"><i class="fas fa-pencil"></i> Edit</button>
                <button class="btn btn-danger" onclick="deletePhase(${phase.id})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;

        phasesList.appendChild(phaseCard);
    });
}

/**
 * Calculate and update all totals
 */
function calculateTotals() {
    // Calculate total hours
    let totalHoursValue = 0;
    phases.forEach(phase => {
        totalHoursValue += phase.hours;
    });

    // Calculate total cost
    let totalCostValue = 0;
    phases.forEach(phase => {
        totalCostValue += phase.hours * phase.rate;
    });

    // Calculate platform fee
    const feePercentage = parseFloat(platformFeeInput.value) || 0;
    const feeAmount = (totalCostValue * feePercentage) / 100;

    // Calculate final earnings
    const finalEarningsValue = totalCostValue - feeAmount;

    // Calculate timeline
    const hoursPerDay = parseFloat(hoursPerDayInput.value) || 8;
    const estimatedDaysValue = hoursPerDay > 0 ? Math.ceil(totalHoursValue / hoursPerDay) : 0;
    const estimatedWeeksValue = Math.ceil(estimatedDaysValue / 7);

    // Update DOM
    totalHours.textContent = formatNumber(totalHoursValue);
    totalCost.textContent = formatCurrency(totalCostValue);
    totalFee.textContent = formatCurrency(feeAmount);
    finalEarnings.textContent = formatCurrency(finalEarningsValue);
    estimatedDays.textContent = formatNumber(estimatedDaysValue);
    estimatedWeeks.textContent = formatNumber(estimatedWeeksValue);
}

/**
 * Update settings from input values
 */
function updateSettings() {
    settings.platformFee = parseFloat(platformFeeInput.value) || 0;
    settings.hoursPerDay = parseFloat(hoursPerDayInput.value) || 8;
    saveToLocalStorage();
}

/**
 * Save data to localStorage
 */
function saveToLocalStorage() {
    const data = {
        phases: phases,
        settings: settings
    };
    localStorage.setItem('projectEstimatorData', JSON.stringify(data));
}

/**
 * Load data from localStorage
 */
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('projectEstimatorData');

    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            phases = data.phases || [];
            settings = data.settings || { platformFee: 10, hoursPerDay: 8 };

            // Restore input values
            platformFeeInput.value = settings.platformFee;
            hoursPerDayInput.value = settings.hoursPerDay;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
}

/**
 * Clear all data
 */
function clearAllData() {
    phases = [];
    settings = { platformFee: 10, hoursPerDay: 8 };

    // Reset inputs
    phaseForm.reset();
    platformFeeInput.value = 10;
    hoursPerDayInput.value = 8;

    // Update UI
    saveToLocalStorage();
    renderPhases();
    calculateTotals();
    clearErrorMessage();
}

// ===========================
// VALIDATION FUNCTIONS
// ===========================

/**
 * Validate input values
 */
function validateInputs(name, hours, rate) {
    let errors = [];

    // Validate name
    if (!name || name.length === 0) {
        errors.push('Phase name is required');
    }
    if (name.length > 50) {
        errors.push('Phase name must be 50 characters or less');
    }

    // Validate hours
    if (isNaN(hours) || hours <= 0) {
        errors.push('Hours must be a positive number');
    }
    if (hours > 10000) {
        errors.push('Hours cannot exceed 10,000');
    }

    // Validate rate
    if (isNaN(rate) || rate <= 0) {
        errors.push('Rate must be a positive number');
    }
    if (rate > 100000) {
        errors.push('Rate cannot exceed ₦100,000');
    }

    // Show errors if any
    if (errors.length > 0) {
        showErrorMessage(errors.join(' • '));
        return false;
    }

    return true;
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    errorMessage.innerHTML = '<i class="fas fa-triangle-exclamation"></i> ' + message;
    errorMessage.classList.add('show');
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Clear error message
 */
function clearErrorMessage() {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Generate unique ID with timestamp and random number
 */
function generateUniqueId() {
    return Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 10000);
}

/**
 * Format number with proper decimal places
 */
function formatNumber(num) {
    const number = parseFloat(num);

    // If it's a whole number or very close to it
    if (Number.isInteger(number)) {
        return number.toString();
    }

    // Otherwise show decimals
    return number.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

/**
 * Format currency with ₦ (Naira) sign and proper decimals
 */
function formatCurrency(num) {
    const number = parseFloat(num) || 0;
    return '₦' + number.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===========================
// CONSOLE LOG FOR DEBUGGING
// ===========================

console.log('✅ Freelance Project Estimator loaded successfully!');
console.log('📊 Ready to track your projects and earnings.');
