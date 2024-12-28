const { isAdmin } = require('../utils/adminUtils');
const { LOCATION_REQUEST_STATUS } = require('../config/constants');

async function requestNewLocation(bot, supabase, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const locationName = msg.text.split(' ').slice(1).join(' ');

  if (!locationName) {
    return bot.sendMessage(chatId, 'الرجاء إدخال اسم الموقع');
  }

  try {
    // إضافة طلب جديد
    const { data: request, error } = await supabase
      .from('location_requests')
      .insert([
        {
          name: locationName,
          chat_id: chatId,
          user_id: userId,
          status: LOCATION_REQUEST_STATUS.PENDING
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // إرسال إشعار للمشرفين
    const admins = await bot.getChatAdministrators(chatId);
    for (const admin of admins) {
      await bot.sendMessage(admin.user.id, 
        `طلب إضافة موقع جديد:
الموقع: ${locationName}
من المستخدم: ${msg.from.first_name}

للموافقة: /approve_location ${request.id}
للرفض: /reject_location ${request.id}`
      );
    }

    await bot.sendMessage(chatId, 'تم إرسال طلبك للمشرفين وسيتم مراجعته قريباً');
  } catch (error) {
    console.error('خطأ في إضافة طلب الموقع:', error);
    await bot.sendMessage(chatId, 'حدث خطأ أثناء إرسال الطلب');
  }
}

async function handleLocationApproval(bot, supabase, msg, approved = true) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!await isAdmin(bot, chatId, userId)) {
    return bot.sendMessage(chatId, 'عذراً، هذا الأمر متاح للمشرفين فقط');
  }

  const requestId = msg.text.split(' ')[1];
  if (!requestId) {
    return bot.sendMessage(chatId, 'الرجاء تحديد رقم الطلب');
  }

  try {
    // جلب معلومات الطلب
    const { data: request, error: requestError } = await supabase
      .from('location_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return bot.sendMessage(chatId, 'لم يتم العثور على الطلب');
    }

    if (request.status !== LOCATION_REQUEST_STATUS.PENDING) {
      return bot.sendMessage(chatId, 'تم معالجة هذا الطلب مسبقاً');
    }

    if (approved) {
      // إضافة الموقع الجديد
      const { error: locationError } = await supabase
        .from('locations')
        .insert([{
          name: request.name,
          chat_id: request.chat_id
        }]);

      if (locationError) throw locationError;
    }

    // تحديث حالة الطلب
    const { error: updateError } = await supabase
      .from('location_requests')
      .update({
        status: approved ? LOCATION_REQUEST_STATUS.APPROVED : LOCATION_REQUEST_STATUS.REJECTED,
        processed_by: userId
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // إرسال إشعار للمستخدم
    await bot.sendMessage(request.chat_id, 
      approved 
        ? `تمت الموافقة على إضافة الموقع: ${request.name}`
        : `تم رفض طلب إضافة الموقع: ${request.name}`
    );

    await bot.sendMessage(chatId, 'تم معالجة الطلب بنجاح');
  } catch (error) {
    console.error('خطأ في معالجة طلب الموقع:', error);
    await bot.sendMessage(chatId, 'حدث خطأ أثناء معالجة الطلب');
  }
}

module.exports = {
  requestNewLocation,
  handleLocationApproval
};