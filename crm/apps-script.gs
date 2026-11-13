/**
 * BIART — CRM заявок в Google Таблице.
 * Веб-приложение Apps Script: сайт отправляет POST, скрипт дописывает строку в лист «Заявки».
 *
 * Развёртывание (один раз, ~3 минуты) — см. crm/README.md.
 * Токена в браузере нет: адрес веб-приложения длинный и неугадываемый, дополнительно стоят проверки ниже.
 */
var SHEET = 'Заявки';
var HEADERS = ['Дата', 'Источник', 'Имя', 'Телефон', 'Событие', 'Желаемая дата', 'Гостей', 'Возраст', 'Направление',
               'Комментарий', 'Язык', 'Статус', 'Ответственный', 'Дата звонка', 'Заметки'];
var STATUSES = ['Новая', 'Перезвонить', 'В работе', 'Договорились', 'Отказ'];
var SOURCE = {ask: 'Вопрос (главная)', lead: 'Запись на пробный', rent: 'Аренда'};
var MAX = {name: 60, phone: 22, event: 60, date: 12, guests: 6, age: 40, direction: 60, message: 500};

function clean_(v, n) {
  return String(v || '').replace(/[\u0000-\u001f\u007f<>=+@]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
}

function setup_(ss) {
  var sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#000000').setFontColor('#ffffff');
    sh.getRange(2, 12, 1000, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());
    var rules = [['Новая', '#fde7e3'], ['Перезвонить', '#fff3cd'], ['В работе', '#dbeafe'], ['Договорились', '#dcfce7'], ['Отказ', '#e5e7eb']].map(function (r) {
      return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(r[0]).setBackground(r[1]).setRanges([sh.getRange(2, 1, 1000, HEADERS.length)]).build();
    });
    sh.setConditionalFormatRules(rules);
    sh.getRange(2, 1, 1000, 1).setNumberFormat('dd.mm.yyyy hh:mm');
    sh.getRange(1, 1, 1000, HEADERS.length).createFilter();
    sh.setColumnWidths(1, HEADERS.length, 130); sh.setColumnWidth(10, 320);
  }
  return sh;
}

/**
 * Лимиты: скрипт доступен всем (адрес публичный), поэтому заявки ограничены — не больше 40 за 10 минут
 * со всех посетителей и не больше одной с одного телефона за 10 минут. Токен (свойство скрипта TOKEN,
 * тот же в BIART_CRM_TOKEN сайта) отсекает ботов, бьющих по случайным адресам; при пустом TOKEN не проверяется.
 */
function allowed_(p) {
  var token = PropertiesService.getScriptProperties().getProperty('TOKEN') || '';
  if (token && String(p.token || '') !== token) return false;
  var cache = CacheService.getScriptCache();
  var total = Number(cache.get('rl:total') || 0);
  if (total >= 40) return false;
  var phoneKey = 'rl:' + String(p.phone || '').replace(/\D/g, '');
  if (cache.get(phoneKey)) return false;
  cache.put('rl:total', String(total + 1), 600);
  cache.put(phoneKey, '1', 600);
  return true;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var p = (e && e.parameter) || {};
    // honeypot и пустые заявки
    if (p.website) return ContentService.createTextOutput('ok');
    if (!allowed_(p)) return ContentService.createTextOutput('limit');
    var name = clean_(p.name, MAX.name), phone = clean_(p.phone, MAX.phone);
    if (name.length < 2 || phone.replace(/\D/g, '').length < 10) return ContentService.createTextOutput('bad');
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = setup_(ss);
    sh.appendRow([new Date(), SOURCE[p.source] || 'Сайт', name, "'" + phone, clean_(p.event, MAX.event), clean_(p.date, MAX.date), clean_(p.guests, MAX.guests),
                  clean_(p.age, MAX.age), clean_(p.direction, MAX.direction), clean_(p.message, MAX.message), clean_(p.lang, 3), 'Новая', '', '', '']);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

/** Меню «BIART CRM» в таблице: подготовить лист и отметить «позвонили». */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('BIART CRM').addItem('Подготовить лист «Заявки»', 'prepare').addToUi();
}
function prepare() { setup_(SpreadsheetApp.getActiveSpreadsheet()); }
