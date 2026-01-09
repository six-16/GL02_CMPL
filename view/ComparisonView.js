// view/ComparisonView.js
// SPEC06: Comparaison de profils d'examens - Version Vega-Lite

const fs = require('fs');
const path = require('path');
const open = require('open').default;

/**
 * Classe pour l'affichage des résultats de comparaison de profils.
 * Génère un graphique Vega-Lite interactif dans le navigateur.
 */
class ComparisonView {

    constructor(outputDir = './output') {
        this.outputDir = outputDir;
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
    }

    /**
     * Affiche le message de bienvenue pour la comparaison.
     */
    displayWelcome() {
        console.log('\n' + '='.repeat(70));
        console.log('  COMPARAISON DE PROFILS D\'EXAMENS (SPEC06)');
        console.log('='.repeat(70) + '\n');
    }

    /**
     * Affiche un message d'erreur.
     * @param {string} message - Le message d'erreur.
     */
    displayError(message) {
        console.error(`\n  Erreur : ${message}`);
    }

    /**
     * Affiche un message d'avertissement.
     * @param {string} message - Le message d'avertissement.
     */
    displayWarning(message) {
        console.warn(`\n  Avertissement : ${message}`);
    }

    /**
     * Traduit les clés techniques en labels français.
     * @param {string} type - Le type technique.
     * @returns {string} Le label français.
     */
    _translateTypeLabel(type) {
        const labels = {
            'MCQ': 'Choix multiples',
            'MissingWord': 'Mot manquant',
            'TrueFalse': 'Vrai / Faux',
            'Matching': 'Correspondance',
            'Numeric': 'Numérique',
            'Essay': 'Question ouverte',
            'Description': 'Description/Info',
            'Credit': 'Crédit partiel',
            'Other': 'Autre'
        };
        return labels[type] || type;
    }

    /**
     * Prépare les données pour le graphique Vega-Lite.
     * @param {Array} comparison - Les données de comparaison.
     * @returns {Array} Données formatées pour Vega-Lite.
     */
    _prepareChartData(comparison) {
        const data = [];
        comparison.forEach(row => {
            const type = this._translateTypeLabel(row.type);
            data.push({
                type: type,
                source: 'Examen',
                percentage: parseFloat(row.examPercentage)
            });
            data.push({
                type: type,
                source: 'Moyenne nationale',
                percentage: parseFloat(row.averagePercentage)
            });
        });
        return data;
    }

    /**
     * Prépare les données pour le graphique des écarts.
     * @param {Array} comparison - Les données de comparaison.
     * @returns {Array} Données des écarts.
     */
    _prepareGapData(comparison) {
        return comparison.map(row => ({
            type: this._translateTypeLabel(row.type),
            ecart: parseFloat(row.difference),
            status: parseFloat(row.difference) >= 0 ? 'Surplus' : 'Déficit'
        }));
    }

    /**
     * Génère la spécification Vega-Lite pour le graphique comparatif.
     */
    _createComparisonSpec(data) {
        return {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "title": {
                "text": "Comparaison : Examen vs Moyenne nationale",
                "fontSize": 18,
                "anchor": "start"
            },
            "width": 500,
            "height": 300,
            "data": { "values": data },
            "mark": {
                "type": "bar",
                "cornerRadiusEnd": 4
            },
            "encoding": {
                "y": {
                    "field": "type",
                    "type": "nominal",
                    "title": "Type de question",
                    "axis": { "labelFontSize": 11, "titleFontSize": 13 },
                    "sort": { "field": "percentage", "op": "max", "order": "descending" }
                },
                "x": {
                    "field": "percentage",
                    "type": "quantitative",
                    "title": "Pourcentage (%)",
                    "axis": { "labelFontSize": 11, "titleFontSize": 13 }
                },
                "xOffset": { "field": "source" },
                "color": {
                    "field": "source",
                    "type": "nominal",
                    "title": "Source",
                    "scale": {
                        "domain": ["Examen", "Moyenne nationale"],
                        "range": ["#3b82f6", "#f59e0b"]
                    },
                    "legend": { "orient": "top", "titleFontSize": 12 }
                },
                "tooltip": [
                    { "field": "type", "title": "Type" },
                    { "field": "source", "title": "Source" },
                    { "field": "percentage", "title": "Pourcentage", "format": ".1f" }
                ]
            },
            "config": {
                "font": "system-ui, -apple-system, sans-serif",
                "axis": { "gridColor": "#e5e7eb" }
            }
        };
    }

    /**
     * Génère la spécification Vega-Lite pour le graphique des écarts.
     */
    _createGapSpec(data) {
        return {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "title": {
                "text": "Écarts par rapport à la moyenne nationale",
                "fontSize": 18,
                "anchor": "start"
            },
            "width": 500,
            "height": 300,
            "data": { "values": data },
            "mark": {
                "type": "bar",
                "cornerRadiusEnd": 4
            },
            "encoding": {
                "y": {
                    "field": "type",
                    "type": "nominal",
                    "title": "Type de question",
                    "axis": { "labelFontSize": 11, "titleFontSize": 13 },
                    "sort": { "field": "ecart", "order": "descending" }
                },
                "x": {
                    "field": "ecart",
                    "type": "quantitative",
                    "title": "Écart (%)",
                    "axis": { "labelFontSize": 11, "titleFontSize": 13 }
                },
                "color": {
                    "field": "status",
                    "type": "nominal",
                    "title": "Statut",
                    "scale": {
                        "domain": ["Surplus", "Déficit"],
                        "range": ["#10b981", "#ef4444"]
                    },
                    "legend": { "orient": "top", "titleFontSize": 12 }
                },
                "tooltip": [
                    { "field": "type", "title": "Type" },
                    { "field": "ecart", "title": "Écart (%)", "format": "+.1f" },
                    { "field": "status", "title": "Statut" }
                ]
            },
            "config": {
                "font": "system-ui, -apple-system, sans-serif",
                "axis": { "gridColor": "#e5e7eb" }
            }
        };
    }

