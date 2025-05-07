function showDocente() {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('docente').classList.remove('hidden');
}

function showEstudiante() {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('estudiante').classList.remove('hidden');
}

// Placeholder: Gráficos con Chart.js
document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('resultsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Parcial 1', 'Parcial 2', 'Parcial 3'],
            datasets: [{
                label: 'Notas',
                data: [75, 85, 90],
                backgroundColor: ['#4CAF50', '#2196F3', '#FFC107']
            }]
        },
        options: {
            responsive: true
        }
// Función para leer y procesar el archivo Excel
function processExcel() {
    const fileInput = document.getElementById('uploadExcel');
    const file = fileInput.files[0];

    if (!file) {
        document.getElementById('uploadStatus').innerText = "Por favor, selecciona un archivo primero.";
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Obtener la primera hoja del archivo Excel
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        console.log(jsonData); // Ver notas procesadas en la consola

        // Mostrar éxito en la interfaz
        document.getElementById('uploadStatus').innerText = "Archivo procesado correctamente.";
        
        // Aquí puedes usar jsonData para trabajar con las notas, por ejemplo, almacenarlas o mostrarlas.
    };

    reader.readAsArrayBuffer(file);
}
    });
});