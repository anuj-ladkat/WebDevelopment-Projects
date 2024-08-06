const thumbnails = document.querySelectorAll('.thumbnail');
const swiper = new Swiper('.swiper', {
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', () => {
        swiper.slideTo(index);
        thumbnails.forEach((t) => t.classList.remove('selected'));
        thumbnail.classList.add('selected');
        updateThumbnailSelection(index);
    });
});

swiper.on('slideChange', () => {
    const activeIndex = swiper.activeIndex;
    thumbnails.forEach((t) => t.classList.remove('selected'));
    thumbnails[activeIndex].classList.add('selected');
    updateThumbnailSelection(activeIndex);
});

let selectedTextElement = null;
let undoStack = [];
let redoStack = [];

document.getElementById('add-text-button').addEventListener('click', () => {
    const font = document.getElementById('font').value;
    const size = document.getElementById('size').value;
    const color = document.getElementById('color').value;

    const activeSlide = document.querySelector('.swiper-slide-active');
    const textContainer = createTextElement('', font, size, color);

    activeSlide.appendChild(textContainer);
    makeMovable(textContainer);
    selectTextElement(textContainer);

    // Position the new text in the center of the slide
    const slideRect = activeSlide.getBoundingClientRect();
    textContainer.style.left = (slideRect.width / 2 - textContainer.offsetWidth / 2) + 'px';
    textContainer.style.top = (slideRect.height / 2 - textContainer.offsetHeight / 2) + 'px';

    addToUndoStack(() => {
        activeSlide.removeChild(textContainer);
    }, () => {
        activeSlide.appendChild(textContainer);
        selectTextElement(textContainer);
    });

    // Focus on the text overlay for immediate editing
    const textOverlay = textContainer.querySelector('.text-overlay');
    textOverlay.focus();
});

document.getElementById('undo-button').addEventListener('click', undo);
document.getElementById('redo-button').addEventListener('click', redo);

document.getElementById('font').addEventListener('change', () => {
    const newFont = document.getElementById('font').value;
    updateTextStyle('fontFamily', newFont);
});

document.getElementById('size').addEventListener('input', () => {
    const newSize = document.getElementById('size').value + 'px';
    updateTextStyle('fontSize', newSize);
});

document.getElementById('color').addEventListener('input', () => {
    const newColor = document.getElementById('color').value;
    updateTextStyle('color', newColor);
});

function createTextElement(textContent, font, size, color) {
    const textContainer = document.createElement('div');
    textContainer.className = 'text-container';
    textContainer.style.position = 'absolute';

    const textElement = document.createElement('div');
    textElement.className = 'text-overlay';
    textElement.style.fontFamily = font;
    textElement.style.fontSize = size + 'px';
    textElement.style.color = color;
    textElement.contentEditable = true;
    textElement.style.whiteSpace = 'nowrap'; // Prevent automatic line breaks
    textElement.style.overflow = 'hidden';   // Hide overflow
    textElement.style.minWidth = '1px';      // Allow the div to shrink to content

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';
    deleteButton.style.display = 'none';
    deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();
        deleteTextElement(textContainer);
    });

    textContainer.appendChild(textElement);
    textContainer.appendChild(deleteButton);

    return textContainer;
}

function selectTextElement(element) {
    if (selectedTextElement && selectedTextElement !== element) {
        deselectTextElement();
    }

    selectedTextElement = element;
    const textOverlay = element.querySelector('.text-overlay');
    const deleteButton = element.querySelector('.delete-button');

    element.classList.add('selected');
    textOverlay.focus();
    deleteButton.style.display = 'block';
    updateControlValues(textOverlay);
}

function deselectTextElement() {
    if (selectedTextElement) {
        selectedTextElement.classList.remove('selected');
        const deleteButton = selectedTextElement.querySelector('.delete-button');
        if (deleteButton) {
            deleteButton.style.display = 'none';
        }
        selectedTextElement = null;
    }
}

