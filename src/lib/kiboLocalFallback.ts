/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Kibo Local & Offline Knowledge Engine
 * Provides intelligent, high-quality Myanmar programming guidance when
 * offline, during network fluctuations, or when AI quotas are temporarily saturated.
 */

import { Course, Lesson } from "../types";

export function generateLocalKiboResponse(
  query: string,
  currentCourse?: Course | null,
  currentLesson?: Lesson | null,
  isPremium?: boolean
): string {
  const q = query.toLowerCase().trim();

  // 1. Python Variables & Data Types
  if (q.includes("variable") || q.includes("ကိန်းရှင်") || q.includes("data type") || q.includes("str") || q.includes("int") || q.includes("float")) {
    return `### 💡 Variable (ကိန်းရှင်) နှင့် Data Types အကြောင်း ရှင်းလင်းချက်

**Variable (ကိန်းရှင်)** ဆိုတာ ပရိုဂရမ်အတွင်း အချက်အလက် (Data) တွေကို ခေတ္တသိမ်းဆည်းထားတဲ့ **တံဆိပ်ကပ်ထားသော သေတ္တာ (Labeled Box)** တစ်ခုလို ဖြစ်ပါတယ်ခင်ဗျာ။

#### 📌 Python တွင် Variable ကြေညာပုံ Syntax:
\`\`\`python
# Variable များ သတ်မှတ်ခြင်း
student_name = "Aung Aung"   # String (စာသား)
student_age = 18             # Integer (ကိန်းပြည့်)
exam_score = 95.5            # Float (ဒသမကိန်း)
is_enrolled = True           # Boolean (မှန်/မှား)

print(f"ကျောင်းသားအမည်: {student_name}, အသက်: {student_age}")
\`\`\`

#### ⚠️ Beginner Mistakes (အဖြစ်များသော အမှားများ):
1. Variable နာမည်ကို ဂဏန်းဖြင့် စတင်ခေါ်ယူခြင်း (ဥပမာ \`1student\` သည် အမှားဖြစ်ပြီး \`student_1\` ဟု သုံးရပါမည်)။
2. Variable နာမည်ကြားတွင် Space (ကွက်လပ်) ခြားခြင်း (ဥပမာ \`user name\` အစား \`user_name\` ဟု snake_case သုံးပါ)။

ဖြည်းဖြည်းချင်း အတူတူလေ့ကျင့်သွားကြရအောင်ဗျာ။ အားတင်းထားပါ!`;
  }

  // 2. Python If-Else / Conditionals
  if (q.includes("if") || q.includes("else") || q.includes("condition") || q.includes("အခြေအနေ")) {
    return `### 💡 If-Else (အခြေအနေအရ ဆုံးဖြတ်ခြင်း) အကြောင်း

ပရိုဂရမ်မင်းမှာ **If-Else** ဆိုတာ လမ်းဆုံတစ်ခုမှာ သွားရမယ့်လမ်းကို စည်းကမ်းချက် (Condition) အရ ရွေးချယ်ခိုင်းတာ ဖြစ်ပါတယ်ခင်ဗျာ။

#### 📌 Python If-Else Syntax:
\`\`\`python
score = 85

if score >= 80:
    print("🌟 Distinction (ဂုဏ်ထူးဖြင့် အောင်မြင်ပါသည်)")
elif score >= 50:
    print("✅ Passed (အောင်မြင်ပါသည်)")
else:
    print("⚠️ Need Improvement (ထပ်မံကြိုးစားပါ)")
\`\`\`

#### 💡 အရေးကြီးသော အချက် (Indentation):
Python တွင် if သို့မဟုတ် else ရေးပြီးပါက အောက်စာကြောင်းတွင် **Space ၄ ချက် (Indentation)** ခြားပေးရန် အလွန်အရေးကြီးပါသည်ခင်ဗျာ။

ဖြည်းဖြည်းချင်း အတူတူလေ့ကျင့်သွားကြရအောင်ဗျာ။ အားတင်းထားပါ!`;
  }

  // 3. Loops (For / While)
  if (q.includes("loop") || q.includes("for") || q.includes("while") || q.includes("ပတ်လမ်း")) {
    return `### 💡 Loops (အကြိမ်ကြိမ် လုပ်ဆောင်စေခြင်း) အကြောင်း

**Loop** ဆိုတာ တူညီတဲ့ အလုပ်တစ်ခုကို အကြိမ်ကြိမ် ကိုယ်တိုင်ရေးစရာမလိုဘဲ ကွန်ပျူတာကို အလိုအလျောက် ပတ်လုပ်စေတဲ့ စနစ်ဖြစ်ပါတယ်ခင်ဗျာ။

#### 📌 Python For Loop & While Loop Syntax:
\`\`\`python
# ၁ မှ ၅ အထိ ပတ်လည်ထုတ်ယူခြင်း (For Loop)
print("--- For Loop ရလဒ် ---")
for i in range(1, 6):
    print(f"အကြိမ်အရေအတွက်: {i}")

# အခြေအနေ မှန်နေသရွေ့ အလုပ်လုပ်ခြင်း (While Loop)
print("--- While Loop ရလဒ် ---")
count = 1
while count <= 3:
    print(f"ရေတွက်မှု: {count}")
    count += 1
\`\`\`

#### ⚠️ Infinite Loop သတိပြုရန်:
\`while\` loop သုံးတဲ့အခါ အခြေအနေကို ရပ်တန့်စေမယ့် တိုးမြှင့်မှု (\`count += 1\`) မထည့်မိပါက ပရိုဂရမ် အဆုံးမရှိ ပတ်နေတတ်ပါသည်ခင်ဗျာ။

ဖြည်းဖြည်းချင်း အတူတူလေ့ကျင့်သွားကြရအောင်ဗျာ။ အားတင်းထားပါ!`;
  }

  // 4. Functions
  if (q.includes("function") || q.includes("def ") || q.includes("ဖန်ရှင်") || q.includes("parameter") || q.includes("return")) {
    return `### 💡 Function (ပြန်လည်အသုံးပြုနိုင်သော ကုဒ်အစုအဝေး) အကြောင်း

**Function** ဆိုတာ တိကျတဲ့ အလုပ်တစ်ခုကို လုပ်ဆောင်ပေးပြီး လိုအပ်တဲ့အချိန်တိုင်း အလွယ်တကူ ပြန်ခေါ်သုံးနိုင်တဲ့ **ဖျော်ရည်စက် (Juice Machine)** တစ်ခုလို ဖြစ်ပါတယ်ခင်ဗျာ။

#### 📌 Python Function Syntax:
\`\`\`python
def greet_student(name, course):
    """ကျောင်းသားအား ကြိုဆိုသော မက်ဆေ့ခ်ျ ထုတ်ပေးသည့် function"""
    message = f"မင်္ဂလာပါ {name}! {course} သင်တန်းမှ ကြိုဆိုပါတယ်။"
    return message

# Function ကို ခေါ်ယူအသုံးပြုခြင်း
result = greet_student("မောင်မောင်", "Python Basics")
print(result)
\`\`\`

#### 💡 Best Practice:
Function တစ်ခုတွင် အလုပ်တစ်ခုတည်းသာ သီးသန့်တာဝန်ယူစေခြင်း (Single Responsibility Principle) သည် ကုဒ်ကို ပိုမိုသန့်ရှင်းစေပါသည်ခင်ဗျာ။

ဖြည်းဖြည်းချင်း အတူတူလေ့ကျင့်သွားကြရအောင်ဗျာ။ အားတင်းထားပါ!`;
  }

  // 5. HTML & CSS Web Development
  if (q.includes("html") || q.includes("css") || q.includes("tag") || q.includes("div") || q.includes("flexbox") || q.includes("grid")) {
    return `### 💡 HTML & CSS Web Development အခြေခံ

- **HTML (HyperText Markup Language):** ဝဘ်ဆိုက်၏ အရိုးစု (Structure) ဖြစ်ပြီး ခေါင်းစဉ်၊ စာပိုဒ်၊ ပုံ၊ ခလုတ် များကို တည်ဆောက်ပေးပါသည်။
- **CSS (Cascading Style Sheets):** ဝဘ်ဆိုက်၏ အဝတ်အစား/အလှဆင်မှု (Styling) ဖြစ်ပြီး အရောင်၊ စာလုံးပုံစံ၊ နေရာချထားမှု (Layout) များကို ပြုပြင်ပေးပါသည်။

#### 📌 HTML & Modern CSS ဥပမာ:
\`\`\`html
<!-- HTML Structure -->
<div class="card">
  <h2>Code Learn Myanmar</h2>
  <p>မြန်မာနိုင်ငံ၏ ခေတ်မီ ပရိုဂရမ်မင်း သင်ကြားရေး ပလက်ဖောင်း</p>
  <button class="btn">စတင်လေ့လာမည်</button>
</div>

<style>
/* CSS Styling */
.card {
  background: #1e293b;
  color: white;
  padding: 24px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.btn {
  background: #3b82f6;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
</style>
\`\`\`

ဖြည်းဖြည်းချင်း အတူတူလေ့ကျင့်သွားကြရအောင်ဗျာ။ အားတင်းထားပါ!`;
  }

  // 6. JavaScript & Web DOM
  if (q.includes("javascript") || q.includes("js") || q.includes("dom") || q.includes("array") || q.includes("object") || q.includes("const") || q.includes("let")) {
    return `### 💡 JavaScript အခြေခံ သဘောတရားများ

**JavaScript** သည် ဝဘ်ဆိုက်တစ်ခုကို အသက်ဝင်လှုပ်ရှားစေသော **ဦးနှောက်နှင့် အာရုံကြောစနစ်** ဖြစ်ပါတယ်ခင်ဗျာ။

#### 📌 Modern JavaScript Syntax:
\`\`\`javascript
// Variable ကြေညာခြင်း
const studentName = "Thuta";
let learningProgress = 85;

// Array (စာရင်း) နှင့် Object (အချက်အလက်အစုအဝေး)
const skills = ["HTML", "CSS", "JavaScript", "Python"];
const student = {
  name: studentName,
  level: "Intermediate",
  skills: skills
};

// Arrow Function
const calculateScore = (base, bonus) => base + bonus;

console.log(student);
console.log("စုစုပေါင်းရမှတ်:", calculateScore(learningProgress, 10));
\`\`\`

ဖြည်းဖြည်းချင်း အတူတူလေ့ကျင့်သွားကြရအောင်ဗျာ။ အားတင်းထားပါ!`;
  }

  // 7. Debugging & Error Handling
  if (q.includes("error") || q.includes("debug") || q.includes("bug") || q.includes("အမှား") || q.includes("syntaxerror") || q.includes("typeerror")) {
    return `### 🛠️ Kibo Smart Debugging Guide (အမှားရှာဖွေပြင်ဆင်နည်း)

ပရိုဂရမ်မင်းတွင် Error တက်ခြင်းသည် သင်ယူမှု၏ အရေးအကြီးဆုံး အဆင့်တစ်ခုဖြစ်ပါသည်ခင်ဗျာ။

#### 🔍 အဖြစ်များသော Errors များနှင့် ဖြေရှင်းနည်းများ:
1. **SyntaxError (သဒ္ဒါအမှား):** ကွင်းစကွင်းပိတ်မစုံခြင်း၊ \`:\` ကျန်ခဲ့ခြင်း သို့မဟုတ် စာလုံးပေါင်းမှားယွင်းခြင်းများကို စစ်ဆေးပါ။
2. **NameError / ReferenceError:** မကြေညာရသေးသော Variable သို့မဟုတ် Function နာမည်ကို ခေါ်သုံးထားခြင်း ရှိမရှိ စစ်ဆေးပါ။
3. **TypeError:** မတူညီသော Data type များကို ပေါင်းစပ်ရန် ကြိုးစားခြင်း (ဥပမာ- String စာသားနှင့် ကိန်းဂဏန်း ပေါင်းခြင်း)။
4. **IndentationError (Python):** ကုဒ်စာကြောင်းများ၏ ရှေ့အကွာအဝေး (Spaces) ညီညာမှု မရှိခြင်း။

သင်စမ်းသပ်နေသော ကုဒ် သို့မဟုတ် Error မက်ဆေ့ခ်ျကို အပြည့်အစုံ copy ကူးပြီး မေးမြန်းပေးပါက အသေးစိတ် ပြင်ဆင်ပေးပါမည်ခင်ဗျာ။`;
  }

  // 8. Lesson Context specific fallback
  if (currentLesson) {
    return `### 💡 ${currentLesson.title} ဆိုင်ရာ လမ်းညွှန်ချက်

မောင်မင်း လေ့လာနေသော **${currentLesson.title}** (${currentCourse?.title || "လက်ရှိသင်တန်း"}) နှင့် ပတ်သက်ပြီး Kibo မှ ကူညီပေးပါမည်ခင်ဗျာ။

#### 📘 သင်ခန်းစာ အနှစ်ချုပ်:
${currentLesson.whatIsIt || currentLesson.title}

${currentLesson.syntax ? `#### 💻 စံသတ်မှတ် Syntax:\n\`\`\`\n${currentLesson.syntax}\n\`\`\`\n` : ""}

ဒီသင်ခန်းစာပါ အကြောင်းအရာများ၊ ကုဒ်ဥပမာများ သို့မဟုတ် နားမလည်သေးသည့် အပိုင်းများကို စိတ်တိုင်းကျ မေးမြန်းနိုင်ပါတယ်ခင်ဗျာ။ ဖြည်းဖြည်းချင်း အတူတူလေ့ကျင့်သွားကြရအောင်ဗျာ!`;
  }

  // General default fallback response
  return `### 🤖 မင်္ဂလာပါခင်ဗျာ! Kibo AI Assistant ဖြစ်ပါတယ်။

သင်မေးမြန်းထားသော မေးခွန်း: **"${query.slice(0, 80)}"** နှင့် ပတ်သက်၍ အောက်ပါ အခြေခံအချက်များကို အကြံပြုလိုပါတယ်ခင်ဗျာ။

1. **ပရိုဂရမ်မင်း အယူအဆ (Concept):** မည်သည့် programming language မဆို Variable (သိုလှောင်မှု), Condition (ဆုံးဖြတ်မှု), Loop (ထပ်ခါလုပ်ဆောင်မှု) နှင့် Function (စုစည်းမှု) ဟူသော အခြေခံမဏ္ဍိုင် ၄ ခုပေါ်တွင် တည်ဆောက်ထားပါသည်။
2. **လက်တွေ့စမ်းသပ်မှု (Practice):** စာတွေ့ဖတ်ရုံသာမက ဘေးဘက်ရှိ Code Playground တွင် ကုဒ်များကို ကိုယ်တိုင်ရိုက်ထည့်ပြီး Run ကြည့်ရန် တိုက်တွန်းပါသည်ခင်ဗျာ။
3. **အသေးစိတ် မေးမြန်းခြင်း:** သိလိုသော coding syntax၊ error logs သို့မဟုတ် ဘာသာရပ်ဆိုင်ရာ အကြောင်းအရာကို တိကျစွာ ရေးသားမေးမြန်းပေးပါခင်ဗျာ။

ဖြည်းဖြည်းချင်း အတူတူလေ့ကျင့်သွားကြရအောင်ဗျာ။ အားတင်းထားပါ!`;
}
