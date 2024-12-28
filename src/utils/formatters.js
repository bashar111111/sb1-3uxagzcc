const moment = require('moment-timezone');

function formatUpdate(update, locationName) {
  const time = moment(update.created_at)
    .tz('Asia/Jerusalem')
    .format('HH:mm DD/MM/YYYY');

  return `🔔 <b>تحديث جديد</b>

📍 <b>الموقع:</b> ${locationName}
⚡️ <b>الحالة:</b> ${update.status}
${update.description ? `📝 <b>الوصف:</b> ${update.description}\n` : ''}
🕒 <b>الوقت:</b> ${time}`;
}

module.exports = {
  formatUpdate
};