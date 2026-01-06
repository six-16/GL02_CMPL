// view/ExamView.js
const readline = require('readline');

/**
 * Classe pour l'affichage et l'interaction lors de la simulation d'examen.
 * Gère l'interface en ligne de commande pour poser les questions et recueillir les réponses.
 */
class ExamView {
    /**
     * Constructeur d'ExamView.
     * Initialise l'interface readline.
     */
    constructor() {
        /** @type {readline.Interface} L'interface readline pour l'interaction utilisateur */
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    /**
     * Pose une question à l'utilisateur et retourne sa réponse.
     * @param {string} questionText - Le texte de la question.
     * @returns {Promise<string>} La réponse de l'utilisateur.
     */
    ask(questionText) {
        return new Promise((resolve) => {
            this.rl.question(questionText, (answer) => {
                resolve(answer);
            });
        });
    }

    /**
     * Affiche l'en-tête de l'examen.
     * @param {string} filename - Le nom du fichier d'examen.
     * @returns {void}
     */
    displayHeader(filename) {
        console.log("\n==================================================");
        console.log(`SIMULATION D'EXAMEN : ${filename}`);
        console.log("==================================================\n");
    }

    /**
     * Affiche une question avec ses choix si applicable.
     * @param {Question} q - L'objet question.
     * @param {number} index - L'index de la question.
     * @returns {void}
     */
    displayQuestion(q, index) {
        console.log(`\n[Question ${index + 1}] (${q.category})`);
        console.log("--------------------------------------------------");
        
        // Afficher le texte avec le trou (si texte à trous)
        console.log(q.text + (q.tail ? " " + q.tail : "")); 

        // Affichage spécifique selon le type pour aider l'utilisateur
        if (q.category === 'MCQ' || q.category === 'Credit') {
            q.choices.forEach((c, i) => {
                // Affiche A) Choix 1, B) Choix 2...
                const letter = String.fromCharCode(65 + i); 
                console.log(`   ${letter}) ${c.text}`);
            });
            console.log("\n-> Entrez la lettre de votre réponse (A, B, C...) :");
        } 
        else if (q.category === 'TrueFalse') {
            console.log("\n-> Répondez par V (Vrai) ou F (Faux) :");
        }
        else if (q.category === 'Numeric') {
            console.log("\n-> Entrez un nombre :");
        }
        else if (q.category === 'Description') {
            console.log("(Ceci est une information, appuyez sur Entrée pour continuer)");
        }
        else {
            console.log("(Ce type de question ne supporte pas la vérification automatique)");
        }
    }

    /**
     * Affiche le feedback après une réponse.
     * @param {boolean} isCorrect - Si la réponse est correcte.
     * @param {string} correctAnswerText - Le texte de la bonne réponse.
     * @returns {void}
     */
    displayFeedback(isCorrect, correctAnswerText) {
        if (isCorrect) {
            console.log("Bonne réponse !");
        } else {
            console.log("Mauvaise réponse.");
            if (correctAnswerText) {
                console.log(`   La bonne réponse était : ${correctAnswerText}`);
            }
        }
    }

    /**
     * Affiche les résultats finaux de l'examen.
     * @param {Object} results - Les résultats de l'examen.
     * @returns {void}
     */
    displayFinalResult(results) {
        console.log("\n==================================================");
        console.log("📊  RÉSULTAT FINAL");
        console.log("==================================================");
        console.log(`Vous avez obtenu : ${results.score} bonnes réponses sur ${results.total}`);
        console.log(`${results.badAnswers} mauvaises réponses sur ${results.total}`);
        console.log(`Soit un total de ${results.percentage}% de bonnes réponses.`);
        console.log("==================================================\n");
    }

    /**
     * Affiche un message d'erreur.
     * @param {string} msg - Le message d'erreur.
     * @returns {void}
     */
    displayError(msg) {
        console.error(`Erreur : ${msg}`);
    }

    /**
     * Ferme l'interface readline.
     * @returns {void}
     */
    close() {
        this.rl.close();
    }
}

module.exports = ExamView;