function updateControlValues(textElement) {
    if (!textElement) return;
    const style = window.getComputedStyle(textElement);
    document.getElementById('font').value = style.fontFamily.replace(/['"]+/g, '');
    document.getElementById('size').value = parseInt(style.fontSize);
    document.getElementById('color').value = rgbToHex(style.color);
}

function makeMovable(element) {
    let isDragging = false;
    let offsetX, offsetY;

    element.addEventListener('mousedown', (event) => {
        if (event.target === element || event.target.classList.contains('text-overlay')) {
            selectTextElement(element);

            isDragging = true;
            swiper.allowTouchMove = false;
            offsetX = event.clientX - element.getBoundingClientRect().left;
            offsetY = event.clientY - element.getBoundingClientRect().top;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            event.preventDefault();
        }
    });

    function onMouseMove(event) {
        if (isDragging) {
            const containerRect = element.parentElement.getBoundingClientRect();
            const newX = event.clientX - containerRect.left - offsetX;
            const newY = event.clientY - containerRect.top - offsetY;

            const maxX = containerRect.width - element.offsetWidth;
            const maxY = containerRect.height - element.offsetHeight;

            element.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
            element.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
        }
    }

    function onMouseUp() {
        isDragging = false;
        swiper.allowTouchMove = true;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    element.ondragstart = () => false;
}

function updateTextStyle(styleProperty, newValue) {
    if (selectedTextElement) {
        const textOverlay = selectedTextElement.querySelector('.text-overlay');
        const oldValue = textOverlay.style[styleProperty];

        addToUndoStack(() => {
            textOverlay.style[styleProperty] = oldValue;
            updateControlValues(textOverlay);
        }, () => {
            textOverlay.style[styleProperty] = newValue;
            updateControlValues(textOverlay);
        });

        textOverlay.style[styleProperty] = newValue;
    }
}

function deleteTextElement(element) {
    const parent = element.parentElement;
    addToUndoStack(() => {
        parent.appendChild(element);
        selectTextElement(element);
    }, () => {
        parent.removeChild(element);
        deselectTextElement();
    });

    parent.removeChild(element);
    deselectTextElement();
}

function undo() {
    if (undoStack.length > 0) {
        const action = undoStack.pop();
        action.undo();
        redoStack.push(action);
    }
}

function redo() {
    if (redoStack.length > 0) {
        const action = redoStack.pop();
        action.redo();
        undoStack.push(action);
    }
}

function addToUndoStack(undoAction, redoAction) {
    undoStack.push({ undo: undoAction, redo: redoAction });
    redoStack = [];
}

function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g);
    return (
        '#' +
        ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2]))
            .toString(16)
            .slice(1)
            .toUpperCase()
    );
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        deselectTextElement();
    }
});

document.getElementById('customize-button').addEventListener('click', () => {
    const customizePanel = document.getElementById('customize-panel');
    customizePanel.style.display = customizePanel.style.display === 'block' ? 'none' : 'block';
    if (customizePanel.style.display === 'block') {
        generateSlideList();
    }
});

function generateSlideList() {
    const slideList = document.getElementById('slide-list');
    slideList.innerHTML = '';
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumbnail, index) => {
        const slideItem = document.createElement('li');
        slideItem.dataset.index = index;

        const number = document.createElement('span');
        number.className = 'number';
        number.textContent = `Slide ${index + 1}`;

        const img = document.createElement('img');
        img.src = thumbnail.src;
        img.alt = `Image ${index + 1}`;

        slideItem.appendChild(number);
        slideItem.appendChild(img);
        slideList.appendChild(slideItem);
    });

    const sortable = Sortable.create(slideList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: (evt) => {
            // Optional: update slide order on drag end
            // const newOrder = Array.prototype.map.call(slideList.children, (slideItem) => slideItem.dataset.index);
            // updateSlideOrder(newOrder);
        },
    });
}

document.getElementById('save-button').addEventListener('click', () => {
    const slideList = document.getElementById('slide-list');
    const slideItems = slideList.querySelectorAll('li');
    const newOrder = Array.prototype.map.call(slideItems, (slideItem) => slideItem.dataset.index);
    updateSlideOrder(newOrder);
    document.getElementById('customize-panel').style.display = 'none';
    // Update swiper and thumbnails
    swiper.updateSlides();
    updateThumbnailSelection(swiper.activeIndex);
});

function updateSlideOrder(newOrder) {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const swiperSlides = document.querySelectorAll('.swiper-slide');
    const thumbnailContainer = thumbnails[0].parentNode;
    const slideContainer = swiperSlides[0].parentNode;

    newOrder.forEach((index, newIndex) => {
        const thumbnail = thumbnails[index];
        const swiperSlide = swiperSlides[index];
        thumbnailContainer.appendChild(thumbnail);
        slideContainer.appendChild(swiperSlide);
    });

    swiper.updateSlides();
    swiper.slideTo(0);
    
    // Update thumbnail selection
    updateThumbnailSelection(0);
}

function updateThumbnailSelection(index) {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((t, i) => {
        if (i === index) {
            t.classList.add('selected');
        } else {
            t.classList.remove('selected');
        }
    });
}