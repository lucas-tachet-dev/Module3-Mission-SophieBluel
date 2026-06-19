const modalElement = document.createElement("div");

export function displayModal(works){
    const portfolioElement = document.getElementById("portfolio");
    
    modalElement.innerHTML = `
        <aside id="edit-modal" class="modal" aria-hidden="true" role="dialog" aria-labelledby="modal-title">
            <div class="modal-wrapper">
                <img class="modal-close" src="assets/icons/xmark-solid-full.svg" alt="Fermeture de la fenêtre d'edition" />
                <h2>Galerie Photo</h2>
                <div class="modal-grid">
                </div>
                <button>Ajouter une photo</button>
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