const challenges = [
  {
    title: "Ronda 1 · Detecta el problema",
    type: "reviews",
    prompt: "Analiza las reseñas de los últimos huéspedes. ¿Qué problema aparece de forma recurrente?",
    reviews: [
      ["★★★★★", "La habitación estuvo impecable y el personal fue muy amable."],
      ["★★★☆☆", "El hotel es bonito, pero tardaron demasiado en hacer mi check-in."],
      ["★★★★★", "Excelente experiencia, especialmente el servicio del restaurante."],
      ["★★☆☆☆", "La atención fue buena, pero tuve que esperar mucho para entrar."]
    ],
    options: ["Demoras en el check-in", "Problemas con el restaurante", "Limpieza deficiente", "Decoración del hotel"],
    answer: 0,
    success: "Correcto. Identificaste un patrón repetido: tiempos de espera durante el check-in.",
    error: "Revisa las reseñas: dos huéspedes mencionan específicamente tiempos de espera al llegar."
  },
  {
    title: "Ronda 2 · Toma una decisión",
    type: "decision",
    prompt: "El problema principal son las demoras en recepción. ¿Qué acción responde directamente al problema?",
    options: [
      "Reforzar el personal de recepción durante las horas de mayor llegada.",
      "Ignorar las reseñas porque también existen comentarios positivos.",
      "Reducir el horario de recepción.",
      "Eliminar el registro de llegada del hotel."
    ],
    answer: 0,
    success: "Correcto. La acción está relacionada directamente con el problema detectado.",
    error: "La opción elegida no ataca directamente la causa del problema identificado."
  },
  {
    title: "Ronda 3 · Elige el KPI",
    type: "kpi",
    prompt: "Después de aplicar la mejora, ¿qué indicador sería útil para comprobar si disminuyeron las demoras?",
    options: [["↓ 18%", "Tiempo promedio de check-in"], ["4.7 ⭐", "Rating promedio"], ["92%", "Ocupación"]],
    answer: 0,
    success: "Correcto. El tiempo promedio de check-in permite observar directamente si las demoras disminuyeron.",
    error: "Piensa en un indicador que mida directamente el problema que se quiere mejorar."
  }
];

let current = 0, score = 0, answered = false, reputation = 40, adTimer = null;

const $ = id => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo({top:0, behavior:"smooth"});
}

function startGame() {
  clearInterval(adTimer);
  current = 0; score = 0; reputation = 40;
  $("score").textContent = "0";
  showScreen("gameScreen");
  renderChallenge();
}

function renderChallenge() {
  answered = false;
  const c = challenges[current];
  $("roundTitle").textContent = c.title;
  $("stepText").textContent = `Ronda ${current + 1} de ${challenges.length}`;
  $("progressPercent").textContent = `${Math.round(((current + 1) / challenges.length) * 100)}%`;
  $("progressBar").style.width = `${((current + 1) / challenges.length) * 100}%`;
  $("feedback").className = "feedback hidden";
  $("nextBtn").classList.add("hidden");

  let html = `<div class="challenge-card"><span class="eyebrow">PREGUNTA</span><h3>${c.title}</h3><p class="sub">${c.prompt}</p>`;

  if (c.type === "reviews") {
    html += `<div class="review-grid">`;
    c.reviews.forEach(r => html += `<article class="review"><div class="stars">${r[0]}</div><p>“${r[1]}”</p></article>`);
    html += `</div><div class="options">`;
    c.options.forEach((o,i) => html += `<button class="option" type="button" data-index="${i}">${String.fromCharCode(65+i)}. ${o}</button>`);
    html += `</div>`;
  } else if (c.type === "decision") {
    html += `<div class="options">`;
    c.options.forEach((o,i) => html += `<button class="option" type="button" data-index="${i}">${String.fromCharCode(65+i)}. ${o}</button>`);
    html += `</div>`;
  } else {
    html += `<div class="kpi-options">`;
    c.options.forEach((o,i) => html += `<button class="kpi-option" type="button" data-index="${i}"><span>Indicador</span><strong>${o[0]}</strong><span>${o[1]}</span></button>`);
    html += `</div>`;
  }

  html += `</div>`;
  $("challengeContainer").innerHTML = html;
  document.querySelectorAll("[data-index]").forEach(btn => btn.addEventListener("click", () => selectAnswer(Number(btn.dataset.index))));
}

