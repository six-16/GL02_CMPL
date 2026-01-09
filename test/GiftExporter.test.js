const GiftExporter = require('../model/GiftExporter');

describe('GiftExporter', function() {
    
    it('devrait exporter une question TrueFalse', function() {
        const questions = [{ number: 'Q1', text: 'Test', category: 'TrueFalse', answer: true }];
        const result = new GiftExporter(questions).export();
        expect(result).toContain('::Q1::');
        expect(result).toContain('{T}');
    });

    it('devrait exporter un QCM avec choix', function() {
        const questions = [{
            number: 'Q1', text: 'Test', category: 'MCQ',
            choices: [
                { text: 'Correct', isCorrect: true },
                { text: 'Faux', isCorrect: false }
            ]
        }];
        const result = new GiftExporter(questions).export();
        expect(result).toContain('=Correct');
        expect(result).toContain('~Faux');
    });

    it('devrait exporter une question Numeric Range', function() {
        const questions = [{
            number: 'Q1', text: 'Test', category: 'Numeric',
            numericType: 'Range', value: 4, tolerance: 0.5
        }];
        const result = new GiftExporter(questions).export();
        expect(result).toContain('{#4:0.5}');
    });

    it('devrait exporter une question Matching', function() {
        const questions = [{
            number: 'Q1', text: 'Test', category: 'Matching',
            pairs: [{ left: 'A', right: '1' }]
        }];
        const result = new GiftExporter(questions).export();
        expect(result).toContain('=A -> 1');
    });

    it('devrait exporter une question Credit', function() {
        const questions = [{
            number: 'Q1', text: 'Test', category: 'Credit',
            choices: [{ text: 'Choix', weight: 50 }]
        }];
        const result = new GiftExporter(questions).export();
        expect(result).toContain('~%50%Choix');
    });

    it('devrait exporter une Description sans accolades', function() {
        const questions = [{ number: 'Intro', text: 'Bienvenue', category: 'Description' }];
        const result = new GiftExporter(questions).export();
        expect(result).toContain('Bienvenue');
        expect(result).not.toContain('{');
    });
});
