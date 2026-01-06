const fs = require('fs');
const BanqueDeQuestions = require('./BanqueDeQuestions');
const QuestionSelection = require('../model/QuestionSelection');
const SelectionView = require('../view/SelectionView');
const GiftExporter = require('../model/GiftExporter');
const Affichage = require('../view/Affichage');

/**
 * Contrôleur pour la sélection et la création d'examens à partir de la banque de questions.
 * Permet de rechercher, ajouter, supprimer des questions et sauvegarder un examen.
 */
class SelectionController {
    /**
     * Constructeur du SelectionController.
     * Initialise la banque de questions, la sélection et la vue.
     */
    constructor() {
        this.banque = new BanqueDeQuestions();
        this.selection = new QuestionSelection();
        this.view = new SelectionView();
    }

    /**
     * Démarre le processus interactif de sélection de questions.
     * @returns {Promise<void>}
     */
    async start() {
        console.log("Chargement de la banque de questions...");
        this.banque.chargerBanque();

        let loop = true;
        while (loop) {
            console.log(`\n--- Panier actuel : ${this.selection.count()} questions ---`);
            const action = await this.view.showMenu();

            switch (action) {
                case 'search_mode':
                    await this.handleSearchWorkflow();
                    break;
                case 'add':
                    await this.handleAdd();
                    break;
                case 'remove':
                    await this.handleRemove();
                    break;
                case 'list':
                    this.view.displayList(this.selection.getAll());
                    break;
                case 'save':
                    loop = await this.handleSave();
                    break;
                case 'exit':
                    loop = false;
                    break;
            }
        }
    }

    /**
     * Gère le workflow de recherche de questions.
     * @returns {Promise<void>}
     */
    async handleSearchWorkflow() {
        const keyword = await this.view.promptForSearchKeyword();
        const results = this.banque.rechercherQuestions(keyword);

        if (results.length === 0) {
            this.view.displayError(`Aucune question trouvee pour "${keyword}".`);
            return;
        }

        let searchLoop = true;
        while (searchLoop) {
            const selectedId = await this.view.showSearchResults(results);

            if (selectedId === 'BACK') {
                searchLoop = false;
            } else {
                await this.handleQuestionAction(selectedId);
            }
        }
    }

    /**
     * Gère les actions sur une question spécifique (afficher, ajouter).
     * @param {string} questionId - L'ID de la question.
     * @returns {Promise<void>}
     */
    async handleQuestionAction(questionId) {
        let actionLoop = true;
        while (actionLoop) {
            const action = await this.view.showQuestionActionMenu(questionId);
            const question = this.banque.getQuestionById(questionId);

            switch (action) {
                case 'view':
                    Affichage.afficherQuestionComplete(question);
                    break;

                case 'add':
                    if (this.selection.count() >= 20) {
                        this.view.displayError("Limite atteinte (20 questions max).");
                    } else {
                        if (this.selection.add(question)) {
                            this.view.displaySuccess(`Question ${questionId} ajoutee.`);
                        } else {
                            this.view.displayError(`La question ${questionId} est deja dans le panier.`);
                        }
                    }
                    actionLoop = false;
                    break;

                case 'back':
                    actionLoop = false;
                    break;
            }
        }
    }

    /**
     * Gère l'ajout manuel d'une question par ID.
     * @returns {Promise<void>}
     */
    async handleAdd() {
        if (this.selection.count() >= 20) {
            this.view.displayError("Vous avez atteint la limite maximale de 20 questions.");
            return;
        }
        const idRaw = await this.view.promptForId();
        const id = idRaw.toUpperCase().startsWith('Q') ? idRaw.toUpperCase() : `Q${idRaw}`;
        const question = this.banque.getQuestionById(id);
        if (!question) {
            this.view.displayError(`Question ${id} introuvable.`);
            return;
        }
        if (this.selection.add(question)) {
            this.view.displaySuccess(`Question ${id} ajoutee.`);
        } else {
            this.view.displayError(`La question ${id} est deja dans la liste (Doublon interdit).`);
        }
    }

    /**
     * Gère la suppression d'une question par ID.
     * @returns {Promise<void>}
     */
    async handleRemove() {
        if (this.selection.count() === 0) {
            this.view.displayError("La selection est vide.");
            return;
        }
        const idRaw = await this.view.promptForId();
        const id = idRaw.toUpperCase().startsWith('Q') ? idRaw.toUpperCase() : `Q${idRaw}`;
        if (this.selection.remove(id)) {
            this.view.displaySuccess(`Question ${id} retiree.`);
        } else {
            this.view.displayError(`L'ID ${id} n'est pas dans votre selection.`);
        }
    }

    /**
     * Gère la sauvegarde de la sélection en fichier GIFT.
     * @returns {Promise<boolean>} True si l'utilisateur souhaite continuer, false sinon.
     */
    async handleSave() {
        const validation = this.selection.isValid();
        if (!validation.valid) {
            this.view.displayError(`Validation echouee : ${validation.error}`);
            return true;
        }
        const filename = await this.view.promptForFilename();
        const exporter = new GiftExporter(this.selection.getAll());
        const content = exporter.export();
        try {
            fs.writeFileSync(filename, content, 'utf8');
            this.view.displaySuccess(`Examen genere avec succes : ${filename}`);
            return false;
        } catch (err) {
            this.view.displayError(`Impossible d'ecrire le fichier : ${err.message}`);
            return true;
        }
    }
}

module.exports = SelectionController;