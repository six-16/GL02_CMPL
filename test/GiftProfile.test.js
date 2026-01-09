const GiftProfile = require('../model/GiftProfile');

describe('GiftProfile', function() {
    
    it('devrait retourner null pour une liste vide', function() {
        const profile = new GiftProfile([]);
        expect(profile.calculate()).toBeNull();
    });

    it('devrait compter les questions par catégorie', function() {
        const questions = [
            { category: 'MCQ', text: 'Q1' },
            { category: 'MCQ', text: 'Q2' },
            { category: 'TrueFalse' }
        ];
        const profile = new GiftProfile(questions);
        profile.calculate();
        expect(profile.stats.MCQ).toEqual(2);
        expect(profile.stats.TrueFalse).toEqual(1);
    });

    it('devrait identifier MissingWord (MCQ avec ____)', function() {
        const questions = [
            { category: 'MCQ', text: 'Complete ____ sentence' },
            { category: 'MCQ', text: 'Normal question' }
        ];
        const profile = new GiftProfile(questions);
        profile.calculate();
        expect(profile.stats.MissingWord).toEqual(1);
        expect(profile.stats.MCQ).toEqual(1);
    });

    it('devrait calculer les pourcentages correctement', function() {
        const questions = [
            { category: 'MCQ', text: 'Q1' },
            { category: 'TrueFalse' }
        ];
        const profile = new GiftProfile(questions);
        const report = profile.calculate();
        const mcq = report.find(r => r.type === 'MCQ');
        expect(mcq.percentage).toEqual('50.0');
    });

    it('devrait trier par pourcentage décroissant', function() {
        const questions = [
            { category: 'TrueFalse' },
            { category: 'MCQ', text: 'Q1' },
            { category: 'MCQ', text: 'Q2' },
            { category: 'MCQ', text: 'Q3' }
        ];
        const profile = new GiftProfile(questions);
        const report = profile.calculate();
        expect(parseFloat(report[0].percentage)).toBeGreaterThanOrEqual(parseFloat(report[1].percentage));
    });
});
