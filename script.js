
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

// Gère la sauvegarde, la reprise et le meilleur score du quiz pour rassembler les cles.
const LS = {
    state: "quiz-state", // garde la partie en cours
    best: "quiz-state", // garde le meilleur score
};

// reprend la sauvegarde et reprendre à l'endroit où on était 
function loadState() {
    try {
        const raw = localStorage.getItem(LS.state); // localStorage = état brut getItem pour aller récupérer et LS state pour retrouver la bonne valeur
        if (!raw) return false; // si rien n'a été sauvegardé, il n'y a rien à charger, donc on retourne simplement false
        const s =JSON.parse(raw); // JSON.parce() va transformer ce qu'on a récupéré en un objet utilisable en JavaScript
        // Récupère les valeurs sauvegardées
        current = s.current; // numéros de la question actuelle 
        score = s.score; // score du joueur
        secondes = s.secondes; // chrono
    
        return true; // tout s'est bien passé 
        } catch {
        return false;
    }
}    

// Pour enregistrer la progression actuelle
function saveState() {
    try {
        localStorage.setItem(
            LS.state,
            JSON.stringify({
                // c'est l'inverse de json.parce ça prend le js et le transforme en chaine de caractère "texte pour le stocker"
                current, // 1..N (0 = accueil)
                score, // nb de bonnes réponses
                secondes, // temps écoulé sur la question courante 
                total: quizData.length, // dire à quelle question je suis 
                updatedAt: Date.now(), // pour savoir à quel heure et date ça a enregistrer la progression
            })
        );
    } catch {} 
}

// Meilleur score - enregistre si on fait mieux
function saveBest(finalScore) {
    try {
        const prev = Number(localStorage.getItem(LS.best) || 0); // on va chercher dans le localStorage la valeur de LS.best, qui est notre meilleur score, si on le trouve, on le convertit en nombre avec Number()
        if (finalScore > prev) {
            // on ne garde le nouveau score que s'il est plus grand que l'ancien, pour toujours enregistrer le meilleur score.
            localStorage.setItem(LS.best, String(finalScore)); // on enregistre le nouveaux meilleurs score et on le convertit en texte pour bien le stocker sous forme de chaine de caractère.
        }
    } catch  {}
}

// Récupérer le meilleurs score
function getBest() {
    try {
        return Number(localStorage.getItem(LS.best || 0)); // aller chercher dans le localStorage la valeur du meilleur score (LS.best), si elle existe, on la convertit en nombre et on la retourne 
    } catch {
        return 0; // si elle n'existe pas, ou s'il y a une erreur, on retourne simplement 0 par défaut.
    }
    
}

// Démarre un nouveau chrono
function startChrono() {
    secondes = 0;
    if (chronoDisplay) chronoDisplay.textContent = secondes;

    // Nettoie l'ancien intervalle s'il existe
    if (chrono) clearInterval(chrono);

    chrono = setInterval(tictictic, 1000); // chaque seconde
}

// Fonction appelée chaque seconde 
function tictictic() {
    secondes++;
    if (chronoDisplay) chronoDisplay.textContent = secondes;

    // Sauvegarde de la progression à chaque tic
    saveState();

    const activeQuestion= document.querySelector(".question.active");
    if(!activeQuestion) return;
}

// Si le temps est écoulé (10 secondes)
if (secondes >= 10) {
    clearInterval(chrono);
}

// Bloque tous les boutons de réponses
const boutons = activeQuestion.querySelectorAll("button:not(.suivant)");
boutons.forEach((btn) => {
    btn.disabled = true;
    if (btn.value === "1") {
        btn.style.backgroundColor = "#16a34a"; //vert 
        if(!btn.textContent.includes("✅")) btn.textContent += "✅";
    }else{
        btn.style.backgroundColor = "#dc2626"; //rouge
        if (!btn.textContent.includes("❌")) btn.textContent += "❌";
    }
});

// Active le bouton "suivant" après timeout
const btnSuivant = activeQuestion.querySelector(".suivant");
if (btnSuivant) btnSuivant.disabled = false;

// Prépare les boutons de réponse: on mémorise le texte d'origine une seul fois
function primeAnswerButtons() {
    const answerButtons = document.querySelectorAll(".question button:not(.suivant)");

    answerButtons.forEach((b) => {
        if (!b.dataset.originText) {
            b.dataset.originText = b.textContent.trim();
        }
    });
}

// Gère le clic sur un bouton de réponse
function handleAnswerClick(btn) {
    // Si temps écoulé, on fait rien
    if (secondes >= 10) return;

    const parent = btn.closest(".question");
    if (!parent) return;

    // Bloque toutes les réponses de cette question
    const allBtns = parent.querySelectorAll("button:not(.suivant)");
    allBtns.forEach((b) => (b.disabled = true));

    // Mise à jour score + feedback
    if (btn.value === "1") {
        score++;
        if(!btn.textContent.includes("✅")) btn.textContent += "✅";
        btn.style.backgroundColor = "#16a34a";
    } else {
        if (!btn.textContent.includes("❌")) btn.textContent += "❌";
        btn.style.backgroundColor = "#dc2626";
        const correct = parent.querySelector('.button[value="1"]');
        if (correct) {
            correct.style.backgroundColor = "#16a34a";
            if (!correct.textContent.includes("✅")) correct.textContent += "✅";
        }
    }

    // Active le bouton "suivant"
    const suivant = parent.querySelector(".suivant");
    if (suivant) suivant.disabled = false;

    // Stoppe le chrono et sauvegarde la progression
    if (chrono) clearInterval(chrono);
    saveState();
}

