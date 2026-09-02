import { AssessmentQuestion } from "../types";

export const DEFAULT_QUESTIONS: AssessmentQuestion[] = [
  // ==========================================
  // 1. PYTHON BASICS - VARIABLES (Lesson Quiz)
  // ==========================================
  {
    id: "q-py-var-mc-1",
    type: "mc",
    question: "Python တွင် Variable (ကိန်းရှင်) အမည်ပေးရာ၌ အောက်ပါတို့အနက် မည်သည်မှာ မှန်ကန်သော အမည်ပေးစနစ် ဖြစ်သနည်း။",
    options: ["1_user_name", "user-name", "user_name", "user name"],
    correctOptionIndex: 2,
    explanation: "Python တွင် variable အမည်များကို စာလုံးအသေး (lowercase) နှင့် မြေအောက်မျဉ်း (underscore '_') ကိုသာ သုံးပြီး စနစ်တကျ ရေးသားရပါမည်။ ကိန်းဂဏန်းဖြင့် စတင်ခွင့်မရှိပါ၊ hyphen (-) နှင့် space (ကွက်လပ်) များ သုံးခွင့်မရှိပါ။",
    tips: [
      "Variable name များကို အဓိပ္ပာယ်ရှိစွာ ပေးပါ။ (ဥပမာ: x အစား age သို့မဟုတ် score စသည်ဖြင့် ပေးပါ)",
      "Snake Case ပုံစံကို ဦးစားပေးသုံးစွဲပါ။"
    ],
    referenceLesson: "python-basics-variables"
  },
  {
    id: "q-py-var-ma-1",
    type: "ma",
    question: "အောက်ပါတို့အနက် မည်သည့် Syntax များသည် Python တွင် ကိန်းရှင် (Variable) ကြေညာရန် မှန်ကန်သော ပုံစံများ ဖြစ်သနည်း။ (အဖြေတစ်ခုထက်မက မှန်ကန်နိုင်ပါသည်)",
    options: ["x = 5", "int x = 5", "x, y = 5, 10", "declare x = 5"],
    correctOptionIndices: [0, 1, 2], // Python supports both simple assignment, type annotations in Python 3, and multiple assignments
    explanation: "Python တွင် x = 5 ကဲ့သို့ တိုက်ရိုက်ကြေညာခြင်းအပြင် x, y = 5, 10 ကဲ့သို့ တစ်ကြောင်းတည်းဖြင့် variable အများကြီး ကြေညာခြင်းကိုလည်း ပံ့ပိုးပေးပါသည်။ ထို့ပြင် Type Annotations (ဥပမာ: x: int = 5) ပုံစံကိုလည်း Python 3 တွင် ပံ့ပိုးပေးထားပါသည်။ declare ဟူသော စာလုံး သုံးရန် မလိုပါ။",
    tips: [
      "တစ်ကြောင်းတည်းဖြင့် variable အများကြီး ကြေညာနိုင်ခြင်း (Multiple assignment) က ကုဒ်ကို ပိုမိုတိုတောင်းစေသည်။",
      "Python သည် Dynamic Typing ကို အသုံးပြုသောကြောင့် explicit ဖြစ်သော data type ကြေညာပေးရန် မလိုပါ။"
    ],
    referenceLesson: "python-basics-variables"
  },
  {
    id: "q-py-var-tf-1",
    type: "tf",
    question: "Python တွင် Variable တစ်ခုအား တန်ဖိုးတစ်ခုခု သတ်မှတ်မပေးဘဲ ကြိုတင်ကြေညာရုံ သက်သက် (ဥပမာ: x) ဖြင့် အသုံးပြုနိုင်သည် ဟူသော ဖော်ပြချက်သည် မှန်ပါသလား။",
    options: ["မှန်ကန်သည် (True)", "မှားယွင်းသည် (False)"],
    correctOptionIndex: 1,
    explanation: "Python တွင် variable တစ်ခုကို တန်ဖိုး (Value) သတ်မှတ်ပေးခြင်း (Assignment) မပြုလုပ်ဘဲ သုံးစွဲခွင့်မရှိပါ။ မဟုတ်ပါက 'NameError' ဖြစ်ပေါ်မည် ဖြစ်ပါသည်။",
    tips: [
      "ကုဒ်ထဲတွင် variable မသုံးမီ ၎င်းအား အနည်းဆုံး တန်ဖိုးတစ်ခုခု (ဥပမာ None, 0, သို့မဟုတ် empty string) သတ်မှတ်ပေးထားပါ။"
    ],
    referenceLesson: "python-basics-variables"
  },
  {
    id: "q-py-var-fitb-1",
    type: "fitb",
    question: "Python တွင် screen ပေါ်သို့ စာသား သို့မဟုတ် တန်ဖိုးများ ပြသရန်အတွက် အသုံးပြုရသော Built-in Function အမည်မှာ ဘာဖြစ်သနည်း။ (စာလုံးအသေးဖြင့်သာ ရေးပါ)",
    correctAnswer: "print",
    explanation: "print() function သည် Python ၏ အသုံးအများဆုံး feedback mechanism ဖြစ်ပြီး ကွန်ဆိုးလ်ဖန်ပြင်ပေါ်တွင် အချက်အလက်များ ပြသရန် သုံးပါသည်။",
    tips: [
      "print function ထဲတွင် single quote (') သို့မဟုတ် double quote (\") ဖြင့် စာသားများကို ရေးသားနိုင်ပါသည်။"
    ],
    referenceLesson: "python-basics-variables"
  },
  {
    id: "q-py-var-prediction-1",
    type: "prediction",
    codeSnippet: `a = 17
b = 5
print(a % b)`,
    question: "အထက်ဖော်ပြပါ Python ကုဒ်၏ Output အနေဖြင့် screen ပေါ်တွင် မည်သည့်ကိန်းဂဏန်း ထွက်ပေါ်လာမည်နည်း။",
    correctAnswer: "2",
    explanation: "% (Modulo Operator) သည် စား၍ကျန်သောအကြွင်း (Remainder) ကို ရှာဖွေပေးခြင်း ဖြစ်ပါသည်။ ၁၇ ကို ၅ နှင့်စားပါက အကြွင်း ၂ ကျန်သောကြောင့် အဖြေမှာ ၂ ဖြစ်သည်။",
    tips: [
      "Modulo operator % ကို ကိန်းပြည့်တစ်ခု စုံသလား၊ မသလား (Even or Odd) စစ်ဆေးရာတွင် အများဆုံး သုံးပါသည်။ (ဥပမာ: x % 2 == 0)"
    ],
    referenceLesson: "python-basics-variables"
  },
  {
    id: "q-py-var-find-error-1",
    type: "find_error",
    codeSnippet: `user-age = 25
print(user-age)`,
    question: "အထက်ပါကုဒ်တွင် Syntax Error တစ်ခု ဖြစ်ပေါ်နေပါသည်။ အမှားကင်းစင်သော မှန်ကန်သည့် ကုဒ်ဖြစ်သွားရန် ပြင်ဆင်ရမည့် Variable အမည်ကို ရေးသားပေးပါ။",
    correctAnswer: "user_age",
    explanation: "Python variable အမည်များတွင် hyphen (-) အနုတ်လက္ခဏာ သုံးခွင့်မရှိပါ။ အစားထိုးပြီး underscore (_) သုံးရမည် ဖြစ်သောကြောင့် user_age ဖြစ်ရပါမည်။",
    tips: [
      "Syntax errors များသည် run-time သို့မရောက်မီ Python interpreter မှ ချက်ချင်း ရှာဖွေဖော်ထုတ်ပေးတတ်ပါသည်။"
    ],
    referenceLesson: "python-basics-variables"
  },

  // ==========================================
  // 2. PYTHON BASICS - CONDITIONS (Lesson Quiz)
  // ==========================================
  {
    id: "q-py-cond-mc-1",
    type: "mc",
    question: "Python တွင် if block တစ်ခုအတွင်းရှိ ကုဒ်များကို စတင်ရန်အတွက် အောက်ပါသင်္ကေတများအနက် မည်သည်ကို သုံးရသနည်း။",
    options: ["; (Semicolon)", "{ } (Curly braces)", ": (Colon)", "then (Keyword)"],
    correctOptionIndex: 2,
    explanation: "Python တွင် flow control statement (if, for, while, def) များ ရေးသားရာတွင် block ၏ အစကို သတ်မှတ်ရန် colon (:) သင်္ကေတကို မဖြစ်မနေ အသုံးပြုရပါမည်။",
    tips: [
      "Colon သုံးပြီးပါက နောက်တစ်ကြောင်းတွင် Indentation (၄ ချက်ခေါက်ခြင်း သို့မဟုတ် Tab တစ်ချက်) ခြားရန် မမေ့ပါနှင့်။"
    ],
    referenceLesson: "python-basics-conditions"
  },
  {
    id: "q-py-cond-tf-1",
    type: "tf",
    question: "Python တွင် Multiple Conditions (အခြေအနေများစွာ) ကို တစ်ခုပြီးတစ်ခု စစ်ဆေးရန်အတွက် 'elif' keyword အစား 'else if' keyword ကို အသုံးပြုရသည် ဟူသော ဖော်ပြချက်သည် မှန်ပါသလား။",
    options: ["မှန်ကန်သည် (True)", "မှားယွင်းသည် (False)"],
    correctOptionIndex: 1,
    explanation: "မှားပါသည်။ Python တွင် 'else if' ဟူ၍ မရှိပါ၊ ၎င်းအစား ပိုမိုတိုတောင်းသော 'elif' keyword ကိုသာ အသုံးပြုရပါသည်။",
    tips: [
      "အခြေအနေများစွာကို စစ်ဆေးလိုပါက sequence အတိုင်း if -> elif -> else ပုံစံဖြင့် စနစ်တကျ သုံးစွဲပါ။"
    ],
    referenceLesson: "python-basics-conditions"
  },
  {
    id: "q-py-cond-prediction-1",
    type: "prediction",
    codeSnippet: `score = 75
if score >= 80:
    print("Distinction")
elif score >= 50:
    print("Pass")
else:
    print("Fail")`,
    question: "အထက်ဖော်ပြပါ Python ကုဒ်ကို run ပါက ကွန်ဆိုးလ်တွင် မည်သည့် စာသား ထွက်ပေါ်လာမည်နည်း။",
    correctAnswer: "Pass",
    explanation: "score တန်ဖိုးမှာ ၇၅ ဖြစ်ပြီး score >= 80 (75 >= 80) သည် False ဖြစ်သဖြင့် ဒုတိယအခြေအနေ score >= 50 (75 >= 50) သို့ ကူးပြောင်းကာ True ဖြစ်သွားသောကြောင့် Pass ဟူသော စာသားကို print ထုတ်ပေးပါသည်။",
    tips: [
      "Condition block များကို စစ်ဆေးရာတွင် အပေါ်မှအောက်သို့ တိုက်ရိုက် ဦးစားပေးလုပ်ဆောင်သွားခြင်း ဖြစ်သည်။"
    ],
    referenceLesson: "python-basics-conditions"
  },

  // ==========================================
  // 3. PYTHON BASICS - MODULE ASSESSMENT (Module 1)
  // ==========================================
  {
    id: "q-py-mod1-ma-1",
    type: "ma",
    question: "Python logic ရေးသားရာတွင် Comparison Operators (နှိုင်းယှဉ်မှုသင်္ကေတ) များဖြစ်သော မည်သည်တို့မှာ မှန်ကန်သနည်း။ (အဖြေတစ်ခုထက်မက မှန်ကန်နိုင်ပါသည်)",
    options: ["== (Equal to)", "!= (Not equal to)", "= (Assignment)", ">= (Greater than or equal to)"],
    correctOptionIndices: [0, 1, 3],
    explanation: "တန်ဖိုးများ တူညီမှုရှိမရှိ စစ်ဆေးရန် == ၊ မတူညီပါက != ၊ နှင့် ကြီးသည် သို့မဟုတ် တူသည်ကို စစ်ဆေးရန် >= တို့ကို သုံးသည်။ = သည် တန်ဖိုးသတ်မှတ်ပေးသော Assignment operator သာဖြစ်ပြီး နှိုင်းယှဉ်မှု operators မဟုတ်ပါ။",
    tips: [
      "တန်ဖိုးစစ်ဆေးရန် == ကို သုံးပါ။ = ကို တန်ဖိုးသတ်မှတ်ရန်သာ သုံးပါ။ ဤအမှားမှာ အတွေ့အကြုံမရှိသေးသူများ အလွန်မှားတတ်သောအမှား ဖြစ်သည်။"
    ],
    referenceLesson: "python-basics-conditions"
  },
  {
    id: "q-py-mod1-coding-1",
    type: "coding",
    codeSnippet: `num = 14
# အကယ်၍ num သည် စုံကိန်းဖြစ်ပါက "Even" ဟု print ထုတ်မည့် ကုဒ်ကို ရေးပါ
if num % 2 == 0:
    `,
    question: "အထက်ပါ သတ်မှတ်ချက်အတိုင်း input variable num သည် စုံကိန်းဖြစ်ခဲ့လျှင် 'Even' ဟု console တွင် စနစ်တကျ print ထုတ်ပေးမည့် logic ကုဒ်အပြည့်အစုံ ရေးပေးပါ။",
    correctAnswer: "print(\"Even\")",
    explanation: "if num % 2 == 0 အခြေအနေမှန်ကန်ပါက print(\"Even\") ကုဒ်ကို indentation ခြားပြီး ရေးသားရပါမည်။",
    tips: [
      "Indentation သည် Python ၏ အသက်သွေးကြော ဖြစ်သည်။ block ကုဒ်များကို indentation ခြားရန် အမြဲအလေးထားပါ။"
    ],
    referenceLesson: "python-basics-conditions"
  },

  // ==========================================
  // 4. HTML BASICS - INTRO (Lesson Quiz)
  // ==========================================
  {
    id: "q-html-mc-1",
    type: "mc",
    question: "HTML ၏ အရှည်ကောက် အဓိပ္ပာယ်အပြည့်အစုံမှာ မည်သည်ဖြစ်သနည်း။",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyperlink Text Management Language",
      "Home Tool Markup Language"
    ],
    correctOptionIndex: 0,
    explanation: "HTML ၏ အရှည်ကောက်မှာ Hyper Text Markup Language ဖြစ်ပြီး ၎င်းသည် website များ၏ အခြေခံ အရိုးစုဖွဲ့စည်းပုံ (Structure) ကို တည်ဆောက်ရန် သုံးသော standard markup ဘာသာစကား ဖြစ်သည်။",
    tips: [
      "HTML သည် programming language မဟုတ်ပါ၊ website အရိုးစုကို ဖော်ပြသည့် Markup language သာ ဖြစ်သည်။"
    ],
    referenceLesson: "html-1"
  },
  {
    id: "q-html-tf-1",
    type: "tf",
    question: "HTML element တိုင်းတွင် စတင်သော tag (opening tag) နှင့် ပိတ်သော tag (closing tag) များ မဖြစ်မနေ အစုံလိုက် ပါဝင်ရမည်ဖြစ်ပြီး ပိတ်သော tag မပါဘဲ သုံးခွင့်မရှိပါ ဟူသော ဖော်ပြချက်သည် မှန်ပါသလား။",
    options: ["မှန်ကန်သည် (True)", "မှားယွင်းသည် (False)"],
    correctOptionIndex: 1,
    explanation: "မှားပါသည်။ HTML တွင် <img>, <br>, <input>, <hr> ကဲ့သို့သော self-closing (သို့မဟုတ် empty tags) များသည် ပိတ်ရန် tag မလိုအပ်ပါ။ ကြွင်းကျန်သော tags များသာ closing tag (ဥပမာ: </p>) လိုအပ်ပါသည်။",
    tips: [
      "Self-closing tags များကို သီးသန့် အလွတ်မှတ်သားထားခြင်းက HTML ရေးသားရာတွင် မြန်ဆန်စေပါသည်။"
    ],
    referenceLesson: "html-2"
  },
  {
    id: "q-html-find-error-1",
    type: "find_error",
    codeSnippet: `<a href="https://google.com">Google ကိုသွားရန်<a>`,
    question: "အထက်ပါ link ချိတ်ဆက်ထားသော HTML ကုဒ်တွင် closing tag ရေးသားပုံ လွဲမှားနေပါသည်။ အမှားကင်းစင်သွားစေရန် မှန်ကန်သော closing tag သက်သက်ကိုသာ ရေးသားပေးပါ။",
    correctAnswer: "</a>",
    explanation: "HTML တွင် closing tag များကို slash '/' သင်္ကေတကို tag အမည်၏ ရှေ့တွင် ထည့်သွင်းရေးသားရပါမည် (ဥပမာ: </a>)။ အထက်ပါ ကုဒ်တွင် slash ကျန်ခဲ့သဖြင့် မှားယွင်းနေခြင်း ဖြစ်သည်။",
    tips: [
      "Closing tag များတွင် slash (/) သင်္ကေတ အမြဲထည့်သွင်းရန် သတိပြုပါ။"
    ],
    referenceLesson: "html-2"
  },

  // ==========================================
  // 5. GIT BASICS - INTRO (Lesson Quiz)
  // ==========================================
  {
    id: "q-git-mc-1",
    type: "mc",
    question: "Git တွင် သင့်ကွန်ပျူတာပေါ်ရှိ Project directory အသစ်တစ်ခုအား Git Repository အဖြစ် စတင်သတ်မှတ် (Initialize) ရန် မည်သည့် command ကို အသုံးပြုရသနည်း။",
    options: ["git start", "git init", "git create", "git new"],
    correctOptionIndex: 1,
    explanation: "'git init' command သည် directory အဟောင်း သို့မဟုတ် အသစ်ကို Git repository (.git file setup) အဖြစ် ပြောင်းလဲသတ်မှတ်ရန် သုံးသော command ဖြစ်သည်။",
    tips: [
      "git init ကို project တစ်ခုလျှင် တစ်ကြိမ်သာ run ရန် လိုအပ်ပါသည်။"
    ],
    referenceLesson: "git-basics-intro"
  },
  {
    id: "q-git-fitb-1",
    type: "fitb",
    question: "Git တွင် ပြောင်းလဲပြင်ဆင်ထားသော file များကို commit မလုပ်မီ ယာယီသိမ်းဆည်းရာနေရာ (Staging Area) သို့ ထည့်သွင်းရန် အသုံးပြုရသော command မှာ 'git _______' ဖြစ်သည်။",
    correctAnswer: "add",
    explanation: "git add command သည် directory ထဲရှိ ပြင်ဆင်မှုများကို staging area သို့ တင်ပေးပြီး commit လုပ်ရန် ပြင်ဆင်ပေးသည့် command ဖြစ်သည်။",
    tips: [
      "File အားလုံးကို တစ်ပြိုင်နက်တင်လိုပါက 'git add .' ဟု သုံးစွဲနိုင်ပါသည်။"
    ],
    referenceLesson: "git-basics-intro"
  }
];

export function getQuestionsForAssessment(assessmentId: string): AssessmentQuestion[] {
  // Return default or filtered questions
  const matched = DEFAULT_QUESTIONS.filter(
    (q) => q.referenceLesson === assessmentId || q.id.includes(assessmentId)
  );
  if (matched.length > 0) return matched;

  // Generic fallback generator for quizzes if not found specifically
  if (assessmentId.includes("python")) {
    return DEFAULT_QUESTIONS.filter((q) => q.id.includes("py"));
  } else if (assessmentId.includes("html") || assessmentId.includes("web")) {
    return DEFAULT_QUESTIONS.filter((q) => q.id.includes("html"));
  } else if (assessmentId.includes("git")) {
    return DEFAULT_QUESTIONS.filter((q) => q.id.includes("git"));
  }

  // Return first 4 as absolute fallback
  return DEFAULT_QUESTIONS.slice(0, 4);
}
