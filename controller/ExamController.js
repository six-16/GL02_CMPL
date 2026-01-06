// controller/ExamController.js

//code de la spec04

const fs = require('fs');
const GiftParser = require('../model/GIFTParser');
const ExamSession = require('../model/ExamSession');
const ExamView = require('../view/ExamView');

/**
 * Contrôleur pour la gestion et la simulation d'examens GIFT.
 * Permet de traiter un fichier GIFT et de simuler un examen interactif.
 */
class ExamController {
    /**
     * Constructeur du ExamController.
     * Initialise la vue d'examen.
     */
    constructor() {
        this.view = new ExamView();
    }

    /**
     * Traite et simule un examen à partir d'un fichier GIFT.
     * @param {string} filePath - Le chemin du fichier GIFT à traiter.
     * @returns {Promise<void>}
     */
    async processExam(filePath) {
        // 1. Vérifications (Préconditions)
        if (!fs.existsSync(filePath)) {
            this.view.displayError(`Le fichier '${filePath}' est introuvable.`);
            this.view.close();
            return;
        }

        try {
            // 2. Lecture et Parsing
            const content = fs.readFileSync(filePath, 'utf8');
            const parser = new GiftParser(false, false);
            parser.parse(content);
            
            const questions = parser.parsedQuestion;
            if (questions.length === 0) {
                this.view.displayError("Le fichier ne contient aucune question.");
                this.view.close();
                return;
            }

            // 3. Initialisation de la session
            const session = new ExamSession(questions);
            this.view.displayHeader(filePath);

            // 4. Boucle de l'examen (Traitement Séquentiel)
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                
                // Si c'est juste une description, on l'affiche et on passe
                if (q.category === 'Description') {
                    this.view.displayQuestion(q, i);
                    await this.view.ask(""); // Juste une pause
                    continue;
                }

                // Types non supportés par la simulation simple
                if (q.category === 'Matching' || q.category === 'Essay') {
                    this.view.displayQuestion(q, i);
                    await this.view.ask("Appuyez sur Entrée (Pas de notation auto pour ce type)");
                    continue;
                }

                // Affichage et Saisie
                this.view.displayQuestion(q, i);
                const answer = await this.view.ask("> ");

                // Vérification
                const isCorrect = session.checkAnswer(q, answer);
                
                // Feedback
                let correctText = "";
                if (!isCorrect) {
                    if (q.category === 'TrueFalse') correctText = q.answer ? "VRAI" : "FAUX";
                    if (q.category === 'MCQ') {
                        const goodChoice = q.choices.find(c => c.isCorrect);
                        if (goodChoice) correctText = goodChoice.text;
                    }
                    if (q.category === 'Numeric') {
                        if(q.numericType === 'Range') correctText = q.value;
                        if(q.numericType === 'Interval') correctText = `Entre ${q.min} et ${q.max}`;
                    }
                }

                this.view.displayFeedback(isCorrect, correctText);

                if (isCorrect) {
                    session.incrementScore();
                }
            }

            // 5. Affichage des résultats (Sorties)
            this.view.displayFinalResult(session.getResults());

        } catch (err) {
            this.view.displayError(`Erreur critique : ${err.message}`);
        } finally {
            this.view.close();
        }
    }
}

module.exports = ExamController;