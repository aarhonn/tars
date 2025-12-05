const API_KEY = "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"
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b";
const COOL_GUY = "AARHON"
const chatEl = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const newChatBtn = document.querySelector(".new-chat");


let systemPrompt = "";
let userSettings = {
    interests: "Replace this with what you want The Thinker to know about you...",
};


function loadUserSettings() {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
        userSettings = JSON.parse(savedSettings);
        updateSettingsForm();
    }
}


function saveUserSettings() {
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    updateSystemPrompt();
}


function updateSystemPrompt() {
    fetch("./prompt.txt")
        .then(res => res.text())
        .then(text => {
            const basePrompt = text.trim();
            const userContext = `Additional context about the user:\nName: ${userSettings.name}\n${userSettings.age ? 'Age: ' + userSettings.age + '\n' : ''}${userSettings.interests ? 'Interests: ' + userSettings.interests + '\n' : ''}${userSettings.background ? 'Background: ' + userSettings.background + '\n' : ''}${userSettings.preferences ? 'Preferences: ' + userSettings.preferences + '\n' : ''}`;
            systemPrompt = `${basePrompt}\n\n${userContext}`;
        })
        .catch(err => {
            console.error("Error loading prompt:", err);
        });
}


function updateSettingsForm() {
    document.getElementById('settingsName').value = userSettings.name || '';
    document.getElementById('settingsAge').value = userSettings.age || '';
    document.getElementById('settingsInterests').value = userSettings.interests || '';
    document.getElementById('settingsBackground').value = userSettings.background || '';
    document.getElementById('settingsPreferences').value = userSettings.preferences || '';
}

function handleSettingsSubmit(e) {
    e.preventDefault();
    userSettings = {
        name: document.getElementById('settingsName').value,
        age: document.getElementById('settingsAge').value,
        interests: document.getElementById('settingsInterests').value,
        background: document.getElementById('settingsBackground').value,
        preferences: document.getElementById('settingsPreferences').value
    };
    saveUserSettings();
    settingsModal.style.display = "none";
}


const typingIndicator = document.createElement('div');
typingIndicator.className = 'typing-indicator';
typingIndicator.innerHTML = `
    <div class="typing-content">
        <div class="avatar">AI</div>
        <div style="display: flex; gap: 4px; align-items: center;">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    </div>
`;

function showTypingIndicator() {
    chatEl.appendChild(typingIndicator);
    typingIndicator.offsetHeight;
    typingIndicator.classList.add('visible');
    chatEl.scrollTop = chatEl.scrollHeight;
}

function hideTypingIndicator() {
    typingIndicator.classList.remove('visible');
    setTimeout(() => {
        if (typingIndicator.parentNode === chatEl) {
            chatEl.removeChild(typingIndicator);
        }
    }, 300);
}

function formatMessage(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    return text;
}


function initializeChat() {
    loadUserSettings();
    updateSystemPrompt();
    appendMessage("ai", "Hello! Nice to meet you. I'm The Thinker. What's on your mind?");
}

function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    
    const content = document.createElement("div");
    content.className = "message-content";
    
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "AT" : "AI";
    
    const messageText = document.createElement("div");
    messageText.className = "message-text";
    messageText.innerHTML = formatMessage(text);
    
    content.appendChild(avatar);
    content.appendChild(messageText);
    div.appendChild(content);
    
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    
    appendMessage("user", text);
    userInput.value = "";
    userInput.style.height = "auto";
    
    showTypingIndicator();
    
    try {
        const res = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ]
            })
        });

        if (!res.ok) {
            throw new Error(await res.text());
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || "(no response)";
        
        hideTypingIndicator();
        appendMessage("ai", reply);
    } catch (err) {
        hideTypingIndicator();
        appendMessage("ai", "Error: " + err.message);
    }
}


document.querySelector('.input-form').addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

userInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

userInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
});


newChatBtn.addEventListener('click', () => {
    chatEl.innerHTML = '';
    initializeChat();
});


settingsBtn?.addEventListener('click', () => {
    settingsModal.style.display = "flex";
});


initializeChat();


//This is code for an AI made by Aaron Tibbitts. Groq barely used at all, and AI hosted on Aaron's PC.
