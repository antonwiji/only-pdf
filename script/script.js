async function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}

async function convertToBase64View(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

async function multiConvertToBase64View(file) {
    const listFile = []

    for (let index = 0; index < file.length; index++) {
        const fileData = await convertToBase64View(file[index])
        listFile.push(fileData)
    }

    return listFile
}

async function multiConvertToBase64(file) {
    const listFile = []

    for (let index = 0; index < file.length; index++) {
        const fileData = await convertToBase64(file[index])
        listFile.push(fileData)
    }

    return listFile
}

async function loadDocumentPdf(files) {
    const pdfLoadBuffers = []

    for (let index = 0; index < files.length; index++) {
        const loadPdf = await PDFLib.PDFDocument.load(files[index])

        pdfLoadBuffers.push(loadPdf)
    }

    return pdfLoadBuffers
}

function downloadPDF(base64Data, fileName) {
    try {
            const cleanedBase64Data = base64Data.split(',')[1] || base64Data;

            const byteCharacters = atob(cleanedBase64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            const blob = new Blob([byteArray], { type: 'application/pdf' });

            const blobURL = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobURL;
            link.download = fileName;

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
        } catch (error) {
            console.error('Error during file download:', error);
        }
}

const form = document.getElementById('pdf-file')

let draggedItem = null;
let placeholder = null;
let fileList = [];

const fileContainer = document.getElementById('pdf-view');

form.addEventListener('change', async() => {
    
    fileList = Array.from(form.files)

    const contentPdf = document.querySelector('#pdf-view')

     const convertFile2 = await multiConvertToBase64View(fileList)

     console.log(fileList)

     for (let index = 0; index < convertFile2.length; index++) {
        contentPdf.insertAdjacentHTML('beforeend',`
              <div draggable="true" data-index="${index}" class="col file-item" style="padding: 10px;">
                <div class="card text-center pdf-view">
                    <div class="card-header">
                    ${fileList[index].name}(${fileList[index].size}kb)
                    </div>
                    <div class="card-body">
                    <iframe frameborder="0" src="${convertFile2[index]}" id="pdf" style="width: 100%; height: 100%;"></iframe>
                    </div>
                </div>
              </div>
        `)
    }

     const loadPdf = await loadDocumentPdf(convertFile2)

        const pdfDoc = await PDFLib.PDFDocument.create()

        for (let index = 0; index < loadPdf.length; index++) {
            const pageIndices = loadPdf[index].getPageIndices()
            const copiedPages = await pdfDoc.copyPages(loadPdf[index], pageIndices)
    
            copiedPages.forEach((page) => {
                pdfDoc.addPage(page);
            })
        }

    const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true })

    // Dragger Script

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
    // contentPdf.innerHTML = `
    // <div class="row row-cols-3">
    //       <div class="col" style="padding: 10px;">
    //         <div class="card text-center pdf-view">
    //             <div class="card-header">
    //             ${files[0].name}(${files[0].size}kb)
    //             </div>
    //             <div class="card-body">
    //             <iframe src="${pdfDataUri}" id="pdf" style="width: 100%; height: 100%;"></iframe>
    //             </div>
    //         </div>
    //       </div>
    // </div>
    // `


        // const convertFile2 = await multiConvertToBase64(files)
        // const loadPdf = await loadDocumentPdf(convertFile2)

        // const pdfDoc = await PDFLib.PDFDocument.create()

        // for (let index = 0; index < loadPdf.length; index++) {
        //     const pageIndices = loadPdf[index].getPageIndices()
        //     const copiedPages = await pdfDoc.copyPages(loadPdf[index], pageIndices)
    
        //     copiedPages.forEach((page) => {
        //         pdfDoc.addPage(page);
        //     })
        // }

        // const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true })

        // downloadPDF(pdfDataUri, 'download-file.pdf')

})

function updateFileOrder() {
    const newOrder = [...fileContainer.querySelectorAll('.file-item')].map(item => {
        console.log(item)
        console.log(item.dataset.index)
        return fileList[item.dataset.index];
    });
    console.log(newOrder)
    fileList = newOrder; // Perbarui urutan fileList sesuai urutan visual
}

function testKlik() {
    updateFileOrder()
    console.log(fileList)
}

