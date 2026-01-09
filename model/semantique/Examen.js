// sélectionner des questions 
// créer un fichier avec les questions sélectionnées
// ajouter les regles de création (nom du fichier, nb de questions...)
// mettre les données au format GIFT

const QuestionCollection = require("./semantique/QuestionCollection.js");

/**
 * Crée un examen en sélectionnant des questions interactivement.
 * @returns {void}
 */
function creerExament() {

    /** @type {number} Nombre de questions dans l'examen */
    nbQuestions = 0;
    /** @type {QuestionCollection} Collection des questions sélectionnées */
    questions = new QuestionCollection();
    
    // show questions 
    
    // attends que l'user entre la commande add + question n°x (-> comment récupérer la question ? -> id ? -> avec question.num)
    if(true){ // si l'user entre "add + question n°x"
        var question = getQuestionByNumber(x); // TODO
        questions.push(question);
        nbQuestions++;
    }

    // stocker les questions dans un tableau
    
    // repeter
    
    // quand l'user entre "valider"

    // vérifiaction nombre de questions
    if (nbQuestions < 15) {
        console.log("Un examen doit contenir au moins 15 questions. Veuillez en ajouter davantage.");
        return;
    }

    // vérification doublons
    if (hasDoublons(questions)) {
        console.log("L'examen contient des questions en double. Veuillez les supprimer avant de continuer.");
        return;
    }

    // on attend que l'user rentre un nom de fichier correct
    while (validerNomFichier(nomFichier) == false) {
        console.log("Entrez le nom du fichier à créer : ");
        var nomFichier = prompt();
    }
    
    // créer le fichier
    console.log("L'examen " + nomFichier + " a été généré avec succès (" + nbQuestions + " questions)");

}

    /**
     * Vérifie si un tableau contient des doublons.
     * @param {Array} array - Le tableau à vérifier.
     * @returns {boolean} True si des doublons sont trouvés, false sinon.
     */
    function hasDoublons(array) {
    const seen = new Set();
    for (const item of array) {
        if (seen.has(item)) {
            return true;
        }
        seen.add(item);
    }
    return false;
}

    /**
     * Valide le nom d'un fichier selon les règles spécifiées.
     * @param {string} nom - Le nom du fichier à valider.
     * @returns {boolean} True si le nom est valide, false sinon.
     */
    function validerNomFichier(nom) {

    valider = true;

    if (nom.length >= 255) {
        console.log("Le nom du fichier est trop long.");
        valider = false;
    }
    
    const regex = /^[a-zA-Z0-9-_]+$/;
    if (!regex.test(nom)) {
        console.log("Le nom de fichier ne doit pas contenir de caractères spéciaux (, /, , ?...).");
        valider = false;
    }

    if (!valider) {
        console.log("Veuillez entrer un nom de fichier valide.");
    }
    
    return valider;
}