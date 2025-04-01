let indiceActual = 0;
const totalItems = document.querySelectorAll('.carousel-item').length;
const itemsPorVista = 3;
const wrapper = document.getElementById('carouselWrapper');
let imagenesSeleccionadas = {};

/*


    Carrusel


*/

// Actualizar el número total de items después de cargar imágenes del JSON
function actualizarTotalItems() {
    return document.querySelectorAll('.carousel-item').length;
}

// Mover carrusel
function moveCarousel(direccion) {
    const totalItems = actualizarTotalItems();
    const indiceMaximo = totalItems - itemsPorVista;
    indiceActual += direccion;

    if (indiceActual < 0) {
        indiceActual = indiceMaximo;
    } else if (indiceActual > indiceMaximo) {
        indiceActual = 0;
    }

    const offset = -(indiceActual * 210);
    wrapper.style.transform = `translateX(${offset}px)`;
}


/*


    Drag and drop


*/

// Permitir soltar
function allowDrop(event) {
    event.preventDefault();
}

// Iniciar arrastre
document.querySelectorAll('.carousel-item').forEach(item => {
    item.addEventListener('dragstart', (event) => {
        if (!item.classList.contains('disabled')) {
            event.dataTransfer.setData('text/plain', item.id);
            setTimeout(() => item.classList.add('dragged'), 0);
        } else {
            event.preventDefault();
        }
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('dragged');
    });
});

// Soltar en contenedor
function drop(event, containerId) {
    event.preventDefault();
    const imagenID = event.dataTransfer.getData('text/plain');
    const imagenArrastrada = document.getElementById(imagenID);

    if (imagenArrastrada) {
        if (!imagenesSeleccionadas[containerId]) {
            addImageToContainer(containerId, imagenArrastrada);
        } else {
            const prevImg = imagenesSeleccionadas[containerId];
            prevImg.classList.remove('disabled');
            prevImg.setAttribute('draggable', true);
            addImageToContainer(containerId, imagenArrastrada);
        }
        
        if (Object.keys(imagenesSeleccionadas).length > 0) {
            guardarEstadoJuego();
        }
    }
}

// Añadir imagen al contenedor
function addImageToContainer(containerId, imagenArrastrada) {
    const contenedorDrop = document.getElementById(`divDrop${containerId}`);
    contenedorDrop.innerHTML = '';

    // Clonar y añadir imagen al contenedor
    const imgClonada = imagenArrastrada.querySelector('img').cloneNode(true);
    contenedorDrop.appendChild(imgClonada);

    // Eliminar con doble clic
    imgClonada.addEventListener('dblclick', () => {
        eliminarSeleccion(containerId, imagenArrastrada);
    });

    imagenArrastrada.classList.add('disabled');
    imagenArrastrada.setAttribute('draggable', false);

    imagenesSeleccionadas[containerId] = imagenArrastrada;
}

// Eliminar imagen del contenedor y habilitar en carrusel
function eliminarSeleccion(containerId, imagenArrastrada) {
    const contenedorDrop = document.getElementById(`divDrop${containerId}`);
    contenedorDrop.innerHTML = '';

    imagenArrastrada.classList.remove('disabled');
    imagenArrastrada.setAttribute('draggable', true);

    delete imagenesSeleccionadas[containerId];
}

// Asignar eventos drag and drop dinámicamente
function assignDragEvents() {
    document.querySelectorAll('.carousel-item').forEach(item => {
        item.addEventListener('dragstart', (event) => {
            if (!item.classList.contains('disabled')) {
                event.dataTransfer.setData('text/plain', item.id);
                setTimeout(() => item.classList.add('dragged'), 0);
            } else {
                event.preventDefault();
            }
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragged');
        });
    });
}


/*


    Elegir grupo aleatoriamente


*/
let data = [];
async function cargarDatos() {
    try {
        const response = await fetch('../data/data.json');
        const datos = await response.json();
        data = datos;
        init();
    } catch (error) {
        console.error('Hubo un error al cargar el archivo JSON:', error);
    }
}

// Cambiar fondo según el grupo seleccionado
function setBackground(indexGrupoSeleccionado) {
    const body = document.body;
    if (indexGrupoSeleccionado === 0) {
        body.style.backgroundImage = "url('../src/img/back1.jpg')";
    } else {
        body.style.backgroundImage = "url('../src/img/back2.jpg')";
    }
}

// Función para obtener elementos aleatorios
function getRandomItems(array, num) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

// Mezclar elementos del array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


/*


    Validar respuestas


*/
// Validación
let respuestasCorrectas = 0;
let totalContainers = 3;
function validateSelection() {
    respuestasCorrectas = 0;
    totalContainers = 3;
    let hasSelection = false;

    for (let i = 1; i <= totalContainers; i++) {
        const contenedorDrop = document.getElementById(`divDrop${i}`);
        const selectedImage = contenedorDrop.querySelector('img');
        
        if (selectedImage) {
            hasSelection = true;
            const imgAlt = selectedImage.alt.toLowerCase();
            const objEsperado = document.getElementById(`textObjeto_${i}`).innerText.toLowerCase();

            if (imgAlt === objEsperado) {
                respuestasCorrectas++;
            }
        }
    }

    if (!hasSelection) {
        alert('No has colocado ninguna imagen. Se cargará un nuevo grupo.');
        resetGame();
        return;
    }

    msjResultado(respuestasCorrectas, totalContainers);
}

