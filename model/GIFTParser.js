const Question = require("./semantique/Question.js");
const QuestionCollection = require("./semantique/QuestionCollection.js");

/**
 * Constructeur de GiftParser.
 * @param {boolean} sTokenize - Afficher la tokenization.
 * @param {boolean} sParsedSymb - Afficher les symboles parsés.
 */
var GiftParser = function (sTokenize, sParsedSymb) {
	/** @type {Array} La liste des questions parsées */
	this.parsedQuestion = [];
	/** @type {Array} La liste des symboles reconnus */
	this.symb = [
		"::",
		"{",
		"}",
		"=",
		"~",
		"#",
		"T",
		"F",
		"->",
		":",
		"..",
		"-",
		"%"
	];
	/** @type {boolean} Afficher la tokenization */
	this.showTokenize = sTokenize;
	/** @type {boolean} Afficher les symboles parsés */
	this.showParsedSymbols = sParsedSymb;
	/** @type {number} Le nombre d'erreurs */
	this.errorCount = 0;
}

//fonction principale qui rassemble le tout 

/**
 * Parse le contenu GIFT et remplit parsedQuestion.
 * @param {string} data - Le contenu du fichier GIFT.
 * @returns {void}
 */
GiftParser.prototype.parse = function (data) {
	var tData = this.tokenize(data);
	this.parsedQuestion = []; // Reset

	while (tData.length > 0) {
		// On parse une question
		this.parseQuestion(tData);

		// On nettoie les éventuels sauts de ligne entre les questions
		while (tData.length > 0 && (tData[0] === "\r\n" || tData[0] === "")) {
			tData.shift();
		}
	}
}


// tokenize : tranform the data input into a list
/**
 * Supprime les commentaires des données.
 * @param {string} data - Les données brutes.
 * @returns {string} Les données sans commentaires.
 */
GiftParser.prototype.removeComments = function(data) {
    // Supprime les lignes commençant par //
    return data.replace(/\/\/.*$/gm, '');
}

/**
 * Tokenize les données en liste de tokens.
 * @param {string} data - Les données à tokenizer.
 * @returns {Array} La liste des tokens.
 */
