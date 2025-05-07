document.getElementById('btnBuscar').addEventListener('click', function() {
    const codigo = document.getElementById('codigoAlumno').value.trim().toUpperCase();
    if (!codigo) {
        alert("Por favor ingresa un código");
        return;
    }
	

    try {
        const alumnos = JSON.parse(localStorage.getItem('alumnos')) || [];
        const alumno = alumnos.find(a => a.codigo === codigo);
        
        if (!alumno) {
            const codigoEjemplo = alumnos[0] && alumnos[0].codigo ? alumnos[0].codigo : 'PRIMERO-A-001';
            alert("Código no encontrado. Prueba con: " + codigoEjemplo);
            return;
        }

        // Filtrar compañeros de misma sección
        const compañeros = alumnos.filter(a => 
            a.grado === alumno.grado && 
            a.seccion === alumno.seccion &&
            a.codigo !== alumno.codigo
        );

        // Calcular promedios
        const alumnosConPromedio = [alumno].concat(compañeros).map(function(a) {
            var nuevoAlumno = {
                codigo: a.codigo,
                nombre: a.nombre,
                grado: a.grado,
                seccion: a.seccion,
                notas: a.notas.slice(),
                promedio: calcularPromedio(a.notas)
            };
            return nuevoAlumno;
        }).sort(function(a, b) {
            return b.promedio - a.promedio;
        });

        // Mostrar resultados
        mostrarResultados(alumno, alumnosConPromedio);

    } catch (error) {
        console.error(error);
        alert("Error al buscar alumno: " + error.message);
    }
});

function mostrarResultados(alumno, ranking) {
    const resultado = document.getElementById('resultado');
    if (!resultado) {
        console.error("No se encontró el elemento para mostrar resultados");
        return;
    }

    // Construir HTML completo primero
    resultado.innerHTML = `
        <div class="card">
            <h2>${alumno.nombre}</h2>
            <p>Código: ${alumno.codigo}</p>
            <p>Grado: ${alumno.grado} - Sección: ${alumno.seccion}</p>
            <p class="promedio">Promedio: <strong>${calcularPromedio(alumno.notas)}</strong></p>
        </div>
        
  <div class="card">
            <h3>🏆 Podio de la Sección</h3>
            <div id="podio"></div>
        </div>

        <div class="card-container">
            <div class="card card-side-by-side">
                <h3>Mis Notas</h3>
                <canvas id="graficoNotas"></canvas>
            </div>
            
            <div class="card card-side-by-side">
                <h3>📊 Comparativa de Sección</h3>
                <div class="grafico-comparativa-container">
                    <canvas id="graficoComparativa"></canvas>
                </div>
                <div class="grafico-comparativa-leyenda">
                    <div class="grafico-comparativa-leyenda-item">
                        <div class="grafico-comparativa-leyenda-color" style="background-color: rgba(54, 162, 235, 0.7);"></div>
                        <div class="grafico-comparativa-leyenda-texto">Tu posición</div>
                    </div>
                    <div class="grafico-comparativa-leyenda-item">
                        <div class="grafico-comparativa-leyenda-color" style="background-color: rgba(75, 192, 192, 0.7);"></div>
                        <div class="grafico-comparativa-leyenda-texto">Compañeros</div>
                    </div>
                </div>
            </div>
        </div>
        
      
    `;

    // Renderizar gráficos después de asegurar que el DOM está listo
    setTimeout(() => {
        try {
            renderizarGraficoNotas(alumno);
            renderizarComparativa(alumno, ranking);
            renderizarPodio(ranking);
        } catch (error) {
            console.error("Error al renderizar gráficos:", error);
            const errorContainer = document.createElement('div');
            errorContainer.className = 'error-message';
            errorContainer.innerHTML = `<p>Ocurrió un error al mostrar los gráficos: ${error.message}</p>`;
            resultado.appendChild(errorContainer);
        }
    }, 50);
}

