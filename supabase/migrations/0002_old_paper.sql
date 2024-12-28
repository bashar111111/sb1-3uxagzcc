/*
  # إضافة نظام طلبات المواقع

  1. جدول جديد
    - `location_requests`: جدول طلبات إضافة المواقع
      - `id` (uuid, المفتاح الرئيسي)
      - `name` (text, اسم الموقع المطلوب)
      - `chat_id` (bigint, معرف المحادثة)
      - `user_id` (bigint, معرف مقدم الطلب)
      - `status` (text, حالة الطلب)
      - `processed_by` (bigint, معرف المشرف الذي عالج الطلب)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS
    - إضافة سياسات القراءة والكتابة
*/

CREATE TABLE IF NOT EXISTS location_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  chat_id bigint NOT NULL,
  user_id bigint NOT NULL,
  status text NOT NULL,
  processed_by bigint,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE location_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read location requests for all"
  ON location_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert location requests for authenticated users"
  ON location_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update location requests for authenticated users"
  ON location_requests
  FOR UPDATE
  TO authenticated
  USING (true);