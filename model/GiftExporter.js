const Question = require("./semantique/Question.js");

/**
 * Classe pour l'exportation de questions au format GIFT.
 * Génère une chaîne GIFT à partir d'une liste de questions.
 */
class GiftExporter {
    /**
     * Constructeur de GiftExporter.
     * @param {Array} questionList - La liste des questions à exporter.
     */
    constructor(questionList) {
        /** @type {Array} La liste des questions à exporter */
        this.questions = questionList;
    }

    /**
     * Exporte toutes les questions au format GIFT.
     * @returns {string} La chaîne GIFT complète.
     */
    export() {
        let giftContent = "";
        
        this.questions.forEach(question => {
            giftContent += this.formatQuestion(question);
            giftContent += "\n\n";
        });

        return giftContent;
    }

    /**
     * Formate une question individuelle au format GIFT.
     * @param {Question} q - La question à formater.
     * @returns {string} La question formatée en GIFT.
     */
    formatQuestion(q) {
        let output = "";

        // 1. Titre (::Title::)
        if (q.number) {
            output += `::${q.number}:: `;
        }

        // 2. Énoncé
        output += q.text;

        // on gère le cas des questions de description avant pour éviter les crochets vides
        if (q.category === 'Description') {
            return output
        }

        // 3. Bloc de réponse
        output += " {";

        switch (q.category) {

            case 'Essay':
                break;
            
            case 'TrueFalse':
                output += q.answer ? "T" : "F";
                break;

            case 'MCQ':
                output += "\n";
                q.choices.forEach(choice => {
                    let prefix = choice.isCorrect ? "=" : "~";
                    output += `\t${prefix}${choice.text}`;
                    if (choice.feedback) {
                        output += ` #${choice.feedback}`;
                    }
                    output += "\n";
                });
                break;

            case 'Credit':
                output += "\n";
                q.choices.forEach(choice => {
                    output += `\t~%${choice.weight}%${choice.text}`;
                    if (choice.feedback) {
                        output += ` #${choice.feedback}`;
                    }
                    output += "\n";
                });
                break;

            case 'Matching':
                output += "\n";
                q.pairs.forEach(pair => {
                    output += `\t=${pair.left} -> ${pair.right}\n`;
                });
                break;

            case 'Numeric':
                output += "#";
                if (q.numericType === 'Range') {
                    output += `${q.value}`;
                    if (q.tolerance !== null && q.tolerance !== undefined) {
                        output += `:${q.tolerance}`;
                    }
                } else if (q.numericType === 'Interval') {
                    output += `${q.min}..${q.max}`;
                }
                break;

            default:
                console.warn(`Type de question inconnu ou non géré : ${q.category}`);
                break;
        }

        output += "}";
        return output;
    }
}

module.exports = GiftExporter;