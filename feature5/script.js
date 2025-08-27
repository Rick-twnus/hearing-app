class HearingAssistantApp {
    constructor() {
        this.isListening = false;
        this.isConnected = false;
        this.messages = [];
        this.recognition = null;
        
        this.initElements();
        this.initSpeechRecognition();
        this.bindEvents();
    }
    
    initElements() {
        this.statusIndicator = document.getElementById('statusIndicator');
        this.connectionBtn = document.getElementById('connectionBtn');
        this.connectionIcon = document.getElementById('connectionIcon');
        this.connectionText = document.getElementById('connectionText');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messagesList = document.getElementById('messagesList');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.controlsSection = document.getElementById('controlsSection');
        this.textInput = document.getElementById('textInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.voiceIcon = document.getElementById('voiceIcon');
        this.voiceText = document.getElementById('voiceText');
    }
    
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognitionClass = window.webkitSpeechRecognition || window.SpeechRecognition;
            this.recognition = new SpeechRecognitionClass();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'zh-TW';
            
            this.recognition.onresult = (event) => {
                const last = event.results.length - 1;
                const text = event.results[last][0].transcript;
                
                if (event.results[last].isFinal) {
                    this.addMessage(text, 'incoming');
                    this.hideTypingIndicator();
                } else {
                    this.showTypingIndicator();
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopListening();
            };
        }
    }
    
    bindEvents() {
        this.connectionBtn.addEventListener('click', () => this.toggleConnection());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.voiceBtn.addEventListener('click', () => this.toggleListening());
        
        this.textInput.addEventListener('input', () => {
            this.sendBtn.disabled = !this.textInput.value.trim();
        });
        
        this.textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }
    
    toggleConnection() {
        this.isConnected = !this.isConnected;
        
        if (this.isConnected) {
            this.startConnection();
        } else {
            this.endConnection();
        }
    }
    
    startConnection() {
        this.statusIndicator.classList.add('connected');
        this.connectionBtn.classList.add('connected');
        this.connectionText.textContent = '結束通話';
        this.connectionIcon.innerHTML = `
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            <line x1="18.5" y1="5.5" x2="5.5" y2="18.5"></line>
        `;
        
        this.controlsSection.classList.remove('hidden');
        this.addMessage('通話已連接，開始對話...', 'incoming');
    }
    
    endConnection() {
        this.statusIndicator.classList.remove('connected');
        this.connectionBtn.classList.remove('connected');
        this.connectionText.textContent = '開始通話';
        this.connectionIcon.innerHTML = `
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        `;
        
        this.controlsSection.classList.add('hidden');
        this.addMessage('通話已結束', 'incoming');
        
        if (this.isListening) {
            this.stopListening();
        }
    }
    
    toggleListening() {
        if (!this.recognition) {
            alert('您的瀏覽器不支持語音識別功能');
            return;
        }
        
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    startListening() {
        try {
            this.recognition.start();
            this.isListening = true;
            this.voiceBtn.classList.add('listening');
            this.voiceText.textContent = '停止聽取';
            this.voiceIcon.innerHTML = `
                <path d="m12 1-3 3-3-3 3-3 3 3z"></path>
                <path d="M12 8c3.866 0 7 3.134 7 7s-3.134 7-7 7-7-3.134-7-7 3.134-7 7-7z"></path>
                <line x1="18.5" y1="5.5" x2="5.5" y2="18.5"></line>
            `;
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            alert('無法啟動語音識別，請檢查麥克風權限');
        }
    }
    
    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.voiceBtn.classList.remove('listening');
        this.voiceText.textContent = '開始聽取對方說話';
        this.voiceIcon.innerHTML = `
            <path d="m12 1-3 3-3-3 3-3 3 3z"></path>
            <path d="M12 8c3.866 0 7 3.134 7 7s-3.134 7-7 7-7-3.134-7-7 3.134-7 7-7z"></path>
        `;
        this.hideTypingIndicator();
    }
    
    sendMessage() {
        const text = this.textInput.value.trim();
        if (!text) return;
        
        this.addMessage(text, 'outgoing');
        this.speakText(text);
        this.textInput.value = '';
        this.sendBtn.disabled = true;
    }
    
    speakText(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-TW';
            speechSynthesis.speak(utterance);
        }
    }
    
    addMessage(text, type) {
        const message = {
            id: Date.now().toString(),
            text: text,
            type: type,
            timestamp: new Date()
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }
    
    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message-wrapper ${message.type}`;
        
        const timeString = message.timestamp.toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const iconSvg = message.type === 'incoming' ? 
            `<svg class="volume-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="m19.07 4.93-1.41 1.41A5 5 0 0 1 19 12a5 5 0 0 1-1.34 3.66l1.41 1.41A7 7 0 0 0 21 12a7 7 0 0 0-1.93-4.93zM15.54 8.46a3 3 0 0 1 0 7.08l1.41 1.41a5 5 0 0 0 0-9.9l-1.41 1.41z"></path>
            </svg>` :
            `<svg class="send-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
            </svg>`;
        
        messageElement.innerHTML = `
            <div class="message-card ${message.type}">
                <div class="message-content">
                    ${message.type === 'incoming' ? iconSvg : ''}
                    <div style="flex: 1;">
                        <div class="message-text">${this.escapeHtml(message.text)}</div>
                        <span class="message-time">${timeString}</span>
                    </div>
                    ${message.type === 'outgoing' ? iconSvg : ''}
                </div>
            </div>
        `;
        
        this.messagesList.appendChild(messageElement);
    }
    
    showTypingIndicator() {
        this.typingIndicator.classList.remove('hidden');
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.typingIndicator.classList.add('hidden');
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HearingAssistantApp();
});