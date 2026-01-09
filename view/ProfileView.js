// view/ProfileView.js
// Vue de la spec05 - Version Vega-Lite

const fs = require('fs');
const path = require('path');
const open = require('open').default;

class ProfileView {
    constructor(outputDir = './output') {
        this.outputDir = outputDir;
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
    }

    displayTitle(filename) {
        console.log(`\n ANALYSE ET PROFILAGE DU FICHIER : ${filename}`);
        console.log("==================================================");
    }

    displayError(msg) {
        console.error(`Erreur : ${msg}`);
    }

    // Dictionnaire de traduction des types
    _getLabels() {
        return {
            'MCQ': 'Choix multiples',
            'MissingWord': 'Mot manquant',
            'TrueFalse': 'Vrai / Faux',
            'Matching': 'Correspondance',
            'Numeric': 'Numérique',
            'Essay': 'Question ouverte',
            'Description': 'Description/Info',
            'Credit': 'Choix multiple (Crédit)',
            'Other': 'Autre'
        };
    }

    // Prépare les données pour Vega-Lite
    _prepareChartData(report) {
        const labels = this._getLabels();
        return report.map(row => ({
            type: labels[row.type] || row.type,
            count: row.count,
            percentage: row.percentage
        }));
    }

    // Génère la spécification Vega-Lite
    _createChartSpec(data, total, filename) {
        return {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "title": {
                "text": `Analyse du fichier : ${filename}`,
                "subtitle": `Total de questions : ${total}`,
                "fontSize": 20,
                "subtitleFontSize": 14,
                "anchor": "start"
            },
            "width": 600,
            "height": 400,
            "data": { "values": data },
            "mark": {
                "type": "bar",
                "cornerRadiusEnd": 6,
                "color": {
                    "x1": 1, "y1": 1, "x2": 0, "y2": 0,
                    "gradient": "linear",
                    "stops": [
                        { "offset": 0, "color": "#3b82f6" },
                        { "offset": 1, "color": "#8b5cf6" }
                    ]
                }
            },
            "encoding": {
                "y": {
                    "field": "type",
                    "type": "nominal",
                    "title": "Type de question",
                    "sort": "-x",
                    "axis": { "labelFontSize": 12, "titleFontSize": 14 }
                },
                "x": {
                    "field": "count",
                    "type": "quantitative",
                    "title": "Nombre de questions",
                    "axis": { "labelFontSize": 12, "titleFontSize": 14 }
                },
                "tooltip": [
                    { "field": "type", "title": "Type" },
                    { "field": "count", "title": "Nombre" },
                    { "field": "percentage", "title": "Pourcentage (%)", "format": ".1f" }
                ]
            },
            "config": {
                "background": "#fafafa",
                "font": "system-ui, -apple-system, sans-serif",
                "axis": { "gridColor": "#e5e7eb" }
            }
        };
    }

    // Affiche l'histogramme via Vega-Lite dans le navigateur
    async displayHistogram(report, total, filename = 'fichier') {
        if (!report || total === 0) {
            console.log("Le fichier ne contient aucune question valide.");
            return null;
        }

        const data = this._prepareChartData(report);
        const spec = this._createChartSpec(data, total, filename);

        const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analyse - ${filename}</title>
    <script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            padding: 2rem;
            max-width: 900px;
            width: 100%;
        }
        h1 {
            color: #1f2937;
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #e5e7eb;
        }
        #chart { display: flex; justify-content: center; }
        .footer {
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Profilage des Questions</h1>
        <div id="chart"></div>
        <div class="footer">Généré le ${new Date().toLocaleDateString('fr-FR')}</div>
    </div>
    <script>
        vegaEmbed('#chart', ${JSON.stringify(spec, null, 2)}, {
            actions: { export: true, source: false, compiled: false, editor: false }
        });
    </script>
</body>
</html>`;

        const outputPath = path.join(this.outputDir, `profile_${filename.replace(/\.[^/.]+$/, '')}.html`);
        fs.writeFileSync(outputPath, htmlContent, 'utf-8');
        
        console.log(`Graphique généré : ${outputPath}`);
        
        // Ouverture automatique dans le navigateur
        await open(outputPath);
        console.log("Ouverture dans le navigateur...");

        return outputPath;
    }
}

module.exports = ProfileView;