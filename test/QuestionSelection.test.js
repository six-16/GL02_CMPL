const QuestionSelection = require('../model/QuestionSelection');

describe('QuestionSelection', function() {
    let selection;

    beforeEach(function() {
        selection = new QuestionSelection();
    });

    it('devrait ajouter une question', function() {
        selection.add({ id: '1', text: 'Q1' });
        expect(selection.count()).toEqual(1);
    });

    it('devrait éviter les doublons', function() {
        selection.add({ id: '1', text: 'Q1' });
        selection.add({ id: '1', text: 'Q1 modifié' });
        expect(selection.count()).toEqual(1);
    });

    it('devrait supprimer une question', function() {
        selection.add({ id: '1', text: 'Q1' });
        selection.remove('1');
        expect(selection.count()).toEqual(0);
    });

    it('devrait vérifier si une question existe', function() {
        selection.add({ id: '1', text: 'Q1' });
        expect(selection.exists('1')).toBeTrue();
        expect(selection.exists('999')).toBeFalse();
    });

    it('devrait être invalide avec moins de 15 questions', function() {
        for (let i = 0; i < 10; i++) selection.add({ id: String(i), text: `Q${i}` });
        expect(selection.isValid().valid).toBeFalse();
    });

    it('devrait être valide avec 15-20 questions', function() {
        for (let i = 0; i < 15; i++) selection.add({ id: String(i), text: `Q${i}` });
        expect(selection.isValid().valid).toBeTrue();
    });

    it('devrait être invalide avec plus de 20 questions', function() {
        for (let i = 0; i < 21; i++) selection.add({ id: String(i), text: `Q${i}` });
        expect(selection.isValid().valid).toBeFalse();
    });
});
