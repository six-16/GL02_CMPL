const Contact = require('../model/Contact');

describe('Contact', function() {
    
    it('devrait valider un nom correct', function() {
        const contact = new Contact('Dupont', 'Jean', 'test@test.com', 'UTC');
        expect(contact.isValidName()).toBeTrue();
    });

    it('devrait rejeter un nom trop court', function() {
        const contact = new Contact('D', 'Jean', 'test@test.com', 'UTC');
        expect(contact.isValidName()).toBeFalse();
    });

    it('devrait valider un email correct', function() {
        const contact = new Contact('Dupont', 'Jean', 'jean@example.com', 'UTC');
        expect(contact.isValidEmail()).toBeTrue();
    });

    it('devrait rejeter un email invalide', function() {
        const contact = new Contact('Dupont', 'Jean', 'invalide', 'UTC');
        expect(contact.isValidEmail()).toBeFalse();
    });

    it('devrait valider un établissement non vide', function() {
        const contact = new Contact('Dupont', 'Jean', 'test@test.com', 'UTC');
        expect(contact.isValidEstablishment()).toBeTruthy();
    });

    it('devrait générer une VCard valide', function() {
        const contact = new Contact('Dupont', 'Jean', 'jean@test.com', 'UTC');
        const vcard = contact.toVCardString();
        expect(vcard).toContain('BEGIN:VCARD');
        expect(vcard).toContain('FN:Jean Dupont');
        expect(vcard).toContain('EMAIL:jean@test.com');
        expect(vcard).toContain('END:VCARD');
    });

    it('devrait générer un nom de fichier correct', function() {
        const contact = new Contact('Dupont', 'Jean', 'test@test.com', 'UTC');
        expect(contact.getFileName()).toEqual('Jean_Dupont.vcf');
    });
});
