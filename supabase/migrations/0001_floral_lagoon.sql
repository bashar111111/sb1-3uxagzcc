/*
  # إنشاء جداول قاعدة البيانات الأساسية

  1. الجداول الجديدة
    - `locations`: جدول المواقع
      - `id` (uuid, المفتاح الرئيسي)
      - `name` (text, اسم الموقع)
      - `chat_id` (bigint, معرف المحادثة)
      - `created_at` (timestamp)
    
    - `road_updates`: جدول تحديثات الطرق
      - `id` (uuid, المفتاح الرئيسي)
      - `location_id` (uuid, مرجع للموقع)
      - `status` (text, حالة الطريق)
      - `description` (text, وصف الحالة)
      - `user_id` (bigint, معرف المستخدم)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - إضافة سياسات القراءة والكتابة
*/

-- إنشاء جدول المواقع
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  chat_id bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول تحديثات الطرق
CREATE TABLE IF NOT EXISTS road_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES locations(id),
  status text NOT NULL,
  description text,
  user_id bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE road_updates ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للمواقع
CREATE POLICY "Allow read locations for all"
  ON locations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert locations for authenticated users"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- سياسات الأمان لتحديثات الطرق
CREATE POLICY "Allow read road updates for all"
  ON road_updates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert road updates for authenticated users"
  ON road_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);