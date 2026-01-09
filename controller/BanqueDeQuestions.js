const fs = require('fs');
const path = require('path');
const GiftParser = require('../model/GIFTParser.js');

/**
 * Classe représentant une banque de questions chargée depuis des fichiers GIFT.
 * Permet de charger, rechercher et récupérer des questions.
 */
class BanqueDeQuestions {
    /**
     * Constructeur de la classe BanqueDeQuestions.
     * Initialise la liste des questions et définit le chemin vers le dossier data.
     */
    constructor() {
        this.questions = [];
        this.dirData = path.join(__dirname, '..', 'data'); // Chemin vers le dossier data
    }


    /**
     * Charge la banque de questions en lisant et parsant tous les fichiers .gift du dossier data.
     * @returns {void}
     */
    chargerBanque() {
        console.log(`Chargement des fichiers GIFT depuis : ${this.dirData}`);

        // Lire le contenu du dossier /data
        try {
            const files = fs.readdirSync(this.dirData);
            const giftFiles = files.filter(file => file.endsWith('.gift'));

            if (giftFiles.length === 0) {
                console.log("Aucun fichier .gift trouvé dans le dossier /data.");
                return;
            }

            //  Parcourir et parser chaque fichier
            const parser = new GiftParser(false, false);
            this.questions = []; // Réinitialiser la banque

            giftFiles.forEach(fileName => {
                const filePath = path.join(this.dirData, fileName);
                try {
                    const data = fs.readFileSync(filePath, 'utf8');
                    parser.parse(data);
                    // Ajouter les questions parsées à la banque centrale
                    // On ajoute un ID simple (index) pour référence facile
                    parser.parsedQuestion.forEach((q, index) => {
                        q.id = `Q${this.questions.length + 1}`; // Générer un identifiant simple
                        q.sourceFile = fileName; // Ajouter le nom du fichier source
                        this.questions.push(q);
                    });
                } catch (error) {
                    console.error(`Erreur de lecture ou de parsing pour ${fileName}: ${error.message}`);
                }
            });

            console.log(`Banque de questions chargée : ${this.questions.length} questions au total.`);

        } catch (error) {
            if (error.code === 'ENOENT') {
                console.error(`Erreur : Le dossier 'data/' est introuvable à : ${this.dirData}`);
            } else {
                console.error(`Erreur lors du chargement de la banque : ${error.message}`);
            }
        }
    }

    /**
     * Recherche des questions par mot-clé dans le titre ou le corps (texte).
     * @param {string} keyword - Le mot-clé ou l'expression de recherche.
     * @returns {Array} Une liste des objets Question correspondants.
     */
    rechercherQuestions(keyword) {
        if (!keyword || this.questions.length === 0) {
            return [];
        }

        const lowerKeyword = keyword.toLowerCase(); // Marche bien finalement donc on garde

        return this.questions.filter(q => {
            // Filtrage dans le titre ou le corps (texte)
            const textToSearch = `${q.number || ''} ${q.text || ''}`.toLowerCase();
            return textToSearch.includes(lowerKeyword);
        });
    }

    /**
     * Trouve une question par son identifiant unique (l'ID que nous avons généré).
     * @param {string} id - L'ID de la question (ex: "Q45").
     * @returns {Question|null} L'objet Question ou null.
     */
    getQuestionById(id) {
        return this.questions.find(q => q.id === id) || null;
    }
}

module.exports = BanqueDeQuestions;