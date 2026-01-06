// model/ExamSession.js

/**
 * Classe gérant une session d'examen pour la simulation.
 * Suit le score et vérifie les réponses.
 */
class ExamSession {
    /**
     * Constructeur d'ExamSession.
     * @param {Array} questions - La liste des questions de l'examen.
     */
    constructor(questions) {
        /** @type {Array} La liste des questions */
        this.questions = questions;
        /** @type {number} Le score actuel */
        this.score = 0;
        /** @type {number} Le nombre total de questions répondables */
        this.totalAnswerable = 0; // Pour exclure les Descriptions qui ne sont pas des questions
    }

    /**
     * Vérifie la réponse de l'utilisateur
     * @param {Object} question - L'objet question
     * @param {String} userAnswer - La réponse brute de l'utilisateur
     * @returns {Boolean} Vrai si correct, Faux sinon
     */
    checkAnswer(question, userAnswer) {
        if (!userAnswer) return false;
        const input = userAnswer.trim().toLowerCase();

        switch (question.category) {
            case 'TrueFalse':
                // On accepte T/F, V/F, Vrai/Faux, True/False
                const isTrue = ['t', 'v', 'true', 'vrai', '1'].includes(input);
                return isTrue === question.answer;

            case 'MCQ':
            case 'Credit': // Traité comme un QCM simple pour la simulation (gagne ou perd)
                // L'utilisateur entre une lettre (A, B, C...)
                const charCode = input.charCodeAt(0);
                const index = charCode - 97; // 'a' code 97 -> index 0
                
                if (index >= 0 && index < question.choices.length) {
                    return question.choices[index].isCorrect === true;
                }
                return false;

            case 'Numeric':
                const num = parseFloat(input);
                if (isNaN(num)) return false;

                if (question.numericType === 'Range') {
                    // Valeur +/- Tolérance
                    const min = question.value - question.tolerance;
                    const max = question.value + question.tolerance;
                    return num >= min && num <= max;
                } 
                else if (question.numericType === 'Interval') {
                    // Min..Max
                    return num >= question.min && num <= question.max;
                }
                return false;

            case 'Matching':
            case 'Essay':
            case 'Description':
            default:
                // Pour ces types complexes ou impossibles à noter auto en CLI simple,
                // on considère que ce n'est pas noté automatiquement ici.
                return false; 
        }
    }

    /**
     * Incrémente le score de 1.
     * @returns {void}
     */
    incrementScore() {
        this.score++;
    }

    /**
     * Calcule et retourne les résultats finaux.
     * @returns {Object} Les statistiques de l'examen.
     */
    getResults() {
        // On ne compte que les questions qui ont une vraie réponse (pas Description ou Essay)
        const answerableTypes = ['TrueFalse', 'MCQ', 'Numeric', 'Credit'];
        this.totalAnswerable = this.questions.filter(q => answerableTypes.includes(q.category)).length;

        return {
            score: this.score,
            total: this.totalAnswerable,
            badAnswers: this.totalAnswerable - this.score,
            percentage: this.totalAnswerable > 0 ? Math.round((this.score / this.totalAnswerable) * 100) : 0
        };
    }
}

module.exports = ExamSession;