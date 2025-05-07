function generarGraficoNotas(alumno) {
    const materias = ['Materia 1', 'Materia 2', 'Materia 3', 'Materia 4', 'Materia 5']; // Puedes personalizar
    const notas = alumno.notas;

    const ctx = document.getElementById('chartNotas').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: materias,
            datasets: [{
                label: 'Notas',
                data: notas,
                backgroundColor: 'rgba(54, 162, 235, 0.6)'
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
