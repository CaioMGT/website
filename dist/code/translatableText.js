// This is a comma separated list (with no spaces) of all supported languages.
// if you want to add another, make sure to add it to this list.
// Make sure that the language name matches the folder name you have in translations.
const languages = "en,pt";
// --------------------------------------Do not modify past this--------------------------------------
let languageCount = 0;
let loadedLanguages = 0;
let languagesLoaded = false;
const elements = [];
let lang = localStorage.getItem("lang") || "en";
const translations = {};
// Always call this function to fetch translations
// I was going to make it hard-coded but decided that
// It's best if you can decide what files to use
// per page, so you won't have to cram everything
// into the same json file.
function fetchTranslations(fileName) {
  for (currentLang of languages.split(",")) {
    console.log("iterating thru " + currentLang);
    languageCount += 2;
    const actualLang = currentLang;
    fetch("/translations/" + actualLang + "/" + fileName).then(function (val) {
      val.json().then(function (json) {
        translations[actualLang] = { ...translations[actualLang], ...json };
        loadedLanguages++;
        if (loadedLanguages == languageCount) {
          languagesLoaded = true;
          console.log("all languages loaded!");
        }
      });
    });
    fetch("/translations/" + actualLang + "/global.json").then(function (val) {
      val.json().then(function (json) {
        translations[actualLang] = { ...translations[actualLang], ...json };
        loadedLanguages++;
        if (loadedLanguages == languageCount) {
          languagesLoaded = true;
          console.log("all languages loaded!");
        }
      });
    });
  }
}
// Gotta do this since it takes time to fetch the json files.
// Can't just await everything since this isn't a module
// and that would just error
function waitFor(conditionFunction) {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout((_) => poll(resolve), 400);
  };

  return new Promise(poll);
}
async function update(transText) {
  let string;
  if (loadedLanguages != languageCount) {
    console.log(
      "Waiting for lang files to load \n This may cause text to not appear temporarily."
    );
    await waitFor(() => languagesLoaded == true);
    update(transText);
    return;
  }
  console.log("ee");
  string = translations[lang][transText.id];
  if (string == null) {
    console.log(
      "Could not find translation key " +
        transText.id +
        " in language " +
        lang +
        ", falling back to english."
    );
    string = translations["en"][transText.id];
  }
  transText.innerText = string;
}
// Call this function to change the current language.
function changeLang(Lang) {
  lang = Lang;
  localStorage.setItem("lang", lang);
  elements.forEach(function (element) {
    update(element);
  });
}
class transText extends HTMLElement {
  constructor() {
    super();
  }
  async connectedCallback() {
    elements.push(this);
    this.innerText = "Waiting for translations to load.";
    update(this);
  }
}
customElements.define("trans-text", transText);
