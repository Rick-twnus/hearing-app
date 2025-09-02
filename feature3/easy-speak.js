// Easy Speak - JavaScript Implementation
class EasySpeak {
    constructor() {
        this.currentPage = 'home';
        this.currentLanguage = 'zh';
        this.messages = [];
        this.categories = [];
        this.editingItem = null;
        
        this.translations = {
            zh: {
                'app.title': 'Easy Speak',
                'app.subtitle': '幫助聽力障礙人士與他人輕鬆溝通',
                'nav.conversation': '開始對話',
                'nav.phrases': '常用語管理',
                'language.switch': '切換語言',
                'conversation.title': '對話模式',
                'conversation.other': '對方',
                'conversation.you': '您',
                'conversation.input.placeholder': '輸入訊息...',
                'conversation.send': '發送',
                'conversation.phrases': '常用語',
                'conversation.end': '結束對話',
                'conversation.empty': '開始您的對話吧！',
                'phrases.title': '常用語管理',
                'phrases.add.category': '新增分類',
                'phrases.category.placeholder': '分類名稱（如：餐廳、咖啡廳）',
                'phrases.add.phrase': '新增常用語',
                'phrases.phrase.placeholder': '輸入常用語',
                'phrases.save': '儲存',
                'phrases.cancel': '取消',
                'phrases.edit': '編輯',
                'phrases.delete': '刪除',
                'phrases.no.categories': '尚未建立任何分類',
                'phrases.no.phrases': '此分類暫無常用語'
            },
            en: {
                'app.title': 'Easy Speak',
                'app.subtitle': 'Helping hearing-impaired individuals communicate easily with others',
                'nav.conversation': 'Start Conversation',
                'nav.phrases': 'Manage Phrases',
                'language.switch': 'Switch Language',
                'conversation.title': 'Conversation Mode',
                'conversation.other': 'Other Person',
                'conversation.you': 'You',
                'conversation.input.placeholder': 'Type a message...',
                'conversation.send': 'Send',
                'conversation.phrases': 'Quick Phrases',
                'conversation.end': 'End Conversation',
                'conversation.empty': 'Start your conversation!',
                'phrases.title': 'Phrase Management',
                'phrases.add.category': 'Add Category',
                'phrases.category.placeholder': 'Category name (e.g., Restaurant, Cafe)',
                'phrases.add.phrase': 'Add Phrase',
                'phrases.phrase.placeholder': 'Enter phrase',
                'phrases.save': 'Save',
                'phrases.cancel': 'Cancel',
                'phrases.edit': 'Edit',
                'phrases.delete': 'Delete',
                'phrases.no.categories': 'No categories created yet',
                'phrases.no.phrases': 'No phrases in this category'
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateTranslations();
        this.renderPhrases();
    }
    
    // Data Management
    loadData() {
        // Load language preference
        const savedLanguage = localStorage.getItem('easy-speak-language');
        if (savedLanguage) {
            this.currentLanguage = savedLanguage;
        }
        
        // Load phrases
        const savedPhrases = localStorage.getItem('easy-speak-phrases');
        if (savedPhrases) {
            try {
                this.categories = JSON.parse(savedPhrases);
            } catch (error) {
                console.error('Failed to parse saved phrases:', error);
            }
        }
    }
    
    saveData() {
        localStorage.setItem('easy-speak-language', this.currentLanguage);
        localStorage.setItem('easy-speak-phrases', JSON.stringify(this.categories));
    }
    
    // Translation System
    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
    
    updateTranslations() {
        // Update all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = this.t(key);
        });
        
        // Update placeholder texts
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            element.placeholder = this.t(key);
        });
        
        // Update language button
        const langBtn = document.getElementById('lang-btn');
        if (langBtn) {
            langBtn.innerHTML = `<i class="fas fa-globe"></i> ${this.currentLanguage === 'zh' ? 'English' : '中文'}`;
        }
    }
    
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
        this.updateTranslations();
        this.saveData();
        this.renderPhrases();
        this.renderPhrasesPopover();
    }
    
    // Navigation
    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Show target page
        document.getElementById(`${page}-page`).classList.add('active');
        
        this.currentPage = page;
        
        // Update specific page content
        if (page === 'phrases') {
            this.renderPhrases();
        } else if (page === 'conversation') {
            this.initConversation();
        }
    }
    
    // Event Listeners
    setupEventListeners() {
        // Language switch
        document.getElementById('lang-btn').addEventListener('click', () => {
            this.toggleLanguage();
        });
        
        // Enter key handlers
        document.getElementById('primary-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage('primary');
            }
        });
        
        document.getElementById('secondary-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage('secondary');
            }
        });
        
        document.getElementById('new-category-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addCategory();
            }
        });
        
        document.getElementById('modal-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveEdit();
            }
        });
        
        // Click outside to close popover
        document.addEventListener('click', (e) => {
            const popover = document.getElementById('phrases-popover');
            const phrasesBtn = document.querySelector('.phrases-btn');
            
            if (popover.classList.contains('active') && 
                !popover.contains(e.target) && 
                !phrasesBtn.contains(e.target)) {
                popover.classList.remove('active');
            }
        });
    }
    
    // Conversation Functions
    initConversation() {
        this.messages = [];
        this.renderMessages();
        this.renderPhrasesPopover();
    }
    
    sendMessage(sender) {
        const input = document.getElementById(`${sender}-input`);
        const text = input.value.trim();
        
        if (!text) return;
        
        const message = {
            id: Date.now().toString(),
            text: text,
            sender: sender,
            timestamp: new Date()
        };
        
        this.messages.push(message);
        input.value = '';
        
        this.renderMessages();
    }
    
    renderMessages() {
        const primaryContainer = document.getElementById('primary-messages');
        const secondaryContainer = document.getElementById('secondary-messages');
        
        // Clear containers
        primaryContainer.innerHTML = '';
        secondaryContainer.innerHTML = '';
        
        if (this.messages.length === 0) {
            primaryContainer.innerHTML = `<div class="messages-empty">${this.t('conversation.empty')}</div>`;
            secondaryContainer.innerHTML = `<div class="messages-empty">${this.t('conversation.empty')}</div>`;
            return;
        }
        
        // Render messages for primary user
        this.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.sender}`;
            
            const bubble = document.createElement('div');
            bubble.className = `message-bubble ${message.sender === 'primary' ? 'primary' : 'secondary-received'}`;
            bubble.textContent = message.text;
            
            messageDiv.appendChild(bubble);
            primaryContainer.appendChild(messageDiv);
        });
        
        // Render messages for secondary user (reversed perspective)
        this.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.sender === 'secondary' ? 'secondary' : 'primary'}`;
            
            const bubble = document.createElement('div');
            bubble.className = `message-bubble ${message.sender === 'secondary' ? 'secondary' : 'primary-received'}`;
            bubble.textContent = message.text;
            
            messageDiv.appendChild(bubble);
            secondaryContainer.appendChild(messageDiv);
        });
        
        // Scroll to bottom
        primaryContainer.scrollTop = primaryContainer.scrollHeight;
        secondaryContainer.scrollTop = secondaryContainer.scrollHeight;
    }
    
    togglePhrasesPopover() {
        const popover = document.getElementById('phrases-popover');
        popover.classList.toggle('active');
    }
    
    renderPhrasesPopover() {
        const container = document.getElementById('phrases-list');
        
        if (this.categories.length === 0) {
            container.innerHTML = `<p class="no-phrases">${this.t('phrases.no.categories')}</p>`;
            return;
        }
        
        container.innerHTML = '';
        
        this.categories.forEach(category => {
            if (category.phrases.length === 0) return;
            
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'phrase-category';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'phrase-category-title';
            titleDiv.textContent = category.title;
            categoryDiv.appendChild(titleDiv);
            
            category.phrases.forEach(phrase => {
                const phraseBtn = document.createElement('button');
                phraseBtn.className = 'phrase-item';
                phraseBtn.textContent = phrase.text;
                phraseBtn.addEventListener('click', () => {
                    this.selectPhrase(phrase.text);
                });
                categoryDiv.appendChild(phraseBtn);
            });
            
            container.appendChild(categoryDiv);
        });
    }
    
    selectPhrase(text) {
        document.getElementById('primary-input').value = text;
        document.getElementById('phrases-popover').classList.remove('active');
    }
    
    endConversation() {
        this.messages = [];
        this.navigateTo('home');
    }
    
    // Phrase Management Functions
    addCategory() {
        const input = document.getElementById('new-category-input');
        const title = input.value.trim();
        
        if (!title) return;
        
        const newCategory = {
            id: Date.now().toString(),
            title: title,
            phrases: []
        };
        
        this.categories.push(newCategory);
        input.value = '';
        
        this.saveData();
        this.renderPhrases();
        this.renderPhrasesPopover();
    }
    
    editCategory(id) {
        const category = this.categories.find(cat => cat.id === id);
        if (!category) return;
        
        this.editingItem = { type: 'category', id: id };
        
        document.getElementById('modal-title').textContent = this.t('phrases.edit');
        document.getElementById('modal-input').value = category.title;
        document.getElementById('edit-modal').classList.add('active');
        document.getElementById('modal-input').focus();
    }
    
    deleteCategory(id) {
        if (confirm(this.currentLanguage === 'zh' ? '確定要刪除此分類嗎？' : 'Are you sure you want to delete this category?')) {
            this.categories = this.categories.filter(cat => cat.id !== id);
            this.saveData();
            this.renderPhrases();
            this.renderPhrasesPopover();
        }
    }
    
    addPhrase(categoryId) {
        const input = document.querySelector(`[data-category="${categoryId}"] .phrase-input`);
        const text = input.value.trim();
        
        if (!text) return;
        
        const category = this.categories.find(cat => cat.id === categoryId);
        if (!category) return;
        
        const newPhrase = {
            id: Date.now().toString(),
            text: text
        };
        
        category.phrases.push(newPhrase);
        input.value = '';
        
        this.saveData();
        this.renderPhrases();
        this.renderPhrasesPopover();
    }
    
    editPhrase(categoryId, phraseId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        if (!category) return;
        
        const phrase = category.phrases.find(p => p.id === phraseId);
        if (!phrase) return;
        
        this.editingItem = { type: 'phrase', categoryId: categoryId, phraseId: phraseId };
        
        document.getElementById('modal-title').textContent = this.t('phrases.edit');
        document.getElementById('modal-input').value = phrase.text;
        document.getElementById('edit-modal').classList.add('active');
        document.getElementById('modal-input').focus();
    }
    
    deletePhrase(categoryId, phraseId) {
        if (confirm(this.currentLanguage === 'zh' ? '確定要刪除此常用語嗎？' : 'Are you sure you want to delete this phrase?')) {
            const category = this.categories.find(cat => cat.id === categoryId);
            if (category) {
                category.phrases = category.phrases.filter(p => p.id !== phraseId);
                this.saveData();
                this.renderPhrases();
                this.renderPhrasesPopover();
            }
        }
    }
    
    renderPhrases() {
        const container = document.getElementById('categories-list');
        
        if (this.categories.length === 0) {
            container.innerHTML = `<div class="no-categories">${this.t('phrases.no.categories')}</div>`;
            return;
        }
        
        container.innerHTML = '';
        
        this.categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.setAttribute('data-category', category.id);
            
            categoryCard.innerHTML = `
                <div class="category-header">
                    <h3 class="category-title">${category.title}</h3>
                    <div class="category-actions">
                        <button class="edit-btn" onclick="app.editCategory('${category.id}')">
                            <i class="fas fa-edit"></i> ${this.t('phrases.edit')}
                        </button>
                        <button class="delete-btn" onclick="app.deleteCategory('${category.id}')">
                            <i class="fas fa-trash"></i> ${this.t('phrases.delete')}
                        </button>
                    </div>
                </div>
                
                <div class="phrase-add-form">
                    <input type="text" class="phrase-input" placeholder="${this.t('phrases.phrase.placeholder')}" 
                           onkeypress="if(event.key==='Enter') app.addPhrase('${category.id}')">
                    <button class="add-phrase-btn" onclick="app.addPhrase('${category.id}')">
                        <i class="fas fa-plus"></i> ${this.t('phrases.add.phrase')}
                    </button>
                </div>
                
                <div class="phrases-grid">
                    ${category.phrases.length === 0 ? 
                        `<div class="no-phrases-in-category">${this.t('phrases.no.phrases')}</div>` :
                        category.phrases.map(phrase => `
                            <div class="phrase-card">
                                <span class="phrase-text">${phrase.text}</span>
                                <div class="phrase-actions">
                                    <button class="phrase-edit-btn" onclick="app.editPhrase('${category.id}', '${phrase.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="phrase-delete-btn" onclick="app.deletePhrase('${category.id}', '${phrase.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            `;
            
            container.appendChild(categoryCard);
        });
    }
    
    // Modal Functions
    closeModal() {
        document.getElementById('edit-modal').classList.remove('active');
        this.editingItem = null;
    }
    
    saveEdit() {
        const input = document.getElementById('modal-input');
        const value = input.value.trim();
        
        if (!value || !this.editingItem) return;
        
        if (this.editingItem.type === 'category') {
            const category = this.categories.find(cat => cat.id === this.editingItem.id);
            if (category) {
                category.title = value;
            }
        } else if (this.editingItem.type === 'phrase') {
            const category = this.categories.find(cat => cat.id === this.editingItem.categoryId);
            if (category) {
                const phrase = category.phrases.find(p => p.id === this.editingItem.phraseId);
                if (phrase) {
                    phrase.text = value;
                }
            }
        }
        
        this.saveData();
        this.renderPhrases();
        this.renderPhrasesPopover();
        this.closeModal();
    }
}

// Global functions for onclick handlers
function navigateTo(page) {
    app.navigateTo(page);
}

function sendMessage(sender) {
    app.sendMessage(sender);
}

function togglePhrasesPopover() {
    app.togglePhrasesPopover();
}

function endConversation() {
    app.endConversation();
}

function addCategory() {
    app.addCategory();
}

function closeModal() {
    app.closeModal();
}

function saveEdit() {
    app.saveEdit();
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EasySpeak();
});
const messagesEl = document.getElementById('messages');
let originalHeight = window.innerHeight;

function sendMessage(side) {
  const input = side === 'top' ? document.getElementById('topText') : document.getElementById('bottomText');
  const msg = input.value.trim();
  if (!msg) return;

  const div = document.createElement('div');
  div.textContent = msg;
  div.classList.add('chat-bubble', side);

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  input.value = '';
}

// 偵測鍵盤彈出，自動捲到底部
window.addEventListener('resize', () => {
  const newHeight = window.innerHeight;
  if (newHeight < originalHeight) {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  originalHeight = newHeight;
});

// 輸入框 focus 時捲到底部
document.querySelectorAll('.chat-input-container input').forEach(input => {
  input.addEventListener('focus', () => {
    setTimeout(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 300);
  });
});
s
