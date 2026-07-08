const { extractWithAI } = require('./dist/services/aiParser');
const { geocodeLocation } = require('./dist/services/geocoder');

const text = `Дніпропетровщина:
1x БпЛА в районі Павлограду курсом на Самар.
1x БпЛА курсом на Кринички.
1x БпЛА курсом на Царичанку.

Чернігівщина:
1x БпЛА курсом на Городню.`;

(async () => {
    const ai = await extractWithAI(text);
    console.log('AI:', ai);
    for (const loc of ai.locationNames || []) {
        console.log('Geocoding', loc, '->', await geocodeLocation(loc, false)); // disable quiet drop for test
    }
})();
