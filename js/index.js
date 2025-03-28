let currentIndex = 0;
const totalItems = document.querySelectorAll('.carousel-item').length;
const itemsPerView = 3;
const wrapper = document.getElementById('carouselWrapper');
let selectedImages = {};

/*


    Carrusel


*/

// Actualizar el número total de items después de cargar imágenes del JSON
function updateTotalItems() {
    return document.querySelectorAll('.carousel-item').length;
}

// Mover carrusel
function moveCarousel(direction) {
    const totalItems = updateTotalItems();
    const maxIndex = totalItems - itemsPerView;
    currentIndex += direction;

    if (currentIndex < 0) {
        currentIndex = maxIndex;
    } else if (currentIndex > maxIndex) {
        currentIndex = 0;
    }

    const offset = -(currentIndex * 210);
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
    const imgId = event.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(imgId);

    if (draggedElement) {
        if (!selectedImages[containerId]) {
            addImageToContainer(containerId, draggedElement);
        } else {
            const prevImg = selectedImages[containerId];
            prevImg.classList.remove('disabled');
            prevImg.setAttribute('draggable', true);
            addImageToContainer(containerId, draggedElement);
        }
        
        if (Object.keys(selectedImages).length > 0) {
            saveGameState();
        }
    }
}

// Añadir imagen al contenedor
function addImageToContainer(containerId, draggedElement) {
    const container = document.getElementById(`drop${containerId}`);
    container.innerHTML = '';

    // Clonar y añadir imagen al contenedor
    const imgClone = draggedElement.querySelector('img').cloneNode(true);
    container.appendChild(imgClone);

    // Eliminar con doble clic
    imgClone.addEventListener('dblclick', () => {
        removeImageFromContainer(containerId, draggedElement);
    });

    draggedElement.classList.add('disabled');
    draggedElement.setAttribute('draggable', false);

    selectedImages[containerId] = draggedElement;
}

// Eliminar imagen del contenedor y habilitar en carrusel
function removeImageFromContainer(containerId, draggedElement) {
    const container = document.getElementById(`drop${containerId}`);
    container.innerHTML = '';

    draggedElement.classList.remove('disabled');
    draggedElement.setAttribute('draggable', true);

    delete selectedImages[containerId];
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
        //console.log(data);
        init();
    } catch (error) {
        console.error('Hubo un error al cargar el archivo JSON:', error);
    }
}

