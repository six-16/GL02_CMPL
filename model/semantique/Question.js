/**
 * Constructeur de la classe Question.
 * @param {number} num - Le numéro de la question.
 * @param {string} inti - Le texte de la question.
 * @param {string} cat - La catégorie de la question.
 * @param {Array} cho - Les choix de réponse.
 * @param {*} ans - La réponse correcte.
 */
var Question = function(num, inti, cat, cho, ans){
    /** @type {number} Le numéro de la question */
    this.number = num;
    /** @type {string} Le texte de la question */
    this.text = inti || "";
    /** @type {string} La queue ou complément du texte */
    this.tail = "";         
    /** @type {string} La catégorie de la question */
    this.category = cat;
    /** @type {Array} Les choix de réponse */
    this.choices = cho || [];
    /** @type {*} La réponse correcte */
    this.answer = ans;
    

    /** @type {string|null} Le type numérique pour les questions numériques */
    this.numericType = null;
    /** @type {number|null} La valeur pour les questions numériques */
    this.value = null;
    /** @type {number|null} La tolérance pour les questions numériques */
    this.tolerance = null;
    /** @type {number|null} La valeur minimale pour les intervalles */
    this.min = null;
    /** @type {number|null} La valeur maximale pour les intervalles */
    this.max = null;
    

    /** @type {Array} Les paires pour les questions de type matching */
    this.pairs = [];
}; 

module.exports = Question;
