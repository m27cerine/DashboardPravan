//-------------------------Le filtrage des résultats--------------------------------
// Étape 1 : Récupération des années
function getAnnees() {
    console.log("Chargement des années..."); // Debug
    const httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '/api/annees');
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                console.log("Années récupérées avec succès:", httpRequest.responseText); // Debug
                const data = JSON.parse(httpRequest.responseText);
                const select = document.getElementById('annee-select');
                select.innerHTML = '<option value="">Sélectionnez une année</option>';
                data.forEach(annee => {
                    const option = document.createElement('option');
                    option.value = annee;
                    option.textContent = annee;
                    select.appendChild(option);
                });
            } else {
                console.error('Erreur lors du chargement des années');
            }
        }
    };
    httpRequest.send();
}

// Étape 2 : Récupération des spécialités
function getSpecialites() {
    console.log("Chargement des spécialités..."); // Debug
    const httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '/api/specialites');
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                console.log("Spécialités récupérées avec succès:", httpRequest.responseText); // Debug
                const data = JSON.parse(httpRequest.responseText);
                const select = document.getElementById('specialite-select');
                select.innerHTML = '<option value="">Sélectionnez une spécialité</option>';
                data.forEach(specialite => {
                    const option = document.createElement('option');
                    option.value = specialite;
                    option.textContent = specialite;
                    select.appendChild(option);
                });
            } else {
                console.error('Erreur lors du chargement des spécialités');
            }
        }
    };
    httpRequest.send();
}

//-----------------------------Affichage des étudiants--------------------------------
//ne pas lancer le chargement des données que si l'annee aisni que la spécialité sont sélectionnées
document.getElementById('annee-select').addEventListener('change', event => {
    const selectedYear = event.target.value;
    if (selectedYear) {
        checkChamps();
    }
});

document.getElementById('specialite-select').addEventListener('change', event => {
    const selectedSpecialite = event.target.value;
    if (selectedSpecialite) {
        checkChamps();
    }
});

function checkChamps() {
    const selectedYear = document.getElementById('annee-select').value;
    const selectedSpecialite = document.getElementById('specialite-select').value;
    if (selectedYear && selectedSpecialite) {
        getEtudiants();
    }
}

