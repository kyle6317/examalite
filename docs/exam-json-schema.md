# Exama Lite — Đặc tả cấu trúc `exam.json`

> File này chỉ lưu **nội dung bài thi** (câu hỏi, đáp án, media).  
> Metadata (tên đề, thời gian, trạng thái public,...) lưu riêng trong Supabase SQL.

---

## Cấu trúc file ZIP

```
{uuid}.zip
├── exam.json
└── media/
    ├── img_abc123.png
    ├── clip_xyz789.mp3
    └── ...
```

- Thư mục `media/` là **phẳng** — không có thư mục con.
- `exam.json` tham chiếu file media bằng **tên file đơn giản**, không kèm đường dẫn.

---

## Cấu trúc `exam.json`

```json
{
  "groups": [ ...Group[] ]
}
```

| Field    | Kiểu      | Bắt buộc | Mô tả                                      |
|----------|-----------|----------|--------------------------------------------|
| `groups` | `Group[]` | ✅        | Danh sách nhóm câu hỏi. Tối thiểu 1 nhóm. |

---

## Group

Group dùng để **gom nhóm câu hỏi** có liên quan — cùng dữ kiện, cùng loại, cùng chủ đề,...

```json
{
  "id": "g1",
  "label": "Nhóm câu hỏi Đúng/Sai",
  "context": "Đọc đoạn văn sau và trả lời các câu hỏi...",
  "context_media": [],
  "questions": [ ...Question[] ]
}
```

| Field           | Kiểu         | Bắt buộc | Mô tả                                                                         |
|-----------------|--------------|----------|-------------------------------------------------------------------------------|
| `id`            | `string`     | ✅        | Định danh duy nhất trong file. Ví dụ: `"g1"`, `"g2"`.                        |
| `label`         | `string`     | ❌        | Tiêu đề nhóm. Hỗ trợ **Markdown**.                                            |
| `context`       | `string`     | ❌        | Dữ kiện chung cho cả nhóm (đoạn văn, bảng số liệu,...). Hỗ trợ **Markdown**. |
| `context_media` | `MediaRef[]` | ❌        | Media đính kèm cho `context`. Mặc định `[]`.                                  |
| `questions`     | `Question[]` | ✅        | Danh sách câu hỏi. Tối thiểu 1 câu.                                          |

---

## Question

```json
{
  "id": "q1",
  "type": "single_choice",
  "prompt": "Thủ đô của Việt Nam là gì?",
  "prompt_media": [],
  "choices": [ ...Choice[] ],
  "answer": "c1"
}
```

| Field          | Kiểu           | Bắt buộc | Mô tả                                                                              |
|----------------|----------------|----------|------------------------------------------------------------------------------------|
| `id`           | `string`       | ✅        | Định danh duy nhất trong file. Ví dụ: `"q1"`, `"q2"`.                             |
| `type`         | `QuestionType` | ✅        | Loại câu hỏi. Xem bảng **QuestionType** bên dưới.                                 |
| `prompt`       | `string`       | ✅        | Nội dung câu hỏi. Hỗ trợ **Markdown**.                                            |
| `prompt_media` | `MediaRef[]`   | ❌        | Media đính kèm cho câu hỏi. Mặc định `[]`.                                        |
| `choices`      | `Choice[]`     | ❌        | Danh sách lựa chọn. Bắt buộc với `single_choice`, `multi_choice`, `true_false`.   |
| `answer`       | `string \| string[] \| number` | ✅ | Đáp án đúng. Cấu trúc tùy theo `type`. Xem chi tiết bên dưới.       |

---

## QuestionType

| Giá trị         | Mô tả                                                   |
|-----------------|---------------------------------------------------------|
| `single_choice` | Trắc nghiệm **một** đáp án đúng (A/B/C/D,...)          |
| `multi_choice`  | Trắc nghiệm **nhiều** đáp án đúng                      |
| `true_false`    | Đúng / Sai                                             |
| `fill_number`   | Điền **số** vào ô trống                                |
| `fill_text`     | Điền **từ ngắn** vào ô trống                           |
| `fill_blank`    | Điền từ vào **đoạn văn** (nhiều chỗ trống)             |

---

## Cấu trúc `answer` theo từng `type`

### `single_choice`
```json
"answer": "c1"
```
Chuỗi `id` của lựa chọn đúng.

### `multi_choice`
```json
"answer": ["c1", "c3"]
```
Mảng `id` của các lựa chọn đúng.

### `true_false`
```json
"answer": "true"
```
Chuỗi `"true"` hoặc `"false"`.

### `fill_number`
```json
"answer": 42
```
Số. Client so sánh bằng `==` (không phân biệt `42` và `42.0`).

### `fill_text`
```json
"answer": "hà nội"
```
Chuỗi. Client so sánh **không phân biệt hoa thường**, **trim** khoảng trắng hai đầu.

### `fill_blank`
```json
"answer": ["hà nội", "1945"]
```
Mảng chuỗi theo thứ tự các `___` trong `prompt`. Số phần tử phải khớp số `___`.

```markdown
Thủ đô của Việt Nam là ___ và năm độc lập là ___.
```

---

## Choice

