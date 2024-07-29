let selectedTextElement = null;
let history = [];
let redoStack = [];

function addText() {
    const textInput = 'ADD Text'; // Default text
    const fontSelect = document.getElementById('fontSelect').value;
    const fontSize = document.getElementById('fontSize').value;
    const colorPicker = document.getElementById('colorPicker').value;

    const textElement = document.createElement('div');
    textElement.classList.add('text');
    textElement.style.fontFamily = fontSelect;
    textElement.style.fontSize = fontSize + 'px';
    textElement.style.color = colorPicker;
    textElement.innerText = textInput;

    textElement.style.left = '50px';
    textElement.style.top = '50px';

    textElement.draggable = true;
    textElement.ondragstart = dragStart;
    textElement.ondragend = dragEnd;
    textElement.onclick = selectText;
    textElement.contentEditable = true; // Make text editable

    document.getElementById('editingArea').appendChild(textElement);

    saveState();
}

function dragStart(event) {
    event.dataTransfer.setData('text/plain', null);
    event.dataTransfer.setDragImage(new Image(), 0, 0);
    event.target.style.opacity = '0.5';
    const rect = event.target.getBoundingClientRect();
    event.target.offsetX = event.clientX - rect.left;
    event.target.offsetY = event.clientY - rect.top;
}

function dragEnd(event) {
    event.target.style.opacity = '1';
    const editingArea = document.getElementById('editingArea');
    const rect = editingArea.getBoundingClientRect();
    let left = event.clientX - rect.left - event.target.offsetX;
    let top = event.clientY - rect.top - event.target.offsetY;

    if (left < 0) left = 0;
    if (top < 0) top = 0;
    if (left + event.target.offsetWidth > editingArea.offsetWidth) {
        left = editingArea.offsetWidth - event.target.offsetWidth;
    }
    if (top + event.target.offsetHeight > editingArea.offsetHeight) {
        top = editingArea.offsetHeight - event.target.offsetHeight;
    }

    event.target.style.left = left + 'px';
    event.target.style.top = top + 'px';

    saveState();
}

function selectText(event) {
    if (selectedTextElement) {
        selectedTextElement.classList.remove('selected');
    }
    selectedTextElement = event.target;
    selectedTextElement.classList.add('selected');

    // Update the sidebar to reflect the selected text's properties
    document.getElementById('fontSelect').value = selectedTextElement.style.fontFamily;
    document.getElementById('fontSize').value = parseInt(selectedTextElement.style.fontSize);
    document.getElementById('colorPicker').value = rgbToHex(selectedTextElement.style.color);
}

function deselectText() {
    if (selectedTextElement) {
        selectedTextElement.classList.remove('selected');
        selectedTextElement = null;
    }
}

function updateSelectedText() {
    if (selectedTextElement) {
        const fontSelect = document.getElementById('fontSelect').value;
        const fontSize = document.getElementById('fontSize').value;
        const colorPicker = document.getElementById('colorPicker').value;

        selectedTextElement.style.fontFamily = fontSelect;
        selectedTextElement.style.fontSize = fontSize + 'px';
        selectedTextElement.style.color = colorPicker;

        saveState();
    }
}

function saveState() {
    const editingArea = document.getElementById('editingArea');
    history.push(editingArea.innerHTML);
    redoStack = [];
}

function undo() {
    if (history.length > 1) {
        redoStack.push(history.pop());
        const editingArea = document.getElementById('editingArea');
        editingArea.innerHTML = history[history.length - 1];
        reassignEvents();
    }
}

function redo() {
    if (redoStack.length > 0) {
        const editingArea = document.getElementById('editingArea');
        history.push(redoStack.pop());
        editingArea.innerHTML = history[history.length - 1];
        reassignEvents();
    }
}

function reassignEvents() {
    const texts = document.getElementsByClassName('text');
    for (let text of texts) {
        text.draggable = true;
        text.ondragstart = dragStart;
        text.ondragend = dragEnd;
        text.onclick = selectText;
        text.contentEditable = true;
    }
}

function rgbToHex(rgb) {
    const rgbValues = rgb.match(/\d+/g).map(Number);
    return "#" + rgbValues.map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Delete' && selectedTextElement) {
        selectedTextElement.remove();
        saveState();
        deselectText();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    saveState();
});
