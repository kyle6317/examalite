// Supabase Edge Function: validate-exam
// Deploy path: supabase/functions/validate-exam/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ✅ Dùng service role key để bypass RLS hoàn toàn
    // KHÔNG truyền Authorization header từ client vào đây
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Parse body
    let body: { exam_id?: string }
    try {
      body = await req.json()
    } catch {
      throw new Error('Request body không hợp lệ')
    }

    const { exam_id } = body

    if (!exam_id || typeof exam_id !== 'string') {
      throw new Error('exam_id là bắt buộc')
    }

    // ── 1. Lấy thông tin bài kiểm tra ──────────────────────────────
    const { data: exam, error: examError } = await supabaseAdmin
      .from('exams')
      .select('id, user_id, title, description, duration_minutes, available_from, expires_at, is_public')
      .eq('id', exam_id)
      .single()

    if (examError) {
      console.error('DB error:', examError.message)
      throw new Error('Bài kiểm tra không tồn tại')
    }

    if (!exam) {
      throw new Error('Bài kiểm tra không tồn tại')
    }

    // ── 2. Kiểm tra điều kiện truy cập ─────────────────────────────
    if (!exam.is_public) {
      throw new Error('Bài kiểm tra không được công khai')
    }

    const now = new Date()

    if (exam.available_from) {
      const availableFrom = new Date(exam.available_from)
      if (now < availableFrom) {
        throw new Error('Bài kiểm tra chưa đến thời gian làm bài')
      }
    }

    if (exam.expires_at) {
      const expiresAt = new Date(exam.expires_at)
      if (now > expiresAt) {
        throw new Error('Bài kiểm tra đã hết hạn')
      }
    }

    // ── 3. Tạo signed URL từ Storage ───────────────────────────────
    const filePath = `${exam.user_id}/${exam.id}.zip`
    console.log('Storage path:', filePath)

    const { data: signedData, error: signError } = await supabaseAdmin
      .storage
      .from('exams')
      .createSignedUrl(filePath, 3600) // URL hết hạn sau 1 giờ

    if (signError || !signedData?.signedUrl) {
      console.error('Storage error:', signError?.message ?? 'signedUrl is null')
      throw new Error('Không thể tạo link tải xuống: ' + (signError?.message ?? 'file không tồn tại'))
    }

    // ── 4. Trả về metadata + signed URL ────────────────────────────
    return new Response(
      JSON.stringify({
        title: exam.title,
        description: exam.description,
        duration_minutes: exam.duration_minutes,
        available_from: exam.available_from,
        expires_at: exam.expires_at,
        signed_url: signedData.signedUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'
    console.error('validate-exam error:', message)

    return new Response(
      JSON.stringify({ message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
