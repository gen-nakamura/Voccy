// the function returns which flashcards_id to be the one you need to do.
// ordered by a schedule test time, then return first 5 elements.
// 変更されたレコードに対して、settingsが変わった時に全体に対して
const NULL_NULL     = 1;
const NULL_CROSS    = 1;
const NULL_CIRCLE   = 1.5;
const NULL_CHECK    = 7;

const CROSS_NULL    = null;
const CROSS_CROSS   = 1;
const CROSS_CIRCLE  = 2;
const CROSS_CHECK   = 3;

const CIRCLE_NULL   = null;
const CIRCLE_CROSS  = 1;
const CIRCLE_CIRCLE = 3;
const CIRCLE_CHECK  = 6;

const CHECK_NULL    = null;
const CHECK_CROSS   = 1;
const CHECK_CIRCLE  = 3;
const CHECK_CHECK   = 30;

function calcFromResult(previous_result, latest_result) {
    if (latest_result === 'done') return null;
    if (previous_result === null) {
      if (latest_result === null) {
        return NULL_NULL;
      } else if (latest_result === 'cross') {
        return NULL_CROSS;
      } else if (latest_result === 'circle') {
        return NULL_CIRCLE;
      } else if (latest_result === 'check') {
        return NULL_CHECK;
      }
    } else if (previous_result === 'cross') {
      if (latest_result === null) {
        return CROSS_NULL;
      } else if (latest_result === 'cross') {
        return CROSS_CROSS;
      } else if (latest_result === 'circle') {
        return CROSS_CIRCLE;
      } else if (latest_result === 'check') {
        return CROSS_CHECK;
      }
    } else if (previous_result === 'circle') {
      if (latest_result === null) {
        return CIRCLE_NULL;
      } else if (latest_result === 'cross') {
        return CIRCLE_CROSS;
      } else if (latest_result === 'circle') {
        return CIRCLE_CIRCLE;
      } else if (latest_result === 'check') {
        return CIRCLE_CHECK;
      }
    } else if (previous_result === 'check') {
      if (latest_result === null) {
        return CHECK_NULL;
      } else if (latest_result === 'cross') {
        return CHECK_CROSS;
      } else if (latest_result === 'circle') {
        return CHECK_CIRCLE;
      } else if (latest_result === 'check') {
        return CHECK_CHECK;
      }
    }
  
    // マッチする組み合わせがない場合は適切なデフォルト値を返す
    return null;
}

import moment from 'moment';

export function formatDateNow() {
    return moment().format('YYYY-MM-DD HH:mm').toString();
}

function addDate(date, days) {
    if (days === 0) return null;
    const min = days*24*60;
    const resultDate = moment(date, 'YYYY-MM-DD HH:mm').add(min, 'minutes').format('YYYY-MM-DD HH:mm');
    return resultDate;
}

function getRandomInterval(days) {
    const minValue = days * 0.8;
    const maxValue = days * 1.3;
    return Math.random() * (maxValue - minValue) + minValue;
}

export function calculateNextTestTimestamp(data) {
    const interval = calcFromResult(data.previous_result, data.latest_result);
    const randomInterval = getRandomInterval(interval);
    data.scheduled_test_timestamp = addDate(data.latest_test_timestamp, randomInterval);
    return data;
}

export function convertToBindParameters(obj) {
    const bindParameters = {};
    for (const key in obj) {
      bindParameters['$' + key] = obj[key];
    }
    return bindParameters;
  }

// getFlashcardっていう一つだけ取り出す関数が必要かもしれない
// タイムスタンプのupdateについて、全てやる場合と一つだけやる場合。引数はidだけになりそう？
// これができたらタイムスタンプに従ってquizsetを取り出す