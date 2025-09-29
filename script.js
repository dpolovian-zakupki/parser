// ------------------- Крок 1: Очищення вхідного тексту -------------------
function cleanInput() { 
  let text = document.getElementById("inputText").value;

  // Збереження email-ів
  let emails = text.match(/[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || [];

  // Видаляємо номери телефонів
  text = text.replace(/\+?\d{1,3}[\s\-]?\(?\d{2,3}\)?[\s\-]?\d{2,3}[\s\-]?\d{2}[\s\-]?\d{2}/g, "");
  text = text.replace(/(ЄДРПОУ\s*:?\s*)\d+/gi, "$1");   
  text = text.replace(/(^|\s)(доброго ранку|добрий ранок)([)!]?)(\s|$)/gi, " ");



  // ------------------- Крок 1a: Видалення заборонених слів -------------------
  const forbiddenWords = [
  "привіт", "привіт)", "привіт!", "привіт,", "а", "аа",
  "марина", "маріна", "ден", "денчик", "денис",

  // Жіночі імена
  "анна", "інна", "іріна", "ірина", "марія", "марійка", "оксана", "наталя", "наталія",
  "світлана", "катерина", "катя", "ольга", "оля", "людмила", "люба", "любава", 
  "юлія", "юля", "юліана", "вiktорія", "віка", "вікторія", "аліна", "аліса",
  "дарина", "даша", "дарія", "лілія", "ліля", "крістіна", "кристина", "карина",
  "марта", "елла", "єлизавета", "ліза", "софія", "соня", "дарья", "поліна", 
  "богдана", "галина", "галя", "жанна", "злата", "мила", "міла", "таїсія", "тася",
  "валентина", "валя", "віталіна", "аріна", "алла", "алія", "юстина",

  // Чоловічі імена
  "андрій", "андрей", "сергій", "олександр", "саня", "саша", "олег", "микола",
  "коля", "василь", "петро", "володимир", "вова", "владислав", "влад", "віталій", 
  "юрій", "юра", "богдан", "максим", "макс", "артем", "тема", "роман", "рома", 
  "євген", "євгеній", "женя", "віктор", "степан", "степан", "ігнат", "ігнатій",
  "тарс", "трохим", "павло", "паша", "тимур", "давид", "дмитро", "діма", "димон",
  "михайло", "миша", "мишка", "василь", "вася", "борис", "костянтин", "костя",
  "єгор", "лев", "марко", "федір", "федя", "азар", "арсен", "ярослав", "славік",
  "ростислав", "станіслав", "толя", "анатолій", "антон", "дьомін", "григорій",
  "гриша", "валерій", "василько", "єлисей", "захар", "клим", "мирон"
];

  text = text
    .split(/\s+/)
    .filter(word => {
      let cleanWord = word.toLowerCase().replace(/!+$/, "");
      return !forbiddenWords.includes(cleanWord);
    })
    .join(" ");

  // ------------------- Крок 1b: Видалення слів у капсі (≥ 3 літери) -------------------
  text = text
    .split(/\s+/)
    .filter(word => {
      let letters = word.replace(/[^A-Za-zА-ЯІЇЄҐ]/g, "");
      let upperLetters = letters.split("").filter(c => c === c.toUpperCase() && c !== c.toLowerCase());
      return !(letters.length >= 3 && upperLetters.length === letters.length);
    })
    .join(" ");


  // Повертаємо email-и назад
  emails.forEach(email => {
    if (!text.includes(email)) text += " " + email;
  });

  document.getElementById("cleanedText").value = text.trim();
}

// ------------------- Витягування ID -------------------
function extractTenderId(text) {
  // Шукай ID після слова ID або варіантів, число закінчується пробілом, кінцем рядка або розділовим знаком
  let idMatch = text.match(/(?:ID|Id|iD|id|ІД|Ід|іД|ід)\s*[:\s]*([\d]+)(?=\s|$|\r?\n|,|\.)/i);
  return idMatch ? idMatch[1] : "";
}

// ------------------- Копіювання очищеного тексту -------------------
function copyCleanedText() {
  let text = document.getElementById("cleanedText").value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    alert("Очищений текст скопійовано!");
  });
}

// ------------------- Крок 2: Формування фінального результату -------------------
function processCleaned() {
  let text = document.getElementById("cleanedText").value;

  // Витягуємо ID
  let tenderId = extractTenderId(text);

  let customerLink = tenderId
    ? `https://my.zakupivli.pro/admin/new_merchants/list?query_string=${tenderId}&entity_type=0&tab=0&company_type=all&marker_filter=&order_by=0`
    : "";

  // Знаходимо всі посилання
  let allLinks = text.match(/https:\/\/my\.zakupivli\.pro\S+/gi) || [];

  // Групуємо по типу
  let linkSections = allLinks.map(link => {
    let sectionName = "Закупівля"; // дефолтна назва
    if (link.includes("state_plan")) sectionName = "План";
    else if (link.includes("monitorings")) sectionName = "Моніторинг";
    else if (link.includes("prozorro_reports")) sectionName = "Звіт";
    else if (link.includes("state_purchase_complaint")) sectionName = "Скарга";
    else if (link.includes("state_purchase_question")) sectionName = "Звернення";
    return { name: sectionName, url: link };
  });

  // Формуємо текст для розділу посилань
  let sectionsText = "";
  let usedSections = new Set();
  linkSections.forEach(link => {
    if (!usedSections.has(link.name)) {
      sectionsText += `${link.name}\n`;
      usedSections.add(link.name);
    }
    sectionsText += `${link.url}\n`;
  });
  sectionsText = sectionsText.trim();

  // Видаляємо ID та посилання з тексту для формування проблеми
  text = text.replace(/(?:ID|Id|iD|id|ІД|Ід|іД|ід)\s*[:\s]*[0-9]+/g, "");
  text = text.replace(/https:\/\/my\.zakupivli\.pro\S+/gi, "");

  // Форматування тексту
  let sentences = text.replace(/\s{2,}/g, ' ').trim();

  // Видаляємо двокрапки і дефіси
  sentences = sentences.replace(/[:\-]/g, '');

  // Формуємо фінальний результат
  let result = `Замовник\n${customerLink}${sectionsText ? "\n\n" + sectionsText : ""}\n\nПроблема\n${sentences}`;
  
  let output = document.getElementById("finalOutput");
  output.textContent = result;
  output.style.display = "block";
}


// ------------------- Копіювання фінального тексту -------------------
function copyFinalText() {
  let output = document.getElementById("finalOutput").textContent;
  if (!output) return;
  
  navigator.clipboard.writeText(output).then(() => {
    alert("Фінальний результат скопійовано!");
  });
}