// Mostrar mensaje final según la cantidad correcta
function msjResultado(respuestasCorrectas, totalContainers) {
    const nombreJugador = localStorage.getItem('playerName') || 'Jugador';
    const score = Math.round((respuestasCorrectas / totalContainers) * 100);

    if (respuestasCorrectas === totalContainers) {
        alert(`🎉 ¡Excelente trabajo, ${nombreJugador}! Todas las imágenes son correctas.\n🏆 Puntaje: ${score}%`);
    } else if (respuestasCorrectas > 0) {
        alert(`👍 Vas bien, ${nombreJugador}.\n🏆 Puntaje: ${score}%`);
    } else {
        alert(`😢 Sigue intentándolo, ${nombreJugador}. Esta vez no tuviste aciertos.\n🏆 Puntaje: ${score}%`);
    }
    resetGame();
}

// Mostrar información sobre la dinámica
function showInfo() {
    alert(
        "**** Instrucciones ****\n\n" +
        "1️⃣ Arrastra la imagen al contenedor que tenga la palabra que coincide con el objeto.\n" +
        "2️⃣ Da doble clic sobre la imagen que colocaste en el contenedor para eliminarla si es necesario.\n" +
        "3️⃣ Usa el botón de 'Validar' para comprobar si las imágenes están correctamente asignadas.\n\n" +
        "¡Diviértete y aprende! 🎉"
    );
}


/*


    Guardar selección en localStorage


*/
function guardarEstadoJuego() {
    // Verificar si al menos un contenedor tiene una imagen
    let hasImage = false;
    const estadoJuego = {
        detalle: $('#textDetalle').text(),
        imagenesSeleccionadas: {}
    };

    for (let i = 1; i <= 3; i++) {
        const contenedorDrop = $(`#divDrop${i}`);
        const selectedImage = contenedorDrop.find('img');

        if (selectedImage.length > 0) {
            hasImage = true;
            estadoJuego.imagenesSeleccionadas[i] = {
                src: selectedImage.attr('src'),
                alt: selectedImage.attr('alt')
            };
        }
    }

    // Solo guarda si al menos un contenedor tiene una imagen
    if (hasImage) {
        localStorage.setItem('gameState', JSON.stringify(estadoJuego));
    }
}

// Eliminar imagen también actualiza el estado
function eliminarSeleccion(containerId, imagenArrastrada) {
    const contenedorDrop = document.getElementById(`divDrop${containerId}`);
    contenedorDrop.innerHTML = '';

    imagenArrastrada.classList.remove('disabled');
    imagenArrastrada.setAttribute('draggable', true);

    delete imagenesSeleccionadas[containerId];
    guardarEstadoJuego();
}

/*


    Cargar estado desde localStorage si existe


*/
function loadGameState() {
    const estadoJuego = localStorage.getItem('gameState');
    if (estadoJuego) {
        const savedState = JSON.parse(estadoJuego);

        $('#textDetalle').text(savedState.detalle);

        for (let i = 1; i <= 3; i++) {
            if (savedState.imagenesSeleccionadas[i]) {
                const contenedorDrop = $(`#divDrop${i}`);
                const imgData = savedState.imagenesSeleccionadas[i];

                contenedorDrop.html(`
                    <img src="${imgData.src}" alt="${imgData.alt}">
                `);

                // Deshabilitar la imagen correspondiente en el carrusel
                $('.carousel-item img').each(function () {
                    if ($(this).attr('src') === imgData.src) {
                        $(this).parent().addClass('disabled').attr('draggable', false);
                    }
                });

                // Habilitar eliminación al hacer doble clic
                contenedorDrop.find('img').on('dblclick', function () {
                    const parentDiv = $(this).parent();
                    eliminarSeleccion(i, parentDiv.find('img').get(0).parentNode);
                });
            }
        }
    }
}

/*


    Cargar grupo aleatorio si no hay estado guardado


*/
function setRandomGroup() {
    const indexGrupoSeleccionado = Math.floor(Math.random() * data.length);
    const grupoSeleccionado = data[indexGrupoSeleccionado];
    const otroGrupo = data[indexGrupoSeleccionado === 0 ? 1 : 0];

    $('#textDetalle').text(grupoSeleccionado.detalle);
    setBackground(indexGrupoSeleccionado);

    const imagenesSeleccionadas = getRandomItems(grupoSeleccionado.objetos, 3);
    
    const otherImages = getRandomItems(otroGrupo.objetos, 2);

    const allImages = [...imagenesSeleccionadas, ...otherImages];
    shuffleArray(allImages);

    setImgCarrusel(allImages);

    const shuffledNames = shuffleArray([...imagenesSeleccionadas.map(item => item.nombre)]);
    $('#textObjeto_1').text(shuffledNames[0] || 'Objeto 1');
    $('#textObjeto_2').text(shuffledNames[1] || 'Objeto 2');
    $('#textObjeto_3').text(shuffledNames[2] || 'Objeto 3');
}

