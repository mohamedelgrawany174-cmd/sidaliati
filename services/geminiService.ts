
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { RoutineResponse, TrainingExample } from '../types';
import { SYSTEM_INSTRUCTION_ANALYZER, SYSTEM_INSTRUCTION_CONSULTANT, MOCK_PRODUCTS } from '../constants';

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

// Create a string context of products for the routine generator prompt
const PRODUCTS_CONTEXT = MOCK_PRODUCTS.map(p => `- ${p.name} (${p.category})`).join(', ');

const SYSTEM_INSTRUCTION_MARKETER = `
أنت خبير عالمي في "سيكولوجية البيع" (Sales Psychology) وكتابة الإعلانات (Copywriting).
أنت لا تقوم فقط بتحسين النصوص، بل تقوم بـ "هندسة الإقناع".

مهمتك هي تحليل النص المدخل، فهم "نية العميل" و"مرحلة الشراء"، ثم صياغة ردود تستهدف العقل الباطن للعميل لزيادة المبيعات وبناء الثقة.

عند التحليل، اتبع الهيكل الصارم التالي في الرد:

1. 🧠 **التحليل النفسي (Deep Diagnosis):**
   - **نقاط الألم:** ما الذي يخيف العميل أو يمنعه من الشراء في النص الأصلي؟
   - **الفرصة الضائعة:** ما هو "المحفز النفسي" (Trigger) المفقود؟ (مثل: الخوف من الفوات FOMO، الحاجة للأمان، الرغبة في التميز).

2. 💡 **استراتيجية التعديل:**
   - اشرح في جملة واحدة كيف سنقوم بقلب الموازين لصالحنا.

3. ✨ **السيناريوهات المقترحة (3 بدائل ذكية):**
   اقترح 3 نسخ مختلفة للنص بناءً على الأسلوب، واجعلها جاهزة للنسخ (منسقة للواتساب):

   *   **الخيار 1: "أسلوب د/ مريم الودود" (Warm & Trust):**
       - يركز على بناء العلاقة، العاطفة، واستخدام كلمات مثل (يا قمر، حبيبتي، عيوني). مناسب للعملاء المترددين.
   
   *   **الخيار 2: "أسلوب العرض الذي لا يقاوم" (Urgency & Value):**
       - يركز على القيمة مقابل السعر، والكمية المحدودة، وسرعة اتخاذ القرار.
   
   *   **الخيار 3: "الأسلوب الاحترافي المختصر" (Direct & Professional):**
       - يركز على الحقائق، النتائج، والوضوح. مناسب للعملاء العمليين.

⚠️ **قواعد ذهبية:**
- استخدم اللهجة المصرية البيضاء (المفهومة والراقية).
- استخدم الإيموجي بذكاء لتوجيه العين.
- قسم النصوص إلى فقرات قصيرة جداً (كبسولات).
- دائماً اختم بـ "دعوة لاتخاذ إجراء" (CTA) واضحة وسهلة (سؤال، أو طلب بيانات).
`;

// --- Tool Definitions ---

const createOrderTool: FunctionDeclaration = {
  name: "create_order",
  description: "Use this tool ONLY when the user explicitly wants to place an order AND has provided all necessary shipping details (Name, Phone, Address).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerName: { type: Type.STRING, description: "Full name of the customer" },
      customerPhone: { type: Type.STRING, description: "Phone number" },
      customerAddress: { type: Type.STRING, description: "Full detailed address (Governorate, Street, Building)" },
      items: {
        type: Type.ARRAY,
        description: "List of items the customer wants to buy. Infer from context if not explicitly listed in the last message.",
        items: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING, description: "Name of the product (try to match store product names)" },
            quantity: { type: Type.NUMBER, description: "Quantity, default to 1" }
          },
          required: ["productName", "quantity"]
        }
      }
    },
    required: ["customerName", "customerPhone", "customerAddress", "items"]
  }
};

/**
 * Helper to check for Quota Exceeded errors gracefully
 */
const handleApiError = (error: any, defaultMsg: string) => {
    // Robust check for 429 using stringify to catch nested error objects
    const errorStr = JSON.stringify(error);
    const isQuotaError = 
        errorStr.includes('429') || 
        errorStr.includes('RESOURCE_EXHAUSTED') || 
        error.status === 429;

    if (isQuotaError) {
        console.warn("Gemini Quota Exceeded (429). Retrying or degrading gracefully.");
        throw new Error("عذراً، النظام مشغول جداً حالياً (تجاوز الحد المسموح). يرجى الانتظار دقيقة والمحاولة مجدداً.");
    }
    
    // Log other errors normally
    console.error("Gemini API Error:", error);
    throw new Error(defaultMsg);
};

