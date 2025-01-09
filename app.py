
from flask import Flask, make_response, render_template, jsonify, request
import mysql.connector

app = Flask(__name__)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'db_university'

def get_db_connection():
    return mysql.connector.connect(
        host=app.config['MYSQL_HOST'],
        port=app.config['MYSQL_PORT'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        database=app.config['MYSQL_DB']
    )


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-dashboard-content/<section_id>')
def get_dashboard_content(section_id):
    if section_id == 'dashboard':
        return render_template('dashboard.html')  
    elif section_id == 'specialites':
        return render_template('specialites.html')
    elif section_id == 'annees':
        return render_template('annee.html') 
    elif section_id == 'resultats':
        return render_template('resultat.html')
    else:
        return 'Section non trouvée', 404 

@app.route('/api/data', methods=["GET"])
def get_data():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT annee, COUNT(*) AS total_etudiants FROM resultats GROUP BY annee")
    etudiants_par_annee = cursor.fetchall()
    
    cursor.execute("SELECT sexe, COUNT(*) AS total FROM resultats GROUP BY sexe")
    repartition_par_sexe = cursor.fetchall()
    
    cursor.execute("SELECT annee, AVG(moyenne) AS performance_moyenne FROM resultats WHERE annee BETWEEN 2019 AND 2021 GROUP BY annee")
    performance_moyenne = cursor.fetchall()
    
    cursor.execute("SELECT specialite, COUNT(*) AS total FROM resultats GROUP BY specialite")
    evolution_specialites = cursor.fetchall()
    
    cursor.execute("SELECT COUNT(*) AS total_etudiants FROM resultats WHERE annee BETWEEN 2019 AND 2021")
    total_etudiants = cursor.fetchone()
    
    cursor.execute("""
    SELECT specialite, sexe, COUNT(*) AS total
    FROM resultats
    WHERE annee BETWEEN 2019 AND 2021
    GROUP BY specialite, sexe
    """)
    repartition_sexe_specialite = cursor.fetchall()
    
    cursor.execute("SELECT COUNT(DISTINCT specialite) AS nombre_specialites_distinctes FROM resultats")
    nombre_specialites_distinctes = cursor.fetchone()
    
    cursor.execute("""
    SELECT 
        CASE
            WHEN moyenne >= 0 AND moyenne < 5 THEN '0-5'
            WHEN moyenne >= 5 AND moyenne < 10 THEN '5-10'
            WHEN moyenne >= 10 AND moyenne < 15 THEN '10-15'
            WHEN moyenne >= 15 AND moyenne < 20 THEN '15-20'
            WHEN moyenne >= 20 THEN '20+'
        END AS tranche,
        COUNT(*) 
    FROM resultats
    GROUP BY tranche
    """)
    tranche_moyenne = cursor.fetchall()
    
    cursor.close()
    conn.close()

    data = {
        "etudiantsParAnnee": etudiants_par_annee,
        "repartitionParSexe": repartition_par_sexe,
        "performanceMoyenne": performance_moyenne,
        "evolutionSpecialites": evolution_specialites,
        "totalEtudiants": total_etudiants,
        "repartitionSexeSpecialite": repartition_sexe_specialite,
        "totalSpecialites": nombre_specialites_distinctes,
        "trancheMoyenne": tranche_moyenne
    }
    return jsonify(data)


@app.route('/api/specialites', methods=["GET"])
def get_specialites():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT specialite FROM resultats")
    specialites = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(specialites)


@app.route('/api/data2/<string:specialite>', methods=["GET"])
def get_data2(specialite):
    if not specialite:
        return jsonify({"error": "Aucune spécialité sélectionnée"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT annee, COUNT(*) AS total_etudiants FROM resultats WHERE specialite = %s GROUP BY annee", (specialite,))
    etudiants_specialite_par_annee = cursor.fetchall()

    cursor.execute("SELECT annee, AVG(moyenne) AS performance_moyenne FROM resultats WHERE specialite = %s AND annee BETWEEN 2019 AND 2021 GROUP BY annee", (specialite,))
    performance_moyenne = cursor.fetchall()
    
    conn.close()
    data2 = {
        "etudiantsSpecialiteParAnnee": etudiants_specialite_par_annee,
        "performanceMoyenne": performance_moyenne    
    }
    return jsonify(data2)

@app.route('/api/data2/<string:specialite>/<int:annee>', methods=["GET"])
def get_data3(specialite, annee):
    if not specialite:
     return jsonify({"error": "Aucune spécialité sélectionnée"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT matricule, moyenne FROM resultats WHERE specialite = %s AND annee = %s AND moyenne < 10 ORDER BY moyenne ASC",
        (specialite, annee)
    )
    worst_student = cursor.fetchall()

    cursor.execute(
        "SELECT matricule, moyenne FROM resultats WHERE specialite = %s AND annee = %s AND moyenne >= 10 ORDER BY moyenne DESC",
        (specialite, annee)
    )
    best_student = cursor.fetchall()
    
    conn.close()

    data3 = {
        "worstStudent": worst_student,
        "bestStudent": best_student    
    }
    return jsonify(data3)



@app.route('/api/annees', methods=["GET"])
def get_annees():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT annee FROM resultats")
    annees = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(annees)

@app.route('/api/data4/<int:annee>', methods=["GET"])
def get_data4(annee):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT COUNT(*) AS total_etudiants FROM resultats WHERE annee = %s", 
        (annee,)
    )
    total_etudiants = cursor.fetchone()
    cursor.execute(
        "SELECT specialite, COUNT(*) AS total_etudiants FROM resultats WHERE annee = %s GROUP BY specialite", 
        (annee,)
    )
    etudiants_specialite_par_annee = cursor.fetchall()
    cursor.execute(
        """
        SELECT specialite, 
               COUNT(CASE WHEN moyenne >= 10 THEN 1 END) * 100.0 / COUNT(*) AS taux_reussite
        FROM resultats 
        WHERE annee = %s 
        GROUP BY specialite
        """,
        (annee,)
    )
    taux_reussite = cursor.fetchall()

    conn.close()
    
    labels = []
    total_etudiants_data = []
    taux_reussite_data = []

    for item in etudiants_specialite_par_annee:
        specialite = item["specialite"]
        labels.append(specialite)
        total_etudiants_data.append(item["total_etudiants"])
        
        taux = next((t["taux_reussite"] for t in taux_reussite if t["specialite"] == specialite), 0)
        taux_reussite_data.append(taux)

    data = {
        "totalEtudiants": total_etudiants["total_etudiants"],
        "labels": labels,
        "totalEtudiantsData": total_etudiants_data,
        "tauxReussiteData": taux_reussite_data
    }
    
    return jsonify(data)

@app.route('/api/resultats/<int:annee>/<string:specialite>', methods=["GET"])
def get_resultats(annee, specialite):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT annee , specialite ,matricule, nom, prenom, sexe, moyenne FROM resultats WHERE annee = %s AND specialite = %s",
        (annee, specialite)
    )
    resultats = cursor.fetchall()
    conn.close()
    return jsonify(resultats)

@app.route('/api/resultats', methods=["POST"])
def insert_resultat():
    data = request.json  # Récupérer les données JSON envoyées par le client
    annee = data.get("annee")
    matricule = data.get("matricule")
    nom = data.get("nom")
    prenom = data.get("prenom")
    sexe = data.get("sexe")
    specialite = data.get("specialite")
    moyenne = data.get("moyenne")
    
    if not all([annee, matricule, nom, prenom, sexe, specialite, moyenne]):
        return jsonify({"error": "Veuillez fournir toutes les informations nécessaires."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    req = "INSERT INTO resultats (annee, matricule, nom, prenom, sexe, specialite, moyenne) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    cursor.execute(req, (annee, matricule, nom, prenom, sexe, specialite, moyenne))
    conn.commit()
    cursor.close()
    conn.close()
    
    return make_response(jsonify({"message": "Résultat ajouté avec succès."}), 201)


    
@app.route('/api/resultats/<string:matricule>', methods=["PUT"])
def update_resultat(matricule):
    annee = request.form["annee"]
    nom = request.form["nom"]
    prenom = request.form["prenom"]
    sexe = request.form["sexe"]
    specialite = request.form["specialite"]
    moyenne = request.form["moyenne"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE resultats 
        SET annee = %s, nom = %s, prenom = %s, sexe = %s, specialite = %s, moyenne = %s 
        WHERE matricule = %s
    """, (annee, nom, prenom, sexe, specialite, moyenne, matricule))
    
    conn.commit()
    cursor.close()
    
    return make_response("Record updated", 200)

@app.route('/api/resultats', methods=["DELETE"])
def delete_resultat():
    data = request.get_json()  # Récupération des IDs envoyés par le client
    ids = data.get('valIds', [])

    if not ids:
        return jsonify({"error": "Aucun ID fourni"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Construction d'une requête SQL pour supprimer plusieurs IDs
    format_strings = ','.join(['%s'] * len(ids))
    query = f"DELETE FROM resultats WHERE matricule IN ({format_strings})"

    cursor.execute(query, tuple(ids))
    conn.commit()
    cursor.close()

    return make_response("Record(s) deleted", 204)


if __name__ == '__main__':
    app.run(debug=True)
