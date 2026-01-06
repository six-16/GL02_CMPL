// model/ComparisonProfile.js
// SPEC06: Comparaison de profils d'examens

const GiftProfile = require('./GiftProfile');

/**
 * Classe pour la comparaison de profils d'examens GIFT.
 * Compare un examen avec des profils de référence.
 */
class ComparisonProfile {
    /**
     * Constructeur de ComparisonProfile.
     * @param {Array} examQuestions - Les questions de l'examen à comparer.
     * @param {Array<Array>} referenceQuestionsList - Liste des listes de questions de référence.
     */
    constructor(examQuestions, referenceQuestionsList) {
        /** @type {Array} Les questions de l'examen à comparer */
        this.examQuestions = examQuestions;
        /** @type {Array<Array>} Liste des listes de questions de référence */
        this.referenceQuestionsList = referenceQuestionsList; // Array of question arrays
        /** @type {Array|null} Le profil de l'examen */
        this.examProfile = null;
        /** @type {Array} Les profils des fichiers de référence */
        this.referenceProfiles = [];
        /** @type {Array|null} Le profil moyen des références */
        this.averageProfile = null;
        /** @type {Array|null} Le résultat de la comparaison */
        this.comparisonResult = null;
    }

    /**
     * Calcule le profil de l'examen et des fichiers de référence.
     * @returns {Array} Le résultat de la comparaison.
     */
    analyze() {
        try {
            // 1. Analyser le profil de l'examen
            const examProfile = new GiftProfile(this.examQuestions);
            this.examProfile = examProfile.calculate();

            // 2. Analyser chaque fichier de référence
            this.referenceProfiles = this.referenceQuestionsList.map(questions => {
                const profile = new GiftProfile(questions);
                return profile.calculate();
            });

            // 3. Calculer la moyenne des profils de référence
            this.averageProfile = this.calculateAverageProfile();

            // 4. Effectuer la comparaison
            this.comparisonResult = this.compareProfiles();

            return this.comparisonResult;
        } catch (error) {
            throw new Error(`Erreur lors de l'analyse: ${error.message}`);
        }
    }

    /**
     * Calcule la moyenne des profils de référence.
     * @returns {Array|null} Le profil moyen ou null si aucune référence.
     */
    calculateAverageProfile() {
        if (this.referenceProfiles.length === 0) {
            return null;
        }

        // Collecte tous les types de questions
        const allTypes = new Set();
        this.referenceProfiles.forEach(profile => {
            profile.forEach(item => {
                allTypes.add(item.type);
            });
        });

        // Calcule la moyenne pour chaque type
        const average = [];
        allTypes.forEach(type => {
            let totalPercentage = 0;
            this.referenceProfiles.forEach(profile => {
                const item = profile.find(p => p.type === type);
                totalPercentage += item ? parseFloat(item.percentage) : 0;
            });

            const avgPercentage = (totalPercentage / this.referenceProfiles.length).toFixed(1);
            average.push({
                type: type,
                percentage: avgPercentage
            });
        });

        return average.sort((a, b) => b.percentage - a.percentage);
    }

    /**
     * Compare le profil de l'examen avec la moyenne nationale.
     * @returns {Array|null} Les données de comparaison ou null.
     */
    compareProfiles() {
        if (!this.examProfile || !this.averageProfile) {
            return null;
        }

        const comparison = [];

        // Collecte tous les types présents dans l'examen ou la moyenne
        const allTypes = new Set();
        this.examProfile.forEach(item => allTypes.add(item.type));
        this.averageProfile.forEach(item => allTypes.add(item.type));

        // Effectue la comparaison type par type
        allTypes.forEach(type => {
            const examItem = this.examProfile.find(item => item.type === type);
            const avgItem = this.averageProfile.find(item => item.type === type);

            const examPercentage = examItem ? parseFloat(examItem.percentage) : 0;
            const avgPercentage = avgItem ? parseFloat(avgItem.percentage) : 0;
            const difference = (examPercentage - avgPercentage).toFixed(1);

            comparison.push({
                type: type,
                examPercentage: examPercentage.toFixed(1),
                averagePercentage: avgPercentage.toFixed(1),
                difference: difference
            });
        });

        // Tri par type pour une meilleure lisibilité
        return comparison.sort((a, b) => {
            // Les types de l'examen d'abord
            const aInExam = this.examProfile.find(item => item.type === a.type) ? -1 : 1;
            const bInExam = this.examProfile.find(item => item.type === b.type) ? -1 : 1;
            return aInExam - bInExam;
        });
    }

    /**
     * Retourne les données de comparaison.
     * @returns {Object} Les données de comparaison complètes.
     */
    getComparisonData() {
        return {
            examProfile: this.examProfile,
            referenceProfiles: this.referenceProfiles,
            averageProfile: this.averageProfile,
            comparison: this.comparisonResult,
            referenceFileCount: this.referenceProfiles.length
        };
    }
}

module.exports = ComparisonProfile;
