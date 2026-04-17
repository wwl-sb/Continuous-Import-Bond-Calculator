// Store calculated duties globally for use in insufficiency calculation
window.calculatedDuties = 0;

function calculateBond() {
    let annualDuties = 0;
    const dutyInput = document.querySelector('input[name="dutyInput"]:checked').value;

    if (dutyInput === 'rate') {
        const annualValue = parseFloat(document.getElementById('annualValue').value) || 0;
        const dutyRate = parseFloat(document.getElementById('dutyRate').value) || 0;

        if (annualValue <= 0) {
            alert('Please enter a valid annual import value.');
            return;
        }

        annualDuties = annualValue * (dutyRate / 100);
    } else {
        annualDuties = parseFloat(document.getElementById('dutyRate').value) || 0;

        if (annualDuties <= 0) {
            alert('Please enter estimated anticipated duties.');
            return;
        }
    }

    // Calculate minimum bond: 10% of annual duties, minimum $50,000
    let minimumBond = annualDuties * 0.10;
    minimumBond = Math.max(minimumBond, 50000);

    // Display results
    if (dutyInput === 'rate') {
        const annualValue = parseFloat(document.getElementById('annualValue').value) || 0;
        document.getElementById('displayAnnualValue').textContent =
            '$' + annualValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
        document.getElementById('displayAnnualValue').textContent = 'See anticipated duties below';
    }

    document.getElementById('displayAnnualDuties').textContent =
        '$' + annualDuties.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('displayBondAmount').textContent =
        '$' + minimumBond.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    document.getElementById('results').style.display = 'block';
    document.getElementById('insufficiencySection').style.display = 'none';

    // Store for insufficiency calc
    window.calculatedDuties = annualDuties;
}

function resetForm() {
    document.getElementById('annualValue').value = '';
    document.getElementById('dutyRate').value = '5';
    document.getElementById('results').style.display = 'none';
}

function toggleInsufficientBondSection() {
    const section = document.getElementById('insufficiencySection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';

    if (section.style.display === 'block') {
        setTimeout(() => section.scrollIntoView({ behavior: 'smooth' }), 100);
    }
}

function calculateInsufficientBond() {
    const currentBond = parseFloat(document.getElementById('currentBondAmount').value) || 0;
    const anniversaryDate = document.getElementById('bondAnniversaryDate').value;
    const bondSaturation = parseFloat(document.getElementById('bondSaturation').value) || 0;

    if (!currentBond || currentBond <= 0) {
        alert('Please enter your current bond amount.');
        return;
    }

    if (!anniversaryDate || !anniversaryDate.match(/^\d{2}\/\d{2}$/)) {
        alert('Please enter bond anniversary date in MM/DD format.');
        return;
    }

    const anticipatedDutiesDuring12Months = window.calculatedDuties || 0;

    if (anticipatedDutiesDuring12Months <= 0) {
        alert('Please calculate initial bond first to determine anticipated duties.');
        return;
    }

    const availableBond = currentBond * ((100 - bondSaturation) / 100);
    const requiredBond = Math.max(anticipatedDutiesDuring12Months * 0.10, 50000);
    const shortfall = Math.max(requiredBond - availableBond, 0);
    const newTotalBond = currentBond + shortfall;

    const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>Bond Insufficiency Calculation Results</h2>
        <div class="result-item">
            <div class="result-label">Current Bond Amount</div>
            <div class="result-value">${fmt(currentBond)}</div>
        </div>
        <div class="result-item">
            <div class="result-label">Bond Saturation (Used/Claimed)</div>
            <div class="result-value">${bondSaturation.toFixed(1)}%</div>
        </div>
        <div class="result-item">
            <div class="result-label">Available Bond Remaining</div>
            <div class="result-value">${fmt(availableBond)}</div>
        </div>
        <div class="result-item">
            <div class="result-label">Anticipated Duties During Next 12 Months</div>
            <div class="result-value">${fmt(anticipatedDutiesDuring12Months)}</div>
        </div>
        <div class="result-item">
            <div class="result-label">Required Bond (10% of anticipated duties, minimum $50,000)</div>
            <div class="result-value">${fmt(requiredBond)}</div>
        </div>
        <div class="result-item">
            <div class="result-label">Bond Shortfall</div>
            <div class="result-value">${fmt(shortfall)}</div>
        </div>
        <div class="result-item" style="border-bottom: none;">
            <div class="result-label" style="font-size: 1rem; opacity: 1; font-weight: 700;">
                ⚡ New Total Bond Amount Required
            </div>
            <div class="result-value">${fmt(newTotalBond)}</div>
        </div>
        <div class="note">
            <strong>Action Required:</strong> You will need to increase your continuous import bond by ${fmt(shortfall)}
            to maintain compliance with CBP requirements. Contact your surety or customs broker immediately.
        </div>
    `;
    resultsDiv.style.display = 'block';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {

    // Toggle duty input mode
    document.querySelectorAll('input[name="dutyInput"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const dutyRateLabel = document.getElementById('dutyRateLabel');
            const dutyRateSmall = document.getElementById('dutyRateSmall');
            const dutyRatePercent = document.getElementById('dutyRatePercent');
            const dutyRateInput = document.getElementById('dutyRate');

            if (this.value === 'anticipated') {
                dutyRateLabel.textContent = 'Estimated Duty for Next 12 Months*';
                dutyRateSmall.textContent = 'Total duties anticipated to be owed during the next 12 months';
                dutyRatePercent.textContent = '$';
                dutyRateInput.placeholder = '50,000';
                dutyRateInput.step = '100';
                dutyRateInput.removeAttribute('max');
            } else {
                dutyRateLabel.textContent = 'Estimated Duty Rate';
                dutyRateSmall.textContent = 'Average duty rate on imported goods';
                dutyRatePercent.textContent = '%';
                dutyRateInput.placeholder = '5';
                dutyRateInput.step = '0.1';
                dutyRateInput.value = '5';
                dutyRateInput.max = '100';
            }

            if (document.getElementById('annualValue').value) calculateBond();
        });
    });

    // Real-time calculation
    document.getElementById('annualValue').addEventListener('input', function () {
        if (this.value) calculateBond();
    });

    document.getElementById('dutyRate').addEventListener('input', function () {
        if (document.getElementById('annualValue').value) calculateBond();
    });

    // Enter key handling
    document.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            if (document.getElementById('insufficiencySection').style.display === 'block') {
                calculateInsufficientBond();
            } else {
                calculateBond();
            }
        }
    });
});
