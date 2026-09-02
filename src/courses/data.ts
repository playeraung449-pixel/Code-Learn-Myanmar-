import { Course } from "../types";
import { lessons1 } from "./htmlLessons1";
import { lessons2 } from "./htmlLessons2";
import { lessons3 } from "./htmlLessons3";

export const COURSES: Course[] = [
  {
    id: "prog-basics-python",
    title: "Programming Basics with Python",
    slug: "programming-basics-python",
    description: "ကွန်ပြူတာပရိုဂရမ်မင်းအခြေခံသဘောတရားများကို Python ဘာသာစကားဖြင့် အစမှစတင်ပြီး နားလည်လွယ်ဆုံး လေ့လာပါ။",
    category: "basics",
    lessonCount: 2,
    difficulty: "Level 1: Beginner",
    estimatedTime: "4 Hours",
    projectCount: 1,
    prerequisites: [
      "ကွန်ပျူတာ အခြေခံ အသုံးပြုတတ်ရပါမည်။ (Basic computer literacy)"
    ],
    learningOutcomes: [
      "Python အခြေခံ Syntax နှင့် ကိန်းရှင်များ (Variables) ကို နားလည်သဘောပေါက်ခြင်း",
      "If-Else Conditions များကို အသုံးပြု၍ ဆုံးဖြတ်ချက်ချသည့် ကုဒ်များ ရေးသားနိုင်ခြင်း",
      "လက်တွေ့ပရောဂျက်ငယ်များကို ကိုယ်တိုင် ဖန်တီးတည်ဆောက်နိုင်ခြင်း"
    ],
    certificateAvailable: true,
    introduction: "ဤသင်တန်းသည် ပရိုဂရမ်မင်းလောကထဲသို့ စတင်ဝင်ရောက်မည့် သူများအတွက် ရည်ရွယ်ပြီး၊ ကမ္ဘာ့အသုံးအများဆုံးနှင့် သင်ယူရလွယ်ကူဆုံး Python ဘာသာစကားဖြင့် စနစ်တကျ မိတ်ဆက်ပေးမည်ဖြစ်ပါသည်။",
    roadmap: [
      { step: "၁", title: "Variables (ကိန်းရှင်များ)", description: "ဒေတာများကို သိမ်းဆည်းနည်းနှင့် စီမံနည်း" },
      { step: "၂", title: "Conditions (အခြေအနေများ)", description: "If-Else သုံး၍ ဆုံးဖြတ်ချက်ချနည်း" },
      { step: "၃", title: "Final Project & Certification", description: "ကျန်းမာရေးစစ်ဆေးသည့် စမတ်စနစ် ဖန်တီးပြီး လက်မှတ်ရယူခြင်း" }
    ],
    quizzesCount: 2,
    assignmentsCount: 2,
    finalProject: {
      title: "Health & Fitness Care System (ကျန်းမာရေးစောင့်ရှောက်မှုစနစ်)",
      description: "အသုံးပြုသူ၏ ကိုယ်အလေးချိန်၊ အမြင့်နှင့် အသက်တို့ကို variable များဖြင့် သိမ်းဆည်းပြီး၊ BMI ကို တွက်ချက်ကာ အခြေအနေအလိုက် အကြံပြုချက်များကို အလိုအလျောက် သတ်မှတ်ပေးသော ပရိုဂရမ်တစ်ခု တည်ဆောက်ပါ။",
      guide: [
        "အဆင့် ၁ - အလေးချိန်၊ အမြင့်၊ အသက်နှင့် နာမည်တို့ကို ကိန်းရှင်များအဖြစ် ကြေညာပါ။",
        "အဆင့် ၂ - BMI ပုံသေနည်း (weight / height^2) ကို အသုံးပြု၍ တွက်ချက်ပါ။",
        "အဆင့် ၃ - If-Elif-Else ကို အသုံးပြု၍ ကျန်းမာရေးအခြေအနေနှင့် သင့်လျော်သော အကြံပြုချက်များကို ပြသပါ။"
      ],
      startingCode: `name = "Aung Aung"
weight = 75
height = 1.8

# ဤနေရာတွင် BMI ပုံသေနည်းအတိုင်း တွက်ချက်ပြီး ရလဒ်နှင့် အကြံပြုချက်များကို print ထုတ်ပါ`,
      solutionCode: `name = "Aung Aung"
weight = 75
height = 1.8

bmi = weight / (height ** 2)
print("Your BMI: " + str(round(bmi, 2)))

if bmi < 18.5:
    print("ကျန်းမာရေးအကြံပြုချက်: ကိုယ်အလေးချိန် နည်းလွန်းသဖြင့် အာဟာရပြည့်ဝအောင် စားသုံးပါ")
elif bmi >= 18.5 and bmi <= 24.9:
    print("ကျန်းမာရေးအကြံပြုချက်: ကျန်းမာသော ပုံမှန်ကိုယ်အလေးချိန် ဖြစ်ပါသည်")
else:
    print("ကျန်းမာရေးအကြံပြုချက်: ကိုယ်အလေးချိန် များလွန်းသဖြင့် လေ့ကျင့်ခန်းပြုလုပ်ရန် အကြံပြုပါသည်")`
    },
    courseSummary: "ဂုဏ်ယူပါတယ်! ဤသင်တန်းကို ပြီးမြောက်ခြင်းဖြင့် သင်သည် ပရိုဂရမ်မင်း၏ အခြေခံအကျဆုံးနှင့် အရေးကြီးဆုံး သဘောတရားများဖြစ်သော ကိန်းရှင်များ၊ If-Else Logic များကို ကောင်းစွာ နားလည်သဘောပေါက်သွားပြီ ဖြစ်ပြီး နောက်တစ်ဆင့်တက်လှမ်းရန် အဆင်သင့် ဖြစ်နေပါပြီ။",
    lessons: [
      {
        id: "python-basics-variables",
        title: "Variables (ကိန်းရှင်များ) အခြေခံ",
        slug: "python-variables",
        duration: "30 mins",
        markdownPath: "/content/python/001-variables.md",
        telegramChannelType: "free",
        telegramDirectUrl: "https://t.me/code_Learn_myanmar/101",
        telegramPostId: "101",
        downloadableZipUrl: "https://t.me/code_Learn_myanmar/101",
        whatIsIt: "Variables (ကိန်းရှင်များ) ဆိုတာ ဒေတာတွေကို ခေတ္တသိမ်းဆည်းထားပေးတဲ့ memory ဘူးလေးတွေ ဖြစ်ပါတယ်။",
        whyImportant: "ပရိုဂရမ်တစ်ခုလုံးမှာ ဒေတာတွေကို သိမ်းဆည်းဖို့၊ တွက်ချက်ဖို့နဲ့ ပြန်လည်အသုံးပြုဖို့အတွက် ကိန်းရှင်တွေက အရေးကြီးဆုံးဖြစ်ပါတယ်။",
        realWorldUsage: "ဥပမာအားဖြင့် သင့်ရဲ့ Facebook username သို့မဟုတ် Game ရဲ့ High score ကို သိမ်းဆည်းတဲ့နေရာမှာ သုံးပါတယ်။",
        syntax: `# Python Variable Assignment\nvariable_name = value`,
        examples: [
          `# String, Integer, Float ကိန်းရှင်များ ကြေညာခြင်း\nname = "Aung Aung"\nage = 20\ngpa = 3.8`
        ],
        commonMistakes: [
          {
            mistake: "1name = 'Aung Aung'",
            correction: "name1 = 'Aung Aung'",
            explanation: "Variable နာမည်များကို ကိန်းဂဏန်းဖြင့် စတင်ခွင့်မရှိပါ။"
          },
          {
            mistake: "my-age = 20",
            correction: "my_age = 20",
            explanation: "Variable နာမည်များတွင် hyphen (-) သုံးခွင့်မရှိပါ၊ underscore (_) သာ သုံးရပါမည်။"
          }
        ],
        bestPractices: [
          "Variable နာမည်တွေကို အဓိပ္ပာယ်ရှိရှိ ပေးပါ။ ဥပမာ - x = 20 အစား user_age = 20 ဟု ပေးပါ။",
          "Python တွင် variable များကို သေးငယ်သောစာလုံး (lowercase) နှင့် မြေအောက်မျဉ်း (snake_case) ပုံစံဖြင့် ရေးသားခြင်းကို ပိုမိုဦးစားပေးပါ။",
          "မလိုအပ်ဘဲ variable နာမည်ရှည်လွန်းခြင်းကို ရှောင်ကြဉ်ပါ။"
        ],
        miniExercise: {
          id: "ex-variables",
          instruction: "အသုံးပြုသူရဲ့ အသက် (age) ကို ၂၅ (25) ဆိုပြီး variable တစ်ခုအဖြစ် ကြေညာပြီး print() ထုတ်ပြပါ။",
          codeTemplate: `# variable တစ်ခု ကြေညာပြီး value ထည့်ပါ\nage = \n# value ကို ပြန်လည် print ထုတ်ပါ\nprint(age)`,
          expectedOutput: "25",
          hints: ["age variable ထဲကို integer တန်ဖိုး ၂၅ ထည့်ပေးရပါမယ်။", "age = 25 ဟု ရေးပါ။"]
        },
        quiz: [
          {
            id: "q-var-1",
            question: "အောက်ပါတို့အနက် မည်သည့် Variable Name သည် မှန်ကန်စွာ ရေးသားထားသနည်း။",
            options: [
              "1st_user = 'Min Min'",
              "user-name = 'Min Min'",
              "user_name = 'Min Min'",
              "class = 'Min Min'"
            ],
            correctOptionIndex: 2,
            explanation: "Python တွင် variable name များကို ဂဏန်းဖြင့်မစရ၊ hyphen (-) မသုံးရ၊ class ကဲ့သို့ သီးသန့် reserved keywords များကို မသုံးရပါ။ ထို့ကြောင့် user_name သည်သာ အမှန်ကန်ဆုံးဖြစ်ပါသည်။"
          }
        ],
        miniProject: {
          title: "Profile Card Generator (ကိုယ်ရေးအကျဉ်း ဖန်တီးသူ)",
          description: "သင့်အမည်၊ အသက်နှင့် ဝါသနာတို့ကို variable များအဖြစ် ကြေညာပြီး text profile ကတ်တစ်ခုအဖြစ် လှပစွာ print ထုတ်ပြပါ။",
          guide: [
            "name, age, hobby variable များကို ကြေညာပါ။",
            "print() ဖြင့် ပြန်လည်ထုတ်ပြပါ။"
          ],
          startingCode: `name = "Mya Mya"
age = 22
hobby = "Reading"

# ဤနေရာတွင် print() သုံးပြီး ထုတ်ပြပါ`
        }
      },
      {
        id: "python-basics-conditions",
        title: "Conditions (အခြေအနေများ) နှင့် ဆုံးဖြတ်ချက်ချခြင်း",
        slug: "python-conditions",
        duration: "30 mins",
        markdownPath: "/content/python/002-conditions.md",
        telegramChannelType: "free",
        telegramDirectUrl: "https://t.me/code_Learn_myanmar/102",
        telegramPostId: "102",
        downloadableZipUrl: "https://t.me/code_Learn_myanmar/102",
        whatIsIt: "Conditions ဆိုတာ ပရိုဂရမ်တစ်ခုကနေ အခြေအနေအမျိုးမျိုးအပေါ် မူတည်ပြီး ဆုံးဖြတ်ချက်ချနိုင်အောင် ပြုလုပ်ပေးတဲ့ နည်းလမ်းဖြစ်ပါတယ်။ ဥပမာ - မိုးရွာရင် ထီးယူသွားမယ်၊ မရွာရင် ထီးမယူဘူး စသည်ဖြင့် ဆုံးဖြတ်ချက်ချခြင်း ဖြစ်ပါတယ်။",
        whyImportant: "ကုဒ်တွေကို အခြေအနေအလိုက် လမ်းကြောင်းခွဲပြီး ပိုမိုစမတ်ကျတဲ့ လုပ်ဆောင်ချက်တွေ ရေးသားနိုင်ဖို့ if-else conditions တွေက မရှိမဖြစ် လိုအပ်ပါတယ်။",
        realWorldUsage: "Facebook သို့ ဝင်ရောက်သည့်အခါ password မှန်ကန်လျှင် ဝင်ခွင့်ပေးပြီး၊ မှားယွင်းလျှင် error ပြသသည့်နေရာတွင် နောက်ကွယ်မှ if-else logic ကို အသုံးပြုထားခြင်း ဖြစ်ပါတယ်။",
        syntax: `# Python If-Else Syntax
if condition:
    # condition မှန်ကန်လျှင် လုပ်ဆောင်မည့် ကုဒ်
else:
    # condition မှားယွင်းလျှင် လုပ်ဆောင်မည့် ကုဒ်`,
        examples: [
          `# Basic If-Else
score = 80
if score >= 50:
    print("Pass")
else:
    print("Fail")`,
          `# If-Elif-Else
score = 85
if score >= 80:
    print("Grade A")
elif score >= 70:
    print("Grade B")
else:
    print("Grade C")`
        ],
        commonMistakes: [
          {
            mistake: "if x = 5:\n    print('Five')",
            correction: "if x == 5:\n    print('Five')",
            explanation: "တန်ဖိုး နှိုင်းယှဉ်ရာတွင် equal operator အဖြစ် double equals (==) ကို အသုံးပြုရပါမည်။"
          },
          {
            mistake: "if score >= 50\n    print('Pass')",
            correction: "if score >= 50:\n    print('Pass')",
            explanation: "Python if သို့မဟုတ် else ၏ အဆုံးတွင် colon (:) ထည့်ရန် မဖြစ်မနေ လိုအပ်ပါသည်။"
          }
        ],
        bestPractices: [
          "ကုဒ်တန်းညှိခြင်း (Indentation) ကို တသမတ်တည်းဖြစ်အောင် ၄ ကွက် (4 Spaces) သို့မဟုတ် Tab ၁ ခုကိုသာ စနစ်တကျ သုံးပါ။",
          "ရှင်းလင်းလွယ်ကူသော logic များကိုသာ ဦးစားပေးသုံးပါ။ ရှုပ်ထွေးလွန်းသော Nested Conditions (တစ်ခုထဲတွင် ထပ်ဆင့်ဝင်ခြင်း) များကို တတ်နိုင်သမျှ ရှောင်ကြဉ်ပါ။"
        ],
        miniExercise: {
          id: "ex-conditions",
          instruction: "temperature (အပူချိန်) ၃၅ ထက်ကျော်ရင် 'Hot' လို့ ပြပြီး၊ မကျော်ရင် 'Normal' လို့ ပြတဲ့ logic ကို ရေးပါ။",
          codeTemplate: `temp = 38
if temp > 35:
    print("Hot")
else:
    print("Normal")`,
          expectedOutput: "Hot",
          hints: ["temp တန်ဖိုးက ၃၈ ဖြစ်တဲ့အတွက် condition temp > 35 က မှန်ကန်ပြီး 'Hot' ကို ပြသရမှာ ဖြစ်ပါတယ်။"]
        },
        quiz: [
          {
            id: "q-cond-1",
            question: "Python တွင် nested blocks များ သို့မဟုတ် code blocks များကို မည်သို့ သတ်မှတ်သနည်း။",
            options: [
              "Curly brackets {} သုံးခြင်းဖြင့်",
              "Indentation (ဘယ်ဘက်ကွက်လပ်ချန်ခြင်း) သုံးခြင်းဖြင့်",
              "Semicolon ; သုံးခြင်းဖြင့်",
              "Parentheses () သုံးခြင်းဖြင့်"
            ],
            correctOptionIndex: 1,
            explanation: "Python တွင် အခြားဘာသာစကားများကဲ့သို့ curly brackets {} မသုံးဘဲ ကုဒ်တန်းညှိခြင်း (Indentation) ဖြင့် block များကို စနစ်တကျ ခွဲခြားပါသည်။"
          }
        ],
        miniProject: {
          title: "Smart Gate System (စမတ်တံခါးစနစ်)",
          description: "အသုံးပြုသူထည့်သွင်းလိုက်သော လက်မှတ်ကုဒ်သည် 'OPEN123' ဖြစ်လျှင် တံခါးဖွင့်ပေးပြီး၊ မဟုတ်လျှင် 'ငြင်းပယ်သည်' ဟု ပြသပေးသည့် စနစ်ကို ရေးသားပါ။",
          guide: [
            "ticket_code variable ကို ကြေညာပါ။",
            "if logic ကို သုံးပြီး တန်ဖိုးကို နှိုင်းယှဉ်ပါ။"
          ],
          startingCode: `ticket_code = "OPEN123"

# ဤနေရာတွင် ကုဒ်ရေးသားပါ
if ticket_code == "OPEN123":
    print("ACCESS GRANTED - WELCOME!")
else:
    print("ACCESS DENIED - INVALID TICKET!")`
        }
      }
    ]
  },
  {
    id: "web-dev-html",
    title: "Web Development: HTML5 & CSS3 Essentials",
    slug: "web-dev-html",
    description: "ကမ္ဘာ့အသုံးအများဆုံး နည်းပညာဖြစ်တဲ့ ဝက်ဘ်ဆိုက်တည်ဆောက်ခြင်းကို HTML နှင့် CSS သုံးပြီး ကိုယ်တိုင်ရေးသားဖန်တီးနိုင်အောင် သင်ယူပါ။",
    category: "web",
    lessonCount: lessons1.length + lessons2.length + lessons3.length,
    difficulty: "Level 1: Beginner",
    estimatedTime: "20-30 Hours",
    projectCount: 10,
    prerequisites: [
      "ကွန်ပျူတာ အခြေခံ အသုံးပြုတတ်ခြင်း သို့မဟုတ် ပရိုဂရမ်မင်း အခြေခံ သဘောတရားများကို နားလည်ထားခြင်း။"
    ],
    learningOutcomes: [
      "HTML5 ၏ အခြေခံ တည်ဆောက်ပုံ tags များကို နားလည်ခြင်း",
      "စာမျက်နှာများကို ခေါင်းစဉ်များ၊ စာပိုဒ်များ၊ ပုံများနှင့် လင့်ခ်များဖြင့် စနစ်တကျ တည်ဆောက်ခြင်း",
      "ဝက်ဘ်ဆိုက်၏ အရိုးစုကို ကိုယ်တိုင် ရေးဆွဲနိုင်ခြင်း",
      "HTML Semantics, Accessibility (a11y), Forms, Tables, and Advanced Layouts များအား အသေးစိတ် နားလည်ပြီး လက်တွေ့ကျင့်သုံးတတ်ခြင်း"
    ],
    certificateAvailable: true,
    introduction: "ဝက်ဘ်ဆိုက်တည်ဆောက်ခြင်း၏ အခြေခံအကျဆုံး တံခါးပေါက်ဖြစ်သော HTML5 ကို အစမှ စတင်ပြီး လက်တွေ့အသုံးချ သင်ယူမည့် သင်တန်းဖြစ်ပါသည်။",
    roadmap: [
      { step: "၁", title: "HTML Basics & Semantics", description: "ဝက်ဘ်ဆိုက်တည်ဆောက်ပုံ၊ tags များနှင့် Semantic elements အကြောင်း" },
      { step: "၂", title: "Forms, Media & Tables", description: "ပုံစံပုံစံ အချက်အလက်ဖြည့်သွင်းခြင်း၊ multimedia နှင့် ဇယားများ" },
      { step: "၃", title: "Accessibility & Final Projects", description: "ဝဘ်ဆိုက် Accessibility (a11y) မြှင့်တင်ခြင်းနှင့် Portfolio, Dashboard တည်ဆောက်ခြင်း" }
    ],
    quizzesCount: lessons1.length + lessons2.length + lessons3.length,
    assignmentsCount: lessons1.length + lessons2.length + lessons3.length,
    finalProject: {
      title: "My Personal Landing Page (ကိုယ်ပိုင်ပင်မစာမျက်နှာ)",
      description: "သင့်ရဲ့ အချက်အလက်များ၊ ကျွမ်းကျင်မှုများ၊ ပရောဂျက်များနှင့် ဆက်သွယ်ရန်လိပ်စာများ ပါဝင်သော လှပသပ်ရပ်သည့် ကိုယ်ပိုင် Portfolio ဝက်ဘ်ဆိုက်တစ်ခုကို HTML5 structural tags များဖြင့် တည်ဆောက်ပါ။",
      guide: [
        "အဆင့် ၁ - HTML Structural tags များကို သုံးပြီး skeleton တည်ဆောက်ပါ။",
        "အဆင့် ၂ - Header၊ Main Content နှင့် Footer များကို ခွဲခြားပါ။",
        "အဆင့် ၃ - သင့်ဓာတ်ပုံတစ်ခုနှင့် အခြားသော social links များကို ချိတ်ဆက်ပါ။"
      ],
      startingCode: `<!DOCTYPE html>
<html>
<head>
    <title>My Portfolio</title>
</head>
<body>
    <!-- ဤနေရာတွင် သင့်ရဲ့ Portfolio ကိုယ်တိုင် ရေးသားတည်ဆောက်ပါ -->
</body>
</html>`,
      solutionCode: `<!DOCTYPE html>
<html>
<head>
    <title>My Portfolio</title>
</head>
<body>
    <header>
        <h1>Aung Ko Portfolio</h1>
        <p>Software Engineer</p>
    </header>
    <main>
        <section>
            <h2>ကျွမ်းကျင်မှုများ (Skills)</h2>
            <ul>
                <li>HTML5 / CSS3</li>
                <li>Python Programming</li>
            </ul>
        </section>
    </main>
    <footer>
        <p>Contact: aungko@email.com</p>
    </footer>
</body>
</html>`
    },
    courseSummary: "ဂုဏ်ယူပါတယ်! သင်သည် HTML5 ကို သုံးပြီး ကိုယ်ပိုင်ဝက်ဘ်ဆိုက်တစ်ခု၏ တည်ဆောက်ပုံကို စနစ်တကျ ပုံဖော်တတ်သွားပါပြီ။",
    lessons: [...lessons1, ...lessons2, ...lessons3]
  },
  {
    id: "git-github-vcs",
    title: "Git & GitHub: Version Control",
    slug: "git-github-vcs",
    description: "ကုဒ်တွေကို သိမ်းဆည်း၊ စီမံခန့်ခွဲပြီး အဖွဲ့အစည်းနဲ့ လုပ်ဆောင်တတ်စေဖို့ မဖြစ်မနေလိုအပ်တဲ့ Git tool ကို ကျွမ်းကျင်အောင် လေ့လာပါ။",
    category: "git",
    lessonCount: 1,
    difficulty: "Level 2: Basic",
    estimatedTime: "3 Hours",
    projectCount: 1,
    prerequisites: [
      "ကွန်ပျူတာ အခြေခံ အသုံးပြုတတ်ခြင်း သို့မဟုတ် ဖိုင်စနစ်များအကြောင်း နားလည်ထားခြင်း။"
    ],
    learningOutcomes: [
      "Version Control System ၏ အလုပ်လုပ်ပုံကို နားလည်ခြင်း",
      "Git CLI command များကို ကျွမ်းကျင်စွာ အသုံးပြုနိုင်ခြင်း",
      "ကုဒ်များကို စနစ်တကျ သိမ်းဆည်းပြီး GitHub သို့ တွန်းတင်နိုင်ခြင်း"
    ],
    certificateAvailable: true,
    introduction: "ဆော့ဖ်ဝဲရေးသားသူတိုင်း မဖြစ်မနေ တတ်မြောက်ထားရမည့် ကုဒ်ထိန်းသိမ်းမှုစနစ် Git နှင့် စုပေါင်းလုပ်ဆောင်နိုင်စွမ်း GitHub အကြောင်းကို လေ့လာပါ။",
    roadmap: [
      { step: "၁", title: "Git Local Basics", description: "Git command များနှင့် Local Repository ဆောက်ခြင်း" },
      { step: "၂", title: "GitHub & Remotes", description: "Remote repository တည်ဆောက်ပြီး ကုဒ်တွန်းတင်ခြင်း" },
      { step: "၃", title: "Final Repository Setup Project", description: "ကိုယ်ပိုင် ကုဒ်တိုက်တစ်ခု စနစ်တကျ စတင်ခြင်း" }
    ],
    quizzesCount: 1,
    assignmentsCount: 1,
    finalProject: {
      title: "Team Collaboration Repository (ပူးပေါင်းဆောင်ရွက်ရေးကုဒ်တိုက်)",
      description: "စမ်းသပ်ပရိုဂရမ်တစ်ခုကို Git ဖြင့် စနစ်တကျ initialize လုပ်ပြီး၊ branch အသစ်တစ်ခု ဆောက်ကာ၊ remote setup လုပ်ပြီး commit ဆွဲတင်ပါ။",
      guide: [
        "အဆင့် ၁ - ပရောဂျက်တစ်ခုကို git init ဖြင့် စတင်ပါ။",
        "အဆင့် ၂ - Feature branch တစ်ခု (feature/login) ဆောက်ပါ။",
        "အဆင့် ၃ - ပြင်ဆင်မှုများကို Stage စင်ပေါ်တင်ပြီး Commit ဆွဲပါ။"
      ],
      startingCode: `# Git simulation commands test\n# ဤနေရာတွင် Git commands များကို စမ်းသပ်ပါ`,
      solutionCode: `git init\ngit checkout -b feature/login\ngit add .\ngit commit -m "add login screen style"`
    },
    courseSummary: "ဂုဏ်ယူပါတယ်! ယခုအခါ သင်သည် Git ကို အသုံးပြု၍ သင့်ကုဒ်များ၏ ဗားရှင်းများကို ပရော်ဖက်ရှင်နယ် ဆန်ဆန် ထိန်းချုပ်နိုင်စွမ်း ရှိသွားပါပြီ။",
    lessons: [
      {
        id: "git-basics-intro",
        title: "Git ဆိုတာဘာလဲ နှင့် အခြေခံ Command များ",
        slug: "git-intro",
        duration: "30 mins",
        markdownPath: "/content/git/001-intro.md",
        whatIsIt: "Git ဆိုတာ ကိုယ်ရေးလိုက်တဲ့ ဆော့ဖ်ဝဲကုဒ်တွေရဲ့ အပြောင်းအလဲမှတ်တမ်းတွေကို အချိန်နဲ့တပြေးညီ မှတ်သားပေးတဲ့ Version Control System ဖြစ်ပါတယ်။ ကုဒ်ရေးနေရင်း မှားသွားခဲ့ရင်လည်း အရင်အလုပ်လုပ်တဲ့ အချိန်ဆီကို နောက်ပြန်ဆုတ်သွားနိုင်တဲ့ အချိန်ခရီးသွားစက်တစ်ခုလိုပါပဲ။",
        whyImportant: "Professional developer တိုင်းသည် အခြားသူများနှင့် စနစ်တကျ ကုဒ်ပေါင်းစပ်လုပ်ကိုင်နိုင်ရန်နှင့် မိမိကုဒ်များ ပျောက်ဆုံးမသွားစေရန် Git ကို နေ့စဉ် အသုံးပြုကြရပါတယ်။",
        realWorldUsage: "ကမ္ဘာ့အကြီးဆုံး ကုမ္ပဏီများဖြစ်ကြသည့် Google, Microsoft, Meta တို့ရှိ developer ထောင်ပေါင်းများစွာသည် ကုဒ်များကို တစ်နေရာတည်းတွင် စုပေါင်းရေးသားရန် Git နှင့် GitHub ကို သုံးစွဲကြပါသည်။",
        syntax: `# Git repository တစ်ခု စတင်တည်ဆောက်ခြင်း
git init

# ဖိုင်များ၏ လက်ရှိအခြေအနေကို စစ်ဆေးခြင်း
git status

# အပြောင်းအလဲများကို Stage စင်မြင့်ပေါ်တင်ခြင်း
git add file_name.py

# မှတ်တမ်းအဖြစ် သိမ်းဆည်းခြင်း
git commit -m "မိတ်ဆက် variables များ ထည့်သွင်းခြင်း"`,
        examples: [
          `# ကုဒ်ဖိုင်အားလုံးကို Commit လုပ်ရန် အဆင့်များ\ngit add .\ngit commit -m "initial commit"`,
          `# Remote Server (GitHub) သို့ ကုဒ်များ တွန်းတင်ခြင်း\ngit push origin main`
        ],
        commonMistakes: [
          {
            mistake: "git commit (မက်ဆေ့ခ်ျမပါဘဲ သုံးစွဲခြင်း)",
            correction: "git commit -m 'လုပ်ဆောင်ချက် ရှင်းလင်းချက်'",
            explanation: "Commit လုပ်တိုင်း မိမိဘာပြင်လိုက်လဲဆိုတာကို အမြဲတမ်း -m flag နဲ့အတူ အကျဉ်းချုပ် ရေးသားပေးရပါမယ်။ မဟုတ်ပါက ကုဒ်ဖတ်ရခက်ခဲစေပါတယ်။"
          }
        ],
        bestPractices: [
          "Commit မက်ဆေ့ခ်ျများကို တိုတိုနှင့် အဓိပ္ပာယ်ရှင်းလင်းစွာ ရေးပါ။ ဥပမာ - 'fix typo' သို့မဟုတ် 'add login feature'။",
          "Commit များကို များများလုပ်ပေးပါ။ ကုဒ်အများကြီး ပြင်ပြီးမှ Commit တစ်ခုတည်း လုပ်ခြင်းကို ရှောင်ကြဉ်ပါ။"
        ],
        miniExercise: {
          id: "ex-git",
          instruction: "ဖိုင်အားလုံးကို Stage စင်မြင့်ပေါ်သို့ တင်ရန်အတွက် အသုံးပြုရမည့် command ကို ရေးပါ။",
          codeTemplate: `git add .`,
          expectedOutput: "git add .",
          hints: ["ဖိုင်တစ်ခုချင်းစီအစား ဖိုင်အားလုံးကို add လုပ်ရန် အစက် (.) လေးကို သုံးရပါမယ်။"]
        },
        quiz: [
          {
            id: "q-git-1",
            question: "Git တွင် ပြင်ဆင်ထားသည့် ဖိုင်များကို သမိုင်းမှတ်တမ်းအဖြစ် အပြီးသတ်သိမ်းဆည်းရန် မည်သည့် Command ကို သုံးရသနည်း။",
            options: [
              "git save",
              "git commit",
              "git push",
              "git upload"
            ],
            correctOptionIndex: 1,
            explanation: "git commit သည် ပြင်ဆင်မှုများကို repository ၏ သမိုင်းမှတ်တမ်းအဖြစ် သေသပ်စွာ သိမ်းဆည်းပေးသည့် command ဖြစ်သည်။"
          }
        ],
        miniProject: {
          title: "First Git Repo Setup (ပထမဆုံး Git ကုဒ်တိုက်)",
          description: "ပရိုဂရမ်တစ်ခုကို Git အသုံးပြုပြီး စတင် initializing လုပ်ပါ၊ ဖိုင်များကို add လုပ်ကာ commit ပထမဆုံးတစ်ကြိမ် ပြုလုပ်ပါ။",
          guide: [
            "git init ဖြင့် စတင်ပါ။",
            "git add . ဖြင့် ဖိုင်များစုစည်းပါ။",
            "git commit -m 'First Commit' ဖြင့် စတင်သိမ်းဆည်းပါ။"
          ],
          startingCode: `# ဤနေရာတွင် Git စတင်သည့် command များ စမ်းသပ်ပါ\ngit init\ngit add .\ngit commit -m "First Commit"`
        }
      }
    ]
  }
];

