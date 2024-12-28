require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
const { ROAD_STATUS } = require('./config/constants');
const { requestNewLocation, handleLocationApproval } = require('./handlers/locationRequests');
const { addStatusUpdate, getLatestUpdates } = require('./handlers/statusUpdates');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// أوامر التحديثات
bot.onText(/\/status (.+)/, (msg) => addStatusUpdate(bot, supabase, msg));
bot.onText(/\/updates/, (msg) => getLatestUpdates(bot, supabase, msg));

// أوامر المواقع
bot.onText(/\/request_location (.+)/, (msg) => requestNewLocation(bot, supabase, msg));
bot.onText(/\/approve_location (.+)/, (msg) => handleLocationApproval(bot, supabase, msg, true));
bot.onText(/\/reject_location (.+)/, (msg) => handleLocationApproval(bot, supabase, msg, false));

// رسالة البداية
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `مرحباً بك في بوت مراقبة حالة الطرق في فلسطين! 🚗

الأوامر المتاحة:
📝 /status [الحالة] [الموقع] [الوصف] - إضافة تحديث جديد
📋 /updates - عرض آخر التحديثات
➕ /request_location [الاسم] - طلب إضافة موقع جديد

حالات الطرق المتاحة:
${Object.values(ROAD_STATUS).map(status => `• ${status}`).join('\n')}

للمشرفين:
✅ /approve_location [رقم_الطلب] - الموافقة على إضافة موقع
❌ /reject_location [رقم_الطلب] - رفض إضافة موقع`, 
    { parse_mode: 'HTML' });
});