function renderizarGraficoNotas(alumno) {
    try {
        const canvas = document.getElementById('graficoNotas');
        if (!canvas) throw new Error("Canvas de notas no encontrado");
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Contexto 2D no disponible");
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: alumno.notas.map((_, i) => `Materia ${i+1}`),
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
    } catch (error) {
        console.error("Error en renderizarGraficoNotas:", error);
        throw error;
    }
}

function renderizarComparativa(alumno, ranking) {
    try {
        // Validaciones iniciales (aseguran que todo exista)
        const canvas = document.getElementById('graficoComparativa');
        if (!canvas) throw new Error("No se encontró el canvas");
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("No se pudo obtener contexto 2D");

        // Destruir gráfico anterior si existe
        if (canvas.chart) canvas.chart.destroy();

        // Procesamiento seguro de datos
        const alumnosSeccion = Array.isArray(ranking) ? 
            ranking.filter(a => a.grado === alumno.grado && a.seccion === alumno.seccion) : [];
        
        if (alumnosSeccion.length === 0) return;

        // Configuración del gráfico (versión compatible)
        canvas.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: alumnosSeccion.map(() => ""), // Labels vacíos
                datasets: [{
                    data: alumnosSeccion.map(a => parseFloat(a.promedio) || 0),
                    backgroundColor: alumnosSeccion.map(a => 
                        a.codigo === alumno.codigo ? 'rgba(54, 162, 235, 0.7)' : 'rgba(75, 192, 192, 0.7)'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Promedio' }
                    },
                    x: { display: false } // Ocultamos el eje X
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const alumno = alumnosSeccion[context[0].dataIndex];
                                return [alumno.nombre, `Código: ${alumno.codigo}`];
                            },
                            label: function(context) {
                                return `Promedio: ${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                animation: {
                    onComplete: function() {
                        // Dibujar nombres manualmente después de la animación
                        const chart = this;
                        const ctx = chart.ctx;
                        ctx.font = 'bold 12px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        
                        chart.data.datasets.forEach(function(dataset, i) {
                            const meta = chart.getDatasetMeta(i);
                            meta.data.forEach(function(bar, index) {
                                const alumno = alumnosSeccion[index];
                                const nombre = alumno.codigo === alumno.codigo ? 'TÚ' : 
                                    alumno.nombre.split(' ')[0] + (alumno.nombre.split(' ')[1] ? ' ' + alumno.nombre.split(' ')[1].charAt(0) + '.' : '');
                                ctx.fillStyle = dataset.backgroundColor[index];
                                ctx.fillText(nombre, bar.x, bar.y - 5);
                            });
                        });
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error en renderizarComparativa:", error);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = "Error al mostrar comparativa";
        canvas.parentNode.appendChild(errorMsg);
    }
}
function renderizarPodio(alumnos) {
    try {
        const podioContainer = document.getElementById('podio');
        if (!podioContainer) {
            throw new Error("Contenedor del podio no encontrado");
        }

        const podio = alumnos.slice(0, 3);
        podioContainer.innerHTML = `
            <div class="podio-container">
                <div class="podio-base">
                    ${podio.map((alumno, index) => `
                    <div class="puesto puesto-${index + 1}">
                        <span class="numero-puesto">${index + 1}</span>
                        <span class="medalla">${['🥇', '🥈', '🥉'][index]}</span>
                        <span class="nombre">${alumno.nombre}</span>
                        <span class="promedio">${alumno.promedio}</span>
                    </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error en renderizarPodio:", error);
        const podioContainer = document.getElementById('podio');
        if (podioContainer) {
            podioContainer.innerHTML = `
                <div class="error-message">
                    <p>No se pudo cargar el podio: ${error.message}</p>
                </div>
            `;
        }
        throw error;
    }
}

function calcularPromedio(notas) {
    if (!notas || !notas.length) return '0.00';
    var sum = 0;
    for (var i = 0; i < notas.length; i++) {
        sum += parseFloat(notas[i]) || 0;
    }
    return (sum / notas.length).toFixed(2);
}