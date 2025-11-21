import { Filter } from "bad-words";
// Profanity Filter (ระบบจัดการคำหยาบ)
const filter = new Filter();
// คุณสามารถเพิ่มคำหยาบภาษาไทยลงใน list ได้ที่นี่
filter.addWords('หยาบ1', 'หยาบ2', 'fuck', 'shit', 'ควย'); 

export const sanitizeText = (text: string): string => {
    if (!text) return text;
    // clean() จะเปลี่ยนคำหยาบเป็น *** โดยอัตโนมัติ
    return filter.clean(text); 
};