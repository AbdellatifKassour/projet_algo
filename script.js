// --- Gestion de la Progression ---
// Récupère la progression depuis localStorage, ou 0 si elle n'existe pas
let progress = parseInt(localStorage.getItem('algoProgress') || '0');

/**
 * Met à jour la progression de X points (sans dépasser 100)
 * et la sauvegarde dans localStorage.
 */
function updateProgress(added) {
  progress = Math.min(progress + added, 100);
  localStorage.setItem('algoProgress', progress.toString());
  updateProgressUI();
}

/**
 * Met à jour l'interface utilisateur (barre et texte)
 * avec la valeur 'progress' actuelle.
 */
function updateProgressUI() {
  const progressText = document.getElementById('progress-text');
  const progressFill = document.getElementById('progress-fill');
  
  if (progressText) progressText.textContent = `Progression : ${progress}%`;
  if (progressFill) progressFill.style.width = `${progress}%`;
}

// Assure-toi que la barre de progression se met à jour au chargement de la page
document.addEventListener('DOMContentLoaded', updateProgressUI);


/**
 * Exécute le pseudo-code de l'éditeur.
 * C'est un interpréteur simple et basique.
 */
async function runAlgorithm(inputId, outputId) {
  const code = document.getElementById(inputId).value;
  const output = document.getElementById(outputId);
  output.textContent = "▶️ Exécution du pseudo-code...\n";

  const variables = {}; // Mémoire de notre algorithme
  const lines = code.split('\n').map(l => l.trim().replace(/ +/g, ' ')); // Nettoyer les lignes

  const getVar = (name) => {
    if (variables[name] === undefined) {
      output.textContent += `❌ Erreur: Variable '${name}' non définie.\n`;
      throw new Error("Variable non définie");
    }
    return variables[name];
  };

  // Helper pour évaluer une expression simple (ex: "x * y", "somme + i", "n > 0")
  const evalExpression = (expr) => {
    try {
      // Remplace les noms de variables par leurs valeurs
      let safeExpr = expr.replace(/[a-zA-Z_]\w*/g, (match) => {
        if (variables.hasOwnProperty(match)) {
          return variables[match];
        }
        // Gère les chaînes de caractères (ex: "Positif")
        if (match.startsWith('"') && match.endsWith('"')) {
          return match;
        }
        // Gère les nombres
        if (!isNaN(parseFloat(match))) {
          return match;
        }
        output.textContent += `❌ Erreur: Variable '${match}' inconnue dans l'expression '${expr}'.\n`;
        throw new Error(`Variable inconnue: ${match}`);
      });
      // Utilise le moteur JS pour évaluer l'expression
      return new Function(`return ${safeExpr}`)();
    } catch (e) {
      output.textContent += `❌ Erreur d'évaluation: ${e.message} dans l'expression '${expr}'\n`;
      throw e;
    }
  };

  try {
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Ignorer les lignes vides ou de début/fin
      if (!line || line === 'Début' || line === 'Fin') continue;

      // 1. Lire
      if (line.startsWith('Lire ')) {
        const varName = line.split(' ')[1];
        const val = prompt(`Entrez la valeur pour ${varName}:`);
        variables[varName] = parseFloat(val) || 0; // On simplifie, on ne gère que les nombres
      }
      // 2. Afficher
      else if (line.startsWith('Afficher ')) {
        const toDisplay = line.substring(9).trim();
        if (toDisplay.startsWith('"') && toDisplay.endsWith('"')) {
          // Afficher une chaîne de caractères
          output.textContent += `${toDisplay.slice(1, -1)}\n`;
        } else {
          // Afficher une variable
          output.textContent += `${getVar(toDisplay)}\n`;
        }
      }
      // 3. Assignation
      else if (line.includes('←')) {
        const [varName, expr] = line.split('←').map(s => s.trim());
        variables[varName] = evalExpression(expr);
      }
      // 4. Condition SI (gère Si, SinonSi, Sinon, FinSi)
      else if (line.startsWith('Si ')) {
        let condition = line.substring(3, line.lastIndexOf(' Alors')).trim();
        let conditionMet = evalExpression(condition);
        let blockToExecute = conditionMet ? 'if' : 'else';
        let currentBlock = 'if';
        
        for (let j = i + 1; j < lines.length; j++) {
          const innerLine = lines[j];
          
          if (innerLine === 'FinSi') {
            i = j; // Sauter à la fin du bloc Si
            break;
          }
          if (innerLine === 'Sinon') {
            currentBlock = 'else';
            continue;
          }
          if (innerLine.startsWith('SinonSi ')) {
            currentBlock = 'elseif';
            if (!conditionMet) { // Si la condition précédente n'a pas été remplie
              condition = innerLine.substring(8, innerLine.lastIndexOf(' Alors')).trim();
              conditionMet = evalExpression(condition);
              blockToExecute = conditionMet ? 'elseif' : 'else';
            }
            continue;
          }
          
          // Exécute la ligne si elle est dans le bon bloc
          if (currentBlock === blockToExecute) {
            // "Exécuter" la ligne intérieure
            if (innerLine.startsWith('Afficher ')) {
                const toDisplay = innerLine.substring(9).trim();
                if (toDisplay.startsWith('"') && toDisplay.endsWith('"')) {
                  output.textContent += `${toDisplay.slice(1, -1)}\n`;
                } else {
                  output.textContent += `${getVar(toDisplay)}\n`;
                }
            } else if (innerLine.includes('←')) {
               const [varName, expr] = innerLine.split('←').map(s => s.trim());
               variables[varName] = evalExpression(expr);
            }
          }
        }
      }
      // 5. Boucle POUR
      else if (line.startsWith('Pour ')) {
        const parts = line.split(' '); // Pour i ← 1 à N faire
        const varName = parts[1];
        const start = evalExpression(parts[3]);
        const end = evalExpression(parts[5]);
        
        const loopBody = [];
        let j = i + 1;
        for (; j < lines.length; j++) {
          if (lines[j] === 'FinPour') break;
          loopBody.push(lines[j]);
        }
        
        for (let k = start; k <= end; k++) {
          variables[varName] = k; // Définit la variable de boucle (ex: i)
          // Exécute le corps de la boucle
          for (const bodyLine of loopBody) {
             if (bodyLine.includes('←')) {
                const [vName, expr] = bodyLine.split('←').map(s => s.trim());
                variables[vName] = evalExpression(expr);
             }
             // ... (Ajouter Afficher si nécessaire)
          }
        }
        i = j; // Sauter à la fin de la boucle
      }
    }
  } catch (e) {
    output.textContent += `\n❌ L'exécution s'est arrêtée en raison d'une erreur.`;
  }
  
  output.textContent += "✅ Exécution terminée.\n";
  updateProgress(15); // Donner des points pour l'exécution
}

// Quiz interactif
function checkAnswer(btn, correct) {
  const parent = btn.parentElement;
  const buttons = parent.querySelectorAll('button');

  // Désactiver les boutons pour cette question
  buttons.forEach(b => b.disabled = true);

  if (correct) {
    btn.style.background = "#00cc66"; // Vert
    btn.style.color = "white";
    updateProgress(10); // Gagner 10% par bonne réponse
  } else {
    btn.style.background = "#ff4444"; // Rouge
    btn.style.color = "white";
  }
}