// écupération et affichage des étudiants filtrés
function getEtudiants() {
    const annee = document.getElementById('annee-select').value;
    const specialite = document.getElementById('specialite-select').value;
    console.log("Filtre sélectionné - Année:", annee, "Spécialité:", specialite); // Debug

    const httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', `/api/resultats/`+ annee + '/' + specialite);
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                console.log("Étudiants récupérés avec succès:", httpRequest.responseText); // Debug
                const data = JSON.parse(httpRequest.responseText);
                const tbody = document.getElementById('etudiants');
                tbody.innerHTML = '';

                if (data.length === 0) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td colspan="8">Aucun étudiant trouvé.</td>`;
                    tbody.appendChild(tr);
                    console.log("Aucun étudiant trouvé avec les filtres sélectionnés."); // Debug
                } else {
                    data.forEach((etudiant, index) => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td><input type="checkbox" data-index="${etudiant.matricule}"></td>
                            <td>${etudiant.matricule}</td>
                            <td>${etudiant.nom}</td>
                            <td>${etudiant.prenom}</td>
                            <td>${etudiant.sexe}</td>
                            <td>${etudiant.annee}</td>
                            <td>${etudiant.specialite}</td>
                            <td>${etudiant.moyenne}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                    console.log("Étudiants affichés dans le tableau."); // Debug
                }
            } else {
                console.error('Erreur lors du chargement des étudiants');
            }
        }
    };
    httpRequest.send();
}


// Initialisation des événements de changement
function initializeFilters() {
    console.log("Initialisation des filtres..."); // Debug
    document.getElementById('annee-select').addEventListener('change', getEtudiants);
    document.getElementById('specialite-select').addEventListener('change', getEtudiants);
}

// Charger les données au démarrage
window.onload = function () {
    console.log("Page chargée, initialisation..."); // Debug
    getAnnees();
    getSpecialites();
    initializeFilters();
};

//------------------------------CRUD des résultats--------------------------------
//Gestion du formulaire d'ajout : 
function openModal() {
    console.log("Ouverture de la modale..."); //
    document.getElementById("add-resultat-modal").style.display = "block";
}
function closeModal() {
    document.getElementById("add-resultat-modal").style.display = "none";
}

// Ajouter un résultat
function addResultat() {
    const matricule = document.getElementById("matricule").value;
    const nom = document.getElementById("nom").value;
    const prenom = document.getElementById("prenom").value;
    const sexe = document.getElementById("sexe").value;
    const annee = document.getElementById("annee").value;
    const specialite = document.getElementById("specialite").value;
    const moyenne = parseFloat(document.getElementById("moyenne").value);

    if (!matricule || !nom || !prenom || isNaN(moyenne)) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
    }

    const data = {
        matricule: matricule,
        nom: nom,
        prenom: prenom,
        sexe: sexe,
        annee: annee,
        specialite: specialite,
        moyenne: moyenne,
    };


    const httpRequest = new XMLHttpRequest();
    httpRequest.open("POST", "/api/resultats", true);
    httpRequest.setRequestHeader("Content-Type", "application/json");
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 201) {
                alert("Résultat ajouté avec succès !");
                getEtudiants(); 
                closeModal();   
                resetForm();  
            } else {
                alert("Erreur lors de l'ajout : " + httpRequest.responseText);
            }
        }
    };

    httpRequest.send(JSON.stringify(data)); 
}

// Réinitialise le formulaire après ajout
function resetForm() {
    document.getElementById("add-resultat-form").reset();
}

// Modifier un résultat
function updateResultat(index) {
    const annee = document.getElementById("anneeInput").value;
    const matricule = document.getElementById("matriculeInput").value;
    const nom = document.getElementById("nomInput").value;
    const prenom = document.getElementById("prenomInput").value;
    const sexe = document.getElementById("sexeInput").value;
    const specialite = document.getElementById("specialiteInput").value;
    const moyenne = parseFloat(document.getElementById("moyenneInput").value);

    if (annee && matricule && nom && prenom && sexe && specialite && !isNaN(moyenne)) {
        const data = new FormData();
        data.append("annee", annee);
        data.append("matricule", matricule);
        data.append("nom", nom);
        data.append("prenom", prenom);
        data.append("sexe", sexe);
        data.append("specialite", specialite);
        data.append("moyenne", moyenne);

        const httpRequest = new XMLHttpRequest();
        httpRequest.open("PUT", `/api/resultats/${index}`, true);
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    alert("Résultat modifié avec succès !");
                    getEtudiants();
                } else {
                    alert("Erreur : " + httpRequest.responseText);
                }
            }
        };
        httpRequest.send(data); 
    } else {
        alert("Veuillez remplir tous les champs correctement.");
    }
}

// Supprimer un résultat
function deleteResultat() {
    const selectedCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));

    if (selectedCheckboxes.length === 0) {
        alert("Veuillez sélectionner au moins un résultat à supprimer.");
        return;
    }
    const idsToDelete = selectedCheckboxes.map(checkbox => checkbox.dataset.index);
    if (!confirm(`Voulez-vous vraiment supprimer ${idsToDelete.length} résultat(s) ?`)) {
        return;
    }

    const httpRequest = new XMLHttpRequest();
    httpRequest.open("DELETE", `/api/resultats`, true); 
    httpRequest.setRequestHeader("Content-Type", "application/json"); 
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 204) {
                alert("Résultat(s) supprimé(s) avec succès !");
                getEtudiants(); 
            } else {
                alert("Erreur lors de la suppression : " + httpRequest.responseText);
            }
        }
    };
    httpRequest.send(JSON.stringify({ valIds: idsToDelete }));
}

