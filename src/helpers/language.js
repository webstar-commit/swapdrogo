const availableLanguages = [
  {
    display_name: 'EN',
    name: 'English',
    code: 'en',
    icon_url: 'https://lipis.github.io/flag-icon-css/flags/4x3/gb.svg',
  },
  // {
  //   display_name: 'RU',
  //   name: 'Russian',
  //   code: 'ru',
  //   icon_url: 'https://lipis.github.io/flag-icon-css/flags/4x3/ru.svg',
  // },
  // {
  //   display_name: 'ES',
  //   name: 'Spanish',
  //   code: 'es',
  //   icon_url: 'https://lipis.github.io/flag-icon-css/flags/4x3/es.svg',
  // }
];

/**
 * Returns the default language.
 * 
 * @return {Object}
 */
export const getDefaultLanguage = () => availableLanguages[0];

/**
 * Finds language by given code.
 * @param {String} code 
 * 
 * @return {Object}
 */
export const findLanguageByCode = code => {
  return availableLanguages.find(lang => lang.code === code);
}

/**
 * Returns current language.
 * 
 * @return {Object}
 */
export const getLanguage = () => {
  let langInStorage = window.localStorage.getItem('lang');

  return findLanguageByCode(langInStorage) || getDefaultLanguage();
}

/**
 * Sets language.
 * @param {String} code 
 */
export const setLanguage = code => {
  window.localStorage.setItem('lang', code);
}

/**
 * Returns all languages.
 * 
 * @return {Array}
 */
export const getAllLanguages = () => availableLanguages;