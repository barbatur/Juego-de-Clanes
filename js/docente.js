document.getElementById('btnProcesar').addEventListener('click', function() {
    const file = document.getElementById('excelInput').files[0];
    if (!file) {
        alert("Por favor selecciona un archivo Excel");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            // Validar estructura mínima
            if (!jsonData[0] || !jsonData[0]['Código'] || !jsonData[0]['Nombre']) {
                throw new Error("El archivo no tiene el formato correcto");
            }

            // Procesar datos
            const alumnos = jsonData.map(row => ({
                codigo: String(row['Código']).trim().toUpperCase(),
                nombre: String(row['Nombre']).trim(),
                grado: String(row['Grado'] || '').trim(),
                seccion: String(row['Sección'] || '').trim(),
                notas: Object.entries(row)
                    .filter(([key]) => !['Código','Nombre','Grado','Sección'].includes(key))
                    .map(([,value]) => Number(value) || 0)
            }));

            localStorage.setItem('alumnos', JSON.stringify(alumnos));
            alert(`Datos cargados correctamente. Total alumnos: ${alumnos.length}`);
            
            // Mostrar primeros 3 alumnos como prueba
            const resultado = document.getElementById('resultado');
            resultado.innerHTML = '<h3>Alumnos cargados:</h3>';
            alumnos.slice(0, 3).forEach(alumno => {
                resultado.innerHTML += `<p>${alumno.codigo}: ${alumno.nombre}</p>`;
            });

        } catch (error) {
            console.error(error);
            alert("Error al procesar el archivo: " + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
});