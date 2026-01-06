// controller/ComparisonController.js
// SPEC06: Comparaison de profils d'examens

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const GiftParser = require('../model/GIFTParser');
const ComparisonProfile = require('../model/ComparisonProfile');
const ComparisonView = require('../view/ComparisonView');

/**
 * Contrôleur pour la comparaison de profils d'examens GIFT.
 * Permet de comparer un examen avec des banques de questions de référence.
 */
class ComparisonController {
    /**
     * Constructeur du ComparisonController.
     * Initialise la vue de comparaison.
     */
    constructor() {
        this.view = new ComparisonView();
    }

    /**
     * Démarre le flux interactif de comparaison de profils.
     * @returns {Promise<void>}
     */
    async start() {
        this.view.displayWelcome();

        try {
            // Étape 1: Demander le fichier d'examen
            const examFile = await this.promptForFile('Entrez le chemin du fichier GIFT d\'examen à comparer');

            // Vérifications du fichier d'examen
            if (!fs.existsSync(examFile)) {
                this.view.displayError(`Le fichier d'examen '${examFile}' n'existe pas.`);
                return;
            }

            const examContent = fs.readFileSync(examFile, 'utf8');
            if (!examContent || examContent.trim().length === 0) {
                this.view.displayError("Le fichier d'examen est vide.");
                return;
            }

            // Parser le fichier d'examen
            const examParser = new GiftParser(false, false);
            examParser.parse(examContent);
            const examQuestions = examParser.parsedQuestion;

            if (examQuestions.length === 0) {
                this.view.displayError("Aucune question trouvée dans le fichier d'examen.");
                return;
            }

            // Étape 2: Demander les fichiers de référence (banque nationale)
            const referenceFiles = await this.promptForReferenceFiles();

            if (referenceFiles.length === 0) {
                this.view.displayError("Vous devez sélectionner au moins un fichier de référence.");
                return;
            }

            // Parser les fichiers de référence
            const referenceQuestionsList = [];
            for (const refFile of referenceFiles) {
                if (!fs.existsSync(refFile)) {
                    this.view.displayError(`Le fichier de référence '${refFile}' n'existe pas.`);
                    continue;
                }

                const refContent = fs.readFileSync(refFile, 'utf8');
                if (!refContent || refContent.trim().length === 0) {
                    this.view.displayWarning(`Le fichier de référence '${refFile}' est vide, ignoré.`);
                    continue;
                }

                const refParser = new GiftParser(false, false);
                refParser.parse(refContent);

                if (refParser.parsedQuestion.length === 0) {
                    this.view.displayWarning(`Aucune question trouvée dans '${refFile}', ignoré.`);
                    continue;
                }

                referenceQuestionsList.push(refParser.parsedQuestion);
            }

            if (referenceQuestionsList.length === 0) {
                this.view.displayError("Aucun fichier de référence valide n'a pu être traité.");
                return;
            }

            // Étape 3: Analyser et comparer
            const comparison = new ComparisonProfile(examQuestions, referenceQuestionsList);
            const result = comparison.analyze();
            const data = comparison.getComparisonData();

            // Étape 4: Afficher les résultats
            this.view.displayComparison(
                examFile,
                referenceFiles,
                data
            );

        } catch (error) {
            this.view.displayError(`Erreur lors de la comparaison: ${error.message}`);
        }
    }

    /**
     * Demande interactivement un chemin de fichier à l'utilisateur.
     * @param {string} message - Le message à afficher pour l'invite.
     * @returns {Promise<string>} Le chemin du fichier saisi par l'utilisateur.
     */
    async promptForFile(message) {
        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'filePath',
                message: message,
                validate: (input) => {
                    if (input.trim() === '') {
                        return 'Le chemin ne peut pas être vide.';
                    }
                    return true;
                }
            }
        ]);

        return answer.filePath.trim();
    }

    /**
     * Demande interactivement les fichiers de référence.
     * @returns {Promise<Array<string>>} La liste des chemins des fichiers de référence.
     */
    async promptForReferenceFiles() {
        const referenceFiles = [];
        let addMore = true;

        while (addMore) {
            const filePath = await this.promptForFile('Entrez le chemin d\'un fichier de référence (banque nationale)');

            if (filePath && filePath.trim() !== '') {
                referenceFiles.push(filePath.trim());

                const answer = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'addAnother',
                        message: 'Ajouter un autre fichier de référence ?',
                        default: false
                    }
                ]);

                addMore = answer.addAnother;
            }
        }

        return referenceFiles;
    }

    /**
     * Traite la comparaison à partir d'un fichier d'examen spécifique (utilisé par CLI).
     * @param {string} examFilePath - Le chemin du fichier d'examen à comparer.
     * @param {Array<string>} referenceFilePaths - La liste des chemins des fichiers de référence.
     * @returns {void}
     */
    processComparison(examFilePath, referenceFilePaths) {
        try {
            // Vérifications
            if (!fs.existsSync(examFilePath)) {
                this.view.displayError(`Le fichier d'examen '${examFilePath}' n'existe pas.`);
                return;
            }

            const examContent = fs.readFileSync(examFilePath, 'utf8');
            if (!examContent || examContent.trim().length === 0) {
                this.view.displayError("Le fichier d'examen est vide.");
                return;
            }

            // Parser l'examen
            const examParser = new GiftParser(false, false);
            examParser.parse(examContent);
            const examQuestions = examParser.parsedQuestion;

            if (examQuestions.length === 0) {
                this.view.displayError("Aucune question trouvée dans le fichier d'examen.");
                return;
            }

            // Parser les fichiers de référence
            const referenceQuestionsList = [];
            for (const refFile of referenceFilePaths) {
                if (!fs.existsSync(refFile)) {
                    this.view.displayError(`Le fichier de référence '${refFile}' n'existe pas.`);
                    continue;
                }

                const refContent = fs.readFileSync(refFile, 'utf8');
                if (!refContent || refContent.trim().length === 0) {
                    this.view.displayWarning(`Le fichier de référence '${refFile}' est vide, ignoré.`);
                    continue;
                }

                const refParser = new GiftParser(false, false);
                refParser.parse(refContent);

                if (refParser.parsedQuestion.length === 0) {
                    this.view.displayWarning(`Aucune question trouvée dans '${refFile}', ignoré.`);
                    continue;
                }

                referenceQuestionsList.push(refParser.parsedQuestion);
            }

            if (referenceQuestionsList.length === 0) {
                this.view.displayError("Aucun fichier de référence valide n'a pu être traité.");
                return;
            }

            // Analyser et comparer
            const comparison = new ComparisonProfile(examQuestions, referenceQuestionsList);
            const result = comparison.analyze();
            const data = comparison.getComparisonData();

            // Afficher les résultats
            this.view.displayComparison(examFilePath, referenceFilePaths, data);

        } catch (error) {
            this.view.displayError(`Erreur lors de la comparaison: ${error.message}`);
        }
    }
}

module.exports = ComparisonController;
