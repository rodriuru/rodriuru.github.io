// Array de títulos e imágenes (puedes editar este array para agregar más gráficas)
const graficas = [
    {
        titulo: "Tiempo Pasado y Pronóstico",
        archivo: "pronostico.png"
    },
    // Puedes agregar más objetos aquí, ejemplo:
    // { titulo: "Otra gráfica", archivo: "grafica2.png" }
];

const container = document.getElementById('graphics-container');

graficas.forEach(grafica => {
    const block = document.createElement('section');
    block.className = 'graphic-block';

    const titulo = document.createElement('h3');
    titulo.textContent = grafica.titulo;

    const img = document.createElement('img');
    img.src = `imagenes/${grafica.archivo}`;
    img.alt = grafica.titulo;

    block.appendChild(titulo);
    block.appendChild(img);
    container.appendChild(block);
});