// Cambiar fondo según el grupo seleccionado
function setBackground(selectedGroupIndex) {
    const body = document.body;
    if (selectedGroupIndex === 0) {
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
let correctCount = 0;
let totalContainers = 3;
function validateSelection() {
    correctCount = 0;
    totalContainers = 3;
    let hasSelection = false;

    for (let i = 1; i <= totalContainers; i++) {
        const container = document.getElementById(`drop${i}`);
        const selectedImage = container.querySelector('img');
        
        if (selectedImage) {
            hasSelection = true;
            const imgAlt = selectedImage.alt.toLowerCase();
            const expectedName = document.getElementById(`obj${i}`).innerText.toLowerCase();

            if (imgAlt === expectedName) {
                correctCount++;
            }
        }
    }

    if (!hasSelection) {
        alert('No has colocado ninguna imagen. Se cargará un nuevo grupo.');
        resetGame();
        return;
    }

    showResultMessage(correctCount, totalContainers);
}

// Mostrar mensaje final según la cantidad correcta
function showResultMessage(correctCount, totalContainers) {
    const playerName = localStorage.getItem('playerName') || 'Jugador';
    const score = Math.round((correctCount / totalContainers) * 100);

    if (correctCount === totalContainers) {
        alert(`🎉 ¡Excelente trabajo, ${playerName}! Todas las imágenes son correctas.\n🏆 Puntaje: ${score}%`);
    } else if (correctCount > 0) {
        alert(`👍 Vas bien, ${playerName}.\n🏆 Puntaje: ${score}%`);
    } else {
        alert(`😢 Sigue intentándolo, ${playerName}. Esta vez no tuviste aciertos.\n🏆 Puntaje: ${score}%`);
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
function saveGameState() {
    // Verificar si al menos un contenedor tiene una imagen
    let hasImage = false;
    const gameState = {
        detalle: $('#detalle').text(),
        selectedImages: {}
    };

    for (let i = 1; i <= 3; i++) {
        const container = $(`#drop${i}`);
        const selectedImage = container.find('img');

        if (selectedImage.length > 0) {
            hasImage = true;
            gameState.selectedImages[i] = {
                src: selectedImage.attr('src'),
                alt: selectedImage.attr('alt')
            };
        }
    }

    // Solo guarda si al menos un contenedor tiene una imagen
    if (hasImage) {
        localStorage.setItem('gameState', JSON.stringify(gameState));
    }
}

// Eliminar imagen también actualiza el estado
function removeImageFromContainer(containerId, draggedElement) {
    const container = document.getElementById(`drop${containerId}`);
    container.innerHTML = '';

    draggedElement.classList.remove('disabled');
    draggedElement.setAttribute('draggable', true);

    delete selectedImages[containerId];
    saveGameState();
}

/*


    Cargar estado desde localStorage si existe


*/
function loadGameState() {
    const gameState = localStorage.getItem('gameState');
    if (gameState) {
        const savedState = JSON.parse(gameState);

        $('#detalle').text(savedState.detalle);

        for (let i = 1; i <= 3; i++) {
            if (savedState.selectedImages[i]) {
                const container = $(`#drop${i}`);
                const imgData = savedState.selectedImages[i];

                container.html(`
                    <img src="${imgData.src}" alt="${imgData.alt}">
                `);

                // Deshabilitar la imagen correspondiente en el carrusel
                $('.carousel-item img').each(function () {
                    if ($(this).attr('src') === imgData.src) {
                        $(this).parent().addClass('disabled').attr('draggable', false);
                    }
                });

                // Habilitar eliminación al hacer doble clic
                container.find('img').on('dblclick', function () {
                    const parentDiv = $(this).parent();
                    removeImageFromContainer(i, parentDiv.find('img').get(0).parentNode);
                });
            }
        }
    }
}

/*


    Cargar grupo aleatorio si no hay estado guardado


*/
function loadRandomGroup() {
    const selectedGroupIndex = Math.floor(Math.random() * data.length);
    const selectedGroup = data[selectedGroupIndex];
    const otherGroup = data[selectedGroupIndex === 0 ? 1 : 0];

    $('#detalle').text(selectedGroup.detalle);
    setBackground(selectedGroupIndex);

    const selectedImages = getRandomItems(selectedGroup.objetos, 3);
    
    const otherImages = getRandomItems(otherGroup.objetos, 2);

    const allImages = [...selectedImages, ...otherImages];
    shuffleArray(allImages);

    loadImagesToCarousel(allImages);

    const shuffledNames = shuffleArray([...selectedImages.map(item => item.nombre)]);
    $('#obj1').text(shuffledNames[0] || 'Objeto 1');
    $('#obj2').text(shuffledNames[1] || 'Objeto 2');
    $('#obj3').text(shuffledNames[2] || 'Objeto 3');
}

/*


    Cargar imágenes al carrusel


*/
function loadImagesToCarousel(images) {
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
function loadSavedGroup(gameState) {
    // Encontrar el grupo seleccionado con los objetos
    const selectedGroup = data.find(group => group.detalle === gameState.detalle);

    if (selectedGroup) {
        setBackground(data.indexOf(selectedGroup));
        $('#detalle').text(selectedGroup.detalle);

        // Mostrar imágenes guardadas del grupo en el carrusel
        loadImagesToCarousel(selectedGroup.objetos);

        // Cargar nombres de los objetos en los contenedores
        const shuffledNames = shuffleArray(selectedGroup.objetos.map(item => item.nombre));
        $('#obj1').text(shuffledNames[0] || 'Objeto 1');
        $('#obj2').text(shuffledNames[1] || 'Objeto 2');
        $('#obj3').text(shuffledNames[2] || 'Objeto 3');
    } else {
        //console.error('No se encontró el grupo guardado. Cargando uno al azar...');
        loadRandomGroup();
    }
}

/*


    Reiniciar juego y limpiar datos


*/
function resetGame() {
    const playerName = localStorage.getItem('playerName') || 'Jugador';
    const score = Math.round((correctCount / totalContainers) * 100);
    
    savePlayerScore(playerName, score);

    for (let i = 1; i <= 3; i++) {
        $(`#drop${i}`).empty();
    }

    Object.keys(selectedImages).forEach(containerId => {
        const draggedElement = selectedImages[containerId];
        if (draggedElement) {
            draggedElement.classList.remove('disabled');
            draggedElement.setAttribute('draggable', true);
        }
    });

    selectedImages = {};
    localStorage.removeItem('gameState');

    loadRandomGroup();
}

// Cargar el estado si existe al iniciar
$(document).ready(function () {
    loadGameState();
});

/*


    Pedir nombre del jugador al iniciar


*/
function askUserName() {
    let playerName = '';

    // Mostrar prompt hasta que el nombre no esté vacío
    while (!playerName.trim()) {
        playerName = prompt('👤 Ingresa tu nombre para comenzar:');
        if (!playerName.trim()) {
            alert('⚠️ El nombre no puede estar vacío. Por favor, ingresa tu nombre.');
        }
    }

    // Guardar nombre en localStorage
    localStorage.setItem('playerName', playerName);
    alert(`🎮 ¡Bienvenido, ${playerName}! Que comience el juego.`);
}

/*


    Guardar puntaje del jugador


*/
function savePlayerScore(playerName, score) {
    let playerScores = JSON.parse(localStorage.getItem('playerScores')) || {};

    if (!playerScores[playerName]) {
        playerScores[playerName] = [];
    }

    playerScores[playerName].unshift(score);

    if (playerScores[playerName].length > 3) {
        playerScores[playerName].pop();
    }

    localStorage.setItem('playerScores', JSON.stringify(playerScores));
}

function historyScore() {
    const playerName = localStorage.getItem('playerName') || 'Jugador';
    const playerScores = JSON.parse(localStorage.getItem('playerScores')) || {};
    
    const scores = playerScores[playerName] || [];

    if (scores.length > 0) {
        alert(`Puntajes de ${playerName}:\n\n${scores.join('\n')}`);
    } else {
        alert(`No hay puntajes guardados para ${playerName}.`);
    }
}

function resetLocalStorage() {
    localStorage.clear();
    alert('Se han eliminado los datos. Comenzando desde cero...');
    location.reload();
}


function init() {
    if (!localStorage.getItem('playerName')) {
        askUserName();
    }

    const savedState = localStorage.getItem('gameState');

    if (savedState) {
        const gameState = JSON.parse(savedState);
        loadSavedGroup(gameState);
    } else {
        loadRandomGroup();
    }
}

// Inicializar al cargar
window.onload = init;

cargarDatos();