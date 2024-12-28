const { ROAD_STATUS } = require('../config/constants');
const { isValidStatus } = require('../utils/validators');
const { formatUpdate } = require('../utils/formatters');

async function addStatusUpdate(bot, supabase, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const parts = msg.text.split(' ');
  
  // تخطي الأمر /status
  parts.shift();
  
  // استخراج الحالة
  const status = parts.shift();
  
  // استخراج الموقع
  const location = parts.shift();
  
  // باقي النص هو الوصف
  const description = parts.join(' ');

  if (!status || !location) {
    return bot.sendMessage(chatId, 
      'الرجاء استخدام الصيغة الصحيحة:\n/status [الحالة] [الموقع] [الوصف]');
  }

  if (!isValidStatus(status)) {
    return bot.sendMessage(chatId, 
      `الحالة غير صحيحة. الحالات المتاحة:\n${Object.values(ROAD_STATUS).join('\n')}`);
  }

  try {
    // التحقق من وجود الموقع
    const { data: locationData, error: locationError } = await supabase
      .from('locations')
      .select('id')
      .eq('name', location)
      .single();

    if (locationError || !locationData) {
      return bot.sendMessage(chatId, 'الموقع غير موجود. الرجاء التأكد من اسم الموقع أو طلب إضافته.');
    }

    // إضافة التحديث
    const { data: update, error } = await supabase
      .from('road_updates')
      .insert([{
        location_id: locationData.id,
        status,
        description,
        user_id: userId
      }])
      .select()
      .single();

    if (error) throw error;

    // إرسال التحديث للمجموعة
    const formattedUpdate = formatUpdate(update, location);
    await bot.sendMessage(chatId, formattedUpdate, { parse_mode: 'HTML' });

  } catch (error) {
    console.error('خطأ في إضافة التحديث:', error);
    await bot.sendMessage(chatId, 'حدث خطأ أثناء إضافة التحديث');
  }
}

async function getLatestUpdates(bot, supabase, msg) {
  const chatId = msg.chat.id;

  try {
    const { data: updates, error } = await supabase
      .from('road_updates')
      .select(`
        *,
        locations (name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!updates.length) {
      return bot.sendMessage(chatId, 'لا توجد تحديثات حالياً');
    }

    const formattedUpdates = updates
      .map(update => formatUpdate(update, update.locations.name))
      .join('\n\n');

    await bot.sendMessage(chatId, 
      `آخر التحديثات:\n\n${formattedUpdates}`, 
      { parse_mode: 'HTML' }
    );

  } catch (error) {
    console.error('خطأ في جلب التحديثات:', error);
    await bot.sendMessage(chatId, 'حدث خطأ أثناء جلب التحديثات');
  }
}

module.exports = {
  addStatusUpdate,
  getLatestUpdates
};