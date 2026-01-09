const GiftParser = require('../model/GIFTParser');

describe('GIFTParser', function() {
    let parser;

    beforeEach(function() {
        parser = new GiftParser(false, false);
    });

    it('devrait parser une question Vrai/Faux', function() {
        parser.parse('::Q1:: La terre est ronde {T}');
        expect(parser.parsedQuestion[0].category).toEqual('TrueFalse');
        expect(parser.parsedQuestion[0].answer).toBeTrue();
    });

    it('devrait parser un QCM et identifier la bonne réponse', function() {
        parser.parse('::Q1:: Capitale de France ? {=Paris ~Londres ~Berlin}');
        expect(parser.parsedQuestion[0].category).toEqual('MCQ');
        expect(parser.parsedQuestion[0].choices.length).toEqual(3);
        expect(parser.parsedQuestion[0].choices.find(c => c.isCorrect).text).toEqual('Paris');
    });

    it('devrait parser une question numérique Range', function() {
        parser.parse('::Q1:: Combien font 2+2 ? {#4:0.5}');
        expect(parser.parsedQuestion[0].category).toEqual('Numeric');
        expect(parser.parsedQuestion[0].value).toEqual(4);
        expect(parser.parsedQuestion[0].tolerance).toEqual(0.5);
    });

    it('devrait parser une question numérique Interval', function() {
        parser.parse('::Q1:: Entre combien ? {#10..20}');
        expect(parser.parsedQuestion[0].category).toEqual('Numeric');
        expect(parser.parsedQuestion[0].min).toEqual(10);
        expect(parser.parsedQuestion[0].max).toEqual(20);
    });

    it('devrait parser une question Matching', function() {
        parser.parse('::Q1:: Associez {=France -> Paris =Allemagne -> Berlin}');
        expect(parser.parsedQuestion[0].category).toEqual('Matching');
        expect(parser.parsedQuestion[0].pairs.length).toEqual(2);
    });

    it('devrait parser une question Credit avec pourcentages', function() {
        parser.parse('::Q1:: Question {~%50%Moitié ~%100%Tout}');
        expect(parser.parsedQuestion[0].category).toEqual('Credit');
        expect(parser.parsedQuestion[0].choices[0].weight).toEqual(50);
    });

    it('devrait parser une question Essay (bloc vide)', function() {
        parser.parse('::Q1:: Décrivez {}');
        const essay = parser.parsedQuestion.find(q => q.category === 'Essay');
        expect(essay).toBeDefined();
    });

    it('devrait supprimer les commentaires', function() {
        const result = parser.removeComments('// Commentaire\nQuestion');
        expect(result).toEqual('\nQuestion');
    });

    it('devrait parser plusieurs questions', function() {
        parser.parse('::Q1:: Test1 {T}\n\n::Q2:: Test2 {F}');
        expect(parser.parsedQuestion.length).toBeGreaterThanOrEqual(2);
    });
});