GiftParser.prototype.tokenize = function (data) {
    data = this.removeComments(data);
    
    // CORRECTION : J'ai retiré '\-' de la liste pour ne pas couper "high-fat"
    // J'ai ajouté \n et \r pour être compatible avec tous les fichiers
    var separator = /(\r\n|\n|\r|::|{|}|=|~|#|->|:|\.\.|%)/; 
    
    data = data.split(separator);
    data = data.filter((val) => val && val.trim() !== "");
    return data;
}

//=========================================== Outils pour parser ====================================================/

/**
 * Consomme et retourne le prochain token.
 * @param {Array} input - La liste des tokens.
 * @returns {string} Le token consommé.
 */
GiftParser.prototype.next = function (input) {
	var curS = input.shift(); //supprime le premier élément du tableau
	if (this.showParsedSymbols) {
		// console.log(curS);
	}
	return curS
}

/**
 * Vérifie si le prochain token est égal à s.
 * @param {string} s - Le symbole à vérifier.
 * @param {Array} input - La liste des tokens.
 * @returns {boolean} True si égal, false sinon.
 */
GiftParser.prototype.check = function (s, input) {
    if (input.length === 0) {
        return false;
    }
    // On compare directement le string, sans passer par accept()
    return input[0] === s;
}

/**
 * Attend un symbole spécifique et le consomme.
 * @param {string} s - Le symbole attendu.
 * @param {Array} input - La liste des tokens.
 * @returns {boolean} True si trouvé, false sinon.
 */
GiftParser.prototype.expect = function (s, input) { // passe au jeton suivant et répond à une question sur le symbole
	if (s == this.next(input)) {
		return true;
	} else {
		// this.errMsg("symbol " + s + " doesn't match", input);
	}
	return false;
}

/**
 * Vérifie si le symbole est autorisé.
 * @param {string} s - Le symbole à vérifier.
 * @returns {number|boolean} L'index si trouvé, false sinon.
 */
GiftParser.prototype.accept = function (s) { //vérifie si le symbôle fait bien partie de la liste autorisée
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if (idx === -1) {
		this.errMsg("symbol " + s + " unknown", [" "]);
		return false;
	}

	return idx;
}

/**
 * Affiche un message d'erreur.
 * @param {string} msg - Le message d'erreur.
 * @param {Array} input - La liste des tokens.
 * @returns {void}
 */
GiftParser.prototype.errMsg = function (msg, input) { // pour afficher un message d'erreur
	this.errorCount++;
	console.log("Parsing Error ! on " + input + " -- msg : " + msg);
}

// Vérifie si un symbole spécifique  est présent dans le bloc 
/**
 * Vérifie si un symbole est présent dans le bloc de réponse.
 * @param {Array} input - La liste des tokens.
 * @param {string} sym - Le symbole à chercher.
 * @returns {boolean} True si trouvé, false sinon.
 */
GiftParser.prototype.containsSymbol = function (input, sym) {
	var i = 0;
	// On boucle tant qu'on est pas à la fin du fichier 
	// ET qu'on n'a pas atteint la fin du bloc de réponse "}"
	while (i < input.length && input[i] !== "}") {
		if (input[i] === sym) {
			return true;
		}
		i++;
	}
	return false;
}
//=====================================================================================================================//

/**
 * Parse une question depuis les tokens.
 * @param {Array} input - La liste des tokens.
 * @returns {void}
 */
GiftParser.prototype.parseQuestion = function (input) {
	var question = new Question;

	if (this.check("::", input)) {
		this.expect('::', input);
		question.number = this.next(input);
		this.expect('::', input);
	}

	while (input.length > 0 && !this.check("::", input)) {

		if (this.check("{", input)) {
			this.expect("{", input);
			question.text += "____";

			if (this.check('}', input)) { // si l'ensemble de réponse est vide, alors c'est une question ouverte 
				this.expect('}', input);
				question.category = "Essay";
				this.parsedQuestion.push(question);
			}
			else if (this.check('T', input) || this.check('F', input)) { // si l'ensemble de réponse est juste T ou F, alors c'est un vrai/faux
				this.parseTrueFalse(input, question);
			}
			else if (this.check('#', input)) { // si l'ensemble de réponse commence par un #, alors c'est une plage numérique
				this.parseNumeric(input, question);
			}
			else { // si le bloc réponse commence par un =, il y'a une ambiguité. Il faut vérifier la présence de symboles dans les bloc réponse, et pas forcément au tout début
				if (this.containsSymbol(input, '->')) {
					this.parseMatching(input, question);
				}
				else if (this.containsSymbol(input, '%')) {
					this.parseCredit(input, question);
				}
				else {
					this.parseMCQ(input, question);
				}
			}
		}
		else {
			question.text += this.next(input) + " "; // stocke l'énoncé et avec des espaces.
		}
	}
	question.text = question.text.trim();

	if (!question.category){
		question.category = "Description";
	}

	this.parsedQuestion.push(question);
}

/**
 * Parse une question Vrai/Faux.
 * @param {Array} input - La liste des tokens.
 * @param {Question} question - L'objet question à remplir.
 * @returns {void}
 */
GiftParser.prototype.parseTrueFalse = function (input, question) {
	question.category = "TrueFalse";

	if (this.check("T", input)) { //vérifie si la réponse est T
		this.expect("T", input); // consomme le T
		question.answer = true;
	}
	else if (this.check("F", input)) {
		this.expect("F", input);
		question.answer = false;
	}
	else {
		this.errMsg("Attendu : 'T' ou 'F' pour une question Vrai/Faux", input);
	}
	this.expect("}", input); //consomme la dernière accolade pour finir la question

}

/**
 * Parse une question QCM.
 * @param {Array} input - La liste des tokens.
 * @param {Question} question - L'objet question à remplir.
 * @returns {void}
 */
GiftParser.prototype.parseMCQ = function (input, question) {
	question.category = "MCQ";
	question.choices = [];

	while (!this.check("}", input) && input.length > 0) {
		if (this.check("=", input)) {
			this.expect("=", input);
			var choice = this.parseChoiceContent(input); //pour lire le texte et le commentaire
			choice.isCorrect = true;
			question.choices.push(choice); //met le choix dans le tableau choices; push = .append en python
		}
		else if (this.check("~", input)) {
			this.expect("~", input);
			if (this.check("=", input)) {
				this.expect("=", input);
				var choice = this.parseChoiceContent(input);
				choice.isCorrect = true;
				question.choices.push(choice);
			}
			else {
				var choice = this.parseChoiceContent(input);
				choice.isCorrect = false;
				question.choices.push(choice);
			}
		}
		else {
			this.next(input) //pour éviter une boucle infinie si on tombe sur autre chose
		}
	}
	this.expect("}", input);
}

/**
 * Parse le contenu d'un choix de réponse.
 * @param {Array} input - La liste des tokens.
 * @returns {Object} L'objet choix avec text et feedback.
 */
GiftParser.prototype.parseChoiceContent = function (input) {
	var choice = { text: "", feedback: "" }; // énoncé de la réponse et commentaire

	//on va lire le texte, et continuer tant qu'on ne rencontre pas un symbole de contrôle = ~ } #
	while (input.length > 0 &&
		!this.check("=", input) &&
		!this.check("~", input) &&
		!this.check("}", input) &&
		!this.check("#", input)) {
		choice.text += this.next(input) + " "; //ajout à la chaine de caractère
	}
	choice.text = choice.text.trim(); //supprime les espaces blancs

	//lecture du commentaire 
	if (this.check("#", input)) {
		this.expect("#", input);
		while (input.length > 0 &&
			!this.check("=", input) &&
			!this.check("~", input) &&
			!this.check("}", input)) {
			choice.feedback += this.next(input) + " ";
		}
		choice.feedback = choice.feedback.trim();
	}
	return choice;
}

/**
 * Parse une question numérique.
 * @param {Array} input - La liste des tokens.
 * @param {Question} question - L'objet question à remplir.
 * @returns {void}
 */
GiftParser.prototype.parseNumeric = function (input, question) {
	question.category = "Numeric";
	this.expect("#", input);
	var number1 = this.next(input); //lecture du premier nombre : peut être la réponse cible OU le minimum
	//il existe deux types de questions numériques : les range (valeur cible) et les intervalles
	if (this.check(":", input)) {
		this.expect(":", input);
		var tolerance = this.next(input);

		question.numericType = "Range";
		question.value = parseFloat(number1);      // La valeur cible
		question.tolerance = parseFloat(tolerance); // La tolérance acceptée
	}

	else if (this.check("..", input)) {
		this.expect("..", input);
		var number2 = this.next(input);

		question.numericType = "Interval";
		//parseFloat est une fonction native de JavaScript
		question.min = parseFloat(number1); // Borne inférieure
		question.max = parseFloat(number2); // Borne supérieure
	}
	else {
		// this.errMsg("Format numérique invalide. Attendu ':' ou '..'", input);
	}
	this.expect("}", input);
}

/**
 * Parse une question de correspondance.
 * @param {Array} input - La liste des tokens.
 * @param {Question} question - L'objet question à remplir.
 * @returns {void}
 */
GiftParser.prototype.parseMatching = function (input, question) {
	question.category = "Matching";
	question.pairs = [];

	while (!this.check("}", input) && input.length > 0) {
		// ABNF : reponseCorrespondance = "=" valeurGauche "->" valeurDroite
		if (this.check("=", input)) {
			this.expect("=", input);

			//lecture de la valeur gauche

			var leftVal = "";
			while (!this.check("->", input) && input.length > 0) {
				leftVal += this.next(input) + " ";
			}
			leftVal = leftVal.trim();
			this.expect("->", input); //consomme la flèche

			//lecture de la valeur droite

			var rightVal = "";
			while (!this.check("=", input) && !this.check("}", input) && input.length > 0) {
				rightVal += this.next(input) + " ";
			}
			rightVal = rightVal.trim();

			question.pairs.push({ left: leftVal, right: rightVal })
		}
		else {
			this.next(input);
		}
		
	}
	this.expect("}", input);
}

/**
 * Parse une question à crédits.
 * @param {Array} input - La liste des tokens.
 * @param {Question} question - L'objet question à remplir.
 * @returns {void}
 */
GiftParser.prototype.parseCredit = function (input, question) {
	// 1. Définition du type
	question.category = "Credit";
	question.choices = []; // On utilisera une liste de choix pondérés

	// 2. Boucle tant qu'on n'est pas à la fin du bloc
	while (!this.check("}", input) && input.length > 0) {

		var choice = { text: "", weight: 0, feedback: "" };

		// --- ÉTAPE A : Gestion du préfixe (= ou ~) ---
		// Dans le format Credit, on trouve parfois "=" pour la réponse à 100%
		// ou "~" pour les partielles. Parfois rien avant le %.
		// On consomme le symbole s'il est là.
		if (this.check("=", input)) {
			this.expect("=", input);
		} else if (this.check("~", input)) {
			this.expect("~", input);
		}

		// --- ÉTAPE B : Lecture du Pourcentage (%valeur%) ---
		// C'est la signature de ce type de question
		if (this.check("%", input)) {
			this.expect("%", input);      // Premier %
			var val = this.next(input);   // La valeur (ex: "50" ou "-33")
			this.expect("%", input);      // Deuxième %

			choice.weight = parseFloat(val); // On stocke le poids
		} else {
			// Si pas de pourcentage explicite (cas rare dans un parseCredit, 
			// mais possible pour la réponse correcte par défaut = 100)
			choice.weight = 100;
		}

		// --- ÉTAPE C : Lecture du Texte et du Feedback ---
		// On lit le texte jusqu'au prochain symbole de contrôle
		// (Les symboles de contrôle ici sont =, ~, }, et %)
		while (input.length > 0 &&
			!this.check("=", input) &&
			!this.check("~", input) &&
			!this.check("}", input) &&
			!this.check("%", input) && // Le % peut démarrer le choix suivant
			!this.check("#", input)) {
			choice.text += this.next(input) + " ";
		}
		choice.text = choice.text.trim();

		// --- ÉTAPE D : Lecture du Commentaire Optionnel (#) ---
		if (this.check("#", input)) {
			this.expect("#", input);
			while (input.length > 0 &&
				!this.check("=", input) &&
				!this.check("~", input) &&
				!this.check("}", input) &&
				!this.check("%", input)) {
				choice.feedback += this.next(input) + " ";
			}
			choice.feedback = choice.feedback.trim();
		}

		// --- ÉTAPE E : Stockage ---
		question.choices.push(choice);
	}

	// 3. Sortie propre
	this.expect("}", input);
};

module.exports = GiftParser;