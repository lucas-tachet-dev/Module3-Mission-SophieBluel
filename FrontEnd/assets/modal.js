// Récup des catégories
let categories = localStorage.getItem("categories");

// Récup dans l'API si rien dans le localStorage
if (categories === null) {
    // Récup de l'API
    const response = await fetch("http://localhost:5678/api/works");
    categories = await response.json();
    
    // Transformation des projets en JSON
    const valueCategories = JSON.stringify(categories);

    // Stockage dans le localStorage
    localStorage.setItem("categories", valueCategories);
} else {
    categories = JSON.parse(categories)
};

const modalElement = document.createElement("div");

const photoGallery = `
<div>
    <h2>Galerie Photo</h2>
    <div class="modal-grid">
    </div>
    <button>Ajouter une photo</button>
</div>`;

const addPhoto = `
<div class="modal-content">
    <h2>Ajout Photo</h2>
    <form class="form-add-photo">
        <div class="upload-div">
            <label for="photo-upload">
                <img src="assets/icons/image.svg" alt="icône d'image" />
                <span>+ Ajouter une photo</span>
                <p>jpg, png : 4mo max</p>
            </label>
            <input type="file" id="photo-upload" accept="image/jpg, image/png" />
        </div>
        <div class="photo-info">
            <label for="photo-title">Titre</label>
            <input type="text" name="photo-title" id="photo-title" />
            <label for="category-select">Catégorie</label>
            <select name="category" id="category-select">
                <option value=""></option>
                <option value="objets" id="${categories[0].id}">${categories[0].name}</option>
                <option value="appartement" id="${categories[1].id}">${categories[1].name}</option>
                <option value="hotel" id="${categories[2].id}">${categories[2].name}</option>
            </select>
        </div>
    </form>
    <button>Valider</button>
</div>`;

export function displayModal(works){
    const portfolioElement = document.getElementById("portfolio");
    
    modalElement.innerHTML = `
        <aside id="edit-modal" class="modal" aria-hidden="true" role="dialog" aria-labelledby="modal-title">
            <div class="modal-wrapper">
                <div class="modal-btns">
					<img class="modal-back" src="assets/icons/arrow-left-solid-full.svg" alt="Retour en arrière" />
                    <img class="modal-close" src="assets/icons/xmark-solid-full.svg" alt="Fermeture de la fenêtre d'edition" />
                </div>
                ${photoGallery}
            </div>
        </aside>`;

    portfolioElement.insertAdjacentElement("beforebegin", modalElement);
    
    const closeIcon = document.querySelector(".modal-close");
    closeIcon.addEventListener("click", closeModal);

    const modalZone = document.querySelector(".modal");
    modalZone.addEventListener('click', (event) => {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    });

    for(let i = 0; i < works.length; i++){
        const work = works[i];

        // Récup de l'élement DOM pour la figure
        const modalGrid = document.querySelector(".modal-grid");

        // Création de la figure
        const modalElement = document.createElement("figure")
        modalElement.dataset.id = work.id
        // Création du code HTML dans l'élément
        modalElement.innerHTML = `
        <img class="modal-img" src="${work.imageUrl}" alt="${work.title}" />
        <img class="delete-icon" id="delete${work.id}" src="assets/icons/trash-can-solid-full.svg" alt="Supprimer ${work.title}"/>`;

        //Insertion de l'élément dans le DOM
        modalGrid.appendChild(modalElement);
    }
};

function closeModal(){
    modalElement.remove();
}