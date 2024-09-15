const fileContainer = document.getElementById('pdf-view');
    let draggedItem = null;
    let placeholder = null;

    // Menambah placeholder untuk menandai posisi item baru
    function createPlaceholder() {
        const placeholderDiv = document.createElement('div');
        placeholderDiv.classList.add('file-item', 'placeholder');
        return placeholderDiv;
    }

    document.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('dragstart', function () {
            draggedItem = this;
            placeholder = createPlaceholder();
            setTimeout(() => {
                this.classList.add('dragging');
                this.style.display = "none";
                fileContainer.insertBefore(placeholder, this.nextSibling);
            }, 0);
        });

        item.addEventListener('dragend', function () {
            setTimeout(() => {
                draggedItem.style.display = "block";
                fileContainer.replaceChild(draggedItem, placeholder);
                this.classList.remove('dragging');
                draggedItem = null;
            }, 0);
        });

    });

    fileContainer.addEventListener('dragover', function (e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(fileContainer, e.clientY, e.clientX);
        console.log(placeholder)
        if (afterElement == null) {
            fileContainer.appendChild(placeholder);
        } else {
            fileContainer.insertBefore(placeholder, afterElement);
        }
    });

    function getDragAfterElement(container, y, x) {
        const draggableElements = [...container.querySelectorAll('.file-item:not(.dragging):not(.placeholder)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            const offsetX = x - box.left - box.width / 2;

            if (offset < 0 && offsetX < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }