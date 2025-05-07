document.getElementById("btnBuscar").addEventListener("click", function () {
    const codigo = document.getElementById("codigoAlumno").value.trim();
    if (!codigo) return alert("Por favor, ingrese un código");

    const url = "https://script.google.com/macros/s/AKfycbzQ1nI0vpwunA5MjCprC61Jnghs0xFEgBv1qHxpuICOV59zTHi6WmjmcvnnXXthQbDh2Q/exec?codigo=" + encodeURIComponent(codigo);

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const contenedor = document.getElementById("resultado");
            contenedor.innerHTML = "";

            if (data.error) {
                contenedor.innerHTML = "<p>No se encontró el alumno.</p>";
                return;
            }

            // Mostrar los datos del alumno
            const html = `
                <div class="card">
                    <h2>${data.nombre}</h2>
                    <p><strong>Grado:</strong> ${data.grado}</p>
                    <p><strong>Sección:</strong> ${data.sección}</p>
                    <p><strong>Notas:</strong> ${data.notas.join(', ')}</p>
                    <p><strong>Promedio:</strong> ${calcularPromedio(data.notas)}</p>
                </div>
            `;

            contenedor.innerHTML = html;

            // Renderizar los gráficos
            renderizarGraficoNotas(data);
        })
        .catch(err => {
            console.error(err);
            alert("Ocurrió un error al buscar los datos.");
        });
});

function calcularPromedio(notas) {
    if (!notas || !notas.length) return '0.00';
    const sum = notas.reduce((acc, nota) => acc + parseFloat(nota), 0);
    return (sum / notas.length).toFixed(2);
}

function renderizarGraficoNotas(alumno) {
    const canvas = document.getElementById('graficoNotas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: alumno.notas.map((_, i) => `Materia ${i + 1}`),
            datasets: [{
                label: 'Mis Notas',
                data: alumno.notas,
                backgroundColor: 'rgba(54, 162, 235, 0.7)'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}