function selectAnswer(index) {
  if (answered) return;
  answered = true;
  const c = challenges[current];
  const buttons = [...document.querySelectorAll("[data-index]")];
  buttons.forEach(b => b.classList.add("disabled"));
  const selected = buttons.find(b => Number(b.dataset.index) === index);
  const correct = buttons.find(b => Number(b.dataset.index) === c.answer);

  if (index === c.answer) {
    score += current === 2 ? 40 : 30;
    reputation += current === 0 ? 20 : 15;
    selected.classList.add("correct");
    $("feedback").className = "feedback success";
    $("feedback").textContent = `✓ ${c.success}`;
  } else {
    score += 5;
    reputation += 3;
    selected.classList.add("wrong");
    correct.classList.add("correct");
    $("feedback").className = "feedback error";
    $("feedback").textContent = `✕ ${c.error}`;
  }

  $("score").textContent = score;
  $("feedback").classList.remove("hidden");
  $("nextBtn").classList.remove("hidden");
  $("nextBtn").textContent = current === challenges.length - 1 ? "Ver diagnóstico →" : "Continuar →";
}

function nextChallenge() {
  if (current < challenges.length - 1) {
    current++;
    showAdThenContinue();
  } else {
    showResults();
  }
}

function showAdThenContinue() {
  clearInterval(adTimer);
  let seconds = 5;
  $("countdown").textContent = seconds;
  $("skipBtn").classList.add("hidden");
  showScreen("adScreen");

  adTimer = setInterval(() => {
    seconds--;
    $("countdown").textContent = seconds;
    if (seconds <= 0) {
      clearInterval(adTimer);
      $("countdown").textContent = "✓";
      $("skipBtn").classList.remove("hidden");
      $("skipBtn").textContent = "Continuar a la siguiente ronda →";
    }
  }, 1000);
}

$("skipBtn").addEventListener("click", () => {
  clearInterval(adTimer);
  renderChallenge();
  showScreen("gameScreen");
});

$("adCta").addEventListener("click", () => {
  alert("Demo promocional: aquí podrías dirigir al visitante a la página de tu servicio o formulario de contacto.");
});

function showResults() {
  const rating = Math.min(4.9, 4.1 + (score / 100) * 0.6).toFixed(1);
  $("finalRating").textContent = `${rating} ⭐`;
  $("reputation").textContent = `${Math.min(reputation,100)}%`;
  $("finalScore").textContent = `${score}/100`;

  if (score >= 90) {
    $("resultTitle").textContent = "¡Excelente diagnóstico!";
    $("resultMessage").textContent = "Analizaste las reseñas, propusiste una acción y seleccionaste un indicador para medir la mejora.";
  } else if (score >= 60) {
    $("resultTitle").textContent = "¡Buen trabajo!";
    $("resultMessage").textContent = "Completaste la trivia y encontraste elementos importantes para mejorar la experiencia del huésped.";
  } else {
    $("resultTitle").textContent = "Trivia completada";
    $("resultMessage").textContent = "Ya tienes una primera lectura del problema. Puedes repetir la trivia para mejorar tu puntuación.";
  }
  showScreen("resultScreen");
}

function copyResult() {
  const text = `Hotel Boutique Challenge | Puntuación: ${score}/100 | Rating simulado: ${$("finalRating").textContent} | Reputación: ${$("reputation").textContent}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => $("copyMessage").textContent = "Resultado copiado al portapapeles.")
      .catch(() => $("copyMessage").textContent = "No se pudo copiar automáticamente.");
  } else {
    $("copyMessage").textContent = text;
  }
}

$("startBtn").addEventListener("click", startGame);
$("nextBtn").addEventListener("click", nextChallenge);
$("restartBtn").addEventListener("click", startGame);
$("resetTop").addEventListener("click", startGame);
$("shareBtn").addEventListener("click", copyResult);
