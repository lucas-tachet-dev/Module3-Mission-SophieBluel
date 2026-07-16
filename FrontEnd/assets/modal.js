import { apiLink } from "./config.js";
import { refreshGalleries, categories, getWorks } from "./index.js";

/**
 * Element de structure de la modale
 */

const modalElement = document.createElement("div");

const photoGallery = `
<div class="photo-gallery">
    <h2>Galerie Photo</h2>
    <div class="modal-grid">
    </div>
    <button class="btn-add-photo selectable">Ajouter une photo</button>
    <span id="delete-message"></span>
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
            <button type="submit" class="btn-validate btn-disabled">Valider</button>
            <span id="form-message"></span>
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
                    <img class="modal-back selectable" src="assets/icons/arrow-left-solid-full.svg" alt="Retour en arrière" />
                    <img class="modal-close selectable" src="assets/icons/xmark-solid-full.svg" alt="Fermeture de la fenêtre d'édition" />
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
    backButton.addEventListener("click", async () => {
        await refreshGalleries();
        showGallery(getWorks());
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
    const deleteMessage = document.querySelector("#delete-message");
    
    try {
        const response = await fetch(`${apiLink}/works/${workId}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            deleteMessage.style.color = "#d10000";
            if (response.status === 401) {
                deleteMessage.innerText = "Session expirée ou non autorisée. Veuillez vous reconnecter.";
            } else {
                deleteMessage.innerText = "Erreur lors de la suppression du projet.";
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
            const deletionSuccessful = await deleteWork(work.id);
            const deleteMessage = document.querySelector("#delete-message");
            
            if (deletionSuccessful) {
                deleteMessage.style.color = "#09ad2f";
                deleteMessage.innerText = "Projet supprimé avec succès !"
                setTimeout(() => {deleteMessage.innerText = "";}, 3000)
                await refreshGalleries(); 
                figure.remove();

                works = getWorks();
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
    
    const fileInput = photoForm.querySelector("#photo-upload");
    const titleInput = photoForm.querySelector("#photo-title");
    const categorySelect = photoForm.querySelector("#category-select");
    const validateBtn = photoForm.querySelector(".btn-validate");
    const messageSpan = photoForm.querySelector("#form-message");
    const uploadDiv = photoForm.querySelector(".upload-div");

    
    validateBtn.disabled = true;
    validateBtn.classList.add("btn-disabled");

    // Vérification globale
    function checkFormValidity() {
        const photo = fileInput.files[0];
        const title = titleInput.value.trim();
        const category = categorySelect.value;
        const maxSize = 4 * 1024 * 1024; // 4 Mo

        const isPhotoValid = photo && photo.size <= maxSize;
        const isTitleValid = title.length > 0;
        const isCategoryValid = category !== "";

        if (isPhotoValid && isTitleValid && isCategoryValid) {
            validateBtn.disabled = false;
            validateBtn.classList.remove("btn-disabled");
            validateBtn.classList.add("selectable");
            messageSpan.innerText = ""; 
        } else {
            validateBtn.disabled = true;
            validateBtn.classList.add("btn-disabled");
            validateBtn.classList.remove("selectable");

            // Si une photo est trop lourde
            if (photo && photo.size > maxSize) {
                messageSpan.style.color = "#d10000";
                messageSpan.innerText = "La photo dépasse la limite de 4 Mo.";
            }
        }
    }

    // Écouteur sur le changement de fichier (Aperçu + Validation)
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        const maxSize = 4 * 1024 * 1024

        if (file) {

            if (file.size > maxSize) {
                messageSpan.style.color = "#d10000";
                messageSpan.innerText = "La photo dépasse la limite de 4 Mo.";
                
                fileInput.value = ""; 
                
                const existingPreview = uploadDiv.querySelector(".img-preview");
                if (existingPreview) existingPreview.remove();
                
                const labelPreview = uploadDiv.querySelector("label");
                if (labelPreview) labelPreview.style.display = "flex";

                checkFormValidity();
                return;
            }

            const reader = new FileReader();
            
            reader.onload = function (e) {
                // Masquer le label visuel d'origine
                const labelPreview = uploadDiv.querySelector("label");
                if (labelPreview) {
                    labelPreview.style.display = "none";
                }
                
                // Éviter les doublons d'images si plusieurs changements
                const existingPreview = uploadDiv.querySelector(".img-preview");
                if (existingPreview) {
                    existingPreview.remove();
                }
                
                // Création et affichage de l'image de preview
                const imgPreview = document.createElement("img");
                imgPreview.src = e.target.result;
                imgPreview.alt = "Aperçu de la photo";
                imgPreview.classList.add("img-preview");
                
                uploadDiv.appendChild(imgPreview);
            };
            
            reader.readAsDataURL(file);
        }

        checkFormValidity();
    });

    // Écouteurs sur titre et sélection de catégories
    titleInput.addEventListener("input", checkFormValidity);
    categorySelect.addEventListener("change", checkFormValidity);

    // Submit du formulaire
    photoForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const photo = fileInput.files[0];
        const photoTitle = titleInput.value;
        const categoryValue = parseInt(categorySelect.value);

        const formData = new FormData();
        formData.append("image", photo);
        formData.append("title", photoTitle);
        formData.append("category", categoryValue);

        let token = sessionStorage.getItem("token");
        
        try {
            const response = await fetch(`${apiLink}/works`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            if (!response.ok) {
                messageSpan.style.color = "#d10000";
                if (response.status === 401) {
                    messageSpan.innerText = "Session expirée ou non autorisée. Veuillez vous reconnecter.";
                } else {
                    messageSpan.innerText = "Erreur lors de l'ajout du projet.";
                }
            } else {
                messageSpan.style.color = "#09ad2f";
                messageSpan.innerText = "Projet ajouté avec succès ! 🎉";
                
                await refreshGalleries();
                
                photoForm.reset();
                
                validateBtn.disabled = true;
                validateBtn.classList.add("btn-disabled");

                const labelPreview = uploadDiv.querySelector("label");
                const imgPreview = uploadDiv.querySelector(".img-preview");
                if (labelPreview) {
                    labelPreview.style.display = "flex";
                }
                if (imgPreview) {
                    imgPreview.remove();
                }

                setTimeout(() => {
                    messageSpan.innerText = "";
                }, 3000);
            }

        } catch (error) {
            console.error("Erreur réseau :", error);
            messageSpan.style.color = "#d10000";
            messageSpan.innerText = "Erreur réseau. Impossible de joindre le serveur.";
        }
    });
}

/**
 * Fermeture de la modale
 */
function closeModal(){
    modalElement.remove();
}

