document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const sentenceOutput = document.getElementById('sentence');
    const clearButton = document.getElementById('clear-canvas');
    const playButton = document.getElementById('play-sentence');
    const returnArea = document.querySelector('.return-area');

    // 初始化拖拽事件
    document.querySelectorAll('.block').forEach(block => {
        block.addEventListener('dragstart', dragStart);
    });

    // 初始化新增按鈕
    document.querySelectorAll('.add-custom').forEach(button => {
        button.addEventListener('click', addCustomBlock);
    });

    canvas.addEventListener('dragover', dragOver);
    canvas.addEventListener('drop', drop);
    returnArea.addEventListener('drop', returnBlock);
    clearButton.addEventListener('click', clearCanvas);
    playButton.addEventListener('click', playSentence);

    // 雙擊刪除功能
    canvas.addEventListener('dblclick', (e) => {
        const target = e.target.closest('.dropped-block');
        if (target) {
            target.remove();
            updateSentence();
        }
    });

    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.textContent);
        e.dataTransfer.setData('class', e.target.className);
        e.dataTransfer.setData('source', e.target.parentElement.getAttribute('data-category') || e.target.parentElement.className);
        e.target.classList.add('dragging');
    }

    function dragOver(e) {
        e.preventDefault();
        const target = e.target.closest('.dropped-block');
        removeInsertLine();

        if (target) {
            const rect = target.getBoundingClientRect();
            const isLeft = (e.clientX - rect.left) < (rect.width / 2);
            const line = document.createElement('div');
            line.className = 'insert-line';
            line.style.left = isLeft ? '-2px' : '100%';
            target.appendChild(line);
        }
    }

    function drop(e) {
        e.preventDefault();
        removeInsertLine();
        const text = e.dataTransfer.getData('text/plain');
        const className = e.dataTransfer.getData('class');
        const source = e.dataTransfer.getData('source');

        const target = e.target.closest('.dropped-block');
        const newBlock = document.createElement('div');
        newBlock.textContent = text;
        newBlock.className = className.replace('dragging', '').trim() + ' dropped-block';
        newBlock.draggable = true;
        newBlock.addEventListener('dragstart', dragStart);

        if (target) {
            const rect = target.getBoundingClientRect();
            const isLeft = (e.clientX - rect.left) < (rect.width / 2);
            canvas.insertBefore(newBlock, isLeft ? target : target.nextSibling);
        } else {
            canvas.appendChild(newBlock);
        }

        updateSentence();
    }

    function returnBlock(e) {
        e.preventDefault();
        const text = e.dataTransfer.getData('text/plain');
        const className = e.dataTransfer.getData('class');
        const source = e.dataTransfer.getData('source');

        if (source && source !== 'canvas') {
            const category = document.querySelector(`.category[data-category="${source}"]`);
            if (category) {
                const newBlock = document.createElement('div');
                newBlock.textContent = text;
                newBlock.className = className.replace('dragging', '').replace('dropped-block', '').trim();
                newBlock.draggable = true;
                newBlock.addEventListener('dragstart', dragStart);
                const addBlockDiv = category.querySelector('.add-block');
                category.insertBefore(newBlock, addBlockDiv);
            }
        }

        const draggedBlock = document.querySelector('.dragging');
        if (draggedBlock && draggedBlock.classList.contains('dropped-block')) {
            draggedBlock.remove();
        }

        updateSentence();
    }

    function removeInsertLine() {
        const existingLine = document.querySelector('.insert-line');
        if (existingLine) existingLine.remove();
    }

    function updateSentence() {
        const blocks = canvas.querySelectorAll('.dropped-block');
        let sentence = '';
        blocks.forEach(block => {
            sentence += block.textContent + ' ';
        });
        sentenceOutput.textContent = sentence.trim();
    }

    function clearCanvas() {
        while (canvas.children.length > 1) {
            canvas.removeChild(canvas.lastChild);
        }
        updateSentence();
    }

    function addCustomBlock(e) {
        const category = e.target.getAttribute('data-category');
        const input = e.target.previousElementSibling;
        const text = input.value.trim();
        if (text) {
            const categoryDiv = document.querySelector(`.category[data-category="${category}"]`);
            const newBlock = document.createElement('div');
            newBlock.textContent = text;
            newBlock.className = `block ${category}`;
            newBlock.draggable = true;
            newBlock.addEventListener('dragstart', dragStart);
            const addBlockDiv = categoryDiv.querySelector('.add-block');
            categoryDiv.insertBefore(newBlock, addBlockDiv);
            input.value = '';
        }
    }

    function playSentence() {
        const sentence = sentenceOutput.textContent;
        if (sentence && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(sentence);
            utterance.lang = 'zh-TW';
            speechSynthesis.speak(utterance);
        } else {
            alert('您的瀏覽器不支援語音合成，或句子為空。');
        }
    }

    // 畫布內拖拽排序
    let draggedBlock = null;
    canvas.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('dropped-block')) {
            draggedBlock = e.target;
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    canvas.addEventListener('dragend', () => {
        removeInsertLine();
        draggedBlock = null;
        updateSentence();
    });
});