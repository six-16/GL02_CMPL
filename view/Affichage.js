/**
 * Classe pour l'affichage des questions et résultats.
 * Fournit des méthodes statiques pour afficher les questions de manière formatée.
 */
class Affichage {

    /**
     * Affiche une liste numérotée des questions.
     * @param {Array} questions - Liste des objets Question.
     * @returns {void}
     */
    static afficherListeQuestions(questions) {
        if (questions.length === 0) {
            console.log("\nAucun résultat trouvé pour cette recherche.");
            return;
        }

        console.log(`\n ${questions.length} questions trouvées :`);
        console.log("------------------------------------------------------------------");

        questions.forEach((q, index) => {
            // Affichage simple : ID et Type et Début du texte (max 80 caractères pour l'instant)
            const questionSnippet = q.text.substring(0, 80).replace(/\n/g, ' ').trim() + (q.text.length > 80 ? '...' : '');
            console.log(`${q.id.padEnd(5)} [${q.category.padEnd(10)}] : ${questionSnippet}`);
        });
    }

    /**
     * Affiche le contenu complet et détaillé d'une seule question.
     * @param {Object} q - L'objet Question.
     * @returns {void}
     */
    static afficherQuestionComplete(q) {
        if (!q) {
            console.log("\n Question introuvable.");
            return;
        }

        console.log(`\n---  Question ${q.id} [${q.category}] (${q.sourceFile}) ---`);
        if (q.number) {
            console.log(`   Titre/Numéro : ${q.number}`);
        }

        console.log(`   Texte Complet :`);
        // Afficher le texte avec une indentation pour la lisibilité
        console.log(q.text.replace(/^/gm, '      '));

        // Affichage spécifique selon le type (logique reprise de test_parser.js, va falloir check si ça passe après)
        switch (q.category) {
            case 'TrueFalse':
                const rep = q.answer ? "VRAI" : "FAUX";
                console.log(`   Réponse Correcte : ${rep}`);
                break;

            case 'MCQ':
            case 'Credit':
                console.log(`   Choix de Réponse :`);
                q.choices.forEach((c, i) => {
                    let status = "";
                    if (c.isCorrect === true) status = "(Correct)";
                    else if (c.isCorrect === false) status = "(Faux)";
                    else if (c.weight !== undefined) status = `(Poids: ${c.weight}%)`;

                    console.log(`     ${String.fromCharCode(65 + i)}) ${status} "${c.text}" ${c.feedback ? `(Feedback: ${c.feedback})` : ''}`);
                });
                break;

            case 'Matching':
                console.log(`   Paires de Correspondance :`);
                q.pairs.forEach(p => {
                    console.log(`     - "${p.left}" -> "${p.right}"`);
                });
                break;

            case 'Numeric':
                console.log(`   Type Numérique : ${q.numericType}`);
                if (q.numericType === 'Range') {
                    console.log(`     Réponse : ${q.value} (Tolérance: ±${q.tolerance})`);
                } else if (q.numericType === 'Interval') {
                    console.log(`     Intervalle : [${q.min} ... ${q.max}]`);
                }
                break;

            case 'Essay':
                console.log(`   (Question Ouverte)`);
                break;
        }

        console.log("------------------------------------------------------------------");
    }
}

module.exports = Affichage;