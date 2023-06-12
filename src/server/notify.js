import { Notification } from "electron";
import { getQuizSets, getSettings } from "./db";

function calculateTimeRemaining(timesString) {
    console.log(timesString);
    const times = JSON.parse(timesString);
    const now = new Date();
    const currentTime = now.getTime();
    let timeRemaining = Infinity;
  
    for (const time of times) {
      const [hour, minute] = time.split(':');
      const timeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
  
      // 比較する時刻が過去の場合は翌日の時刻として計算
      if (timeDate < now) {
        timeDate.setDate(now.getDate() + 1);
      }
  
      const timeValue = timeDate.getTime();
      const remaining = timeValue - currentTime;
  
      if (remaining >= 0 && remaining < timeRemaining) {
        timeRemaining = remaining;
        console.log(time);
      }
    }
    console.log('↑this is the set time');
  
    return timeRemaining;
  }
  

function showNotification(title, options) {
    const notification = new Notification({ title, ...options });
    notification.show();
  }

//   const times = ['7:00', '11:00', '15:00', '19:00', '23:00'];
  
//   const remainingMilliseconds = calculateTimeRemaining(times);
  
//   console.log(remainingMilliseconds);

export async function scheduleNextNotification() {
    let { remind_enabled, remind_times } = await getSettings();
    const ms = calculateTimeRemaining(remind_times);
    
    process.env.notificationId = setTimeout(async () => {
        const taskExists = await getQuizSets().then(quizSets => quizSets.length);
        if (taskExists && remind_enabled) {
            showNotification('新しいメッセージ', {
                body: '新しいメッセージが届きました。'
            });
        }
      // 次の通知をスケジュールする
      scheduleNextNotification();
    }, ms);
  }