const ExamSession = require('../model/ExamSession');

describe('ExamSession', function() {
    
    it('devrait vérifier une réponse TrueFalse correcte', function() {
        const session = new ExamSession([{ category: 'TrueFalse', answer: true }]);
        expect(session.checkAnswer(session.questions[0], 'T')).toBeTrue();
        expect(session.checkAnswer(session.questions[0], 'vrai')).toBeTrue();
    });

    it('devrait vérifier une réponse MCQ correcte', function() {
        const q = {
            category: 'MCQ',
            choices: [
                { text: 'Correct', isCorrect: true },
                { text: 'Faux', isCorrect: false }
            ]
        };
        const session = new ExamSession([q]);
        expect(session.checkAnswer(q, 'a')).toBeTrue();
        expect(session.checkAnswer(q, 'b')).toBeFalse();
    });

    it('devrait vérifier une réponse Numeric Range', function() {
        const q = { category: 'Numeric', numericType: 'Range', value: 10, tolerance: 2 };
        const session = new ExamSession([q]);
        expect(session.checkAnswer(q, '10')).toBeTrue();
        expect(session.checkAnswer(q, '11')).toBeTrue();
        expect(session.checkAnswer(q, '15')).toBeFalse();
    });

    it('devrait vérifier une réponse Numeric Interval', function() {
        const q = { category: 'Numeric', numericType: 'Interval', min: 10, max: 20 };
        const session = new ExamSession([q]);
        expect(session.checkAnswer(q, '15')).toBeTrue();
        expect(session.checkAnswer(q, '25')).toBeFalse();
    });

    it('devrait incrémenter le score', function() {
        const session = new ExamSession([]);
        session.incrementScore();
        session.incrementScore();
        expect(session.score).toEqual(2);
    });

    it('devrait calculer les résultats correctement', function() {
        const questions = [
            { category: 'MCQ', choices: [] },
            { category: 'TrueFalse', answer: true },
            { category: 'Description' }
        ];
        const session = new ExamSession(questions);
        session.score = 1;
        const results = session.getResults();
        expect(results.total).toEqual(2);
        expect(results.score).toEqual(1);
        expect(results.percentage).toEqual(50);
    });

    it('devrait rejeter une réponse vide ou null', function() {
        const q = { category: 'TrueFalse', answer: true };
        const session = new ExamSession([q]);
        expect(session.checkAnswer(q, '')).toBeFalse();
        expect(session.checkAnswer(q, null)).toBeFalse();
    });
});