    /**
     * Affiche la comparaison via Vega-Lite dans le navigateur.
     * @param {string} examFile - Le chemin du fichier d'examen.
     * @param {Array<string>} referenceFiles - La liste des fichiers de référence.
     * @param {Object} data - Les données de comparaison.
     */
    async displayComparison(examFile, referenceFiles, data) {
        const chartData = this._prepareChartData(data.comparison);
        const gapData = this._prepareGapData(data.comparison);
        
        const comparisonSpec = this._createComparisonSpec(chartData);
        const gapSpec = this._createGapSpec(gapData);

        // Calcul des statistiques
        const examTotal = data.examProfile.reduce((sum, item) => sum + parseInt(item.count || 0), 0);

        // Génération du tableau HTML des écarts
        const tableRows = data.comparison.map(row => {
            const ecart = parseFloat(row.difference);
            const ecartClass = ecart > 0 ? 'positive' : ecart < 0 ? 'negative' : 'neutral';
            const ecartSign = ecart > 0 ? '+' : '';
            return `
                <tr>
                    <td>${this._translateTypeLabel(row.type)}</td>
                    <td>${row.examPercentage}%</td>
                    <td>${row.averagePercentage}%</td>
                    <td class="${ecartClass}">${ecartSign}${row.difference}%</td>
                </tr>
            `;
        }).join('');

        // Liste des fichiers de référence
        const refFilesList = referenceFiles.map((f, i) => `<li>${f}</li>`).join('');

        const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comparaison - ${examFile}</title>
    <script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 {
            color: #1e3a5f;
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
        }
        .subtitle {
            color: #64748b;
            font-size: 1rem;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
        }
        .stat-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 1rem;
            text-align: center;
        }
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #3b82f6;
        }
        .stat-label {
            color: #64748b;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(550px, 1fr));
            gap: 1.5rem;
            margin-bottom: 1.5rem;
        }
        .chart-card {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .chart-container {
            display: flex;
            justify-content: center;
        }
        .table-card {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            margin-bottom: 1.5rem;
        }
        .table-card h2 {
            color: #1e3a5f;
            font-size: 1.25rem;
            margin-bottom: 1rem;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background: #f8fafc;
            color: #1e3a5f;
            font-weight: 600;
        }
        tr:hover {
            background: #f8fafc;
        }
        .positive { color: #10b981; font-weight: 600; }
        .negative { color: #ef4444; font-weight: 600; }
        .neutral { color: #f59e0b; font-weight: 600; }
        .ref-files {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .ref-files h2 {
            color: #1e3a5f;
            font-size: 1.25rem;
            margin-bottom: 1rem;
        }
        .ref-files ul {
            list-style: none;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 0.5rem;
        }
        .ref-files li {
            background: #f8fafc;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
            color: #475569;
        }
        .ref-files li::before {
            content: "📄 ";
        }
        .footer {
            text-align: center;
            color: rgba(255,255,255,0.7);
            font-size: 0.875rem;
            margin-top: 1.5rem;
        }
        @media (max-width: 600px) {
            .charts-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Comparaison de Profils d'Examens</h1>
            <p class="subtitle">Examen analysé : <strong>${examFile}</strong></p>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${examTotal}</div>
                    <div class="stat-label">Questions dans l'examen</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.examProfile.length}</div>
                    <div class="stat-label">Types de questions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.referenceFileCount}</div>
                    <div class="stat-label">Fichiers de référence</div>
                </div>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-card">
                <div id="comparison-chart" class="chart-container"></div>
            </div>
            <div class="chart-card">
                <div id="gap-chart" class="chart-container"></div>
            </div>
        </div>

        <div class="table-card">
            <h2>Tableau détaillé des écarts</h2>
            <table>
                <thead>
                    <tr>
                        <th>Type de question</th>
                        <th>Examen</th>
                        <th>Moyenne nationale</th>
                        <th>Écart</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>

        <div class="ref-files">
            <h2>Fichiers de référence (banque nationale)</h2>
            <ul>
                ${refFilesList}
            </ul>
        </div>

        <div class="footer">
            Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
        </div>
    </div>

    <script>
        const comparisonSpec = ${JSON.stringify(comparisonSpec, null, 2)};
        const gapSpec = ${JSON.stringify(gapSpec, null, 2)};

        vegaEmbed('#comparison-chart', comparisonSpec, {
            actions: { export: true, source: false, compiled: false, editor: false }
        });

        vegaEmbed('#gap-chart', gapSpec, {
            actions: { export: true, source: false, compiled: false, editor: false }
        });
    </script>
</body>
</html>`;

        const outputPath = path.join(this.outputDir, `comparison_${path.basename(examFile).replace(/\.[^/.]+$/, '')}.html`);
        fs.writeFileSync(outputPath, htmlContent, 'utf-8');
        
        console.log(`Rapport de comparaison généré : ${outputPath}`);
        
        // Ouverture automatique dans le navigateur
        await open(outputPath);
        console.log("Ouverture dans le navigateur...");

        return outputPath;
    }
}

module.exports = ComparisonView;