export const BLOG_POSTS = [
  {
    id: "blog-1",
    title: "Complete Beginner တစ်ယောက်အတွက် Developer လမ်းညွှန်",
    summary: "ပရိုဂရမ်မင်းကို ဘယ်ကနေစပြီး ဘယ်လိုလေ့လာရမလဲဆိုတာ ဝေခွဲမရဖြစ်နေတဲ့ သူတွေအတွက် အကောင်းဆုံး လမ်းပြမြေပုံ။",
    content: `ပရိုဂရမ်မင်းကို စတင်လေ့လာတော့မယ်ဆိုရင် လူတိုင်း တွေ့ကြုံရတဲ့ ပြဿနာကတော့ ဘယ်ကနေ စရမလဲဆိုတာပါပဲ။ 

ပထမဆုံး သိထားရမှာက programming ဆိုတာ ကွန်ပြူတာနဲ့ စကားပြောတာဖြစ်တဲ့အတွက် ဘာသာစကားအသစ်တစ်ခုကို လေ့လာနေရသလိုပါပဲ။

၁။ အခြေခံကို အရင်ဆုံး ပိုင်နိုင်အောင်လုပ်ပါ
Python သို့မဟုတ် JavaScript ကဲ့သို့သော လေ့လာရလွယ်ကူပြီး အသုံးဝင်တဲ့ ဘာသာစကားတစ်ခုကို ရွေးချယ်ပါ။ variable တွေ၊ conditions တွေ၊ loops တွေရဲ့ သဘောတရားကို အပတ်တကုတ် နားလည်အောင် လုပ်ပါ။

၂။ ကုဒ်များကို လက်တွေ့ ကိုယ်တိုင်ရေးပါ
စာအုပ်ဖတ်ရုံ၊ ဗီဒီယိုကြည့်ရုံနဲ့ ကုဒ်မတတ်နိုင်ပါဘူး။ လက်တွေ့ကီးဘုတ်ပေါ်မှာ ကိုယ်တိုင် အမှားရှာပြီး ရိုက်နှိပ်ရေးသားခြင်းကသာ အကောင်းဆုံး သင်ခန်းစာ ဖြစ်ပါတယ်။

၃။ ကိုယ်ပိုင် Mini Project လေးတွေ စတင်လုပ်ဆောင်ပါ
ရိုးရှင်းတဲ့ Calculator၊ Todo List စတာတွေကို ကိုယ်တိုင် ဖန်တီးကြည့်ပါ။ ဒါမှသာ ကုဒ်တွေ ဘယ်လိုအလုပ်လုပ်တယ်ဆိုတာ ကောင်းစွာ နားလည်လာမှာ ဖြစ်ပါတယ်။`,
    author: "Zayar Min",
    date: "2026-07-01",
    readTime: "5 mins",
    category: "Career Guide"
  },
  {
    id: "blog-2",
    title: "AI ခေတ်မှာ Programming လေ့လာဖို့ လိုအပ်သေးသလား။",
    summary: "Gemini နဲ့ ChatGPT တို့ ပေါ်ထွန်းလာတဲ့ ဒီနေ့ခေတ်မှာ Programmer တစ်ယောက်ဖြစ်ဖို့ လေ့လာသင့်သလား ဆိုတာကို သုံးသပ်ခြင်း။",
    content: `AI တွေက ကုဒ်တွေကို စက္ကန့်ပိုင်းအတွင်း ရေးပေးနိုင်တဲ့အတွက် လူတွေက မေးခွန်းထုတ်လာကြပါတယ်။ "ငါတို့ ကုဒ်ရေးဖို့ လိုအပ်ပါဦးမလား" တဲ့။

တကယ်တော့ AI ဆိုတာ developer တွေရဲ့ အလုပ်ကို အစားထိုးဖို့ထက်၊ အလုပ်ကို ပိုမိုမြန်ဆန်အောင် ကူညီပေးမယ့် အလွန်တော်တဲ့ လက်ထောက်တစ်ယောက် ဖြစ်ပါတယ်။

အဘယ်ကြောင့် ဆက်လက်လေ့လာသင့်သနည်း-
- AI က ရေးပေးတဲ့ကုဒ်တွေကို နားလည်ပြီး ပြင်ဆင်နိုင်ဖို့၊ စနစ်တကျ စုစည်းနိုင်ဖို့ ကုဒ်အခြေခံသဘောတရားကို သိကိုသိထားရပါမယ်။
- Logic ပိုင်းဆိုင်ရာ တွေးခေါ်မြော်မြင်မှုနှင့် ပြဿနာဖြေရှင်းနိုင်စွမ်း (Problem Solving Skills) ကို AI က အစားမထိုးနိုင်ပါ။
- AI ကို စနစ်တကျ ခိုင်းစေတတ်ဖို့ (Prompt Engineering) အတွက်လည်း programming knowledge က များစွာ အထောက်အကူပြုပါတယ်။

နိဂုံးချုပ်အနေနဲ့ AI ကို ရန်သူလိုမမြင်ဘဲ မိတ်ဆွေလိုအသုံးချတတ်တဲ့ 'AI-Powered Developers' တွေကသာ ရှေ့လျှောက် အောင်မြင်လာမှာ ဖြစ်ပါတယ်။`,
    author: "Thura Aung",
    date: "2026-07-05",
    readTime: "4 mins",
    category: "AI & Future Tech"
  }
];

