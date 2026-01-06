/**
 * Classe pour gérer une sélection de questions.
 * Permet d'ajouter, supprimer et valider une sélection de questions pour un examen.
 */
class QuestionSelection {
    /**
     * Constructeur de QuestionSelection.
     * Initialise une liste vide de questions.
     */
    constructor() {
        /** @type {Array} La liste des questions sélectionnées */
        this.questions = [];
    }

    /**
     * Ajoute une question à la sélection si elle n'existe pas déjà.
     * @param {Question} question - La question à ajouter.
     * @returns {boolean} True si ajoutée, false si déjà présente.
     */
    add(question) {
        // SPEC_NF01 : Éviter les doublons
        if (!this.exists(question.id)) {
            this.questions.push(question);
            return true;
        }
        return false;
    }

    /**
     * Supprime une question de la sélection par ID.
     * @param {string} id - L'ID de la question à supprimer.
     * @returns {boolean} True si supprimée, false sinon.
     */
    remove(id) {
        const initialLength = this.questions.length;
        this.questions = this.questions.filter(q => q.id !== id);
        return this.questions.length < initialLength;
    }

    /**
     * Vérifie si une question existe dans la sélection.
     * @param {string} id - L'ID de la question.
     * @returns {boolean} True si elle existe, false sinon.
     */
    exists(id) {
        return this.questions.some(q => q.id === id);
    }

    /**
     * Retourne toutes les questions de la sélection.
     * @returns {Array} La liste des questions.
     */
    getAll() {
        return this.questions;
    }

    /**
     * Retourne le nombre de questions dans la sélection.
     * @returns {number} Le nombre de questions.
     */
    count() {
        return this.questions.length;
    }

    /**
     * Valide la sélection selon les règles (15-20 questions).
     * @returns {Object} Objet avec valid (boolean) et error (string) si invalide.
     */
    isValid() {
        const count = this.count();
        if (count < 15) {
            return { valid: false, error: `Pas assez de questions. Il en faut au moins 15 (Actuel : ${count}).` };
        }
        if (count > 20) {
            return { valid: false, error: `Trop de questions. Le maximum est de 20 (Actuel : ${count}).` };
        }
        return { valid: true };
    }
}

module.exports = QuestionSelection;