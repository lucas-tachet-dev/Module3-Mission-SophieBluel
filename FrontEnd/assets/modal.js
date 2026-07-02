import { refreshGalleries, categories } from "./index.js";

// Structure de la modale
const modalElement = document.createElement("div");

const photoGallery = `
<div class="photo-gallery">
    <h2>Galerie Photo</h2>
    <div class="modal-grid">
    </div>
    <button class="btn-add-photo">Ajouter une photo</button>
</div>`;

/**
 * Génétation des options de catégories
 * @returns categories
 */
const generateCategoryOptions = () => {
    return categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
};

const addPhoto = () => {
    return `
    <div class="modal-content">
        <h2>Ajout Photo</h2>
        <form class="form-add-photo">
            <div class="upload-div">
                <label for="photo-upload">
                    <img src="assets/icons/image.svg" alt="icône d'image" />
                    <span>+ Ajouter une photo</span>
                    <p>jpg, png : 4mo max</p>
                </label>
                <input type="file" id="photo-upload" name="image" accept="image/jpeg, image/png" />
            </div>
            <div class="photo-info">
                <label for="photo-title">Titre</label>
                <input type="text" name="title" id="photo-title" required />
                
                <label for="category-select">Catégorie</label>
                <select id="category-select" required />
                    <option value=""></option>
                    ${generateCategoryOptions()} 
                </select>
            </div>
            <button type="submit" class="btn-validate">Valider</button>
        </form>
    </div>`;
};

/**
 * Affichage de la modale
 * @param {Array} works 
 */
export function displayModal(works) {
    const portfolioElement = document.getElementById("portfolio");
    
    modalElement.innerHTML = `
        <aside id="edit-modal" class="modal" aria-hidden="true" role="dialog" aria-labelledby="modal-title">
            <div class="modal-wrapper">
                <div class="modal-btns">
                    <img class="modal-back" src="assets/icons/arrow-left-solid-full.svg" alt="Retour en arrière" />
                    <img class="modal-close" src="assets/icons/xmark-solid-full.svg" alt="Fermeture de la fenêtre d'édition" />
                </div>
                <div class="modal-body"></div>
            </div>
        </aside>`;

    portfolioElement.insertAdjacentElement("beforebegin", modalElement);
    
    // Écouteurs de fermeture
    const closeIcon = modalElement.querySelector(".modal-close");
    closeIcon.addEventListener("click", closeModal);

    const modalZone = modalElement.querySelector(".modal");
    modalZone.addEventListener('click', (event) => {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    });
    
    // Écouteur du bouton retour
    const backButton = modalElement.querySelector(".modal-back");
    backButton.addEventListener("click", () => {
        showGallery(works);
    });
    
    showGallery(works);
}

/**
 * Fonction de suppression
 * @param {number} workId 
 * @returns boolean
 */
async function deleteWork(workId) {
    let token = sessionStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                alert("Session expirée ou non autorisée. Veuillez vous reconnecter.");
            } else {
                alert("Erreur lors de la suppression du projet.");
            }
            return false;
        }
        
        return true;

    } catch (error) {
        console.error("Erreur réseau :", error);
        return false;
    }
}

/**
 * Fonction d'affichage de galerie
 * @param {Array} works 
 */
function showGallery(works){
    modalElement.querySelector(".modal-back").classList.remove("visible");
    
    const modalBody = modalElement.querySelector(".modal-body");
    modalBody.innerHTML = photoGallery;
    
    // Écouteur pour la partie d'ajout de photo
    const addPhotoButton = document.querySelector(".btn-add-photo");
    addPhotoButton.addEventListener("click", switchAddPhoto);

    // Récup de l'élement DOM pour la figure
    const modalGrid = document.querySelector(".modal-grid");
    
    // Replissage de la grille
    works.forEach(work => {
        // Création de la figure
        const figure = document.createElement("figure");
        
        // Définir son id
        figure.dataset.workId = work.id;

        // Création de son HTML
        figure.innerHTML = `
            <img class="modal-img" src="${work.imageUrl}" alt="${work.title}" />
            <img class="delete-icon" id="delete-${work.id}" src="assets/icons/trash-can-solid-full.svg" alt="Supprimer ${work.title}"/>
        `;

        // Ajout du bouton de l'écouteur de suppression d'élément 
        const deleteIcon = figure.querySelector(".delete-icon");
        deleteIcon.addEventListener("click", async (event) => {
        
        if (confirm(`Voulez-vous vraiment supprimer "${work.title}" ?`)) {
            
            const deletionSuccessful = await deleteWork(work.id);
            
            if (deletionSuccessful) {
                await refreshGalleries(); 
                figure.remove();
            }
        }
});

        modalGrid.appendChild(figure);
    })
}

/**
 * Basculement sur la page d'ajout de photo
 */
function switchAddPhoto() {
    modalElement.querySelector(".modal-back").classList.add("visible");   
    const modalBody = modalElement.querySelector(".modal-body");
    modalBody.innerHTML = addPhoto();
    
    const photoForm = modalElement.querySelector("form");
    photoForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const photo = photoForm.querySelector("input[type=file]").files[0];
        const maxSize = 4 * 1024 * 1024;
        
        if(photo.size > maxSize) {
            alert("Photo trop volumineuse");
            photoForm.reset();
            return
        }

        const photoTitle = photoForm.querySelector("input[type=text]").value;
        const photoCategoryId = photoForm.querySelector("select");
        const categoryValue = parseInt(photoCategoryId.value);

        console.log("Fichier photo :", photo);
        console.log("Titre :", photoTitle);
        console.log("ID Catégorie envoyé :", categoryValue)

        const formData = new FormData();
        formData.append("image", photo);
        formData.append("title", photoTitle);
        formData.append("category", categoryValue);

        let token = sessionStorage.getItem("token");
        
        try {
            const response = await fetch(`http://localhost:5678/api/works`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    alert("Session expirée ou non autorisée. Veuillez vous reconnecter.");
                } else {
                    alert("Erreur lors de l'ajout du projet.");
                }
            } else {
                alert("Projet ajouté avec succès !");
                refreshGalleries();
                photoForm.reset();
            }

        } catch (error) {
            console.error("Erreur réseau :", error);
        }
    });
    
    const fileInput = photoForm.querySelector("#photo-upload");
    const uploadDiv = photoForm.querySelector(".upload-div");
    
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function (e) {
                // Vider la div Upload
                uploadDiv.innerHTML = "";
                
                // Création élément image d'aperçu
                const imgPreview = document.createElement("img");
                imgPreview.src = e.target.result;
                imgPreview.alt = "Aperçu de la photo";
                imgPreview.classList.add("img-preview");
                
                // On l'ajoute dans la div
                uploadDiv.appendChild(imgPreview);
            };
            
            // Lancement lecture du fichier
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Fermeture de la modale
 */
function closeModal(){
    modalElement.remove();
}

