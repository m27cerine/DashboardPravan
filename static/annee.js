//-------------------------- Etape 1 : le filtrage ---------------------------------------------
function getAnnees(){
    httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '/api/annees');
    httpRequest.onreadystatechange = doAfficherAnnes;
    httpRequest.send();
}

function doAfficherAnnes(){
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            var data = JSON.parse(httpRequest.responseText);
            var select = document.getElementById('annee-select');
            select.innerHTML = '<option value="">Sélectionnez une année</option>';
            for (var i = 0; i < data.length; i++) {
                var option = document.createElement('option');
                option.value = data[i];
                option.text = data[i];
                select.appendChild(option);
            }
        } else {
            console.error('Erreur lors du chargement des années');
        }
    }
}

// ---------------------------- Partie 2 : Les graphiques de l'année sélectionnée  ------------------------------------
function getDataAnnee(annee) {
    httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '/api/data4/' + annee);
    httpRequest.onreadystatechange = doAfficherDataAnnee;
    httpRequest.send();
}

function doAfficherDataAnnee(){
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            var data = JSON.parse(httpRequest.responseText);
            afficherKPI('total-etudiants', data.totalEtudiants);
            afficherGraphiqueMixed(data);
        } else {
            console.error('Erreur lors du chargement des données');
        }
    }
}


// Initialisation 
getAnnees();

// Gestion de l'événement de changement de l'année
document.getElementById('annee-select').addEventListener('change', event => {
    const selectedYear = event.target.value;
    if (selectedYear) {
        getDataAnnee(selectedYear);
    }
});

//----------------------------Fonctions pour gerer les graphes et les kpi ----------------------------
function destroyChartIfExists(canvasId) {
    const existingChart = Chart.getChart(canvasId); 
    if (existingChart) {
        existingChart.destroy();
    }
}
function afficherGraphiqueMixed(data) {
    const ctx = document.getElementById('graphique-mixte');
    if (ctx) {
        destroyChartIfExists('graphique-mixte');
        new Chart(ctx, {
            type: 'bar',  // Le type principal est un bar chart, mais on y ajoutera un graphique linéaire
            data: {
                labels: data.labels, 
                datasets: [
                    {
                        label: 'Nombre total d\'étudiants',
                        data: data.totalEtudiantsData,  
                        backgroundColor: 'rgba(4, 30, 76, 0.5)', 
                        borderColor: 'rgba(4, 30, 76, 0.5)' ,                        
                        borderWidth: 2
                    },
                    {
                        label: 'Taux de réussite (%)',
                        data: data.tauxReussiteData,  
                        type: 'line', 
                        borderColor: '#8e0447',
                        backgroundColor: '#8e0447',
                        fill: false, 
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        beginAtZero: true,
                        stacked: false
                    }
                }
            }
        });
    }
}

function afficherKPI(id, valeur) {
    if (typeof valeur === 'object' && valeur !== null) {
        if (valeur.total_etudiants) {
            valeur = valeur.total_etudiants; 
        } else if (valeur.nombre_specialites_distinctes) {
            valeur = valeur.nombre_specialites_distinctes; 
        } else {
            console.error('Propriété inconnue dans l\'objet:', valeur);
            document.getElementById(id).textContent = 'Données non disponibles';
            return;
        }
    }
    
    if (typeof valeur === 'number') {
        document.getElementById(id).textContent = valeur.toLocaleString();
    } else {
        console.error('La valeur n\'est pas un nombre:', valeur);
        document.getElementById(id).textContent = 'Données non disponibles';
    }
}
