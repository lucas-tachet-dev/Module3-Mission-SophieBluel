import { apiLink } from "./config.js";

// Submit du login
const login = document.querySelector("#login");
console.log(login)


/**
 * Ecouteur du formulaire de connexion
*/
const btnConnect = document.querySelector("#login button");
btnConnect.addEventListener("click", async (event) => {
    event.preventDefault();

    //Récup des elem d'email et password
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");

    //Récup de leurs valeurs
    const emailValue = emailInput.value;
    const passwordValue = passwordInput.value;

    //Stockage dans un objet
    const loginData = {
        email: emailValue,
        password: passwordValue
    }

    //envoie d'une requête POST à l'API
    const response = await fetch(`${apiLink}/users/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(loginData)
    })

    //Test du login
    if(response.ok){
        const data = await response.json();

        //Stockage du token dans la sessionStorage
        sessionStorage.setItem("token", data.token);

        //Redirection vers l'index
        window.location.href = "index.html";
    } else {
        alert("Email/Mot de passe incorrect")
    }
})

