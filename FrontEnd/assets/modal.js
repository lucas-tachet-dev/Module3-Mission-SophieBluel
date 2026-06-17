export function displayModal(works){
    const portfolioElement = document.getElementById("portfolio");

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
        <img class="delete-icon" id="" src="assets/icons/trash-can-solid-full.svg" alt="Supprimer ${work.title}"/>`;

        //Insertion de l'élément dans le DOM
        modalGrid.appendChild(modalElement);
        console.log("tamer")
    }
};