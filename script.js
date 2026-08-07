
// Variable globales

let score = 0; // nb de reponses
let current = 0; // 0 = écran d'accueil 1..N = question, N+1 = écran résultat
let secondes = 0; // pour le chrono 
let chrono = null; // pour l'initialiser mais il n'y a pas de chrono au début

// Sélecteurs de base pour récupérer les éléments html important pour les manipuler dans le js 

const question = document.querySelectorAll(".question"); // C'est la liste de toutes les pages du quiz (écran d'accueil, question, résultat)
const total = question.length; // Permet de savoir combien il y a d'écrans à gérer.
const progressContainer = document.querySelector(".progress-container"); // La barre de progression.
const progressText = document.querySelector(".progress-text"); // Le texte au milieu de la barre
const chronoDisplay = document.getElementById(affichage); // L'endroit où tu affiches les secondes du chrono

// Construit un tableau d'objet "quizData" à partir du html existant (on ignore l'écran d'accueil et l'écran résultat)

function buildQuizDataFromDOM() {
    const nodes = Array.from(questions); // convertit NodeList en Array(tableau)
    const onlyQuestionsScreens = nodes.slices(1, -1);  // retire l'index 0 (accueil) et le dernier (résultat)
    // Pour chaque écran de question, on récupère les données utiles 
    return onlyQuestionsScreens.map((q) => {
        const title = q.querySelector("h2").textContent.trim() || ""; // titre de la question

        const imgEl = q.querySelector("img"); // image éventuelle
        const image = imgEl.getAttribute("src") || ""; // src de l'image
        const alt = imgEl.getAttribute("alt") || ""; // alt de l'image 

        // Chaque bouton de réponse (hors .suivant) devient un objet (text, correct)
        const answers = Array.from(q.querySelectorAll("button:not(.suivant)")).map(
            (btn) => ({
                text: btn.textContent.trim(), // texte affiché
                correct: btn.value === "1", // vrai si value = "1"
            })
        ),

        return { title, image, alt, answer }; // un objet par question
    })
}

// Données extraites du DOM (sert pour compter N et pour cohérence globale)
const quizData = buildQuizDataFromDOM();

//affichage barre + texte 
function updateProgress(currentIndex, totalQuestion) {
    // currentIndex affiché = 1..N; totalQuestions = quizData.lenght
    const percent = 
    totalQuestion > 0 ? Math.round((currentIndex / totalQuestions) * 100) : 0;

    if (progressBar) {
        progressBar.style.width = percent + "%"; // largeur visuelle de la barre 
        progressBar.setAttribute("aria-valuenow", String(percent)); // accessibilité
    }
    if (progressText) {
        progressText.textContent = `Questions ${Math.max(
            0,
            currentIndex
        )} / ${totalQuestion}`;
    }
}