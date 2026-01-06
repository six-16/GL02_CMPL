// controller/ProfileController.js

//pour la spec05

const fs = require('fs');
const GiftParser = require('../model/GIFTParser');
const GiftProfile = require('../model/GiftProfile');
const ProfileView = require('../view/ProfileView');

/**
 * Contrôleur pour l'analyse de profils d'examens GIFT.
 * Permet de traiter un fichier GIFT et d'afficher son profil statistique.
 */
class ProfileController {
    /**
     * Constructeur du ProfileController.
     * Initialise la vue de profil.
     */
    constructor() {
        this.view = new ProfileView();
    }

    /**
     * Traite un fichier GIFT et affiche son profil d'examen.
     * @param {string} filePath - Le chemin du fichier GIFT à analyser.
     * @returns {void}
     */
    processFile(filePath) {
        // 1. Vérification de l'existence du fichier (Précondition)
        if (!fs.existsSync(filePath)) {
            this.view.displayError(`Le fichier '${filePath}' n'existe pas.`);
            return;
        }

        try {
            // 2. Lecture du fichier
            const content = fs.readFileSync(filePath, 'utf8');

            // Vérification fichier vide
            if (!content || content.trim().length === 0) {
                this.view.displayError("Le fichier est vide.");
                return;
            }

            this.view.displayTitle(filePath);

            // 3. Parsing (Utilisation de ton parser existant)
            const parser = new GiftParser(false, false);
            parser.parse(content);

            const questions = parser.parsedQuestion;

            // 4. Analyse via le Modèle
            const profileModel = new GiftProfile(questions);
            const report = profileModel.calculate();

            // 5. Affichage via la Vue
            this.view.displayHistogram(report, profileModel.total);

        } catch (err) {
            this.view.displayError(`Problème de lecture ou de format : ${err.message}`);
        }
    }
}

module.exports = ProfileController;