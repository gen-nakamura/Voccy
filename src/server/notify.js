import { Notification } from "electron";

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
      }
    }
  
    return timeRemaining;
  }
  

function showNotification(title, options) {
    const notification = new Notification({ title, ...options });
    notification.show();
  }

//   const times = ['7:00', '11:00', '15:00', '19:00', '23:00'];
  
//   const remainingMilliseconds = calculateTimeRemaining(times);
  
//   console.log(remainingMilliseconds);

export function scheduleNextNotification() {
    if (process.env.remind_enabled !== 'true') {
        console.log('disabled');
      return; // 終了条件: 全ての通知が完了した場合
    }
  
    const ms = calculateTimeRemaining(process.env.remind_times);
  
    setTimeout(() => {
      showNotification('新しいメッセージ', {
        body: '新しいメッセージが届きました。'
      });
      // 次の通知をスケジュールする
      scheduleNextNotification();
    }, ms);
  }