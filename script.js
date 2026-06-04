const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const convertBtn = document.getElementById('convertBtn');
const formatSelect = document.getElementById('formatSelect');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const fileInfo = document.getElementById('fileInfo');
const downloadContainer = document.getElementById('downloadContainer');
const downloadLink = document.getElementById('downloadLink');

let loadedFile = null;

// Eventos para el área de arrastrar y soltar
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drop-zone--over');
});

['dragleave', 'dragend'].forEach(type => {
    dropZone.addEventListener(type, () => {
        dropZone.classList.remove('drop-zone--over');
    });
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drop-zone--over');
    
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFile(e.dataTransfer.files[0]);
    }
});

// Procesar el archivo seleccionado
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
    }
    
    loadedFile = file;
    fileInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        imagePreview.src = reader.result;
        previewContainer.style.display = 'block';
        convertBtn.disabled = false;
        downloadContainer.style.display = 'none'; // Ocultar descargas anteriores si sube otra foto
    };
}

// Lógica de conversión usando Canvas (100% en el cliente)
convertBtn.addEventListener('click', () => {
    if (!loadedFile) return;

    const img = new Image();
    img.src = imagePreview.src;
    
    img.onload = () => {
        // Crear un lienzo (canvas) oculto en memoria
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Si el formato es JPG, rellenar el fondo con blanco (por si la imagen original tiene transparencias PNG)
        const selectedFormat = formatSelect.value;
        if (selectedFormat === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Dibujar la imagen en el canvas
        ctx.drawImage(img, 0, 0);
        
        // Convertir el lienzo al formato solicitado
        // Calidad establecida en 0.9 (90%) para balance óptimo entre peso y calidad
        const convertedDataUrl = canvas.toDataURL(selectedFormat, 0.9);
        
        // Configurar el botón de descarga
        downloadLink.href = convertedDataUrl;
        
        // Definir la extensión correcta del archivo de salida
        let extension = '.jpg';
        if (selectedFormat === 'image/png') extension = '.png';
        if (selectedFormat === 'image/webp') extension = '.webp';
        
        const originalName = loadedFile.name.substring(0, loadedFile.name.lastIndexOf('.')) || loadedFile.name;
        downloadLink.download = `${originalName}_convertido${extension}`;
        
        // Mostrar contenedor de descarga
        downloadContainer.style.display = 'block';
        
        // Auto-scroll suave hasta el botón de descarga para mejorar la experiencia (y que vean el anuncio)
        downloadContainer.scrollIntoView({ behavior: 'smooth' });
    };
});
