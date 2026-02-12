// Configuration - Get API key from window or environment
const API_KEY = window.VITE_GROQ_API_KEY || import.meta.env?.VITE_GROQ_API_KEY;

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Counselor Definitions
const counselors = {
    delulu: {
        name: 'Delulu 💛',
        avatar: '✨',
        role: 'The Romantic Idealist',
        systemPrompt: `You are Delulu, an overly romantic and delusional dating counselor. You always see the best in every situation and believe everyone will fall in love. Give short, enthusiastic, and unrealistically optimistic advice (2-3 sentences). Use lots of emojis. Act like everything is a fairy tale.`
    },
    normal: {
        name: 'Normal 💗',
        avatar: '🧠',
        role: 'The Rational Advisor',
        systemPrompt: `You are Normal, a practical and grounded dating counselor who gives sensible, mature advice. Be realistic about dating situations. Provide balanced, thoughtful guidance (2-3 sentences). Be honest but kind. Avoid being preachy.`
    },
    mysterious: {
        name: 'Mysterious 💜',
        avatar: '🔮',
        role: 'The Enigmatic Sage',
        systemPrompt: `You are Mysterious, a vague and cryptic dating counselor. Speak in riddles, metaphors, and abstract wisdom. Your advice should be poetic but confusing (2-3 sentences). Never give direct answers. Use philosophical language.`
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

    if (!API_KEY) {
        showError('❌ API key not found. Make sure VITE_GROQ_API_KEY is set in Vercel environment variables.');
        console.error('API_KEY:', API_KEY);
        console.error('import.meta.env:', import.meta.env);
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
    const counselor = counselors[counselorKey];

    const requestBody = {
        model: 'mixtral-8x7b-32768',
        messages: [
            {
                role: 'system',
                content: counselor.systemPrompt
            },
            {
                role: 'user',
                content: `Here's my dating situation: ${situation}`
            }
        ],
        max_tokens: 200,
        temperature: 0.8
    };

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
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
