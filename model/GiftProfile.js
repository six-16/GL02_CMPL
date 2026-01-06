// model/GiftProfile.js

//pour la spec5
    
/**
 * Classe pour analyser le profil d'un ensemble de questions GIFT.
 * Calcule les statistiques par type de question.
 */
class GiftProfile {
    /**
     * Constructeur de GiftProfile.
     * @param {Array} questions - La liste des questions à analyser.
     */
    constructor(questions) {
        /** @type {Array} La liste des questions */
        this.questions = questions;
        /** @type {Object} Les statistiques par type de question */
        this.stats = {
            'MCQ': 0,           // Choix multiples
            'MissingWord': 0,   // Mot manquant (sous-catégorie de MCQ)
            'TrueFalse': 0,     // Vrai / Faux
            'Matching': 0,      // Correspondance
            'Numeric': 0,       // Numérique
            'Essay': 0,         // Question ouverte
            'Description': 0,   // Description
            'Credit': 0,        // Crédit partiel
            'Other': 0          // Sécurité
        };
        /** @type {number} Le nombre total de questions */
        this.total = 0;
    }

    /**
     * Calcule les statistiques des questions.
     * @returns {Array|null} Le rapport des statistiques ou null si aucune question.
     */
    calculate() {
        this.total = this.questions.length;
        if (this.total === 0) return null;

        this.questions.forEach(q => {
            // Logique spécifique pour distinguer Mot Manquant (Missing Word)
            if (q.category === 'MCQ' && q.text && q.text.includes('____')) {
                this.stats['MissingWord']++;
            } 
            else if (this.stats.hasOwnProperty(q.category)) {
                this.stats[q.category]++;
            } 
            else {
                this.stats['Other']++;
            }
        });

        return this.generateReport();
    }

    /**
     * Génère le rapport des statistiques.
     * @returns {Array} Le rapport trié par pourcentage.
     */
    generateReport() {
        const report = [];
        for (const [type, count] of Object.entries(this.stats)) {
            // On ignore les types qui sont à 0 pour nettoyer l'affichage
            if (count >= 0) { 
                report.push({
                    type: type,
                    count: count,
                    percentage: ((count / this.total) * 100).toFixed(1)
                });
            }
        }
        // Tri décroissant par pourcentage pour un plus joli histogramme
        return report.sort((a, b) => b.percentage - a.percentage);
    }
}

module.exports = GiftProfile;