
//-------------------------------------Charger les données du dashboard-------------------------------------
function getDashboard() {
  const httpRequest = new XMLHttpRequest();
  httpRequest.open('GET', '/api/data');
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        const data = JSON.parse(httpRequest.responseText);
        updateCharts(data);
        updateKPIs(data);
      } else {
        console.error('Erreur lors du chargement des données :', httpRequest.statusText);
      }
    }
  };
  httpRequest.send();
}

//-------------------------------------Mise à jour des graphiques et des KPI-------------------------------------
function updateCharts(data) {
  // Graphique des étudiants par année
  const etudiantsParAnneeData = data.etudiantsParAnnee;
  const anneeLabels = etudiantsParAnneeData.map(d => d.annee);
  const etudiantsCounts = etudiantsParAnneeData.map(d => d.total_etudiants);

  const ctx1 = document.getElementById('etudiantsParAnnee').getContext('2d');
  new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: anneeLabels,
      datasets: [{
        label: 'Nombre d\'étudiants par année',
        data: etudiantsCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // Graphique de répartition par genre
  const sexeLabels = data.repartitionParSexe.map(d => d.sexe);
  const sexeCounts = data.repartitionParSexe.map(d => d.total);

  const ctx2 = document.getElementById('repartitionParGenre').getContext('2d');
  new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: sexeLabels,
      datasets: [{
        label: 'Répartition par sexe',
        data: sexeCounts,
        backgroundColor: ['#c32f55', '#385c8e'], 
        hoverOffset: 4
      }]
    }
  });

  // Graphique des performances moyennes
  const performanceMoyenneData = data.performanceMoyenne;
  const performanceLabels = performanceMoyenneData.map(d => d.annee);
  const performanceValues = performanceMoyenneData.map(d => d.performance_moyenne);

  const ctx3 = document.getElementById('performanceMoyenne').getContext('2d');
  new Chart(ctx3, {
    type: 'line',
    data: {
      labels: performanceLabels,
      datasets: [{
        label: 'Performance moyenne par année',
        data: performanceValues,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      }]
    }
  });

  // Graphique d'évolution des spécialités
  const specialiteLabels = data.evolutionSpecialites.map(d => d.specialite);
  const specialiteCounts = data.evolutionSpecialites.map(d => d.total);

  const ctx4 = document.getElementById('evolutionSpecialites').getContext('2d');
  new Chart(ctx4, {
    type: 'radar',
    data: {
      labels: specialiteLabels,
      datasets: [{
        label: 'Évolution des spécialités',
        data: specialiteCounts,
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)'
      }]
    }
  });

  // Graphique scatter pour les tranches moyennes
  if (data.trancheMoyenne) {
    const scatterData = data.trancheMoyenne.map(d => ({
      x: parseFloat(d.tranche.split('-')[0]),
      y: d['COUNT(*)']
    }));

    const ctxScatter = document.getElementById('trancheMoyenne').getContext('2d');
    new Chart(ctxScatter, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Étudiants par tranche de moyenne',
          data: scatterData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)'
        }]
      }
    });
  }

  // Répartition par sexe et spécialité
  const specialiteLabelsSexe = [...new Set(data.repartitionSexeSpecialite.map(d => d.specialite))];
  const hommes = specialiteLabelsSexe.map(specialite => {
    const specialiteData = data.repartitionSexeSpecialite.find(d => d.specialite === specialite && d.sexe === 'H');
    return specialiteData ? specialiteData.total : 0;
  });

  const femmes = specialiteLabelsSexe.map(specialite => {
    const specialiteData = data.repartitionSexeSpecialite.find(d => d.specialite === specialite && d.sexe === 'F');
    return specialiteData ? specialiteData.total : 0;
  });

  const ctx5 = document.getElementById('repartitionSexeSpecialite').getContext('2d');
  new Chart(ctx5, {
    type: 'bar',
    data: {
      labels: specialiteLabelsSexe,
      datasets: [
        { label: 'Hommes', data: hommes, backgroundColor: '#041e4c' },
        { label: 'Femmes', data: femmes, backgroundColor: '#8e0447' }
      ]
    },
    options: { responsive: true }
  });
}


function updateKPIs(data) {
  afficherKPI('kpiEtudiants', data.totalEtudiants);
  afficherKPI('kpiSpecialites', data.totalSpecialites);
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

// Charger les données au chargement de la page
window.onload = getDashboard;

// Événement pour actualiser les données
document.getElementById('actualiser-btn').addEventListener('click', () => {
  getDashboard();
});