export const FORUM_POSTS = [
  {
    id: "post-1",
    title: "Python variables နဲ့ပတ်သက်ပြီး မေးချင်လို့ပါ ခင်ဗျာ",
    content: "variable name ကြေညာတဲ့အခါ space ခြားပြီး ရေးရင် error တက်လို့ပါဗျာ။ ဥပမာ- user name = 'Mg Mg' ဆိုပြီး ရေးမိလို့။ ဘယ်လိုစနစ်တကျ ရေးရမလဲဗျ။",
    author: "Kyaw Swar",
    date: "2026-07-06",
    likes: 5,
    replies: [
      {
        id: "rep-1",
        author: "Aung Kaung",
        content: "variable name တွေမှာ space ခြားခွင့် မရှိပါဘူး ခင်ဗျာ။ ၎င်းအစား user_name = 'Mg Mg' ဆိုပြီး မြေအောက်မျဉ်း (underscore) သုံးပြီး ရေးပေးရပါမယ်ဗျာ။",
        date: "2026-07-06"
      }
    ],
    category: "Programming Basics"
  },
  {
    id: "post-2",
    title: "Web Development စလေ့လာမယ့်သူတွေအတွက် Road Map လေး မျှဝေပေးချင်ပါတယ်",
    content: "ဝက်ဘ်ဆိုက်ရေးတာ စိတ်ဝင်စားရင် ပထမဆုံး HTML ကို ၃ ရက်လောက် လေ့လာပါ၊ နောက်ပြီး CSS ကို ၁ ပတ်လောက် လေ့လာပြီး အခြေခံ ဒီဇိုင်းဆွဲပါ။ ပြီးမှ JavaScript စလေ့လာပါဗျ။ အဲဒါပြီးရင် React ကို ဆက်သွားပါဗျာ။",
    author: "Ei Thandar",
    date: "2026-07-07",
    likes: 12,
    replies: [
      {
        id: "rep-2",
        author: "Min Khant",
        content: "ကျေးဇူးတင်ပါတယ်ဗျာ။ ကျွန်တော်လည်း အခု HTML5 လေ့လာနေတာ အရမ်းစိတ်ဝင်စားဖို့ ကောင်းပါတယ်!",
        date: "2026-07-08"
      }
    ],
    category: "Web Development"
  }
];

