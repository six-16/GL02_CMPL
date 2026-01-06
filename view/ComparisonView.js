// view/ComparisonView.js
// SPEC06: Comparaison de profils d'examens

const colors = require('colors');

/**
 * Classe pour l'affichage des résultats de comparaison de profils.
 * Gère l'affichage formaté des comparaisons d'examens.
 */
class ComparisonView {

    /**
     * Affiche le message de bienvenue pour la comparaison.
     * @returns {void}
     */
    displayWelcome() {
        console.log('\n' + '='.repeat(70));
        console.log('  COMPARAISON DE PROFILS D\'EXAMENS (SPEC06)'.cyan.bold);
        console.log('='.repeat(70) + '\n');
    }

    /**
     * Affiche un message d'erreur.
     * @param {string} message - Le message d'erreur.
     * @returns {void}
     */
    displayError(message) {
        console.error(`\n  Erreur : ${message}`.red);
    }

    /**
     * Affiche un message d'avertissement.
     * @param {string} message - Le message d'avertissement.
     * @returns {void}
     */
    displayWarning(message) {
        console.warn(`\n   Avertissement : ${message}`.yellow);
    }

    /**
     * Affiche le tableau comparatif des profils d'examens
     * 
     * Structure de data:
     * {
     *   examProfile: [...],
     *   referenceProfiles: [...],
     *   averageProfile: [...],
     *   comparison: [...],
     *   referenceFileCount: number
     * }
     * @param {string} examFile - Le chemin du fichier d'examen.
     * @param {Array<string>} referenceFiles - La liste des fichiers de référence.
     * @param {Object} data - Les données de comparaison.
     * @returns {void}
     */
    displayComparison(examFile, referenceFiles, data) {
        console.log('\n' + '─'.repeat(70));
        console.log(`  EXAMEN ANALYÉ : ${examFile}`.cyan);
        console.log(`  FICHIERS DE RÉFÉRENCE : ${referenceFiles.length}`.cyan);
        console.log('─'.repeat(70) + '\n');

        // Afficher les informations des fichiers de référence
        console.log('  Fichiers de référence (banque nationale) :');
        referenceFiles.forEach((file, index) => {
            console.log(`    ${index + 1}. ${file}`);
        });
        console.log();

        // Afficher les statistiques
        this.displayStatistics(data);

        // Afficher le tableau comparatif
        this.displayComparisonTable(data.comparison);

        console.log('\n' + '='.repeat(70) + '\n');
    }

    /**
     * Affiche les statistiques globales.
     * @param {Object} data - Les données de comparaison.
     * @returns {void}
     */
    displayStatistics(data) {
        console.log('─'.repeat(70));
        console.log('  STATISTIQUES GLOBALES'.cyan);
        console.log('─'.repeat(70));

        const examTotal = data.examProfile.reduce((sum, item) => sum + parseInt(item.count || 0), 0);
        console.log(`\n  Nombre de questions dans l'examen : ${examTotal}`);
        console.log(`  Nombre de types de questions : ${data.examProfile.length}`);
        console.log(`  Nombre de fichiers de référence analysés : ${data.referenceFileCount}`);

        console.log('\n  Répartition dans l\'examen :');
        data.examProfile.forEach(item => {
            const label = this.translateTypeLabel(item.type);
            console.log(`    • ${label} : ${item.percentage}% (${item.count} question${item.count > 1 ? 's' : ''})`);
        });

        console.log('\n  Moyenne nationale (fichiers de référence) :');
        data.averageProfile.forEach(item => {
            const label = this.translateTypeLabel(item.type);
            console.log(`    • ${label} : ${item.percentage}%`);
        });

        console.log();
    }

    /**
     * Affiche le tableau comparatif principal.
     * @param {Array} comparison - Les données de comparaison.
     * @returns {void}
     */
    displayComparisonTable(comparison) {
        console.log('─'.repeat(70));
        console.log('  TABLEAU COMPARATIF'.cyan);
        console.log('─'.repeat(70) + '\n');

        // En-têtes du tableau
        const headers = [
            'Type de question'.padEnd(30),
            'Examen'.padEnd(12),
            'Moyenne'.padEnd(12),
            'Écart'
        ];

        console.log('  ' + headers.join('│'));
        console.log('  ' + '─'.repeat(68));

        // Données du tableau
        comparison.forEach(row => {
            const type = this.translateTypeLabel(row.type).padEnd(30);
            const exam = `${row.examPercentage}%`.padEnd(12);
            const average = `${row.averagePercentage}%`.padEnd(12);
            
            // Calcul et formatage de l'écart
            let ecartStr = '';
            const ecartValue = parseFloat(row.difference);
            
            if (ecartValue > 0) {
                ecartStr = `+${row.difference}%`.green; // Surplus en vert
            } else if (ecartValue < 0) {
                ecartStr = `${row.difference}%`.red; // Déficit en rouge
            } else {
                ecartStr = `${row.difference}%`.yellow; // Égal en jaune
            }

            console.log(`  ${type}│${exam}│${average}│${ecartStr}`);
        });

        console.log();
    }

    /**
     * Traduit les clés techniques en labels français.
     * @param {string} type - Le type technique.
     * @returns {string} Le label français.
     */
    translateTypeLabel(type) {
        const labels = {
            'MCQ': 'Choix multiples',
            'MissingWord': 'Mot manquant',
            'TrueFalse': 'Vrai / Faux',
            'Matching': 'Correspondance',
            'Numeric': 'Numérique',
            'Essay': 'Question ouverte',
            'Description': 'Description/Info',
            'Credit': 'Crédit partiel',
            'Other': 'Autre'
        };

        return labels[type] || type;
    }
}

module.exports = ComparisonView;