```json
{
  "id": "c1",
  "text": "Hà Nội",
  "media": []
}
```

| Field   | Kiểu         | Bắt buộc | Mô tả                                             |
|---------|--------------|----------|---------------------------------------------------|
| `id`    | `string`     | ✅        | Định danh duy nhất trong phạm vi câu hỏi.         |
| `text`  | `string`     | ✅        | Nội dung lựa chọn. Hỗ trợ **Markdown**.           |
| `media` | `MediaRef[]` | ❌        | Media đính kèm cho lựa chọn này. Mặc định `[]`.  |

> **`true_false`**: `choices` luôn có đúng 2 phần tử với `id: "true"` và `id: "false"`. Label hiển thị (Đúng/Sai, True/False,...) do **client** quyết định.

---

## MediaRef

```json
{
  "type": "image",
  "src": "img_abc123.png",
  "alt": "Biểu đồ dân số Việt Nam 2020"
}
```

| Field  | Kiểu        | Bắt buộc | Mô tả                                                  |
|--------|-------------|----------|--------------------------------------------------------|
| `type` | `MediaType` | ✅        | Loại file.                                             |
| `src`  | `string`    | ✅        | Tên file trong `media/`. Không kèm đường dẫn.          |
| `alt`  | `string`    | ❌        | Mô tả thay thế (accessibility). Khuyến khích điền đủ. |

### MediaType

| Giá trị | Định dạng hỗ trợ        |
|---------|-------------------------|
| `image` | png, jpg, webp, gif,... |
| `audio` | mp3, ogg, wav,...       |
| `video` | mp4, webm,...           |

---

## Ví dụ đầy đủ

```json
{
  "groups": [
    {
      "id": "g1",
      "label": "Trắc nghiệm một lựa chọn",
      "context": "",
      "context_media": [],
      "questions": [
        {
          "id": "q1",
          "type": "single_choice",
          "prompt": "Thủ đô của Việt Nam là gì?",
          "prompt_media": [],
          "choices": [
            { "id": "c1", "text": "Hà Nội", "media": [] },
            { "id": "c2", "text": "TP. Hồ Chí Minh", "media": [] },
            { "id": "c3", "text": "Đà Nẵng", "media": [] },
            { "id": "c4", "text": "Huế", "media": [] }
          ],
          "answer": "c1"
        }
      ]
    },
    {
      "id": "g2",
      "label": "Đúng/Sai — Hợp chất hữu cơ",
      "context": "Cho các phát biểu sau về **ankan**. Xác định mỗi phát biểu là Đúng hay Sai.",
      "context_media": [
        { "type": "image", "src": "img_ankan.png", "alt": "Công thức cấu tạo ankan" }
      ],
      "questions": [
        {
          "id": "q2",
          "type": "true_false",
          "prompt": "Ankan là hợp chất no, chỉ chứa liên kết đơn C–C và C–H.",
          "prompt_media": [],
          "choices": [
            { "id": "true",  "text": "Đúng", "media": [] },
            { "id": "false", "text": "Sai",  "media": [] }
          ],
          "answer": "true"
        },
        {
          "id": "q3",
          "type": "true_false",
          "prompt": "Metan (CH₄) có công thức phân tử C₂H₆.",
          "prompt_media": [],
          "choices": [
            { "id": "true",  "text": "Đúng", "media": [] },
            { "id": "false", "text": "Sai",  "media": [] }
          ],
          "answer": "false"
        }
      ]
    },
    {
      "id": "g3",
      "label": "Điền vào chỗ trống",
      "context": "",
      "context_media": [],
      "questions": [
        {
          "id": "q4",
          "type": "fill_blank",
          "prompt": "Công thức tổng quát của ankan là ___, phản ứng đặc trưng là phản ứng ___.",
          "prompt_media": [],
          "choices": [],
          "answer": ["CnH2n+2", "thế"]
        },
        {
          "id": "q5",
          "type": "fill_number",
          "prompt": "Phân tử propan có bao nhiêu nguyên tử hydro?",
          "prompt_media": [],
          "choices": [],
          "answer": 8
        }
      ]
    }
  ]
}
```

---

## Quy ước chung

- **`id` phải duy nhất trong toàn file** — group id, question id không được trùng nhau. Choice id chỉ cần duy nhất trong phạm vi câu hỏi đó.
- **Markdown** được hỗ trợ tại: `label`, `context`, `prompt`, `text` (Choice). **Không** dùng cú pháp markdown `![...]()` để chèn ảnh — media phải đi qua `MediaRef`.
- **`fill_blank`** — dùng `___` (3 dấu gạch dưới) làm placeholder. Số lượng `___` trong `prompt` phải bằng số phần tử trong mảng `answer`.
- **`true_false`** — `choices` luôn có đúng 2 phần tử, `id` cố định là `"true"` và `"false"`. Label hiển thị do client tự render.
- **Tên file media** — dùng chữ thường, không dấu cách, không ký tự đặc biệt. Ví dụ: `img_badin_1945.jpg`, `clip_nghe_01.mp3`.
- **Xáo trộn câu hỏi / đáp án** — do client xử lý theo cài đặt từ Supabase, không lưu trong file.
