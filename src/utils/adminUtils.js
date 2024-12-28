const TelegramBot = require('node-telegram-bot-api');

// التحقق من صلاحيات المشرف
async function isAdmin(bot, chatId, userId) {
  try {
    const admins = await bot.getChatAdministrators(chatId);
    return admins.some(admin => admin.user.id === userId);
  } catch (error) {
    console.error('خطأ في التحقق من صلاحيات المشرف:', error);
    return false;
  }
}

module.exports = { isAdmin };