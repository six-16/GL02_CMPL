const ComparisonProfile = require('../model/ComparisonProfile');

describe('ComparisonProfile', function() {
    
    it('devrait analyser et retourner un résultat', function() {
        const exam = [{ category: 'MCQ', text: 'Q1' }];
        const refs = [[{ category: 'MCQ', text: 'R1' }]];
        const comparison = new ComparisonProfile(exam, refs);
        const result = comparison.analyze();
        expect(Array.isArray(result)).toBeTrue();
    });

    it('devrait calculer la moyenne des références', function() {
        const exam = [{ category: 'MCQ', text: 'Q1' }];
        const refs = [
            [{ category: 'MCQ', text: 'R1' }],
            [{ category: 'MCQ', text: 'R1' }, { category: 'TrueFalse' }]
        ];
        const comparison = new ComparisonProfile(exam, refs);
        comparison.analyze();
        const mcq = comparison.averageProfile.find(p => p.type === 'MCQ');
        expect(parseFloat(mcq.percentage)).toEqual(75.0);
    });

    it('devrait calculer la différence exam vs moyenne', function() {
        const exam = [
            { category: 'MCQ', text: 'Q1' },
            { category: 'MCQ', text: 'Q2' }
        ];
        const refs = [[{ category: 'MCQ', text: 'R1' }, { category: 'TrueFalse' }]];
        const comparison = new ComparisonProfile(exam, refs);
        comparison.analyze();
        const mcq = comparison.comparisonResult.find(c => c.type === 'MCQ');
        expect(parseFloat(mcq.difference)).toEqual(50.0);
    });

    it('devrait retourner les données complètes', function() {
        const exam = [{ category: 'MCQ', text: 'Q1' }];
        const refs = [[{ category: 'MCQ', text: 'R1' }], [{ category: 'TrueFalse' }]];
        const comparison = new ComparisonProfile(exam, refs);
        comparison.analyze();
        const data = comparison.getComparisonData();
        expect(data.examProfile).toBeDefined();
        expect(data.averageProfile).toBeDefined();
        expect(data.referenceFileCount).toEqual(2);
    });
});
