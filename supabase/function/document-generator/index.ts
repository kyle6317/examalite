import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_CHARS = 80_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── 1. Xác minh JWT của user ──────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing authorization header" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const accessToken = authHeader.replace("Bearer ", "").trim();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Invalid or expired access token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── 2. Đọc body ───────────────────────────────────────────────────────────
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawText = body.text ?? "";

  if (!rawText || rawText.trim().length === 0) {
    return new Response(JSON.stringify({ error: "Field 'text' is required and must not be empty" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── 3. Kiểm tra độ dài ────────────────────────────────────────────────────
  if (rawText.length > MAX_CHARS) {
    return new Response(
      JSON.stringify({
        error: `Document too long. Maximum is ${MAX_CHARS.toLocaleString()} characters, received ${rawText.length.toLocaleString()}.`,
      }),
      {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // ── 4. Gọi Gemini API ─────────────────────────────────────────────────────
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "Server misconfiguration: missing API key" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Cấu hình: vai trò và hướng dẫn
  const systemInstruction = {
    parts: [
      {
        text: [
          "Bạn là một chuyên gia soạn tài liệu học thuật và kỹ thuật.",
          "Nhiệm vụ của bạn là nhận nội dung thô từ người dùng và tổ chức lại thành một tài liệu Markdown mạch lạc, có cấu trúc rõ ràng.",
          "",
          "Quy tắc bắt buộc:",
          "- Chỉ sử dụng DUY NHẤT một heading cấp 1 (#) ở đầu tài liệu làm tiêu đề tổng thể.",
          "- Khuyến kích sử dụng heading cấp 2 (##) và cấp 3 (###) cấp 4 (####) hay cấp 5 (#####) (dùng heading cấp 6 khi tài liệu phức tạp) để phân chia nội dung thành các mục con hợp lý.",
          "- Nội dung mỗi mục phải súc tích, đủ ý — không quá dài, không quá ngắn.",
          "- Ưu tiên dùng bullet list hoặc numbered list khi liệt kê.",
          "- Bôi đậm (**text**) các khái niệm quan trọng.",
          "- Giữ nguyên ngôn ngữ của văn bản gốc (không dịch).",
          "- Không thêm lời giới thiệu, lời kết hay bình luận cá nhân.",
          "- Soạn tài liệu dựa vào nội dung thô của người dùng, không soạn dựa vào cấu trúc dữ liệu thô người dùng nhập, phải phân chia thành các Heading hợp lý",
          "- Chỉ trả về nội dung Markdown thuần túy, không bọc trong code block.",
        ].join("\n"),
      },
    ],
  };

  // Nội dung người dùng gửi lên
  const userMessage = {
    role: "user",
    parts: [
      {
        text: `Hãy tạo tài liệu Markdown từ nội dung sau:\n\n${rawText}`,
      },
    ],
  };

  const geminiPayload = {
    system_instruction: systemInstruction,
    contents: [userMessage],
    generationConfig: {
      temperature: 0.4,
      topP: 0.9,
      maxOutputTokens: 8192,
    },
  };

  let geminiRes: Response;
  try {
    geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to reach Gemini API", detail: String(err) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!geminiRes.ok) {
    const errBody = await geminiRes.text();
    return new Response(
      JSON.stringify({ error: "Gemini API error", status: geminiRes.status, detail: errBody }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const geminiData = await geminiRes.json();

  // Trích markdown từ response
  const markdown: string =
    geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!markdown) {
    return new Response(JSON.stringify({ error: "Gemini returned empty content" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── 5. Trả kết quả cho client ─────────────────────────────────────────────
  return new Response(
    JSON.stringify({ markdown }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