export const PROJECTS_DATA = [
  {
    id: "proj-bmi-calc",
    title: "BMI (ခန္ဓာကိုယ်အချိုးအစား) တွက်ချက်စနစ်",
    description: "အသုံးပြုသူရဲ့ အလေးချိန်နဲ့ အမြင့်ကို variables တွေထဲမှာ သိမ်းဆည်းပြီး၊ if-else conditions သုံးကာ BMI ရလဒ်နှင့် ကျန်းမာရေးအဆင့်အတန်းကို တိကျစွာ ပြသပေးသော console အက်ပ်တစ်ခုကို တည်ဆောက်ပါ။",
    difficulty: "Beginner",
    category: "Programming Basics",
    steps: [
      {
        title: "အဆင့် ၁ - အလေးချိန်နှင့် အမြင့် သတ်မှတ်ခြင်း",
        content: "weight_kg (ဥပမာ- 70) နှင့် height_m (ဥပမာ- 1.75) variable များကို သတ်မှတ်ပါ။"
      },
      {
        title: "အဆင့် ၂ - BMI တွက်ချက်ခြင်းပုံသေနည်း",
        content: "BMI = weight / (height * height) ဖြစ်ပါသည်။ Python ကုဒ်ဖြင့် bmi = weight_kg / (height_m ** 2) ဟု တွက်ချက်ပါ။"
      },
      {
        title: "အဆင့် ၃ - ကျန်းမာရေးအဆင့် သတ်မှတ်ခြင်း (If-Else)",
        content: "BMI သည် ၁၈.၅ အောက်ဆိုလျှင် 'ဝိတ်နည်းနေသည်'၊ ၁၈.၅ မှ ၂၄.၉ ကြားဆိုလျှင် 'ပုံမှန်ကျန်းမာသည်'၊ ၂၅ အထက်ဆိုလျှင် 'ဝိတ်လွန်နေသည်' ဟု if-elif-else သုံး၍ ဆုံးဖြတ်ပြီး print() ထုတ်ပါ။"
      }
    ],
    startingCode: `weight_kg = 70
height_m = 1.75

# ၁။ BMI ကို ပုံသေနည်းဖြင့် တွက်ပါ
bmi = weight_kg / (height_m ** 2)

print("Your BMI: " + str(round(bmi, 2)))

# ၂။ If-Elif-Else စနစ်ဖြင့် ကျန်းမာရေးအဆင့်ကို သတ်မှတ်ပြီး print ထုတ်ပါ
if bmi < 18.5:
    print("ကျန်းမာရေးအခြေအနေ: ကိုယ်အလေးချိန် နည်းပါးလွန်းနေသည်")
elif bmi >= 18.5 and bmi <= 24.9:
    print("ကျန်းမာရေးအခြေအနေ: ပုံမှန် ကျန်းမာသော အချိုးအစား ရှိသည်")
else:
    print("ကျန်းမာရေးအခြေအနေ: ကိုယ်အလေးချိန် လွန်ကဲနေသည်")`,
    solutionCode: `weight_kg = 70
height_m = 1.75

bmi = weight_kg / (height_m ** 2)

print("Your BMI: " + str(round(bmi, 2)))

if bmi < 18.5:
    print("ကျန်းမာရေးအခြေအနေ: ကိုယ်အလေးချိန် နည်းပါးလွန်းနေသည်")
elif bmi >= 18.5 and bmi <= 24.9:
    print("ကျန်းမာရေးအခြေအနေ: ပုံမှန် ကျန်းမာသော အချိုးအစား ရှိသည်")
else:
    print("ကျန်းမာရေးအခြေအနေ: ကိုယ်အလေးချိန် လွန်ကဲနေသည်")`
  },
  {
    id: "proj-payroll-db",
    title: "Professional Employee Payroll & Tax System 👑",
    description: "ဝန်ထမ်းလစာစာရင်းများ၊ အခွန်နှုတ်ယူမှုများနှင့် ဘောနပ်စ်များကို သတ်မှတ်တွက်ချက်ကာ အပြီးသတ် အစီရင်ခံစာ ထုတ်ပြန်ပေးသော စနစ်တကျ ရေးသားထားသည့် စီးပွားရေးလုပ်ငန်းသုံး ပရိုဂရမ်တစ်ခု ဖြစ်ပါသည်။",
    difficulty: "Professional",
    category: "Full-Stack Development",
    steps: [
      {
        title: "အဆင့် ၁ - ဝန်ထမ်းအချက်အလက် စုဆောင်းခြင်း",
        content: "ဝန်ထမ်းတစ်ဦးချင်းစီ၏ အမည်၊ အခြေခံလစာနှင့် လုပ်သက်ကို Dictionary Object များဖြင့် စုစည်းပါ။"
      },
      {
        title: "အဆင့် ၂ - အခွန်နှင့် ဘောနပ်စ် တွက်ချက်ခြင်း",
        content: "အခြေခံလစာ၏ ၅% အား ဝင်ငွေခွန်အဖြစ် နှုတ်ယူပြီး၊ လုပ်သက် ၅နှစ်ကျော်ပါက ၁၀% ဘောနပ်စ် ပေါင်းထည့်ပါ။"
      }
    ],
    startingCode: `employees = [
    {"name": "Aung Aung", "salary": 800000, "years": 6},
    {"name": "Ma Ma", "salary": 1200000, "years": 3}
]

# ဝန်ထမ်းတစ်ဦးစီအတွက် အသားတင်လစာ (Net Salary) တွက်ချက်သည့် function ရေးသားပါ
`,
    solutionCode: `employees = [
    {"name": "Aung Aung", "salary": 800000, "years": 6},
    {"name": "Ma Ma", "salary": 1200000, "years": 3}
]
`
  }
];
