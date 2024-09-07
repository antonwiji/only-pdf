async function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
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

form.addEventListener('change', async(event) => {
        const files = event.target.files
        const convertFile2 = await multiConvertToBase64(files)
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

        downloadPDF(pdfDataUri, 'download-file.pdf')

})