// Attache un listener (écouteur de clic) à tous les boutons de réponse (de toutes les questions du DOM)
function attachAnswerHandlers() {
    primeAnswerButtons();
    const answerButtons = document.querySelectorAll(".question button:not(.suivant)");

    answerButtons.forEach((btn) => {
        // Évite d'ajouter plusieurs fois le même listener si on relance init()
        if (!btn.dataset.bound) {
            btn.addEventListener("click", () => handleAnswerClick(btn));
            btn.dataset.bound = "1";
        }
    });
}

// Remet une question à l'état "propre" (appelé quand on affiche une nouvelle question)
function resetQuestionButtons(qE1) {
    const boutons = qE1.querySelectorAll(".button:not(.suivant)");
    boutons.forEach((b) => {
        b.disabled = false;
        b.style.backgroundColor = "";
        // remet le texte d'origine si présent (supprime ✅/❌)
        b.textContent = b.dataset.originText || b.textContent.replace(/[✅❌]/g, "");
    });

    const suivant = qE1.querySelector(".suivant");
    if (suivant) suivant.disabled = true;
}

function startQuiz() {
    //Reprendre l'état si dispo (current, score, secondes)
    const hasState = loadState(); //true si on a trouvé quelque chose, sinon false.

    //Afficher barre et chrono
    if (progressContainer) progressContainer.style.display = "block";
    if (chronoDisplay) {
        chronoDisplay.style.display = "block";
        chronoDisplay.textContent = String(secondes || 0);
    }

    //Masquer l'écran d'accueil
    if (question[0]) question[0].classList.remove("active");

    // Si pas d'état, on démarre à la question 1 
    if (!hasState || current === 0) current = 1;

    // Afficher la question courante
    const qE1 = question[current];
    if(qE1) {
        qE1.classList.add(".active");
        resetQuestionButtons(qE1); // remet les boutons propres
    }

    // Prépare les handlers (si pas déjà fait)
    attachAnswerHandlers();

    // Progression + Chrono + Sauvegarde
    setTimeout(startChrono, 0);
    updateProgress(current, quizData.length);

    saveState();
}

function nextQuestion() {
    // Indice de la dernière "vraie" question (pas accueil/réelles)
    const lastQuestionIndex = quizData.length; 

    // Cacher la question actuellement visible
    const active = question[current];
    if (active) active.classList.remove("active");

    // Avancer si on n'est pas à la dernière question
    if (current < lastQuestionIndex) {
        current++;

        // Affiche la nouvelle question
        const nextQ = question[current];
        if (nextQ) {
            nextQ.classList.add("active");
            resetQuestionButtons(nextQ);
        }
        // Relance chrono + progression + sauvegarde
        startChrono();
        updateProgress(current, quizData.length);
        saveState();
        return;
    }

    // Sinon fin du quiz écran résultat
    if (chrono) clearInterval(chrono);

    // Cacher barre & chrono
    if (progressContainer) progressContainer.style.display = "none";
    if (chronoDisplay) chronoDisplay.style.display = "none";

    // Texte résultat + meilleur score
    const resulDiv = document.querySelector(".result");
    const resultText = document.getElementById("resultText");
    if (resultText) {
        saveBest(score);
        const best = getBest();
        resultText.textContent = `🎯 Tu as obtenu ${score}/${quizData.length} — 🏆 Meilleur: ${best}`;
    }
    if (resultDiv) resultDiv.classList.add("active");

    // On efface la progression (partie terminée)
    clearState();
}

function recommencerQuiz() {
    // Reset variables & chrono
    score = 0;
    current = 0; // on revient à l'accueil
    secondes = 0;
    if (chrono) clearInterval(chrono);
    clearState();

    // Chrono
    if (chronoDisplay) {
        chronoDisplay.textContent = "0";
        chronoDisplay.style.display = "none";
    }

    // Barre de progression
    if (progressContainer) progressContainer.style.display = "none";
    if (progressBar) progressBar.style.width = "0%";
    if (progressText) progressText.textContent = "0%";

    // Remettre toutes les questions "propres"
    Array.from(question).forEach((q) => resetQuestionButtons(q));

    // Affichages : cacher résultat, montrer accueil
    const resultDiv = document.querySelector(".result");
    if (resultDiv) resultDiv.classList.remove("active");
    if (questions[0]) question[0].classList.add("active");

    // Progression affichée à 0
    updateProgress(0, quizData.length);
}



