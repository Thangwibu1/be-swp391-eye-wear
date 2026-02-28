import { config } from "../config/env.config";

export function buildIntentPrompt(message: string) {
    return `
Trích xuất thông tin mua kính từ câu sau.

User message:
"${message}"

Trả về JSON DUY NHẤT theo schema:

{
  "type": "frame | sunglass | null | undefined",
  "gender": "M | F | unisex | null | undefined",
  "priceLower": number | null | undefined,
  "priceUpper": number | null | undefined,
  "color": string | null | undefined,
  "shape": string | null | undefined,
  "brand": string | null | undefined,
  "style": string | null | undefined,
  "isRefinement": boolean
}

Rules:
- Nếu user nói "loại nào cũng được" → để null.
- Nếu user không nhắc đến thì thuộc tính(undefined) đó thì không liệt kê trong object trả về luôn.
- Nếu user đang thay đổi yêu cầu → isRefinement = true.
- Không giải thích. Chỉ trả định dạng JSON.
- Để lên các field này dạng tiếng anh (English) nha
- priceUpper là giá tối đa(giá đến) khách có thể trả, priceLower(giá từ) là giá tối thiểu khách có thể trả, nếu chỉ đề cập 1 trong 2 thì cái còn lại có giá trị tối đa trong khoảng
`;
}
export function buildAnswerPrompt(message: string, products: any[]) {
    const context = products
        .map(p => `- Tên: ${p.nameBase} | Thương hiệu: ${p.brand ?? 'Không có'} | Link: ${config.cors.origin[2]}/products/${p._id}`)
        .join("\n");

    return `
Bạn là nhân viên tư vấn bán kính mắt chuyên nghiệp. 
Nhiệm vụ: Dựa vào danh sách sản phẩm bên dưới để tư vấn cho khách hàng.

DỮ LIỆU SẢN PHẨM:
${context || "KHO TRỐNG - KHÔNG CÓ SẢN PHẨM NÀO"}
YÊU CẦU QUAN TRỌNG VỀ DỮ LIỆU:
- TUYỆT ĐỐI KHÔNG giới thiệu bất kỳ sản phẩm nào không có trong danh sách "DỮ LIỆU SẢN PHẨM CÓ TRONG KHO" ở trên.
- Nếu danh sách trên trống hoặc không tìm thấy sản phẩm nào khớp với yêu cầu khách, hãy xin lỗi chân thành và hỏi lại nhu cầu khách. KHÔNG ĐƯỢC tự bịa ra tên sản phẩm hay link.
- Nếu không có sản phẩm nào (Product Length: ${products.length} là 0), hãy xin lỗi chân thành và hỏi lại nhu cầu khách
- Nếu có sản phẩm, hãy tư vấn tự nhiên và chèn link vào tên sản phẩm như yêu cầu.

YÊU CẦU ĐỊNH DẠNG PHẢN HỒI (BẮT BUỘC):
- 1. Sử dụng HTML thuần để trình bày. 
- 2. Trả về văn bản tư vấn tự nhiên, KHÔNG chia khung, KHÔNG chia cột.
- 3. Khi nhắc đến tên sản phẩm, hãy kẹp nó trong thẻ <a> với link tương ứng.
   Ví dụ: "Bạn có thể tham khảo mẫu <a href='LINK_SP' style='color: #007bff; font-weight: bold;'>Tên sản phẩm</a>, mẫu này rất hợp với..."
- 4. Chỉ trả về mã HTML sạch (bọc trong 1 thẻ <div> duy nhất).
- 5. KHÔNG sử dụng ký tự "\\n" (backslash n) trong văn bản trả về mà thay bằng <br> hoặc các thẻ đóng mở khối (p, div) để xuống dòng.
- 6. KHÔNG bao bọc toàn bộ kết quả trong Markdown code block (ví dụ \`\`\`html). Chỉ trả về mã HTML trực tiếp.

CÂU HỎI CỦA KHÁCH:
"${message}"

Bắt đầu tư vấn:
`;
}
export function buildAskSlotPrompt(
  missingSlot: string,
  currentIntent: Record<string, any>,
  userMessage: string
) {
  return `
Bạn là nhân viên tư vấn kính mắt đang trò chuyện với khách.

Khách vừa nói:
"${userMessage}"

Hệ thống chưa đủ thông tin để tìm sản phẩm.

Thông tin còn thiếu:
${missingSlot}

Thông tin đã biết (để bạn KHÔNG hỏi lại):
${JSON.stringify(currentIntent)}

Nhiệm vụ của bạn:
- Hỏi NGẮN GỌN để lấy đủ thông tin còn thiếu.
- Không hỏi lại thông tin đã có.
- Không giải thích dài dòng.
- Không liệt kê kỹ thuật.
- Chỉ hỏi như nhân viên bán hàng thật (1 câu tự nhiên).
- Không nói bạn là AI.

Chỉ trả về câu hỏi.
`;
}