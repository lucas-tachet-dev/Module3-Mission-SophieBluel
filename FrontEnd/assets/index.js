import { displayModal } from "./modal.js";

/**
 * Export des variables des projets, catégories et API
 */
export const apiLink = "http://localhost:5678/api";
export let works = [];
export let categories = [];

export function getWorks() {
    return works;
}

/**
 * Récup des catégories dans le localStorage ou API
 */
async function loadCategories() {
    let localCategories = localStorage.getItem("categories");

    if (localCategories === null) {
        try {
            const response = await fetch(`${apiLink}/categories`);
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
        const response = await fetch(`${apiLink}/works`);
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

/**
 * Vérification du token de login et mise en page selon l'état
 */

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

/**
 * Fonction pour déconnecter l'utilsateur du mode édition
 */
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

// Afficher toutes les projets
const btnAll = document.querySelector(".btn-all");
btnAll.addEventListener("click", () => {
    const btnFiltersContainer = document.querySelector(".btn-filters");
    const allBtns = btnFiltersContainer.querySelectorAll(".btn-filters button");
    allBtns.forEach(btn => btn.classList.remove("btn-selected"));
    btnAll.classList.add("btn-selected");

    document.querySelector(".gallery").innerHTML =``;
    displayWorks(works);
});

/**
 * Fonction d'affichage boutons de filtres depuis l'API
 */
function setupFiltersBtns() {
    const btnFiltersContainer = document.querySelector(".btn-filters");
    
    categories.forEach((category) => {
        const btn = document.createElement("button");
        btn.textContent = category.name;
        btn.dataset.categoryId = category.id;
        
        btn.addEventListener("click", () => {
            const allBtns = btnFiltersContainer.querySelectorAll(".btn-filters button");
            allBtns.forEach(btn => btn.classList.remove("btn-selected"));
            btn.classList.add("btn-selected");
            
            document.querySelector(".gallery").innerHTML =``;
            const filteredWorks = works.filter(work => work.categoryId === category.id);
            displayWorks(filteredWorks);
        })
        
        btnFiltersContainer.appendChild(btn);
    });
}

/**
 * Lancement de initial
 */
async function init() {
    await loadCategories();
    await refreshGalleries();
    setupFiltersBtns();
    checkLogin();
}

init();