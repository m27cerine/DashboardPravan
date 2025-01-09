// Affiche ou masque le menu en cliquant sur le bouton
document.addEventListener('DOMContentLoaded', () => {
    const toggleMenuButton = document.getElementById("menu-btn");
    const sidebar = document.querySelector(".sidebar");

    toggleMenuButton.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
});

// Charge le contenu de la section demandée
function showSection(sectionId) {
    console.log('Chargement de la section:', sectionId);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/get-dashboard-content/' + sectionId, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById('content').innerHTML = xhr.responseText;
            if (sectionId === 'dashboard') {
                console.log("Chargement du script dashboard.js..");
                loadDashboardScript();
            }
            if (sectionId === 'specialites') {
                console.log("Chargement du script specialite.js..");
                loadSpecialiteScript();
            }
            if (sectionId === 'annees') {
                console.log("Chargement du script annee.js..");
                loadAnneeScript();
            }
            if (sectionId === 'resultats') {
                console.log("Chargement du script resultat.js..");
                loadResultatScript();
            }
        }
    };
    xhr.send();
}

// Charge le script du dashboard
function loadDashboardScript() {
    console.log("Loading dashboard.js...");
    var script = document.createElement('script');
    script.src = '/static/dashboard.js'; 
    script.onload = () => {
        getDashboard();
    };
    document.body.appendChild(script);
}

// Charge le script de la spécialité
function loadSpecialiteScript() {
    console.log("Loading specialite.js...");
    var script = document.createElement('script');
    script.src = '/static/specialite.js'; 
    script.onload = () => {
        getSpecialites();
    };
    document.body.appendChild(script);
}

// Charge le script de l'année
function loadAnneeScript() {
    console.log("Loading annee.js...");
    var script = document.createElement('script');
    script.src = '/static/annee.js'; 
    script.onload = () => {
        getAnnees();
    };
    document.body.appendChild(script);
}

// Charge le script du résultat
function loadResultatScript() {
    console.log("Loading resultat.js...");
    var script = document.createElement('script');
    script.src = '/static/resultat.js';
    script.onload = () => {
        getAnnees();
        getSpecialites();
    };
    document.body.appendChild(script);
}

// Affiche la section 'dashboard' par défaut au chargement de la page
window.onload = function() {
    showSection('dashboard');
}
// Sélectionner le bouton par son ID
const actualiserBtn = document.getElementById("actualiser-btn");

// Ajouter un écouteur d'événement pour détecter les clics
actualiserBtn.addEventListener("click", () => {
    // Recharger la page
    location.reload();
});
