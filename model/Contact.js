// model/Contact.js

/**
 * Classe représentant un contact pour la génération de VCard.
 * Gère les informations d'un enseignant et valide les données.
 */
class Contact {
    /**
     * Constructeur de Contact.
     * @param {string} nom - Le nom de famille.
     * @param {string} prenom - Le prénom.
     * @param {string} email - L'adresse email.
     * @param {string} etablissement - L'établissement.
     */
    constructor(nom, prenom, email, etablissement) {
        /** @type {string} Le nom de famille */
        this.nom = nom;
        /** @type {string} Le prénom */
        this.prenom = prenom;
        /** @type {string} L'adresse email */
        this.email = email;
        /** @type {string} L'établissement */
        this.etablissement = etablissement;
    }

    /**
     * Valide le nom et le prénom.
     * @returns {boolean} True si valide, false sinon.
     */
    isValidName() {
        // ABNF: Au moins 2 caractères alphabétiques
        const regex = /^[a-zA-Z\s]{2,}$/;
        return regex.test(this.nom) && regex.test(this.prenom);
    }

    /**
     * Valide l'adresse email.
     * @returns {boolean} True si valide, false sinon.
     */
    isValidEmail() {
        // Validation format email simple
        const regex = /^[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~.]+@[a-zA-Z0-9\-]+\.[a-zA-Z]+$/;
        return regex.test(this.email);
    }

    /**
     * Valide l'établissement.
     * @returns {boolean} True si valide, false sinon.
     */
    isValidEstablishment() {
        // ABNF: NOTE non vide
        return this.etablissement && this.etablissement.trim().length > 0;
    }

    /**
     * Génère la chaîne VCard.
     * @returns {string} La chaîne VCard formatée.
     */
    toVCardString() {
        // Note: L'espace après BEGIN:VCARD est requis par ton ABNF spécifique
        let content = "BEGIN:VCARD \r\n"; 
        content += "VERSION:4.0\r\n";
        
        // Propriété FN (Nom complet)
        content += `FN:${this.prenom} ${this.nom}\r\n`;
        
        // Propriété N (Nom structuré : Nom;Prénom)
        content += `N:${this.nom};${this.prenom}\r\n`;
        
        // Propriété EMAIL
        content += `EMAIL:${this.email}\r\n`;
        
        // Propriété NOTE (Utilisée pour l'établissement car ORG est absent de ton ABNF)
        content += `NOTE:${this.etablissement}\r\n`;
        
        content += "END:VCARD\r\n";
        return content;
    }

    /**
     * Génère le nom du fichier VCard.
     * @returns {string} Le nom du fichier.
     */
    getFileName() {
        return `${this.prenom}_${this.nom}.vcf`.replace(/\s+/g, '_');
    }
}

module.exports = Contact;