// Counselor Definitions
const counselors = {
    delulu: {
        name: 'Delulu 💛',
        avatar: '✨',
        role: 'The Romantic Idealist',
        key: 'delulu'
    },
    normal: {
        name: 'Normal 💗',
        avatar: '🧠',
        role: 'The Rational Advisor',
        key: 'normal'
    },
    mysterious: {
        name: 'Mysterious 💜',
        avatar: '🔮',
        role: 'The Enigmatic Sage',
        key: 'mysterious'
    }
};

// DOM Elements
const situationInput = document.getElementById('situationInput');
const charCount = document.getElementById('charCount');
const submitBtn = document.getElementById('submitBtn');
const counselorsContainer = document.getElementById('counselorsContainer');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');

// Event Listeners
situationInput.addEventListener('input', updateCharCount);
submitBtn.addEventListener('click', getCounsel);

function updateCharCount() {
    charCount.textContent = situationInput.value.length;
}

async function getCounsel() {
    const situation = situationInput.value.trim();

    if (!situation) {
        showError('Please share your dating situation first!');
        return;
    }

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    counselorsContainer.innerHTML = '';

    try {
        const responses = await Promise.all([
            fetchCounselorResponse('delulu', situation),
            fetchCounselorResponse('normal', situation),
            fetchCounselorResponse('mysterious', situation)
        ]);

        Object.entries(counselors).forEach((entry, index) => {
            const [key, counselor] = entry;
            displayCounselorCard(key, counselor, responses[index]);
        });

    } catch (error) {
        console.error('Error:', error);
        showError(`❌ ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

async function fetchCounselorResponse(counselorKey, situation) {
    try {
        const response = await fetch('/api/counsel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                counselorKey: counselorKey,
                situation: situation
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error(`Error for ${counselorKey}:`, error);
        throw error;
    }
}

function displayCounselorCard(key, counselor, response) {
    const card = document.createElement('div');
    card.className = `counselor-card ${key}`;
    
    card.innerHTML = `
        <div class="counselor-header">
            <div class="counselor-avatar">${counselor.avatar}</div>
            <div>
                <div class="counselor-name">${counselor.name}</div>
                <div class="counselor-role">${counselor.role}</div>
            </div>
        </div>
        <div class="counselor-response">${response}</div>
    `;

    counselorsContainer.appendChild(card);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    counselorsContainer.appendChild(errorDiv);
}