/**
 * Analyzes a skin image using Gemini Vision capabilities with Thinking Config.
 */
export const analyzeSkinImage = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "قم بتحليل صورة البشرة بسرعة ودقة. حدد النوع والمشاكل، واقترح أفضل المنتجات."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ANALYZER,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 0 }, // Set to 0 for fastest possible response
      }
    });

    return response.text || "عذراً، لم أتمكن من تحليل الصورة.";
  } catch (error) {
    handleApiError(error, "حدث خطأ أثناء تحليل الصورة.");
    return ""; // Unreachable due to throw, but satisfies TS
  }
};

/**
 * Generates a skincare routine based on text input description.
 */
export const generateRoutine = async (userDescription: string): Promise<RoutineResponse | null> => {
  try {
    const prompt = `
    بناءً على تحليل البشرة التالي: "${userDescription}"
    
    قم بإنشاء روتين عناية متكامل (صباحي ومسائي).
    حاول تضمين المنتجات التالية من متجرنا في الروتين عند الحاجة: [${PRODUCTS_CONTEXT}].
    إذا لم يكن هناك منتج مناسب في المتجر، اقترح نوع المنتج العام (مثلاً "واقي شمس").
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            morning: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.STRING },
                  productType: { type: Type.STRING, description: "Specific product name from our store OR generic type" },
                  advice: { type: Type.STRING }
                }
              }
            },
            evening: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.STRING },
                  productType: { type: Type.STRING },
                  advice: { type: Type.STRING }
                }
              }
            },
            notes: { type: Type.STRING }
          }
        }
      }
    });

    let text = response.text || "{}";
    
    // CRITICAL FIX: Robust JSON Extraction
    // Find the substring that starts with '{' and ends with '}' (greedy match)
    // This fixes issues where AI adds text like "Here is the JSON:" before the block
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        text = jsonMatch[0];
    }

    // Attempt Parse
    const parsed = JSON.parse(text) as Partial<RoutineResponse>;
    
    // Ensure arrays exist
    return {
      morning: Array.isArray(parsed.morning) ? parsed.morning : [],
      evening: Array.isArray(parsed.evening) ? parsed.evening : [],
      notes: parsed.notes || ''
    };
  } catch (error: any) {
    // For routine, we fallback gracefully if quota exceeded instead of throwing
    const errorStr = JSON.stringify(error);
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
        console.warn("Routine generation skipped due to quota limit.");
    } else {
        console.warn("Routine Generation Failed (Parse or API):", error.message);
    }
    return null; 
  }
};

/**
 * Starts a chat session, optionally injecting previous analysis context AND dynamic training data.
 */
export const createChatSession = (medicalContext?: string, trainingData?: TrainingExample[]) => {
  let instructions = SYSTEM_INSTRUCTION_CONSULTANT;
  
  // Inject Analysis Context if available
  if (medicalContext) {
    instructions += `\n\n### 📝 [حالة العميل الحالية - هام جداً]:\nلقد قام العميل للتو بإجراء تحليل للبشرة وهذه هي النتائج:\n${medicalContext}\nكن على علم بهذه التفاصيل وأجب على استفساراته بناءً عليها.`;
  }

  // Inject Training Data (Knowledge Base) if available
  if (trainingData && trainingData.length > 0) {
     const activeTraining = trainingData.filter(t => t.active);
     if (activeTraining.length > 0) {
        instructions += `\n\n### 🧠 [قاعدة المعرفة والتدريب الخاص]:\nالتعليمات التالية لها أولوية قصوى. إذا سأل العميل عن هذه المواضيع، التزم بالردود المحددة هنا:\n`;
        activeTraining.forEach(t => {
           instructions += `- إذا قال العميل/الموقف: "${t.pattern}"\n  -> الرد المطلوب/التصرف: "${t.response}"\n`;
        });
     }
  }

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: instructions,
      tools: [{ functionDeclarations: [createOrderTool] }],
    }
  });
};

/**
 * Analyzes marketing text and suggests improvements.
 */
export const analyzeTextStrategy = async (text: string, goal: string, audience: string, platform: string): Promise<string> => {
  try {
    const prompt = `
    بيانات التحليل المطلوبة:
    - النص الأصلي: "${text}"
    - الهدف: ${goal}
    - الجمهور المستهدف (نوع العميل): ${audience}
    - منصة النشر: ${platform}
    
    قم بتحليل هذا النص بناءً على سيكولوجية الجمهور والمنصة المحددة.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_MARKETER,
      }
    });
    return response.text || "لم أتمكن من تحليل النص.";
  } catch (error) {
     handleApiError(error, "حدث خطأ أثناء الاتصال بالمحلل الذكي.");
     return "";
  }
};
