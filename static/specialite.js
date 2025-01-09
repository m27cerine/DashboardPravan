// --------------------------- Partie 1 : Le filtrage -----------------------------------
function getSpecialites() {
    const httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '/api/specialites');
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                const data = JSON.parse(httpRequest.responseText);
                const select = document.getElementById('specialite-select');
                select.innerHTML = '<option value="">Sélectionnez une spécialité</option>';
                data.forEach(specialite => {
                    const option = document.createElement('option');
                    option.value = specialite;
                    option.text = specialite;
                    select.appendChild(option);
                });
            } else {
                console.error('Erreur lors du chargement des spécialités');
            }
        }
    };
    httpRequest.send();
}

// ---------------------------- Charger les données de la spécialité sélectionnée ---------------------------
function getDataSpecialites(specialite) {
    const httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', `/api/data2/${specialite}`);
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                const data = JSON.parse(httpRequest.responseText);
                afficherGraphiquesG(data);
                const container = document.getElementById('dynamic-content');
                if (container) {
                    container.innerHTML = ''; // Effacer le contenu précédent
                }
                data.etudiantsSpecialiteParAnnee.forEach(item => {
                    getDataParAnnee(specialite, item.annee);
                });
            } else {
                console.error('Erreur lors du chargement des statistiques générales');
            }
        }
    };
    httpRequest.send();
}

function onSpecialiteChange() {
    const selectElement = document.getElementById('specialite-select');
    if (!selectElement) {
        console.error("L'élément select pour les spécialités n'existe pas !");
        return;
    }
    const specialite = selectElement.value;
    if (specialite) {
        getDataSpecialites(specialite);
    }
}

// ---------------------------- Fonction pour gérer les graphiques généraux ------------------------------------
function destroyChartIfExists(canvasId) {
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) {
        existingChart.destroy();
    }
}

function afficherGraphiquesG(data) {
    const ctx1 = document.getElementById('total_etudiant_specialite_annee');
    if (ctx1) {
        destroyChartIfExists('total_etudiant_specialite_annee');
        new Chart(ctx1, {
            type: 'polarArea',
            data: {
                labels: data.etudiantsSpecialiteParAnnee.map(item => item.annee),
                datasets: [{
                    label: 'Nombre d\'étudiants',
                    data: data.etudiantsSpecialiteParAnnee.map(item => item.total_etudiants),
                    backgroundColor: ['rgba(128, 0, 32, 0.2)', 'rgba(139, 0, 32, 0.4)', 'rgba(153, 0, 36, 0.6)'],
                    borderColor: ['rgba(128, 0, 32, 0.7)', 'rgba(139, 0, 32, 0.8)', 'rgba(153, 0, 36, 1)'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });
    }

    const ctx2 = document.getElementById('performanceMoyenne');
    if (ctx2) {
        destroyChartIfExists('performanceMoyenne');
        new Chart(ctx2, {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'Performance moyenne',
                    data: data.performanceMoyenne.map(item => ({
                        x: item.annee,
                        y: item.performance_moyenne,
                        r: 10
                    })),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });
    }
}

// ---------------------------- Graphiques par année ------------------------------------
function createYearSection(annee) {
    const container = document.getElementById('dynamic-content');
    if (!container) return;

    const yearTitle = document.createElement('h3');
    yearTitle.textContent = `Statistiques pour l'année ${annee}`;
    container.appendChild(yearTitle);
    const div = document.createElement('div');
    div.classList.add('chart-container');
    div.innerHTML = `
        <h4>Répartition des étudiants</h4>
        <canvas id="bestWorststudent_${annee}"></canvas>
    `;
    container.appendChild(div);
}

function getDataParAnnee(specialite, annee) {
    const httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', `/api/data2/${specialite}/${annee}`);
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                const data3 = JSON.parse(httpRequest.responseText);
                createYearSection(annee);
                const ctxBestWorst = document.getElementById(`bestWorststudent_${annee}`);
                if (ctxBestWorst) {
                    destroyChartIfExists(`bestWorststudent_${annee}`);
                    new Chart(ctxBestWorst, {
                        type: 'doughnut',
                        data: {
                            labels: ['Moyenne >= 10', 'Moyenne < 10'],
                            datasets: [{
                                data: [data3.bestStudent.length, data3.worstStudent.length],
                                backgroundColor: ['#8e0447', '#041e4c'],
                                borderColor: ['#8e0447', '#041e4c'],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: { position: 'top' }
                            }
                        }
                    });
                }
            } else {
                console.error(`Erreur lors du chargement des données pour l'année ${annee}`);
            }
        }
    };
    httpRequest.send();
}


// Initialisation au chargement de la page.
document.addEventListener('DOMContentLoaded', () => {
    getSpecialites();
    const selectElement = document.getElementById('specialite-select');
    if (selectElement) {
        selectElement.addEventListener('change', onSpecialiteChange);
    }
});