/*


    Cargar imágenes al carrusel


*/
function setImgCarrusel(images) {
    const carouselWrapper = $('#carouselWrapper');
    carouselWrapper.empty();

    images.forEach((item, index) => {
        carouselWrapper.append(`
            <div class="carousel-item" draggable="true" id="img${index + 1}">
                <img src="${item.imagen}" alt="${item.nombre}">
            </div>
        `);
    });

    assignDragEvents();
}

/*


    Cargar grupo guardado desde localStorage


*/
function loadSavedGroup(estadoJuego) {
    // Encontrar el grupo seleccionado con los objetos
    const grupoSeleccionado = data.find(group => group.detalle === estadoJuego.detalle);

    if (grupoSeleccionado) {
        setBackground(data.indexOf(grupoSeleccionado));
        $('#textDetalle').text(grupoSeleccionado.detalle);

        // Mostrar imágenes guardadas del grupo en el carrusel
        setImgCarrusel(grupoSeleccionado.objetos);

        // Cargar nombres de los objetos en los contenedores
        const shuffledNames = shuffleArray(grupoSeleccionado.objetos.map(item => item.nombre));
        $('#textObjeto_1').text(shuffledNames[0] || 'Objeto 1');
        $('#textObjeto_2').text(shuffledNames[1] || 'Objeto 2');
        $('#textObjeto_3').text(shuffledNames[2] || 'Objeto 3');
    } else {
        //console.error('No se encontró el grupo guardado. Cargando uno al azar...');
        setRandomGroup();
    }
}

/*


    Reiniciar juego y limpiar datos


*/
function resetGame() {
    const nombreJugador = localStorage.getItem('playerName') || 'Jugador';
    const score = Math.round((respuestasCorrectas / totalContainers) * 100);
    
    guardarPuntaje(nombreJugador, score);

    for (let i = 1; i <= 3; i++) {
        $(`#divDrop${i}`).empty();
    }

    Object.keys(imagenesSeleccionadas).forEach(containerId => {
        const imagenArrastrada = imagenesSeleccionadas[containerId];
        if (imagenArrastrada) {
            imagenArrastrada.classList.remove('disabled');
            imagenArrastrada.setAttribute('draggable', true);
        }
    });

    imagenesSeleccionadas = {};
    localStorage.removeItem('gameState');

    setRandomGroup();
}

// Cargar el estado si existe al iniciar
$(document).ready(function () {
    loadGameState();
});

/*


    Pedir nombre del jugador al iniciar


*/
function getNombre() {
    let nombreJugador = '';

    // Mostrar prompt hasta que el nombre no esté vacío
    while (!nombreJugador.trim()) {
        nombreJugador = prompt('👤 Ingresa tu nombre para comenzar:');
        if (!nombreJugador.trim()) {
            alert('⚠️ El nombre no puede estar vacío. Por favor, ingresa tu nombre.');
        }
    }

    // Guardar nombre en localStorage
    localStorage.setItem('playerName', nombreJugador);
    alert(`🎮 ¡Bienvenido, ${nombreJugador}! Que comience el juego.`);
}

/*


    Guardar puntaje del jugador


*/
function guardarPuntaje(nombreJugador, score) {
    let playerScores = JSON.parse(localStorage.getItem('playerScores')) || {};

    if (!playerScores[nombreJugador]) {
        playerScores[nombreJugador] = [];
    }

    playerScores[nombreJugador].unshift(score);

    if (playerScores[nombreJugador].length > 3) {
        playerScores[nombreJugador].pop();
    }

    localStorage.setItem('playerScores', JSON.stringify(playerScores));
}

function historialPuntaje() {
    const nombreJugador = localStorage.getItem('playerName') || 'Jugador';
    const playerScores = JSON.parse(localStorage.getItem('playerScores')) || {};
    
    const scores = playerScores[nombreJugador] || [];

    if (scores.length > 0) {
        alert(`Puntajes de ${nombreJugador}:\n\n${scores.join('\n')}`);
    } else {
        alert(`No hay puntajes guardados para ${nombreJugador}.`);
    }
}

function resetLocalStorage() {
    localStorage.clear();
    alert('Se han eliminado los datos. Comenzando desde cero...');
    location.reload();
}


function init() {
    if (!localStorage.getItem('playerName')) {
        getNombre();
    }

    const savedState = localStorage.getItem('gameState');

    if (savedState) {
        const estadoJuego = JSON.parse(savedState);
        loadSavedGroup(estadoJuego);
    } else {
        setRandomGroup();
    }
}

// Inicializar al cargar
window.onload = init;

cargarDatos();