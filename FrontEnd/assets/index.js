import { displayModal } from "./modal.js";

/**
 * Export des variables des projets et catégories
 */
export let works = [];
export let categories = [];

/**
 * Récup des catégories dans le localStorage ou API
 */
async function loadCategories() {
    let localCategories = localStorage.getItem("categories");

    if (localCategories === null) {
        try {
            const response = await fetch("http://localhost:5678/api/categories");
            categories = await response.json();
            localStorage.setItem("categories", JSON.stringify(categories));
        } catch (error) {
            console.error("Erreur lors du chargement des catégories :", error);
        }
    } else {
        categories = JSON.parse(localCategories);
    }
}

/**
 * Rafraichir les projets depuis l'API
 */
export async function refreshGalleries() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        works = await response.json();
        
        const gallery = document.querySelector(".gallery");
        if (gallery) {
            gallery.innerHTML = "";
            displayWorks(works);
        }
    } catch (error) {
        console.error("Erreur lors de la synchronisation des galeries :", error);
    }
}

/**
 * Génération des projets sur la page
 * @param {Array} works 
 */

function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
    if (!gallery) return;

    works.forEach(work => {
        const workElement = document.createElement("figure");
        workElement.dataset.id = work.id;
        workElement.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `;
        gallery.appendChild(workElement);
    });
};

//Récupération du token de Sophie
let token = sessionStorage.getItem("token");

// Vérification du token de login
function checkLogin() {

    const projectsTitle = document.querySelector("#portfolio h2");
    const btnfilters = document.querySelector(".btn-filters");
    const headerElement = document.querySelector("header")
    const editionBar = document.createElement("div")

    if(token){
        // afficher les éléments du mode modification
        // Bande Mode édition
        editionBar.innerHTML = `<div class="edition-bar">
        <img src="assets/icons/pen-to-square.svg" alt="icône de modification"/> Mode édition</div>`;
        headerElement.insertAdjacentElement("beforebegin", editionBar);
        // modifier les projets pour la modale
        projectsTitle.innerHTML = `Mes Projets
        <span class="edit-projects">
        <img src="assets/icons/pen-to-square.svg" alt="icône de modification"/> 
        modifier</span>`;

        //Afficher la modale d'édition
        const modalButton = document.querySelector(".edit-projects");
        modalButton.addEventListener("click", (event) => {
            event.stopPropagation();
            displayModal(works);
        });

        btnfilters.classList.add("hidden");
        // Exécuter la fonction du setup de déconnexion
        setupLogOut();
    } else {
        // S'assurer que les éléments soient cachés
        btnfilters.classList.remove("hidden");
        editionBar.remove();
        projectsTitle.innerHTML = `Mes Projets`;
    } 
}

function setupLogOut () {
    // Cibler le LogOut
    const logOutButton = document.getElementById("login");
    // Changer le texte
    logOutButton.innerText = "logout";
    // Comportement du logout
    logOutButton.addEventListener("click", (event) => {
        event.preventDefault();
        logOutButton.innerText = "login";
        sessionStorage.removeItem("token");
        window.location.reload();
    })
}

// Mise à jour du CSS du bouton selectionné
function updateButton(select){
    const btns = document.querySelectorAll(".btn-filters button");
    for(let i = 0; i < btns.length; i++){
        if(i === select){
            btns[i].classList.add("btn-selected")
        } else {
            btns[i].classList.remove("btn-selected")
        }
    }
}

// Afficher toutes les projets
const allButton = document.querySelector(".btn-all");
allButton.addEventListener("click", () => {
    updateButton(0);
    document.querySelector(".gallery").innerHTML =``;
    displayWorks(works);
});

// Filtrer la catégorie objets
const filterObjectsButton = document.querySelector(".btn-objects");
filterObjectsButton.addEventListener("click", () => {
    const filterObjects = works.filter((works) => {
        return works.categoryId === 1;
    });
    updateButton(1);
    document.querySelector(".gallery").innerHTML =``;
    displayWorks(filterObjects);
});

// Filtrer la catégorie Appartements
const filterAppartmentButton = document.querySelector(".btn-appartments");
filterAppartmentButton.addEventListener("click", () => {
    const filterAppartment = works.filter((works) => {
        return works.categoryId === 2;
    });
    updateButton(2);
    document.querySelector(".gallery").innerHTML =``;
    displayWorks(filterAppartment);
});

// Filtrer la catégorie Appartements
const filterHotelButton = document.querySelector(".btn-hotel");
filterHotelButton.addEventListener("click", () => {
    const filterHotel = works.filter((works) => {
        return works.categoryId === 3;
    });
    updateButton(3);
    document.querySelector(".gallery").innerHTML =``;
    displayWorks(filterHotel);
});


/**
 * Lancement de initial
 */
async function init() {
    await loadCategories();
    await refreshGalleries();
    checkLogin();
}

init();