const inquirer = require('inquirer');
const colors = require('colors');

const SelectionController = require('./SelectionController');
const VCardController = require('./VCardController');
const ExamController = require('./ExamController');
const ProfileController = require('./ProfileController');
const ComparisonController = require('./ComparisonController');
const BanqueDeQuestions = require('./BanqueDeQuestions');
const Affichage = require('../view/Affichage');

/**
 * Contrôleur principal de l'application SRYEM - GESTIONNAIRE D'EXAMENS GIFT v1.0
 * Gère le menu principal et distribue les actions aux contrôleurs appropriés.
 */
class AppController {

    /**
     * Démarre la boucle principale de l'application, affichant le menu et gérant les choix de l'utilisateur.
     * @returns {Promise<void>}
     */
    async start() {
        this.showWelcome();

        while (true) {
            const answer = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Que souhaitez-vous faire ?',
                    choices: [
                        { name: 'Rechercher une question dans la banque', value: 'search' },
                        { name: 'Creer un examen (Selection)', value: 'create' },
                        { name: 'Simuler un examen existant', value: 'simulate' },
                        { name: 'Analyser un fichier GIFT (Profil)', value: 'profile' },
                        { name: 'Comparer un profil d\'examen', value: 'comparison' },
                        { name: 'Generer ma VCard', value: 'vcard' },
                        new inquirer.Separator(),
                        { name: 'Quitter', value: 'exit' }
                    ]
                }
            ]);

            if (answer.action === 'exit') {
                console.log("Au revoir !");
                break;
            }

            await this.dispatch(answer.action);
            console.log("\n--------------------------------------------------\n");
        }
    }

    /**
     * Affiche le message de bienvenue et efface la console.
     */
    showWelcome() {
        console.clear();
        console.log("==================================================".cyan);
        console.log("   SRYEM - GESTIONNAIRE D'EXAMENS GIFT v1.0      ".yellow.bold);
        console.log("==================================================\n".cyan);
    }

    /**
     * Distribue l'action sélectionnée à la méthode de gestion correspondante.
     * @param {string} action - L'action à effectuer (par exemple 'search', 'create', etc.)
     * @returns {Promise<void>}
     */
    async dispatch(action) {
        switch (action) {
            case 'search':
                await this.handleSearch();
                break;
            case 'create':
                const selectionCtrl = new SelectionController();
                await selectionCtrl.start();
                break;
            case 'simulate':
                await this.handleSimulate();
                break;
            case 'profile':
                await this.handleProfile();
                break;
            case 'comparison':
                await this.handleComparison();
                break;
            case 'vcard':
                const vcardCtrl = new VCardController();
                await vcardCtrl.start();
                break;
        }
    }

    /**
     * Gère la fonctionnalité de recherche de questions dans la banque de questions.
     * Invite l'utilisateur à saisir un mot-clé, recherche dans la banque et affiche les résultats.
     * @returns {Promise<void>}
     */
    async handleSearch() {
        const answer = await inquirer.prompt([{
            type: 'input',
            name: 'keyword',
            message: 'Mot-cle a rechercher :',
            validate: input => input.trim() !== '' ? true : "Le mot-cle ne peut pas etre vide."
        }]);

        const banque = new BanqueDeQuestions();
        console.log("Chargement de la banque de questions...");
        banque.chargerBanque();

        const results = banque.rechercherQuestions(answer.keyword);

        if (results.length === 0) {
            console.log(`Aucune question trouvee pour "${answer.keyword}".`);
            return;
        }

        let searchLoop = true;
        while (searchLoop) {
            const choices = results.map(q => {
                const snippet = q.text.substring(0, 60).replace(/(\r\n|\n|\r)/gm, " ");
                return {
                    name: `[${q.id}] (${q.category}) ${snippet}...`,
                    value: q.id
                };
            });

            choices.push(new inquirer.Separator());
            choices.push({ name: '<-- Retour au menu principal', value: 'EXIT' });

            const selection = await inquirer.prompt([{
                type: 'list',
                name: 'questionId',
                message: `Resultats (${results.length}). Choisissez une question pour voir les details :`,
                pageSize: 15,
                choices: choices
            }]);

            if (selection.questionId === 'EXIT') {
                searchLoop = false;
            } else {
                const question = banque.getQuestionById(selection.questionId);
                if (question) {
                    Affichage.afficherQuestionComplete(question);
                } else {
                    console.error("Erreur : Question introuvable.");
                }

                await inquirer.prompt([{
                    type: 'input',
                    name: 'pause',
                    message: 'Appuyez sur Entree pour revenir a la liste des resultats...'
                }]);
            }
        }
    }

    /**
     * Gère la fonctionnalité de simulation d'examen.
     * Invite l'utilisateur à saisir le chemin d'un fichier GIFT et traite l'examen.
     * @returns {Promise<void>}
     */
    async handleSimulate() {
        const answer = await inquirer.prompt([{
            type: 'input',
            name: 'file',
            message: 'Chemin du fichier GIFT a simuler :',
            default: 'test.gift'
        }]);
        const ctrl = new ExamController();
        await ctrl.processExam(answer.file);
    }

    /**
     * Gère l'analyse de profil d'un fichier GIFT.
     * Invite l'utilisateur à saisir le chemin d'un fichier et l'analyse.
     * @returns {Promise<void>}
     */
    async handleProfile() {
        const answer = await inquirer.prompt([{
            type: 'input',
            name: 'file',
            message: 'Chemin du fichier GIFT a analyser :'
        }]);
        const ctrl = new ProfileController();
        ctrl.processFile(answer.file);

        await inquirer.prompt([{
            type: 'input',
            name: 'pause',
            message: 'Appuyez sur Entree pour continuer...'
        }]);
    }

    /**
     * Gère la fonctionnalité de comparaison.
     * Démarre le contrôleur de comparaison.
     * @returns {Promise<void>}
     */
    async handleComparison() {
        const ctrl = new ComparisonController();
        await ctrl.start();

        await inquirer.prompt([{
            type: 'input',
            name: 'pause',
            message: 'Appuyez sur Entree pour continuer...'
        }]);
    }
}

module.exports = AppController;