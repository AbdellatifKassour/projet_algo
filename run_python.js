async function main() {
  const outputElement = document.getElementById("python-output");
  const codeElement = document.getElementById("python-code");
  const runBtn = document.getElementById("run-btn");

  outputElement.textContent = "⏳ Chargement de l’interpréteur Python (Pyodide)...";
  
  try {
    const pyodide = await loadPyodide();
    outputElement.textContent = "✅ Pyodide chargé ! Tu peux exécuter ton code.";

    // Rediriger stdout et stderr vers notre élément
    pyodide.setStdout({ 
      batched: (msg) => {
        outputElement.textContent += msg + "\n";
      }
    });
    pyodide.setStderr({ 
      batched: (msg) => {
        outputElement.textContent += "❌ ERREUR: " + msg + "\n";
      }
    });
    
    runBtn.addEventListener("click", async () => {
      const code = codeElement.value;
      outputElement.textContent = "▶️ Exécution en cours...\n";
      
      try {
        // Exécuter le code. Les 'print' seront gérés par setStdout.
        await pyodide.runPythonAsync(code);
      } catch (err) {
        // Gérer les erreurs de syntaxe ou d'exécution
        outputElement.textContent += "❌ Erreur d'exécution: " + err;
      }
    });
    runBtn.disabled = false; // Activer le bouton
    
  } catch (e) {
    outputElement.textContent = "❌ Échec du chargement de Pyodide. Vérifie ta connexion Internet ou la console du navigateur.";
  }
}

main();