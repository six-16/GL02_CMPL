const inquirer = require('inquirer');

/**
 * Classe pour l'affichage et l'interaction lors de la sélection de questions.
 * Gère les menus et invites pour la création d'examens.
 */
class SelectionView {

    /**
     * Affiche le menu principal de sélection.
     * @returns {Promise<string>} L'action choisie par l'utilisateur.
     */
    async showMenu() {
        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Menu de Selection :',
                pageSize: 12,
                choices: [
                    { name: 'Rechercher des questions (pour ajout ou consultation)', value: 'search_mode' },
                    new inquirer.Separator(),
                    { name: 'Ajouter une question par ID (Manuel)', value: 'add' },
                    { name: 'Retirer une question par ID', value: 'remove' },
                    { name: 'Visualiser la selection actuelle', value: 'list' },
                    new inquirer.Separator(),
                    { name: 'Sauvegarder (Generer l\'examen)', value: 'save' },
                    { name: 'Quitter sans sauvegarder', value: 'exit' }
                ]
            }
        ]);
        return answer.action;
    }

    /**
     * Invite l'utilisateur à saisir un mot-clé de recherche.
     * @returns {Promise<string>} Le mot-clé saisi.
     */
    async promptForSearchKeyword() {
        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'keyword',
                message: 'Entrez un mot-cle pour rechercher des questions :',
                validate: input => input.trim() !== '' ? true : "Le mot-cle ne peut pas etre vide."
            }
        ]);
        return answer.keyword;
    }

    /**
     * Affiche les résultats de recherche et permet la sélection.
     * @param {Array} questions - La liste des questions trouvées.
     * @returns {Promise<string>} L'ID de la question sélectionnée ou 'BACK'.
     */
    async showSearchResults(questions) {
        const choices = questions.map(q => {
            const snippet = q.text.substring(0, 60).replace(/(\r\n|\n|\r)/gm, " ");
            return {
                name: `[${q.id}] (${q.category}) ${snippet}`,
                value: q.id
            };
        });

        choices.push(new inquirer.Separator());
        choices.push({ name: '<-- Retour au menu principal', value: 'BACK' });

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedId',
                message: `Resultats de la recherche (${questions.length} trouves). Choisissez une question :`,
                pageSize: 15,
                choices: choices
            }
        ]);
        return answer.selectedId;
    }

    /**
     * Affiche le menu d'actions pour une question.
     * @param {string} questionId - L'ID de la question.
     * @returns {Promise<string>} L'action choisie.
     */
    async showQuestionActionMenu(questionId) {
        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: `Action pour la question ${questionId} :`,
                choices: [
                    { name: 'Voir les details complets', value: 'view' },
                    { name: 'Ajouter a la selection', value: 'add' },
                    { name: 'Retour a la liste de recherche', value: 'back' }
                ]
            }
        ]);
        return answer.action;
    }

    /**
     * Invite l'utilisateur à saisir un ID de question.
     * @returns {Promise<string>} L'ID saisi.
     */
    async promptForId() {
        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'id',
                message: 'Entrez l\'ID de la question (ex: Q1, Q45) :',
                validate: input => input.trim() !== '' ? true : "L'ID ne peut pas etre vide."
            }
        ]);
        return answer.id;
    }

    /**
     * Invite l'utilisateur à saisir un nom de fichier.
     * @returns {Promise<string>} Le nom du fichier avec extension .gift.
     */
    async promptForFilename() {
        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'filename',
                message: 'Nom du fichier de sortie (sans l\'extension .gift) :',
                validate: input => /^[a-zA-Z0-9-_]+$/.test(input) ? true : "Nom invalide (lettres, chiffres, - et _ uniquement)."
            }
        ]);
        return answer.filename + ".gift";
    }

    /**
     * Affiche la liste des questions sélectionnées.
     * @param {Array} questions - La liste des questions.
     * @returns {void}
     */
    displayList(questions) {
        console.log("\n=== CONTENU DE LA SELECTION ===");
        if (questions.length === 0) {
            console.log("   (Aucune question selectionnee)");
        } else {
            questions.forEach((q, index) => {
                const snippet = q.text.substring(0, 60).replace(/\n/g, ' ') + "...";
                console.log(`   ${index + 1}. [${q.id}] (${q.category}) : ${snippet}`);
            });
        }
        console.log(`   > Total : ${questions.length} question(s)\n`);
    }

    /**
     * Affiche un message de succès.
     * @param {string} msg - Le message de succès.
     * @returns {void}
     */
    displaySuccess(msg) {
        console.log(`OK : ${msg}`);
    }

    /**
     * Affiche un message d'erreur.
     * @param {string} msg - Le message d'erreur.
     * @returns {void}
     */
    displayError(msg) {
        console.error(`ERREUR : ${msg}`);
    }
}

module.exports = SelectionView;