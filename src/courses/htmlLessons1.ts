import { Lesson } from "../types";

export const lessons1: Lesson[] = [
  // ==========================================
  // MODULE 1: INTRODUCTION TO HTML
  // ==========================================
  {
    id: "html-1",
    title: "What is HTML?",
    slug: "what-is-html",
    duration: "20 mins",
    whatIsIt: "HTML (HyperText Markup Language) ဆိုသည်မှာ ဝက်ဘ်ဆိုက်တစ်ခု၏ အခြေခံအရိုးစု (Structure) ကို တည်ဆောက်ရန် အသုံးပြုရသည့် စံသတ်မှတ်ချက် ဘာသာစကား ဖြစ်ပါသည်။",
    whyImportant: "ဝက်ဘ်ဆိုက်တစ်ခုကို တည်ဆောက်ရာတွင် HTML သည် မရှိမဖြစ် အခြေခံအကျဆုံးအဆင့် ဖြစ်ပါသည်။ HTML မရှိဘဲ CSS သို့မဟုတ် JavaScript များကို အသုံးပြု၍ မရနိုင်ပါ။",
    realWorldUsage: "ကမ္ဘာပေါ်ရှိ မည်သည့်ဝက်ဘ်ဆိုက်မဆို (ဥပမာ - Google, Facebook, Wikipedia) ၎င်းတို့၏ စာမျက်နှာများကို HTML ဖြင့် တည်ဆောက်ထားခြင်း ဖြစ်ပါသည်။",
    syntax: `<!-- HTML Tag အခြေခံပုံစံ -->
<tagname>အကြောင်းအရာ</tagname>`,
    examples: [
      `<h1>မင်္ဂလာပါ ကမ္ဘာလောက</h1>`,
      `<p>HTML ကို အခြေခံမှ စတင်လေ့လာနေပါသည်။</p>`
    ],
    commonMistakes: [
      {
        mistake: "<h1>မင်္ဂလာပါ",
        correction: "<h1>မင်္ဂလာပါ</h1>",
        explanation: "ဖွင့်ထားသော tag များကို စနစ်တကျ ပြန်ပိတ်ပေးရန် လိုအပ်ပါသည်။"
      }
    ],
    bestPractices: [
      "HTML tags များကို အမြဲတမ်း စာလုံးအသေး (lowercase) ဖြင့်သာ ရေးသားပါ။",
      "ကုဒ်များကို သေသပ်စွာ စာကြောင်းချ၍ ရေးပါ။"
    ],
    miniExercise: {
      id: "ex-html-1",
      instruction: "<h1> tag ကို အသုံးပြုပြီး 'Hello HTML' ဟူသော ခေါင်းစဉ်တစ်ခု ရေးသားပါ။",
      codeTemplate: "<h1>Hello HTML</h1>",
      expectedOutput: "<h1>Hello HTML</h1>",
      hints: ["ဖွင့် tag နှင့် ပိတ် tag ကြားတွင် Hello HTML ဟု ရေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-1",
        question: "HTML ၏ အရှည်ကောက်မှာ အောက်ပါတို့အနက် မည်သည်ဖြစ်သနည်း။",
        options: [
          "HyperText Markup Language",
          "HighText Machine Language",
          "HyperTransfer Modern Layout",
          "Home Tool Markup Language"
        ],
        correctOptionIndex: 0,
        explanation: "HTML သည် HyperText Markup Language ကို ဆိုလိုခြင်း ဖြစ်ပါသည်။"
      }
    ],
    miniProject: {
      title: "My First Heading",
      description: "အခြေခံ အကြီးဆုံး ခေါင်းစဉ်တစ်ခု ဖန်တီးပါ။",
      guide: ["<h1> tag ကို သုံးပါ။", "သင့်စိတ်ကြိုက် ခေါင်းစဉ်စာသားတစ်ခု ရေးပါ။"],
      startingCode: "<h1>My First Website</h1>"
    },
    learningObjectives: {
      what: "HTML ၏ အဓိပ္ပာယ်နှင့် ဝက်ဘ်ဆိုက်များတွင် အလုပ်လုပ်ပုံကို နားလည်စေရန်။",
      why: "ဝက်ဘ်ဆော့ဖ်ဝဲလ်ရေးဆွဲသူတိုင်း တတ်မြောက်ရမည့် ပထမဆုံးခြေလှမ်းဖြစ်သောကြောင့်။",
      when: "ဝက်ဘ်စာမျက်နှာတစ်ခုကို စတင်တည်ဆောက်သည့် အခါတိုင်းတွင် သုံးသည်။",
      how: "Tags များကို အသုံးပြုပြီး text များကို element များအဖြစ် ပြောင်းလဲခြင်းဖြင့် သုံးသည်။"
    },
    myanmarExplanation: "HTML သည် programming language တစ်ခုမဟုတ်ဘဲ markup language တစ်ခုသာ ဖြစ်သည်။ ၎င်းသည် browser များအား စာမျက်နှာပေါ်တွင် ပုံ၊ စာသား၊ လင့်ခ်များကို မည်သို့ပြသရမည်ကို ညွှန်ကြားပေးသည်။",
    theory: "HyperText ဆိုသည်မှာ ဝက်ဘ်စာမျက်နှာများကို အချင်းချင်း ချိတ်ဆက်ပေးသော hyperlink များကို ဆိုလိုပြီး၊ Markup ဆိုသည်မှာ စာသားများကို သတ်မှတ်ချက် tags များဖြင့် အရောင်အသွေး သတ်မှတ်ပေးခြင်းကို ဆိုလိုသည်။",
    englishKeywords: ["Markup", "Element", "Tag", "Browser", "HyperText"],
    stepByStepExplanation: [
      "ဖွင့် tag <h1> ကို ရေးပါ။",
      "အလယ်တွင် စာသားထည့်ပါ။",
      "ပိတ် tag </h1> ကို ရေးပြီး အပြီးသတ်ပါ။"
    ],
    outputPreview: "Hello HTML (အက္ခရာအကြီးကြီးဖြင့် ပြသမည်)",
    tips: ["Tag name များကို စာလုံးအသေးဖြင့်သာ ရေးရန် လေ့ကျင့်ပါ။"],
    assignment: {
      title: "HTML Concept Journal",
      description: "HTML ၏ အခြေခံ သဘောတရားကို ရေးသားပါ။",
      instructions: ["HTML ဆိုတာ ဘာလဲဆိုတာကို သင့်ကိုယ်ပိုင်စကားလုံးဖြင့် မှတ်သားပါ။"]
    },
    lessonSummary: "HTML သည် ဝက်ဘ်စာမျက်နှာများ၏ အရိုးစု ဖြစ်ပြီး tags များကို အသုံးပြု၍ တည်ဆောက်သည်။",
    nextLesson: "History of HTML"
  },
  {
    id: "html-2",
    title: "History of HTML",
    slug: "history-of-html",
    duration: "20 mins",
    whatIsIt: "HTML ၏ သမိုင်းကြောင်းနှင့် ဗားရှင်းအဆင့်ဆင့် ပြောင်းလဲလာပုံ ဖြစ်ပါသည်။",
    whyImportant: "ယနေ့ခေတ် သုံးစွဲနေသော HTML5 သည် မည်သို့ ပေါ်ပေါက်လာသည်ကို သိရှိခြင်းဖြင့် အချို့သော tag ဟောင်းများနှင့် tag အသစ်များ၏ ကွာခြားချက်ကို ပိုမိုနားလည်နိုင်ပါသည်။",
    realWorldUsage: "ယခုအခါ ကမ္ဘာတစ်ဝှမ်းရှိ ဝက်ဘ်ဆိုက်အားလုံးသည် HTML5 စံနှုန်းကို အသုံးပြု၍ ခေတ်မီ responsive စာမျက်နှာများ တည်ဆောက်နေကြပါသည်။",
    syntax: `<!-- HTML5 standard declaration -->
<!DOCTYPE html>`,
    examples: [
      `<!DOCTYPE html>\n<html>\n</html>`
    ],
    commonMistakes: [
      {
        mistake: "<!doctype html5>",
        correction: "<!DOCTYPE html>",
        explanation: "HTML5 အတွက် စံနှုန်းသတ်မှတ်ချက်မှာ <!DOCTYPE html> သာ ဖြစ်ပါသည်။ html5 ဟု ရေးစရာမလိုပါ။"
      }
    ],
    bestPractices: [
      "HTML5 စံနှုန်းအသစ်များကို အမြဲလိုက်နာပြီး ရေးသားပါ။"
    ],
    miniExercise: {
      id: "ex-html-2",
      instruction: "HTML5 doc type ကို ရေးသားပါ။",
      codeTemplate: "<!DOCTYPE html>",
      expectedOutput: "<!DOCTYPE html>",
      hints: ["<!DOCTYPE html> ဟု ရေးသားပေးရပါမည်။"]
    },
    quiz: [
      {
        id: "q-html-2",
        question: "HTML ကို မည်သူက စတင်တီထွင်ခဲ့သနည်း။",
        options: [
          "Tim Berners-Lee",
          "Bill Gates",
          "Mark Zuckerberg",
          "Linus Torvalds"
        ],
        correctOptionIndex: 0,
        explanation: "HTML ကို ကွန်ပျူတာပညာရှင် Tim Berners-Lee က ၁၉၉၁ ခုနှစ်တွင် စတင်တီထွင်ခဲ့ပါသည်။"
      }
    ],
    miniProject: {
      title: "HTML5 Intro Boilerplate",
      description: "အခြေခံ HTML5 စာမျက်နှာတစ်ခု၏ အစပျိုးပုံစံကို တည်ဆောက်ပါ။",
      guide: ["<!DOCTYPE html> ကို ပထမဆုံး စာကြောင်းတွင် ထည့်သွင်းပါ။"],
      startingCode: "<!DOCTYPE html>"
    },
    learningObjectives: {
      what: "HTML စံနှုန်းများ၏ သမိုင်းကြောင်းနှင့် HTML5 ၏ ထူးခြားချက်များကို လေ့လာရန်။",
      why: "ဝက်ဘ်နည်းပညာများ၏ ဆင့်ကဲပြောင်းလဲမှုကို သိရှိရန်။",
      when: "ဝက်ဘ်ဆိုက်များကို ခေတ်မီစံနှုန်းများအတိုင်း ရေးသားရန်။",
      how: "ခေတ်ဟောင်း tag များအစား HTML5 semantic tag များကို သုံးစွဲခြင်းဖြင့် သုံးသည်။"
    },
    myanmarExplanation: "HTML ကို CERN ဓာတ်ခွဲခန်းတွင် အချက်အလက်များ လွယ်ကူစွာ မျှဝေရန် ဖန်တီးခဲ့ပြီး၊ ယခုနောက်ဆုံးဗားရှင်းမှာ HTML5 ဖြစ်ပြီး multimedia နှင့် semantic အားသာချက်များစွာ ပါရှိသည်။",
    theory: "HTML standard များကို W3C (World Wide Web Consortium) မှ စနစ်တကျ ထိန်းသိမ်းပြီး အဆင့်မြှင့်တင်မှုများ ပြုလုပ်သည်။",
    englishKeywords: ["W3C", "HTML5", "CERN", "Standard", "Version"],
    stepByStepExplanation: [
      "Document high-level code အမျိုးအစားကို သတ်မှတ်ပါ။",
      "W3C စံနှုန်းများကို လေ့လာပါ။"
    ],
    outputPreview: "<!DOCTYPE html> (သတ်မှတ်ချက်သာဖြစ်ပြီး screen တွင် ဘာမှပြမည်မဟုတ်ပါ)",
    tips: ["HTML5 သည် multimedia (audio/video) များကို တိုက်ရိုက်ပံ့ပိုးပေးသည်။"],
    assignment: {
      title: "W3C Standards Search",
      description: "W3C ၏ ဝဘ်စံနှုန်းများအကြောင်း လေ့လာမှတ်သားပါ။",
      instructions: ["W3C အဖွဲ့အစည်းက ဘာကြောင့် အရေးကြီးသလဲဆိုတာ ရေးသားပါ။"]
    },
    lessonSummary: "HTML ကို Tim Berners-Lee က တီထွင်ခဲ့ပြီး လက်ရှိသုံးနေသော ဗားရှင်းမှာ HTML5 ဖြစ်သည်။",
    nextLesson: "How Websites Work"
  },
  {
    id: "html-3",
    title: "How Websites Work",
    slug: "how-websites-work",
    duration: "20 mins",
    whatIsIt: "ဝက်ဘ်ဆိုက်များ အလုပ်လုပ်ပုံ (Client-Server Architecture) အခြေခံဖြစ်ပါသည်။",
    whyImportant: "Browser က HTML ဖိုင်များကို မည်သို့ တောင်းဆိုပြီး မည်သို့ render လုပ်ပြသသည်ကို သိရှိမှသာ ကောင်းမွန်သော ဆော့ဖ်ဝဲဒီဇိုင်းများ ရေးဆွဲနိုင်ပါမည်။",
    realWorldUsage: "ဝက်ဘ်ဆိုက်တစ်ခုသို့ ဝင်ရောက်သည့်အခါ သင့်ဖုန်း (Client) က server ဆီသို့ request လှမ်းပို့ပြီး server က HTML, CSS, JS ဖိုင်များကို ပြန်လည်ပေးပို့ကာ အလုပ်လုပ်ပါသည်။",
    syntax: `<!-- Client Request -> Server Response -> HTML Render -->`,
    examples: [
      `<!-- Browser က HTML ဖိုင်ကို လက်ခံပြီး အသုံးပြုသူမြင်အောင် ပြသပေးသည် -->`
    ],
    commonMistakes: [
      {
        mistake: "HTML ဖိုင်သည် သီးခြားဆော့ဖ်ဝဲမလိုဘဲ အလုပ်လုပ်သည်ဟု ထင်ခြင်း",
        correction: "Browser (ဥပမာ - Chrome, Safari) လိုအပ်ပါသည်",
        explanation: "HTML ကို browser ကသာ ဖတ်ရှုပြီး စာမျက်နှာအဖြစ် ပုံဖော်ပေးနိုင်သည်။"
      }
    ],
    bestPractices: [
      "ဖိုင်အရွယ်အစားကို ပေါ့ပါးအောင် ရေးသားခြင်းဖြင့် ဝက်ဘ်ဆိုက် loading speed ကို မြန်ဆန်စေပါသည်။"
    ],
    miniExercise: {
      id: "ex-html-3",
      instruction: "Browser က ဖတ်နိုင်သော HTML header structure စာသားတစ်ခုရေးပါ။",
      codeTemplate: "<html></html>",
      expectedOutput: "<html></html>",
      hints: ["<html> element ကို အသုံးပြုပါ။"]
    },
    quiz: [
      {
        id: "q-html-3",
        question: "ဝက်ဘ်ဆိုက်များကို ဖတ်ရှုပြီး ပုံဖော်ပြသပေးသည့် ဆော့ဖ်ဝဲကို မည်သို့ခေါ်သနည်း။",
        options: [
          "Web Browser",
          "Web Server",
          "Compiler",
          "Database"
        ],
        correctOptionIndex: 0,
        explanation: "Web Browser (ဥပမာ - Chrome, Edge) သည် HTML ကုဒ်များကို ဖတ်ရှုပြီး လူသားများမြင်နိုင်သော စာမျက်နှာအဖြစ် ပြောင်းလဲပေးသည်။"
      }
    ],
    miniProject: {
      title: "Web Request Simulation",
      description: "အခြေခံ ဝက်ဘ်ဆိုက် အလုပ်လုပ်ပုံကို နားလည်စေရန် စမ်းသပ်စာမျက်နှာလေး တည်ဆောက်ပါ။",
      guide: ["HTML တည်ဆောက်ပုံကို စတင်လေ့လာရန် <html> tag ဆောက်ပါ။"],
      startingCode: "<html>\n</html>"
    },
    learningObjectives: {
      what: "Client-Server ဆက်သွယ်မှုနှင့် browser များ၏ အလုပ်လုပ်ပုံကို နားလည်ရန်။",
      why: "ကုဒ်ရေးရာတွင် backend နှင့် frontend မည်သို့ချိတ်ဆက်သည်ကို မြင်သာစေရန်။",
      when: "ဝက်ဘ်ဆော့ဖ်ဝဲများ တည်ဆောက်သည့် အဆင့်တိုင်းတွင် လိုအပ်သည်။",
      how: "Domain အမည်များ ရိုက်ထည့်ကာ DNS မှတဆင့် server သို့ ဆက်သွယ်ခြင်းကို နားလည်ခြင်း။"
    },
    myanmarExplanation: "အသုံးပြုသူက URL တစ်ခုကို ရိုက်ထည့်လိုက်လျှင် Internet မှတဆင့် Server သို့ ဆက်သွယ်ပြီး ၎င်းဆီမှ HTML/CSS ဖိုင်များကို browser သို့ ပို့ပေးကာ မျက်နှာပြင်ပေါ်တွင် ပြသပေးသည်။",
    theory: "Request-Response cycle သည် ဝဘ်၏ အခြေခံလုပ်ငန်းစဉ် ဖြစ်ပြီး HTTP protocol ကို အသုံးပြု၍ အလုပ်လုပ်သည်။",
    englishKeywords: ["Client", "Server", "IP Address", "HTTP", "DNS"],
    stepByStepExplanation: [
      "User က browser တွင် URL ရိုက်ထည့်သည်။",
      "Browser က server ထံမှ HTML ဖိုင်တောင်းခံသည်။",
      "Server က ဖိုင်ပြန်ပို့ပြီး browser က render လုပ်ပြသသည်။"
    ],
    outputPreview: "Web page rendered fully.",
    tips: ["F12 key ကိုနှိပ်ပြီး browser developer tools များကို အသုံးပြုလေ့လာနိုင်သည်။"],
    assignment: {
      title: "Client-Server Diagram",
      description: "ဝဘ်ဆိုက်တစ်ခု အလုပ်လုပ်ပုံကို လေ့လာပါ။",
      instructions: ["Client နှင့် Server အကြား ဆက်သွယ်ပုံကို မှတ်စုတိုရေးပါ။"]
    },
    lessonSummary: "ဝဘ်ဆိုက်များသည် client က တောင်းဆိုပြီး server က HTML ဖိုင်များ ပေးပို့ကာ browser က ပြသပေးခြင်းဖြင့် အလုပ်လုပ်သည်။",
    nextLesson: "Installing VS Code"
  },
  {
    id: "html-4",
    title: "Installing VS Code",
    slug: "installing-vs-code",
    duration: "25 mins",
    whatIsIt: "ကုဒ်များကို လွယ်ကူလျင်မြန်စွာ ရေးသားနိုင်ရန် Visual Studio Code (VS Code) ကို တပ်ဆင်အသုံးပြုနည်း ဖြစ်ပါသည်။",
    whyImportant: "VS Code သည် ယနေ့ခေတ် ကမ္ဘာ့လူကြိုက်အများဆုံး အခမဲ့ Code Editor ဖြစ်ပြီး auto-completion, extensions နှင့် debugging စနစ်များ ကောင်းမွန်စွာ ပါရှိသည်။",
    realWorldUsage: "Professional Web Developers အားလုံးနီးပါးသည် ၎င်းတို့၏ နေ့စဉ်လုပ်ငန်းခွင်များတွင် VS Code ကို အသုံးပြု၍ ပရောဂျက်များ ရေးသားကြပါသည်။",
    syntax: `<!-- No syntax: VS Code is an editor application -->`,
    examples: [
      `<!-- VS Code ကို သုံးပြီး .html ဖိုင်များကို ဖန်တီးကာ ရေးသားနိုင်သည် -->`
    ],
    commonMistakes: [
      {
        mistake: "ကုဒ်များကို Notepad တွင်သာ အမြဲတမ်းရေးရန် ကြိုးစားခြင်း",
        correction: "VS Code ကဲ့သို့ ခေတ်မီ Code Editor ကို သုံးပါ",
        explanation: "Notepad တွင် syntax highlighting မရှိသဖြင့် အမှားရှာရန် ခက်ခဲလှပါသည်။"
      }
    ],
    bestPractices: [
      "VS Code တွင် 'Live Server' extension ကို ထည့်သွင်းထားပါက ကုဒ်ပြင်လိုက်တိုင်း browser တွင် auto-refresh ပြုလုပ်ပေးပါသည်။"
    ],
    miniExercise: {
      id: "ex-html-4",
      instruction: "VS Code တွင် သုံးရမည့် extension တစ်ခုဖြစ်သော 'Live Server' ၏ အမည်ကို စာသားအဖြစ် ရေးပါ။",
      codeTemplate: "Live Server",
      expectedOutput: "Live Server",
      hints: ["Live Server ဟု တိကျစွာ ရေးသားပါ။"]
    },
    quiz: [
      {
        id: "q-html-4",
        question: "အောက်ပါတို့အနက် ဝဘ်ကုဒ်များ ရေးသားရန် အကောင်းဆုံး အခမဲ့ Editor မှာ မည်သည်ဖြစ်သနည်း။",
        options: [
          "Visual Studio Code (VS Code)",
          "MS Word",
          "PowerPoint",
          "Photoshop"
        ],
        correctOptionIndex: 0,
        explanation: "VS Code သည် ကမ္ဘာ့အသုံးအများဆုံးနှင့် အကောင်းဆုံး web development editor တစ်ခုဖြစ်ပါသည်။"
      }
    ],
    miniProject: {
      title: "Editor Familiarization",
      description: "VS Code editor ၏ layout ကို လေ့လာပါ။",
      guide: ["Editor ကို download လုပ်ပြီး layout ကို လေ့လာပါ။"],
      startingCode: "<!-- VS Code is fully installed and ready -->"
    },
    learningObjectives: {
      what: "VS Code editor အား download လုပ်ပြီး အသုံးပြုတတ်စေရန်။",
      why: "ကုဒ်ရေးသားမှု အမြန်နှုန်းနှင့် အမှားပြင်ဆင်မှုကို ထိရောက်စေရန်။",
      when: "ပရောဂျက်စတင်သည့် အခါတိုင်းတွင် အသုံးပြုသည်။",
      how: "Extensions များ တပ်ဆင်ခြင်း၊ theme ပြောင်းလဲခြင်းနှင့် shortcuts များ သုံးခြင်း။"
    },
    myanmarExplanation: "VS Code ကို code.visualstudio.com တွင် အခမဲ့ရယူနိုင်ပြီး HTML, CSS, JavaScript ရေးသားရန် အကောင်းဆုံး tools များနှင့် shortcuts များစွာ ပါရှိသည်။",
    theory: "IDE (Integrated Development Environment) နှင့် Code Editor ၏ ကွာခြားချက်ကို သိရှိပြီး၊ editor များ၏ ပေါ့ပါးသွက်လက်မှုကို အသုံးချခြင်း။",
    englishKeywords: ["Editor", "Extension", "Shortcut", "Auto-complete", "Live Server"],
    stepByStepExplanation: [
      "VS Code installer ကို download ဆွဲပါ။",
      "စက်ထဲသို့ install လုပ်ပါ။",
      "Live Server extension ကို ရှာဖွေပြီး တပ်ဆင်ပါ။"
    ],
    outputPreview: "Visual Studio Code Interface loaded.",
    tips: ["Ctrl + ` (backtick) ကို သုံးပြီး VS Code terminal ကို ဖွင့်နိုင်သည်။"],
    assignment: {
      title: "VS Code Setup Check",
      description: "သင့်စက်တွင် VS Code စနစ်တကျ ရှိမရှိ စစ်ဆေးပါ။",
      instructions: ["VS Code ကို install လုပ်ပြီးနောက် အသုံးပြုပုံအဆင့်ဆင့်ကို ပြန်လည်ရေးသားပါ။"]
    },
    lessonSummary: "VS Code သည် ဝဘ်ရေးသားရန် အကောင်းဆုံး editor ဖြစ်ပြီး Live Server သုံးခြင်းဖြင့် လက်တွေ့လေ့ကျင့်မှု လွယ်ကူစေသည်။",
    nextLesson: "Creating Your First HTML File"
  },
  {
    id: "html-5",
    title: "Creating Your First HTML File",
    slug: "creating-first-html-file",
    duration: "25 mins",
    whatIsIt: "ပထမဆုံး HTML ဖိုင်ကို စတင်ဖန်တီးပြီး စာလုံးများ ရေးသားကာ browser တွင် ဖွင့်လှစ်ကြည့်ရှုခြင်း ဖြစ်ပါသည်။",
    whyImportant: "ဝက်ဘ်ဆိုက်တည်ဆောက်ခြင်း၏ ပထမဆုံး လက်တွေ့ခြေလှမ်းဖြစ်ပြီး ဖိုင် extension များအကြောင်း နားလည်စေရန် အရေးကြီးပါသည်။",
    realWorldUsage: "ဝက်ဘ်ဆိုက်တစ်ခု၏ ပင်မပင်မစာမျက်နှာဖိုင်ကို အမြဲတမ်း index.html ဟု အမည်ပေးလေ့ရှိကြပါသည်။",
    syntax: `<!-- File format requirement -->
index.html`,
    examples: [
      `<!-- index.html တွင် ကုဒ်များ စတင်ရေးသားသည် -->\n<h1>My First Webpage!</h1>`
    ],
    commonMistakes: [
      {
        mistake: "index.txt သို့မဟုတ် index.html.txt ဟု ဖိုင်အမည် ပေးမိခြင်း",
        correction: "index.html ဟုသာ ပေးပါ",
        explanation: "ဖိုင် extension သည် .html ဖြစ်ရန် လိုအပ်ပါသည်။ မဟုတ်ပါက browser က ဖတ်မည်မဟုတ်ပါ။"
      }
    ],
    bestPractices: [
      "ဖိုင်အမည်များတွင် space (ကွက်လပ်) မခြားပါနှင့်။ စာလုံးအသေးကိုသာ သုံးပါ။"
    ],
    miniExercise: {
      id: "ex-html-5",
      instruction: "ဝက်ဘ်ဆိုက်၏ ပင်မစာမျက်နှာဖိုင်အမည်ကို အောက်တွင် ရေးသားပါ။",
      codeTemplate: "index.html",
      expectedOutput: "index.html",
      hints: ["index.html ဟု ရေးသားပေးရပါမည်။"]
    },
    quiz: [
      {
        id: "q-html-5",
        question: "HTML ဖိုင်များ သိမ်းဆည်းရာတွင် အသုံးပြုရမည့် ဖိုင် extension မှာ မည်သည်ဖြစ်သနည်း။",
        options: [
          ".html",
          ".txt",
          ".css",
          ".docx"
        ],
        correctOptionIndex: 0,
        explanation: "HTML ဖိုင်ဖြစ်ရန်အတွက် ဖိုင်အမည်နောက်တွင် .html extension ရှိရပါမည်။"
      }
    ],
    miniProject: {
      title: "Hello World Page",
      description: "ကိုယ်ပိုင် index.html ဖိုင်တစ်ခု တည်ဆောက်ပြီး Hello World ဟု ရေးသားပါ။",
      guide: ["index.html ဖိုင်ဆောက်ပါ။", "<h1>Hello World</h1> ဟု ရေးပါ။"],
      startingCode: "<h1>Hello World</h1>"
    },
    learningObjectives: {
      what: "HTML ဖိုင်တစ်ဖိုင် ဖန်တီးနည်းနှင့် ၎င်းအား browser တွင် စနစ်တကျ ဖွင့်နည်းကို လေ့လာရန်။",
      why: "ဝက်ဘ်ပရောဂျက်တစ်ခုကို စတင်နိုင်ရန်။",
      when: "ဝက်ဘ်ဆိုက်အသစ်တစ်ခု စတင်ဆောက်လုပ်သည့် အခါတိုင်းတွင် သုံးသည်။",
      how: "ဖိုင်အသစ်ဆောက်ကာ .html ဟု အမည်ပေးပြီး text editor ဖြင့် ရေးသားခြင်း။"
    },
    myanmarExplanation: "ဖိုင်အမည်ပေးရာတွင် အင်္ဂလိပ်စာလုံးအသေးများသာ အသုံးပြုပြီး index.html ဟု ရေးသားကာ browser ဖြင့် Double-click နှိပ်၍ ဖွင့်ကြည့်နိုင်ပါသည်။",
    theory: "Operating systems များသည် ဖိုင်များကို မည်သို့ကိုင်တွယ်ရမည်ကို သိရှိရန် ဖိုင် extension (.html, .jpg) များကို ကြည့်ရှုအသုံးပြုကြသည်။",
    englishKeywords: ["Extension", "File Name", "Index", "Workspace", "File Explorer"],
    stepByStepExplanation: [
      "Folder အသစ်တစ်ခု ဆောက်ပါ။",
      "၎င်းထဲတွင် index.html ဖိုင်ဆောက်ပါ။",
      "ကုဒ်ရေးပြီး browser ဖြင့် ဖွင့်လှစ်ပါ။"
    ],
    outputPreview: "Hello World (Browser တွင် ပေါ်လာမည်)",
    tips: ["အမြဲတမ်း space ခြားမည့်အစား hyphen (-) သို့မဟုတ် underscore (_) ကို သုံးပါ။"],
    assignment: {
      title: "File Extension Practice",
      description: "မှန်ကန်သော ဖိုင်အမည်စနစ်ကို လေ့လာပါ။",
      instructions: ["မှန်ကန်သော ဝဘ်ဖိုင်အမည်ပေးစနစ် ၃ ခုကို ရေးပြပါ။"]
    },
    lessonSummary: "HTML ဖိုင်များ၏ အဓိက extension မှာ .html ဖြစ်ပြီး ပင်မစာမျက်နှာကို index.html ဟု သတ်မှတ်သည်။",
    nextLesson: "HTML Document Structure"
  },

  // ==========================================
  // MODULE 2: HTML BASICS
  // ==========================================
  {
    id: "html-6",
    title: "HTML Document Structure",
    slug: "html-document-structure",
    duration: "30 mins",
    whatIsIt: "HTML စာမျက်နှာတစ်ခုလုံး၏ အခြေခံ အရိုးစု တည်ဆောက်ပုံ ဖြစ်ပါသည်။",
    whyImportant: "စံနှုန်းကိုက်ညီသော document structure မရှိပါက search engines (SEO) နှင့် browser များတွင် စာမျက်နှာကို စနစ်တကျ ဖတ်ရှုရန် မဖြစ်နိုင်ပါ။",
    realWorldUsage: "ကမ္ဘာပေါ်ရှိ ခေတ်မီ ဝက်ဘ်ဆိုက်တိုင်း၏ ရင်းမြစ်ကုဒ် (Source code) ကို ဖွင့်ကြည့်ပါက ဤ structure အား တွေ့ရှိရမည် ဖြစ်ပါသည်။",
    syntax: `<!DOCTYPE html>
<html>
<head>
    <title>Title</title>
</head>
<body>
    <!-- Content goes here -->
</body>
</html>`,
    examples: [
      `<!DOCTYPE html>\n<html>\n<head>\n    <title>My Web</title>\n</head>\n<body>\n    <p>Hello World</p>\n</body>\n</html>`
    ],
    commonMistakes: [
      {
        mistake: "<body> tag ထဲတွင် <head> သို့မဟုတ် <title> ကို ထည့်ရေးခြင်း",
        correction: "သီးခြားခွဲရေးပါ",
        explanation: "head သည် အချက်အလက်များအတွက် ဖြစ်ပြီး body သည် လူမြင်နိုင်သော အပိုင်းအတွက် သီးခြားစီ ဖြစ်သည်။"
      }
    ],
    bestPractices: [
      "HTML tags များ အထပ်ထပ် nesting ဖြစ်ပုံကို စနစ်တကျ indentation (Space/Tab) ပေး၍ ရေးသားပါ။"
    ],
    miniExercise: {
      id: "ex-html-6",
      instruction: "HTML basic structure တစ်ခုကို ဖွင့် tag၊ ပိတ် tag ညီအောင် တည်ဆောက်ပါ။",
      codeTemplate: "<html>\n<head></head>\n<body></body>\n</html>",
      expectedOutput: "<html>\n<head></head>\n<body></body>\n</html>",
      hints: ["html ဖွင့်ပိတ်၊ head ဖွင့်ပိတ် နှင့် body ဖွင့်ပိတ် များကို သုံးပါ။"]
    },
    quiz: [
      {
        id: "q-html-6",
        question: "HTML စာမျက်နှာတစ်ခု၏ မြင်နိုင်သော အစိတ်အပိုင်းများကို မည်သည့် tag အတွင်း၌ ရေးသားရသနည်း။",
        options: [
          "<body>",
          "<head>",
          "<title>",
          "<html>"
        ],
        correctOptionIndex: 0,
        explanation: "အသုံးပြုသူ မြင်တွေ့နိုင်သော အရာများ (ပုံများ၊ စာများ၊ စားပွဲများ) ကို <body> tag ထဲတွင် ရေးရပါသည်။"
      }
    ],
    miniProject: {
      title: "Structural Page Setup",
      description: "စံနှုန်းကိုက်ညီသော HTML outline တစ်ခုဆွဲပါ။",
      guide: ["doctype, html, head, title, body များကို သုံးပါ။"],
      startingCode: "<!DOCTYPE html>\n<html>\n<head>\n<title>My Project</title>\n</head>\n<body>\n</body>\n</html>"
    },
    learningObjectives: {
      what: "HTML document တစ်ခုလုံး၏ အစိတ်အပိုင်းများနှင့် tree structure ကို နားလည်ရန်။",
      why: "ဝက်ဘ်ဆိုက်များကို ကမ္ဘာ့စံချိန်စံညွှန်းမီ ရေးဆွဲတတ်စေရန်။",
      when: "ဝက်ဘ်စာမျက်နှာတစ်ခု စတင်ရေးသားသည့်အခါတိုင်း လိုအပ်သည်။",
      how: "Tags များကို စနစ်တကျ အထပ်ထပ် Nesting ပြုလုပ်၍ ရေးသားခြင်း။"
    },
    myanmarExplanation: "HTML structure တွင် head (မျက်နှာပြင်ပေါ်မပေါ်သော အချက်အလက်များ) နှင့် body (မျက်နှာပြင်ပေါ်တွင် ပြသရမည့် အရာများ) ဟူ၍ အဓိက အပိုင်းနှစ်ပိုင်း ကွဲပြားသည်။",
    theory: "DOM (Document Object Model) သည် ဤ HTML nesting structure ကို အခြေခံ၍ browser ထဲတွင် memory tree တည်ဆောက်သည်။",
    englishKeywords: ["Structure", "Nesting", "Head", "Body", "DOM"],
    stepByStepExplanation: [
      "DOCTYPE ကို ကြေညာပါ။",
      "<html> root element ကို ဆောက်ပါ။",
      "<head> နှင့် <body> ကို အဆင့်ဆင့် ထည့်သွင်းပါ။"
    ],
    outputPreview: "Empty structured webpage.",
    tips: ["VS Code တွင် ! (exclamation mark) ကို နှိပ်ပြီး Tab ခေါက်ပါက ဤ structure အလိုအလျောက် ပေါ်လာမည်။"],
    assignment: {
      title: "Structure Diagram Check",
      description: "HTML basic tags များ၏ hierarchy ကို ချရေးပါ။",
      instructions: ["HTML tag တွေရဲ့ ဆက်နွယ်မှု hierarchy ပုံစံကို စာအုပ်ထဲတွင် ချရေးပြီး လေ့လာပါ။"]
    },
    lessonSummary: "HTML template တွင် doctype, html, head, title, body စသည့် tags များ စနစ်တကျ အထပ်ထပ် ပါဝင်သည်။",
    nextLesson: "DOCTYPE"
  },
  {
    id: "html-7",
    title: "DOCTYPE",
    slug: "doctype-declaration",
    duration: "15 mins",
    whatIsIt: "DOCTYPE (Document Type Declaration) ဆိုသည်မှာ browser များကို ဤဖိုင်သည် HTML5 ဗားရှင်းဖြစ်ကြောင်း ပြောပြသည့် ညွှန်ကြားချက် ဖြစ်ပါသည်။",
    whyImportant: "DOCTYPE မပါဝင်ပါက browser များသည် 'Quirks Mode' သို့ ရောက်ရှိသွားပြီး ဒီဇိုင်းများ ပျက်စီးကာ browser တစ်ခုနှင့်တစ်ခု ပြသပုံ မတူညီဘဲ ဖြစ်တတ်ပါသည်။",
    realWorldUsage: "ခေတ်မီ HTML5 ဆိုက်များအားလုံး၏ ထိပ်ဆုံး (ပထမဆုံးစာကြောင်း) တွင် ဤကုဒ်ကို ထည့်သွင်းရမည် ဖြစ်ပါသည်။",
    syntax: `<!DOCTYPE html>`,
    examples: [
      `<!DOCTYPE html>\n<html>\n</html>`
    ],
    commonMistakes: [
      {
        mistake: "<html> ရေးပြီးမှ အောက်စာကြောင်းတွင် <!DOCTYPE html> သွားရေးခြင်း",
        correction: "ထိပ်ဆုံးတွင် ရေးပါ",
        explanation: "DOCTYPE သည် HTML ဖိုင်၏ ပထမဆုံး စာကြောင်း၊ ပထမဆုံး စာလုံး ဖြစ်ရပါမည်။"
      }
    ],
    bestPractices: [
      "အမြဲတမ်း <!DOCTYPE html> ဟု စာလုံးအကြီးဖြင့် standard ပုံစံ ရေးသားရန် သတိပြုပါ။"
    ],
    miniExercise: {
      id: "ex-html-7",
      instruction: "HTML5 DOCTYPE ကို အမှားအယွင်းမရှိ ရေးသားပါ။",
      codeTemplate: "<!DOCTYPE html>",
      expectedOutput: "<!DOCTYPE html>",
      hints: ["<!DOCTYPE html> သာ ဖြစ်ပါသည်။"]
    },
    quiz: [
      {
        id: "q-html-7",
        question: "DOCTYPE ၏ အဓိက ရည်ရွယ်ချက်မှာ မည်သည်ဖြစ်သနည်း။",
        options: [
          "Browser အား HTML standard ဗားရှင်းကို ပြောပြရန်",
          "ဝက်ဘ်ဆိုက်၏ ခေါင်းစဉ် သတ်မှတ်ရန်",
          "ဝက်ဘ်ဆိုက်တွင် ပုံများ ပြသရန်",
          "ကုဒ်များကို လျှို့ဝှက်သိမ်းဆည်းရန်"
        ],
        correctOptionIndex: 0,
        explanation: "DOCTYPE သည် Browser အား HTML standard ဗားရှင်း (HTML5) ကို အသိပေးရန်အတွက် သုံးခြင်း ဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "Boilerplate Starter",
      description: "DOCTYPE ပါဝင်သော startup code တည်ဆောက်ပါ။",
      guide: ["ပထမဆုံးလိုင်းတွင် <!DOCTYPE html> ရေးပါ။"],
      startingCode: "<!DOCTYPE html>\n<html>\n</html>"
    },
    learningObjectives: {
      what: "DOCTYPE ၏ အဓိပ္ပာယ်နှင့် Browser behavior ပေါ်တွင် သက်ရောက်ပုံကို နားလည်ရန်။",
      why: "Browser များတွင် ဒီဇိုင်းများ တသမတ်တည်း ကောင်းမွန်စွာ ပေါ်လာစေရန်။",
      when: "HTML document တိုင်း တည်ဆောက်တိုင်း သုံးသည်။",
      how: "ဖိုင်၏ ထိပ်ဆုံးလိုင်းတွင် တစ်ကြိမ်သာ ထည့်သွင်းခြင်း။"
    },
    myanmarExplanation: "DOCTYPE သည် HTML element တစ်ခု မဟုတ်ပါ။ Browser ကို html standards အတိုင်း render လုပ်ခိုင်းသည့် ညွှန်ကြားချက် သက်သက်သာ ဖြစ်သည်။",
    theory: "ခေတ်ဟောင်း HTML ဗားရှင်းများတွင် DOCTYPE သည် အလွန်ရှည်လျားသော DTD (Document Type Definition) links များ လိုအပ်ခဲ့သော်လည်း HTML5 တွင် ရိုးရှင်းသွားသည်။",
    englishKeywords: ["DOCTYPE", "Declaration", "Standards Mode", "Quirks Mode", "DTD"],
    stepByStepExplanation: [
      "အမြဲတမ်း ဖိုင်၏ line 1 တွင် ရေးပါ။",
      "<!DOCTYPE html> ဟု ရေးသားပါ။"
    ],
    outputPreview: "Quirks mode disabled, Standards mode active.",
    tips: ["DOCTYPE သည် case-insensitive ဖြစ်သော်လည်း standard အနေဖြင့် စာလုံးအကြီး ရေးကြသည်။"],
    assignment: {
      title: "DOCTYPE Research",
      description: "Quirks mode နှင့် Standards mode ခြားနားချက်ကို ရှာဖွေပါ။",
      instructions: ["Quirks mode ဆိုတာ ဘာလဲဆိုတာကို အကျဉ်းချုပ် ရေးသားပါ။"]
    },
    lessonSummary: "<!DOCTYPE html> သည် browser များကို HTML5 အတိုင်း အလုပ်လုပ်ရန် ညွှန်ကြားပေးသည့် ညွှန်ကြားချက်ဖြစ်သည်။",
    nextLesson: "html Tag"
  },
  {
    id: "html-8",
    title: "html Tag",
    slug: "html-tag",
    duration: "15 mins",
    whatIsIt: "<html> tag သည် HTML document တစ်ခုလုံး၏ အမြစ် (Root Element) ဖြစ်ပါသည်။",
    whyImportant: "Browser များသည် ဤ tag အတွင်းရှိ သမျှကိုသာ HTML code အဖြစ် သတ်မှတ်ပြီး လုပ်ဆောင်သောကြောင့် ကျန် tag အားလုံးကို ဤ tag အတွင်း Nesting လုပ်ရပါမည်။",
    realWorldUsage: "ဝက်ဘ်ဆိုက်၏ မူရင်းဘာသာစကားကို ဖော်ပြရန် <html lang=\"my\"> (မြန်မာ) သို့မဟုတ် <html lang=\"en\"> (အင်္ဂလိပ်) ဟု အသုံးပြုကြပါသည်။",
    syntax: `<html lang="en">
    <!-- All tags go here -->
</html>`,
    examples: [
      `<html lang="en">\n</html>`
    ],
    commonMistakes: [
      {
        mistake: "<html> tag အား ပြန်မပိတ်ဘဲ ထားခြင်း",
        correction: "</html> ဟု ပြန်ပိတ်ပါ",
        explanation: "Root element ဖြစ်သောကြောင့် ဖိုင်၏ နောက်ဆုံးတွင် သေချာစွာ ပြန်ပိတ်ပေးရပါမည်။"
      }
    ],
    bestPractices: [
      "lang attribute ကို အမြဲတမ်း ထည့်သွင်းရေးသားပေးခြင်းဖြင့် SEO နှင့် screen readers များအတွက် ကောင်းမွန်စေပါသည်။"
    ],
    miniExercise: {
      id: "ex-html-8",
      instruction: "ဘာသာစကားအဖြစ် 'my' (Myanmar) သတ်မှတ်ထားသော html tag ကို ရေးသားပါ။",
      codeTemplate: "<html lang=\"my\"></html>",
      expectedOutput: "<html lang=\"my\"></html>",
      hints: ["lang=\"my\" attribute ထည့်ပေးရပါမည်။"]
    },
    quiz: [
      {
        id: "q-html-8",
        question: "HTML document တစ်ခု၏ root (အမြစ်) element မှာ မည်သည်ဖြစ်သနည်း။",
        options: [
          "<html>",
          "<body>",
          "<head>",
          "<!DOCTYPE>"
        ],
        correctOptionIndex: 0,
        explanation: "<html> သည် HTML document တစ်ခုလုံး၏ အမြစ်ဖြစ်ပြီး tags အားလုံးကို ၎င်းအတွင်း၌ ထည့်သွင်းရသည်။"
      }
    ],
    miniProject: {
      title: "Root Set",
      description: "မြန်မာဘာသာ သတ်မှတ်ထားသော root element တည်ဆောက်ပါ။",
      guide: ["lang=\"my\" ပါသော html tag ကို ဖန်တီးပါ။"],
      startingCode: "<html lang=\"my\">\n</html>"
    },
    learningObjectives: {
      what: "<html> element ၏ အခန်းကဏ္ဍနှင့် lang attribute သုံးစွဲပုံကို လေ့လာရန်။",
      why: "ဝက်ဘ်ဆိုက်များ၏ ဘာသာစကားသတ်မှတ်ချက်ကို ရှင်းလင်းစွာ သိရှိရန်။",
      when: "ဝက်ဘ်ဆိုက်တိုင်း၏ အခြေခံအဆောက်အဦးတွင် အမြဲသုံးသည်။",
      how: "lang attribute တွင် 'en', 'my', 'ja' စသည်ဖြင့် ထည့်သွင်းခြင်း။"
    },
    myanmarExplanation: "<html> tag သည် ကျန်ရှိသော tag များကို စုစည်းပေးထားသည့် container ကြီးတစ်ခု ဖြစ်ပြီး ၎င်းအတွင်းတွင် head နှင့် body တို့ ပါဝင်သည်။",
    theory: "lang attribute သည် translation tools များနှင့် text-to-speech tools များအတွက် စာမျက်နှာကို မှန်ကန်စွာ ဘာသာပြန်နိုင်ရန် ကူညီပေးသည်။",
    englishKeywords: ["Root", "Language Attribute", "Nesting", "SEO", "Accessibility"],
    stepByStepExplanation: [
      "<html> tag ကို စတင်ရေးသားပါ။",
      "lang attribute ထည့်သွင်းပါ။",
      "ပိတ် tag </html> ဖြင့် အဆုံးသတ်ပါ။"
    ],
    outputPreview: "Root container loaded.",
    tips: ["lang attribute ထည့်ခြင်းသည် SEO (Search Engine Optimization) အတွက် များစွာ အထောက်အကူပြုသည်။"],
    assignment: {
      title: "Lang Attribute Search",
      description: "ကွဲပြားသော ဘာသာစကား codes များကို လေ့လာပါ။",
      instructions: ["မြန်မာ၊ ဂျပန်၊ တရုတ် နှင့် စပိန် ဘာသာစကားတို့၏ lang attribute ကုဒ်များကို ချရေးပါ။"]
    },
    lessonSummary: "<html> tag သည် HTML document တစ်ခုလုံး၏ အခြေခံ root element ဖြစ်ပြီး lang attribute နှင့်အတူ ရေးသားလေ့ရှိသည်။",
    nextLesson: "head Tag"
  },
  {
    id: "html-9",
    title: "head Tag",
    slug: "head-tag",
    duration: "20 mins",
    whatIsIt: "<head> tag သည် ဝက်ဘ်ဆိုက်စာမျက်နှာပေါ်တွင် တိုက်ရိုက် မပြသသော Metadata (အချက်အလက်များ) ကို သိမ်းဆည်းသည့် နေရာ ဖြစ်ပါသည်။",
    whyImportant: "စာမျက်နှာ၏ ခေါင်းစဉ် (Title)၊ စာလုံးပုံစံများ (Fonts)၊ စတိုင်လ်များ (CSS) နှင့် SEO ရှာဖွေမှု အချက်အလက်များအားလုံးကို <head> အတွင်း၌သာ ကြေညာပေးရပါသည်။",
    realWorldUsage: "Google တွင် ရှာဖွေသည့်အခါ ပေါ်လာသော စာသားများနှင့် ဖုန်းတွင် ဝက်ဘ်ဆိုက်များ ချောမွေ့စွာ ပေါ်လာအောင် လုပ်ဆောင်ပေးသော ကုဒ်များသည် head ထဲတွင် ရှိပါသည်။",
    syntax: `<head>
    <title>ငါ့ဝက်ဘ်ဆိုက်</title>
</head>`,
    examples: [
      `<head>\n    <meta charset="UTF-8">\n    <title>Home - My Web</title>\n</head>`
    ],
    commonMistakes: [
      {
        mistake: "<head> ထဲတွင် <h1> သို့မဟုတ် <p> tags များ ထည့်ရေးပြီး မျက်နှာပြင်ပေါ်တွင် ပြသရန် ကြိုးစားခြင်း",
        correction: "<body> ထဲသို့ ရွှေ့ရေးပါ",
        explanation: "<head> ထဲရှိ tag များသည် browser အတွက်သာ ဖြစ်ပြီး အသုံးပြုသူမြင်ရန် မဟုတ်ပါ။"
      }
    ],
    bestPractices: [
      "<head> အတွင်း၌ အမြဲတမ်း <meta charset=\"UTF-8\"> ကို ထည့်သွင်းခြင်းဖြင့် မြန်မာစာလုံးများ အမှားအယွင်းမရှိ ပေါ်လာစေပါသည်။"
    ],
    miniExercise: {
      id: "ex-html-9",
      instruction: "<head> tag အတွင်း 'My Blog' ဟူသော title tag တစ်ခုကို ရေးသားပါ။",
      codeTemplate: "<head>\n    <title>My Blog</title>\n</head>",
      expectedOutput: "<head>\n    <title>My Blog</title>\n</head>",
      hints: ["head tag ကြားတွင် title tag ကို ရေးသားပါ။"]
    },
    quiz: [
      {
        id: "q-html-9",
        question: "အောက်ပါတို့အနက် စာမျက်နှာပေါ်တွင် လူသားများ မမြင်နိုင်သော Metadata များကို မည်သည့် tag တွင် ထည့်သွင်းရသနည်း။",
        options: [
          "<head>",
          "<body>",
          "<html>",
          "<h1>"
        ],
        correctOptionIndex: 0,
        explanation: "<head> tag သည် စာမျက်နှာ၏ metadata၊ title နှင့် ပြင်ပ CSS links များကို သိုလှောင်ရန် နေရာဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "Metadata Setup",
      description: "ခေါင်းစဉ်နှင့် စာလုံးစနစ် သတ်မှတ်ထားသော head တစ်ခုကို ရေးဆွဲပါ။",
      guide: ["<head> နှင့် <title> များကို ပေါင်းစပ်ရေးသားပါ။"],
      startingCode: "<head>\n    <meta charset=\"UTF-8\">\n    <title>My Portfolio</title>\n</head>"
    },
    learningObjectives: {
      what: "<head> ၏ သဘောတရားနှင့် ၎င်းအတွင်းရှိ အဓိက tags များကို သိရှိနားလည်ရန်။",
      why: "စာမျက်နှာ၏ နောက်ကွယ်မှ အချက်အလက်များကို စနစ်တကျ ထိန်းချုပ်နိုင်ရန်။",
      when: "ဝက်ဘ်ဆိုက်များ၏ document configuration လုပ်သည့်အခါတိုင်း သုံးသည်။",
      how: "Title, character encoding (UTF-8), stylesheets စသည်တို့ကို ချိတ်ဆက်ခြင်း။"
    },
    myanmarExplanation: "head tag သည် browser အတွက် စာမျက်နှာ၏ အချက်အလက်များကို ပေးဆောင်သည့် ဦးခေါင်းပိုင်း ဖြစ်ပြီး အသုံးပြုသူ မြင်တွေ့နိုင်သော အရာများ မပါဝင်ပါ။",
    theory: "Metadata ဆိုသည်မှာ ဒေတာများအကြောင်းကို ဖော်ပြထားသည့် ဒေတာ (Data about data) ဖြစ်ပြီး search engines များ စာမျက်နှာကို ဖတ်ရှုရာတွင် သုံးသည်။",
    englishKeywords: ["Metadata", "Title", "UTF-8", "Encoding", "SEO Configuration"],
    stepByStepExplanation: [
      "<head> opening tag ကို ရေးပါ။",
      "<title> tag ဖြင့် စာမျက်နှာ၏ အမည်ပေးပါ။",
      "</head> ဖြင့် ပိတ်ပါ။"
    ],
    outputPreview: "Tab title updated in browser tab.",
    tips: ["Character encoding UTF-8 မပါပါက အချို့သော မြန်မာစာလုံးများ ပျက်စီးနိုင်ပါသည်။"],
    assignment: {
      title: "Title Tag Experiment",
      description: "Title tag ၏ အရေးကြီးပုံကို လေ့လာပါ။",
      instructions: ["Title tag က SEO အတွက် ဘာကြောင့် အရေးကြီးလဲဆိုတာ စာကြောင်း ၃ ကြောင်း ချရေးပါ။"]
    },
    lessonSummary: "<head> tag သည် browser နှင့် search engine များအတွက် metadata များကို သိုလှောင်ပေးသော နေရာဖြစ်သည်။",
    nextLesson: "body Tag"
  },
  {
    id: "html-10",
    title: "body Tag",
    slug: "body-tag",
    duration: "20 mins",
    whatIsIt: "<body> tag သည် ဝက်ဘ်ဆိုက်စာမျက်နှာပေါ်တွင် တိုက်ရိုက် မြင်တွေ့ရမည့် အရာအားလုံးကို ထည့်သွင်းရသည့် ကိုယ်ထည်အပိုင်း ဖြစ်ပါသည်။",
    whyImportant: "စာသားများ၊ ပုံများ၊ link များ၊ ဗီဒီယိုများနှင့် forms များအားလုံးသည် <body> tag အတွင်းရှိမှသာ အသုံးပြုသူ မြင်တွေ့နိုင်မည် ဖြစ်ပါသည်။",
    realWorldUsage: "သင်မြင်တွေ့နေရသော ကတ်ပြားများ၊ ခလုတ်များ၊ စာပိုဒ်များအားလုံးသည် body tag အတွင်း ရေးသားထားသော ကုဒ်များ ဖြစ်ကြပါသည်။",
    syntax: `<body>
    <h1>မင်္ဂလာပါ</h1>
    <p>အသုံးပြုသူများ မြင်ရမည့်အရာများ ဖြစ်သည်။</p>
</body>`,
    examples: [
      `<body>\n    <h2>Aung Aung</h2>\n    <p>Web Developer</p>\n</body>`
    ],
    commonMistakes: [
      {
        mistake: "HTML ဖိုင်တစ်ခုတည်းတွင် <body> tag အား နှစ်ကြိမ် ထည့်ရေးခြင်း",
        correction: "<body> tag တစ်ခုသာ သုံးပါ",
        explanation: "HTML စာမျက်နှာတစ်ခုတွင် body tag တစ်ခုသာ ရှိရပါမည်။"
      }
    ],
    bestPractices: [
      "<body> ထဲရှိ ကုဒ်များကို သတ်သတ်ရပ်ရပ် ဖြစ်စေရန် semantic tags များနှင့် စနစ်တကျ စုစည်းပါ။"
    ],
    miniExercise: {
      id: "ex-html-10",
      instruction: "<body> tag အတွင်း <p>Hello</p> ဟူသော element တစ်ခုကို ရေးသားပါ။",
      codeTemplate: "<body>\n    <p>Hello</p>\n</body>",
      expectedOutput: "<body>\n    <p>Hello</p>\n</body>",
      hints: ["<body> tags ကြားတွင် paragraph tag ကို ထည့်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-10",
        question: "ဝဘ်စာမျက်နှာပေါ်တွင် ပုံများနှင့် စာသားများ အမှန်တကယ် ပေါ်လာစေရန် မည်သည့် tag အတွင်း၌ ရေးသားရသနည်း။",
        options: [
          "<body>",
          "<head>",
          "<title>",
          "<html>"
        ],
        correctOptionIndex: 0,
        explanation: "<body> tag သည် ဝဘ်စာမျက်နှာပေါ်တွင် အမှန်တကယ် ပေါ်လာမည့် အကြောင်းအရာများအားလုံးကို ထည့်သွင်းရမည့် ကိုယ်ထည် ဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "Interactive Body Layout",
      description: "ခေါင်းစဉ်နှင့် စာသားပါဝင်သော ရိုးရှင်းသည့် ကိုယ်ထည်တစ်ခုကို ဖန်တီးပါ။",
      guide: ["<body> tag အတွင်း <h1> နှင့် <p> ကို အသုံးပြုပါ။"],
      startingCode: "<body>\n    <h1>Welcome</h1>\n    <p>This is my body section.</p>\n</body>"
    },
    learningObjectives: {
      what: "<body> tag ၏ ရည်ရွယ်ချက်နှင့် စာမျက်နှာပေါ်တွင် visible ဖြစ်ပုံကို လေ့လာရန်။",
      why: "ဝက်ဘ်ဆိုက်၏ အဓိက အကြောင်းအရာများကို ဖန်တီးနိုင်ရန်။",
      when: "ဝက်ဘ်ဆိုက်တွင် ပါဝင်မည့်အရာများကို နေရာချတိုင်း သုံးသည်။",
      how: "<body> tags ကြားတွင် အခြားသော text သို့မဟုတ် media elements များ ထည့်သွင်းခြင်း။"
    },
    myanmarExplanation: "body tag သည် HTML template ၏ ဒုတိယအရေးအကြီးဆုံး အပိုင်းဖြစ်ပြီး အသုံးပြုသူများ လက်တွေ့အပြန်အလှန် ထိတွေ့လုပ်ဆောင်ရမည့် အရာအားလုံး တည်ရှိရာ ဖြစ်သည်။",
    theory: "Browser သည် HTML architecture ကို ဖတ်ရှုပြီးနောက် body အတွင်းရှိ သမျှကို layout စနစ်ဖြင့် screen ပေါ်တွင် pixel များအဖြစ် စတင်ဆွဲသား (painting) ပေးသည်။",
    englishKeywords: ["Body", "Visible Content", "Layout", "Rendering", "Painting"],
    stepByStepExplanation: [
      "<body> opening tag ကို ရေးပါ။",
      "အလယ်တွင် စာသားများနှင့် content tags များ ထည့်ပါ။",
      "</body> tag ပိတ်ပြီး အဆုံးသတ်ပါ။"
    ],
    outputPreview: "Welcome\nThis is my body section. (On screen)",
    tips: ["CSS styling အများစုကို body ပေါ်တွင် သတ်မှတ်ပြီး default styles များအဖြစ် သုံးနိုင်သည်။"],
    assignment: {
      title: "Body Tag Content Map",
      description: "Body tag အတွင်း ထည့်နိုင်သော tags ၅ ခုကို ရှာဖွေပါ။",
      instructions: ["Body tag ထဲမှာ ရေးလို့ရတဲ့ tag အမျိုးအစား ၅ ခုကို စာအုပ်ထဲတွင် ချရေးပါ။"]
    },
    lessonSummary: "<body> tag သည် အသုံးပြုသူများ မြင်တွေ့နိုင်ပြီး အပြန်အလှန် ထိတွေ့နိုင်သော content အားလုံး၏ ပင်မ container ဖြစ်သည်။",
    nextLesson: "Comments"
  },
  {
    id: "html-11",
    title: "Comments",
    slug: "html-comments",
    duration: "15 mins",
    whatIsIt: "Comments ဆိုသည်မှာ browser မှ ဖတ်ရှုပြသမည်မဟုတ်ဘဲ ဆော့ဖ်ဝဲရေးသားသူများအတွက် အချင်းချင်း နားလည်စေရန် ကုဒ်အတွင်း မှတ်စုတိုများ ရေးသားသည့် စနစ်ဖြစ်ပါသည်။",
    whyImportant: "ရှုပ်ထွေးသော ကုဒ်များကို မည်သည့်အပိုင်းဖြစ်သည်ကို လွယ်ကူစွာ မှတ်သားနိုင်ရန်နှင့် အမှားရှာဖွေစဉ်အတွင်း ကုဒ်များကို ယာယီပိတ်ထားနိုင်ရန် အသုံးဝင်ပါသည်။",
    realWorldUsage: "အဖွဲ့အစည်းဖြင့် ကုဒ်ရေးသားသည့်အခါ 'ဤအပိုင်းသည် Header ဖြစ်သည်' သို့မဟုတ် 'API ချိတ်ဆက်သည့်နေရာ' ဟု comment ပေး၍ ဆက်သွယ်ကြပါသည်။",
    syntax: `<!-- ဤနေရာတွင် comment ရေးသားပါ -->`,
    examples: [
      `<!-- ဤစာကြောင်းသည် browser တွင် မပေါ်ပါ -->`,
      `<!-- <button>အသုံးမပြုတော့သော ခလုတ်</button> -->`
    ],
    commonMistakes: [
      {
        mistake: "// ဤကဲ့သို့ ရေးသားခြင်း",
        correction: "<!-- ဤကဲ့သို့ ရေးသားပါ -->",
        explanation: "// သည် HTML comments မဟုတ်ပါ။ ၎င်းကို သုံးပါက browser တွင် စာသားအဖြစ် ပေါ်လာပါလိမ့်မည်။"
      }
    ],
    bestPractices: [
      "Comments များတွင် အရေးကြီးသော လျှို့ဝှက်ကုဒ်များ၊ စကားဝှက်များကို ချမရေးပါနှင့်။ အသုံးပြုသူများ View Source ဖြင့် မြင်နိုင်ပါသည်။"
    ],
    miniExercise: {
      id: "ex-html-11",
      instruction: "'Note' ဟူသော စကားလုံးပါဝင်သည့် HTML comment တစ်ခုကို ရေးသားပါ။",
      codeTemplate: "<!-- Note -->",
      expectedOutput: "<!-- Note -->",
      hints: ["<!-- နှင့် စတင်ပြီး --> နှင့် ပိတ်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-11",
        question: "HTML တွင် comment ရေးသားရန် မှန်ကန်သော ပုံစံမှာ အောက်ပါတို့အနက် မည်သည်ဖြစ်သနည်း။",
        options: [
          "<!-- Comment -->",
          "// Comment",
          "/* Comment */",
          "# Comment"
        ],
        correctOptionIndex: 0,
        explanation: "HTML တွင် comment ရေးရန် <!-- အဖွင့်နှင့် --> အပိတ်ကို စနစ်တကျ အသုံးပြုရပါမည်။"
      }
    ],
    miniProject: {
      title: "Documenting Code",
      description: "ကုဒ်များအကြား မှတ်စုတိုများ ထည့်သွင်းပါ။",
      guide: ["Comment tags များကို သုံးပြီး သင့်ကုဒ်များကို အပိုင်းလိုက် ရှင်းပြပါ။"],
      startingCode: "<!-- ဤသည်မှာ ပင်မစာမျက်နှာ၏ header ဖြစ်ပါသည် -->"
    },
    learningObjectives: {
      what: "HTML Comments များ ရေးသားနည်းနှင့် ၎င်းတို့၏ ရည်ရွယ်ချက်များကို လေ့လာရန်။",
      why: "ကုဒ်များကို ပြုပြင်ထိန်းသိမ်းရ လွယ်ကူစေရန်။",
      when: "ကုဒ်အပိုင်းအစများကို ရှင်းပြချင်သည့်အခါ သို့မဟုတ် ယာယီ ပိတ်ထားချင်သည့်အခါ သုံးသည်။",
      how: "<!--  --> သင်္ကေတများအကြား စာသားများ ရေးသားခြင်းဖြင့် သုံးသည်။"
    },
    myanmarExplanation: "Comment သည် browser မျက်နှာပြင်ပေါ်တွင် လုံးဝပေါ်လာမည် မဟုတ်ပါ။ ကုဒ်ကိုဖတ်သည့် developer များအတွက်သာ ရည်ရွယ်သည့် လမ်းညွှန်ချက် ဖြစ်သည်။",
    theory: "HTML parser သည် <!-- ကို တွေ့သည်နှင့် အပိတ် --> အထိ ရှိသမျှ ဒေတာများကို ignore လုပ်ကျော်ဖြတ်သွားသည်။",
    englishKeywords: ["Comments", "Annotations", "Ignore", "Readability", "Documentation"],
    stepByStepExplanation: [
      "<!-- ဖြင့် အစပြုပါ။",
      "မှတ်စုစာသား ရေးပါ။",
      "--> ဖြင့် အဆုံးသတ်ပါ။"
    ],
    outputPreview: "(ဘာမှ ပြသမည် မဟုတ်ပါ - Hidden fully)",
    tips: ["VS Code တွင် Ctrl + / (slash) ကို နှိပ်ပြီး Comment များကို လျင်မြန်စွာ ပေးနိုင်သည်/ဖျက်နိုင်သည်။"],
    assignment: {
      title: "Comment Tag Usage",
      description: "Comments များ ရေးသားလေ့ကျင့်ပါ။",
      instructions: ["ကုဒ်တစ်ခုကို comment tags သုံးပြီး ယာယီပိတ်ကြည့်ပါ။"]
    },
    lessonSummary: "Comments (<!-- -->) ကို ကုဒ်အတွင်း မှတ်စုရေးရန် သုံးပြီး browser က ၎င်းတို့ကို ignore ပြုလုပ်ပြသမည်မဟုတ်ပါ။",
    nextLesson: "Headings"
  },
  {
    id: "html-12",
    title: "Headings",
    slug: "html-headings",
    duration: "20 mins",
    whatIsIt: "Headings ဆိုသည်မှာ ဝက်ဘ်စာမျက်နှာပေါ်ရှိ အကြောင်းအရာများ၏ ခေါင်းစဉ်များကို အဆင့်ဆင့် သတ်မှတ်ပေးသည့် tags များ ဖြစ်ပါသည်။",
    whyImportant: "ခေါင်းစဉ်များသည် ဝက်ဘ်ဆိုက်၏ အဆင့်ဆင့်ဖွဲ့စည်းပုံ (Hierarchy) ကို ပြသပေးသည့်အပြင် Google Search Engine က အဓိကအချက်များကို နားလည်စေရန် အလွန် အရေးကြီးပါသည်။",
    realWorldUsage: "သတင်းဝက်ဘ်ဆိုက်များတွင် အဓိက သတင်းခေါင်းစဉ်ကြီးကို <h1> ဖြင့် ရေးပြီး၊ သတင်းခွဲခေါင်းစဉ်များကို <h2> သို့မဟုတ် <h3> တို့ဖြင့် အဆင့်ဆင့် ရေးသားကြပါသည်။",
    syntax: `<h1>အကြီးဆုံးခေါင်းစဉ်</h1>
<h2>ဒုတိယအကြီးဆုံး</h2>
<h3>တတိယအကြီးဆုံး</h3>
<h4>စတုတ္ထ</h4>
<h5>ပဉ္စမ</h5>
<h6>အသေးဆုံးခေါင်းစဉ်</h6>`,
    examples: [
      `<h1>နွေဦးသတင်း</h1>\n<h2>ပြည်တွင်းသတင်း</h2>`
    ],
    commonMistakes: [
      {
        mistake: "စာသားများကို အက္ခရာကြီးစေချင်ရုံသက်သက်ဖြင့် <h1> ကို နေရာတကာ လျှောက်သုံးခြင်း",
        correction: "လိုအပ်မှသာ သုံးပါ",
        explanation: "စာလုံးကြီးရန်အတွက် CSS ကို သုံးရမည်ဖြစ်ပြီး၊ headings များကို အဆင့်အတန်း (Structural structure) အလိုက်သာ သုံးရပါမည်။"
      }
    ],
    bestPractices: [
      "စာမျက်နှာတစ်ခုတွင် <h1> tag ကို တစ်ခုသာ အသုံးပြုရန်နှင့် အဓိကခေါင်းစဉ်ကြီးအတွက်သာ ထားရှိရန် အကြံပြုပါသည်။"
    ],
    miniExercise: {
      id: "ex-html-12",
      instruction: "<h2> tag ကို အသုံးပြုပြီး 'HTML Learn' ဟူသော ဒုတိယအဆင့် ခေါင်းစဉ်တစ်ခု ရေးသားပါ။",
      codeTemplate: "<h2>HTML Learn</h2>",
      expectedOutput: "<h2>HTML Learn</h2>",
      hints: ["<h2> အဖွင့်နှင့် </h2> အပိတ်ကို သုံးပါ။"]
    },
    quiz: [
      {
        id: "q-html-12",
        question: "HTML တွင် အကြီးဆုံးသော ခေါင်းစဉ်အဆင့်ကို သတ်မှတ်ပေးသည့် tag မှာ အောက်ပါတို့အနက် မည်သည်ဖြစ်သနည်း။",
        options: [
          "<h1>",
          "<h6>",
          "<head>",
          "<heading>"
        ],
        correctOptionIndex: 0,
        explanation: "<h1> သည် အကြီးဆုံးနှင့် အရေးကြီးဆုံး ခေါင်းစဉ်ကို သတ်မှတ်ပေးပြီး <h6> သည် အသေးဆုံး ခေါင်းစဉ် ဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "News Headline Page",
      description: "သတင်းစာမျက်နှာတစ်ခု၏ ခေါင်းစဉ်ပုံစံအဆင့်ဆင့်ကို ရေးဆွဲပါ။",
      guide: ["<h1>, <h2> နှင့် <h3> တို့ကို အသုံးပြု၍ သတင်းခေါင်းစဉ်များ ရေးပါ။"],
      startingCode: "<h1>Myanmar News Today</h1>\n<h2>Local Section</h2>\n<h3>Weather Report</h3>"
    },
    learningObjectives: {
      what: "Heading tags (h1 မှ h6) ၏ အသုံးပြုပုံနှင့် စနစ်တကျ အသုံးပြုရမည့် စည်းကမ်းကို လေ့လာရန်။",
      why: "ဝက်ဘ်ဆိုက်၏ စာသားများအား အဆင့်ဆင့် ဖတ်ရလွယ်ကူစေရန်။",
      when: "ဝဘ်စာမျက်နှာတွင် ခေါင်းစဉ်များ ထည့်သွင်းလိုသည့် အခါတိုင်း သုံးသည်။",
      how: "h1, h2, h3, h4, h5, h6 tags များကို အဆင့်ဆင့် သုံးစွဲခြင်း။"
    },
    myanmarExplanation: "HTML တွင် ခေါင်းစဉ် အဆင့် ၆ ခု ရှိပြီး h1 သည် အကြီးဆုံးနှင့် အရေးကြီးဆုံး ဖြစ်ကာ h6 သည် အသေးဆုံး ဖြစ်သည်။ search engines များသည် h1 စာသားကို အလွန်ဦးစားပေး ဖတ်ရှုသည်။",
    theory: "Semantic Hierarchy အရ h1 ပြီးလျှင် h2 လာရမည်၊ h1 ပြီးမှ h3 သို့ တိုက်ရိုက်ခုန်ကျော်ခြင်းကို ရှောင်ကြဉ်ရမည်။",
    englishKeywords: ["Heading", "Hierarchy", "Semantic", "Structure", "Search Engine"],
    stepByStepExplanation: [
      "အဓိက ခေါင်းစဉ်ကြီးအတွက် <h1> ကို သုံးပါ။",
      "ခေါင်းစဉ်ခွဲငယ်များအတွက် <h2> သို့မဟုတ် <h3> ကို သုံးပါ။"
    ],
    outputPreview: "Myanmar News Today (အကြီးဆုံး)\nLocal Section (အလယ်အလတ်)\nWeather Report (အသေး)",
    tips: ["Heading tags များသည် default အနေဖြင့် စာလုံးအထူ (bold) ဖြစ်ပြီး margin အနည်းငယ် ပါရှိသည်။"],
    assignment: {
      title: "Hierarchy Construction",
      description: "စာအုပ်တစ်အုပ်၏ မာတိကာကို headings များဖြင့် ရေးသားပါ။",
      instructions: ["စာအုပ်အခန်းများနှင့် အခန်းခွဲများကို h1, h2, h3 သုံးပြီး ရေးပြပါ။"]
    },
    lessonSummary: "Heading tags (h1-h6) သည် စာမျက်နှာ၏ ခေါင်းစဉ်များကို အဆင့်လိုက် သတ်မှတ်ပေးပြီး SEO အတွက် အရေးကြီးသည်။",
    nextLesson: "Paragraphs"
  },
  {
    id: "html-13",
    title: "Paragraphs",
    slug: "html-paragraphs",
    duration: "20 mins",
    whatIsIt: "<p> tag သည် ဝက်ဘ်ဆိုက်ပေါ်တွင် စာပိုဒ် (Paragraph) များ ရေးသားရန်အတွက် အသုံးပြုသည့် tag ဖြစ်ပါသည်။",
    whyImportant: "စာသားအမြောက်အမြားကို ဖတ်ရှုရလွယ်ကူစေရန် သီးခြားစီ စာပိုဒ်လိုက် ခွဲခြားပြသပေးပြီး အလိုအလျောက် spacing (ဘေးပတ်လည်ကွက်လပ်) ထည့်ပေးပါသည်။",
    realWorldUsage: "ဆောင်းပါးများ၊ သတင်းများ၊ ထုတ်ကုန်ရှင်းလင်းချက်များနှင့် ဘလော့ဂ်ပို့စ်များရှိ စာပိုဒ်အားလုံးကို <p> tag ဖြင့် ရေးသားထားခြင်း ဖြစ်ပါသည်။",
    syntax: `<p>ဤသည်မှာ စာပိုဒ်တစ်ခု ဖြစ်သည်။</p>`,
    examples: [
      `<p>ပထမ စာပိုဒ် ဖြစ်ပါသည်။</p>\n<p>ဒုတိယ စာပိုဒ် ဖြစ်ပါသည်။</p>`
    ],
    commonMistakes: [
      {
        mistake: "စာပိုဒ်တစ်ခုလုံးကို tag မသုံးဘဲ စာသားသက်သက်သာ ရေးသားခြင်း",
        correction: "<p> tag ထဲတွင် ထည့်ရေးပါ",
        explanation: "Tag မပါသော စာသားများသည် styling လုပ်ရန် ခက်ခဲပြီး browser က format လုပ်ရန် အဆင်မပြေပါ။"
      }
    ],
    bestPractices: [
      "စာပိုဒ်များ စနစ်တကျ ကွဲပြားစေရန် တစ်ပိုဒ်လျှင် <p> tag တစ်ခုစီ သီးသန့် ခွဲခြားရေးသားပါ။"
    ],
    miniExercise: {
      id: "ex-html-13",
      instruction: "<p> tag ကို သုံးပြီး 'This is a paragraph.' ဟူသော စာသားကို ရေးသားပါ။",
      codeTemplate: "<p>This is a paragraph.</p>",
      expectedOutput: "<p>This is a paragraph.</p>",
      hints: ["<p> ဖွင့် tag နှင့် </p> ပိတ် tag ကြားတွင် ရေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-13",
        question: "ဝဘ်စာမျက်နှာပေါ်တွင် စာပိုဒ်များ ရေးသားရန် မည်သည့် tag ကို သုံးရသနည်း။",
        options: [
          "<p>",
          "<para>",
          "<text>",
          "<h1>"
        ],
        correctOptionIndex: 0,
        explanation: "<p> tag သည် paragraph ၏ အတိုကောက်ဖြစ်ပြီး စာပိုဒ်များ ရေးသားရန်အတွက် အသုံးပြုသည်။"
      }
    ],
    miniProject: {
      title: "Simple Essay Page",
      description: "ခေါင်းစဉ်တစ်ခုနှင့် စာပိုဒ်နှစ်ခု ပါဝင်သော စာမျက်နှာငယ်တစ်ခု ရေးဆွဲပါ။",
      guide: ["<h1> ဖြင့် ခေါင်းစဉ်ပေးပြီး <p> ဖြင့် စာပိုဒ်များ ရေးပါ။"],
      startingCode: "<h1>About HTML</h1>\n<p>HTML is easy to learn.</p>\n<p>It forms the structure of web pages.</p>"
    },
    learningObjectives: {
      what: "<p> tag ၏ အလုပ်လုပ်ပုံနှင့် default paragraph spacing အကြောင်းကို လေ့လာရန်။",
      why: "စာသားများကို စနစ်တကျ စုစည်းဖတ်ရှုနိုင်စေရန်။",
      when: "ဝဘ်စာမျက်နှာတွင် သာမန်စာသားများ၊ စာပိုဒ်များ ရေးသားလိုသည့်အခါတိုင်း သုံးသည်။",
      how: "<p> tags အတွင်း စာသားများ ထည့်သွင်းခြင်းဖြင့် သုံးသည်။"
    },
    myanmarExplanation: "<p> tag ကို သုံးစွဲလိုက်လျှင် browser က ၎င်းစာပိုဒ်၏ အပေါ်နှင့် အောက်တွင် margin အလိုအလျောက် ထည့်သွင်းပေးသဖြင့် စာပိုဒ်များ ကွဲကွဲပြားပြား ဖြစ်သွားစေသည်။",
    theory: "Paragraph tag သည် Block-level element တစ်ခု ဖြစ်သောကြောင့် အမြဲတမ်း စာကြောင်းအသစ် (new line) မှသာ စတင်အလုပ်လုပ်သည်။",
    englishKeywords: ["Paragraph", "Block-level", "Margin", "Spacing", "Flow"],
    stepByStepExplanation: [
      "<p> opening tag ရေးပါ။",
      "စာပိုဒ်စာသားများကို ထည့်သွင်းပါ။",
      "</p> closing tag ဖြင့် ပိတ်ပါ။"
    ],
    outputPreview: "This is a paragraph. (စာပိုဒ်ပုံစံဖြင့် စာကြောင်းချပြသမည်)",
    tips: ["စာပိုဒ်များကြား Spacing ကို CSS margin များ သုံးပြီး စိတ်ကြိုက် ပြုပြင်နိုင်သည်။"],
    assignment: {
      title: "Article Page Layout",
      description: "ဆောင်းပါးတိုလေးတစ်ပုဒ်ကို HTML ဖြင့် တည်ဆောက်ပါ။",
      instructions: ["ခေါင်းစဉ်ကြီးတစ်ခု၊ စာပိုဒ်သုံးခုပါဝင်သော ဆောင်းပါးတိုကို HTML ဖြင့် ရေးသားပါ။"]
    },
    lessonSummary: "<p> tag သည် block-level element ဖြစ်ပြီး ဝဘ်ပေါ်တွင် စာပိုဒ်များ စနစ်တကျ ရေးသားရန်နှင့် spacing ဖန်တီးရန် သုံးသည်။",
    nextLesson: "Horizontal Line"
  },
  {
    id: "html-14",
    title: "Horizontal Line",
    slug: "html-horizontal-line",
    duration: "15 mins",
    whatIsIt: "<hr> tag သည် စာမျက်နှာပေါ်တွင် ရေပြင်ညီ မျဉ်းဖြောင့်တစ်ကြောင်း (Horizontal Line) တားပေးသည့် tag ဖြစ်ပါသည်။",
    whyImportant: "အကြောင်းအရာ တစ်ခုနှင့်တစ်ခု မတူညီဘဲ ကွဲပြားခြားနားသွားကြောင်း အမြင်အာရုံဖြင့် လွယ်ကူစွာ သိရှိနိုင်ရန် အပိုင်း (Section) များ ပိုင်းခြားရာတွင် သုံးပါသည်။",
    realWorldUsage: "ဆောင်းပါးတစ်ခု၏ အောက်ခြေတွင် ဆက်စပ်သတင်းများ မလာမီ သို့မဟုတ် footer မရောက်မီ မျဉ်းတား၍ ပိုင်းခြားထားလေ့ ရှိပါသည်။",
    syntax: `<hr>`,
    examples: [
      `<p>အပိုင်း (၁)</p>\n<hr>\n<p>အပိုင်း (၂)</p>`
    ],
    commonMistakes: [
      {
        mistake: "<hr></hr> ဟု ရေးသားခြင်း",
        correction: "<hr> သာ ရေးပါ",
        explanation: "<hr> သည် Empty element (self-closing) ဖြစ်သောကြောင့် ပိတ် tag မလိုအပ်ပါ။"
      }
    ],
    bestPractices: [
      "မျဉ်းကြောင်းများကို နေရာတကာ အလွန်အကျွံ မသုံးပါနှင့်။ စာမျက်နှာကို ရှုပ်ထွေးသွားစေနိုင်ပါသည်။"
    ],
    miniExercise: {
      id: "ex-html-14",
      instruction: "<hr> tag ကို သုံးပြီး စာကြောင်းနှစ်ကြောင်းကြားတွင် မျဉ်းတစ်ကြောင်း တားပါ။",
      codeTemplate: "<p>A</p>\n<hr>\n<p>B</p>",
      expectedOutput: "<p>A</p>\n<hr>\n<p>B</p>",
      hints: ["အလယ်တွင် <hr> သာ ထည့်သွင်းပေးရပါမည်။"]
    },
    quiz: [
      {
        id: "q-html-14",
        question: "HTML တွင် ရေပြင်ညီမျဉ်းတစ်ကြောင်း တားရန် မည်သည့် tag ကို သုံးရသနည်း။",
        options: [
          "<hr>",
          "<line>",
          "<br>",
          "<border>"
        ],
        correctOptionIndex: 0,
        explanation: "<hr> (Horizontal Rule) သည် ရေပြင်ညီ မျဉ်းကြောင်းတစ်ကြောင်း ဆွဲသားပေးသည့် tag ဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "Content Separator Page",
      description: "ခေါင်းစဉ်နှင့် စာပိုဒ်များအကြားတွင် လှပသော မျဉ်းများ တားပါ။",
      guide: ["<hr> tag ကို အပိုင်းအခြားများအကြား ထည့်သွင်းသုံးစွဲပါ။"],
      startingCode: "<h1>First Section</h1>\n<p>Content A</p>\n<hr>\n<h1>Second Section</h1>\n<p>Content B</p>"
    },
    learningObjectives: {
      what: "<hr> tag ၏ ရည်ရွယ်ချက်နှင့် self-closing element များအကြောင်း လေ့လာရန်။",
      why: "စာမျက်နှာ၏ layout ကို အပိုင်းများ သေသပ်စွာ ခွဲခြားရန်။",
      when: "အကြောင်းအရာ အပြောင်းအလဲ တစ်ခုကို visual အနေဖြင့် ဖော်ပြလိုသည့်အခါ သုံးသည်။",
      how: "အပိတ် tag မပါဘဲ <hr> ဟုသာ ရေးသားခြင်း။"
    },
    myanmarExplanation: "<hr> သည် horizontal rule ကို ဆိုလိုပြီး၊ အပိုင်းခွဲများကြားတွင် သီးခြားခွဲထုတ်ရန် မျဉ်းကြောင်းတားပေးသော အပိတ်မလိုသည့် tag အမျိုးအစား ဖြစ်သည်။",
    theory: "HTML5 တွင် <hr> သည် ရိုးရိုးမျဉ်းတားခြင်းထက် အကြောင်းအရာ အပြောင်းအလဲ (Thematic break) ကို ဖော်ပြသော semantic အဓိပ္ပာယ် ရှိသည်။",
    englishKeywords: ["Horizontal Rule", "Self-closing", "Empty Element", "Thematic Break", "Separator"],
    stepByStepExplanation: [
      "စာပိုဒ် သို့မဟုတ် ခေါင်းစဉ်များအကြား သွားပါ။",
      "<hr> ဟု ရေးသားထည့်သွင်းပါ။"
    ],
    outputPreview: "A\n───────────────────\nB (ရေပြင်ညီမျဉ်းတားပြသမည်)",
    tips: ["CSS ကို အသုံးပြု၍ <hr> မျဉ်း၏ အထူ၊ အရောင်နှင့် ပုံစံများကို ပြောင်းလဲနိုင်သည်။"],
    assignment: {
      title: "Section Separator Design",
      description: "မျဉ်းတားခြင်းဖြင့် စာမျက်နှာကို ဒီဇိုင်းဆွဲပါ။",
      instructions: ["စာပိုဒ် ၃ ခုကြားတွင် <hr> ကို သုံးပြီး အပိုင်း ၃ ပိုင်း ခွဲခြားပြပါ။"]
    },
    lessonSummary: "<hr> tag သည် ပိတ် tag မလိုသော empty element ဖြစ်ပြီး စာမျက်နှာပေါ်တွင် thematic break မျဉ်းတားရန် သုံးသည်။",
    nextLesson: "Line Break"
  },
  {
    id: "html-15",
    title: "Line Break",
    slug: "html-line-break",
    duration: "15 mins",
    whatIsIt: "<br> tag သည် စာသားများကို စာကြောင်းအသစ်တစ်ခုသို့ အတင်းအကျပ် ဆင်းစေသည့် (Line Break) tag ဖြစ်ပါသည်။",
    whyImportant: "စာပိုဒ်အသစ် မဆောက်ဘဲ လက်ရှိစာပိုဒ်အတွင်း၌သာ စာကြောင်းကို အောက်လိုင်းသို့ ဆင်းစေချင်သည့်အခါ (ဥပမာ - ကဗျာများ၊ လိပ်စာများ ရေးသားရာတွင်) အလွန်အသုံးဝင်ပါသည်။",
    realWorldUsage: "ကုမ္ပဏီလိပ်စာများကို ရေးသားရာတွင် အိမ်နံပါတ်၊ လမ်းအမည်၊ မြို့နယ်တို့ကို တစ်ကြောင်းချင်းစီ ဆင်း၍ ရေးရန် သုံးပါသည်။",
    syntax: `<br>`,
    examples: [
      `<p>ရန်ကုန်မြို့၊<br>ဗဟန်းမြို့နယ်၊<br>ကမ္ဘာအေးဘုရားလမ်း။</p>`
    ],
    commonMistakes: [
      {
        mistake: "စာပိုဒ်များအကြား Spacing အကျယ်ကြီး လိုချင်သဖြင့် <br><br><br><br> ဟု ထပ်ခါတလဲလဲ သုံးခြင်း",
        correction: "CSS margin ကို သုံးပါ",
        explanation: "<br> ကို spacing အတွက် မသုံးရပါ။ spacing အတွက် CSS layout properties ကိုသာ သုံးရပါမည်။"
      }
    ],
    bestPractices: [
      "<br> သည် empty element ဖြစ်သောကြောင့် <br></br> ဟု မရေးပါနှင့်။"
    ],
    miniExercise: {
      id: "ex-html-15",
      instruction: "စာကြောင်းတစ်ကြောင်းအတွင်း 'Hello' နှင့် 'World' ကြားတွင် စာကြောင်းဆင်းရန် <br> ထည့်ပါ။",
      codeTemplate: "Hello<br>World",
      expectedOutput: "Hello<br>World",
      hints: ["Hello နှင့် World ကြားတွင် <br> သာ ရေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-15",
        question: "HTML တွင် စာပိုဒ်သစ်မဆောက်ဘဲ လက်ရှိစာကြောင်းကို အောက်စာကြောင်းသို့ ဆင်းရန် မည်သည့် tag ကို သုံးသနည်း။",
        options: [
          "<br>",
          "<break>",
          "<hr>",
          "<enter>"
        ],
        correctOptionIndex: 0,
        explanation: "<br> (Break) tag သည် စာကြောင်းသစ်သို့ ဆင်းပေးသည့် empty element ဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "Poem Layout Page",
      description: "ကဗျာတိုတစ်ပုဒ်ကို <br> tag များ သုံးပြီး စနစ်တကျ စာကြောင်းချ ရေးသားပါ။",
      guide: ["ကဗျာတစ်ကြောင်းစီ၏ အဆုံးတွင် <br> ထည့်သွင်းပါ။"],
      startingCode: "<p>နွေဦးကာလ၊<br>မြူထတောင်းတောင်း၊<br>ရေကန်ဖျား၌။</p>"
    },
    learningObjectives: {
      what: "<br> tag ၏ အလုပ်လုပ်ပုံနှင့် ၎င်းအား လိပ်စာ၊ ကဗျာများတွင် သုံးစွဲပုံကို လေ့လာရန်။",
      why: "စာကြောင်းများ၏ တည်နေရာစီးဆင်းမှုကို ထိန်းချုပ်ရန်။",
      when: "စာပိုဒ်အတွင်း စာကြောင်းဆင်းချင်သည့် အခါတိုင်း သုံးသည်။",
      how: "စာလုံး၏ နောက်တွင် <br> ကို ကပ်၍ ရေးသားခြင်း။"
    },
    myanmarExplanation: "<br> သည် Line Break ကို ဆိုလိုပြီး ၎င်းသည် အပိတ် tag မရှိသော empty element ဖြစ်သည်။ စာပိုဒ်သစ် ဖန်တီးခြင်း မဟုတ်ဘဲ စာကြောင်းချခြင်းသာ ဖြစ်သည်။",
    theory: "Paragraph modification တွင် <br> သည် text-flow ကို ဖြတ်တောက်ပြီး inline format အဖြစ် စာကြောင်းဆင်းစေသည်။",
    englishKeywords: ["Line Break", "Text Flow", "Self-closing", "Inline Element", "Address formatting"],
    stepByStepExplanation: [
      "စာကြောင်းဆင်းလိုသည့် နေရာကို ရွေးချယ်ပါ။",
      "<br> ဟု ရေးသားထည့်သွင်းပါ။"
    ],
    outputPreview: "Hello\nWorld (အောက်တန်းဆင်းပြသမည်)",
    tips: ["လိပ်စာများ ရေးသားရာတွင် <address> tag နှင့်အတူ <br> ကို တွဲဖက်သုံးလေ့ရှိကြသည်။"],
    assignment: {
      title: "Address formatting",
      description: "သင့်အိမ်လိပ်စာကို HTML စာကြောင်းချစနစ်ဖြင့် ရေးပါ။",
      instructions: ["သင့်အိမ်လိပ်စာကို <br> သုံးပြီး သပ်ရပ်စွာ စာကြောင်းချရေးသားပါ။"]
    },
    lessonSummary: "<br> tag သည် စာပိုဒ်အတွင်း စာကြောင်းသစ်ဆင်းရန် သုံးပြီး ပိတ် tag မလိုသော empty inline element ဖြစ်သည်။",
    nextLesson: "Formatting Text"
  },

  // ==========================================
  // MODULE 3: TEXT & LINKS
  // ==========================================
  {
    id: "html-16",
    title: "Formatting Text",
    slug: "html-formatting-text",
    duration: "25 mins",
    whatIsIt: "Formatting Text ဆိုသည်မှာ စာသားများကို အထူ (Bold)၊ စာလုံးစောင်း (Italic)၊ မျဉ်းတား (Underline) စသည်ဖြင့် ပုံစံအမျိုးမျိုး ပြောင်းလဲပေးသည့် tags များ ဖြစ်ပါသည်။",
    whyImportant: "စာသားများထဲမှ အရေးကြီးသော စကားလုံးများကို ထင်ရှားစေရန်နှင့် စာဖတ်သူ၏ အာရုံစိုက်မှုကို ဆွဲဆောင်ရန် လိုအပ်ပါသည်။",
    realWorldUsage: "သတင်းများ သို့မဟုတ် ထုတ်ကုန်စျေးနှုန်းများတွင် စျေးနှုန်းအဟောင်းကို မျဉ်းဖြတ်တားခြင်း၊ အထူးလျှော့စျေးကို စာလုံးအထူဖြင့် ပြသရာတွင် သုံးပါသည်။",
    syntax: `<b>Bold</b> or <strong>Strong</strong>
<i>Italic</i> or <em>Emphasis</em>
<mark>Highlighted</mark>
<del>Deleted text</del>
<ins>Inserted text</ins>`,
    examples: [
      `<p>ဒီစာသားက <strong>အရေးကြီးသည်</strong>။</p>`,
      `<p>စျေးနှုန်းမှာ <del>၁၀၀၀</del> ကျပ်မှ <b>၈၀၀</b> ကျပ် ဖြစ်သည်။</p>`
    ],
    commonMistakes: [
      {
        mistake: "<b> နှင့် <strong> သည် ရလဒ်တူသဖြင့် နေရာတကာ <b> သာ အမြဲသုံးခြင်း",
        correction: "အဓိပ္ပာယ်ပေါ်မူတည်၍ သုံးပါ",
        explanation: "<b> သည် အမြင်အရသာ ထူခြင်းဖြစ်ပြီး <strong> သည် screen readers များအတွက် အရေးကြီးကြောင်း အသံထွက်အလေးပေးဖတ်စေသော semantic အဓိပ္ပာယ်ရှိသည်။"
      }
    ],
    bestPractices: [
      "စာသားကို အမြင်အာရုံသာမက နည်းပညာအရပါ အဓိပ္ပာယ်ရှိစေရန် <b> အစား <strong> ကိုလည်းကောင်း၊ <i> အစား <em> ကိုလည်းကောင်း သုံးစွဲပါ။"
    ],
    miniExercise: {
      id: "ex-html-16",
      instruction: "<strong> tag ကို သုံးပြီး 'Critical' ဟူသော စာလုံးကို အထူ ရေးသားပါ။",
      codeTemplate: "<strong>Critical</strong>",
      expectedOutput: "<strong>Critical</strong>",
      hints: ["<strong> opening နှင့် </strong> closing ကို သုံးပါ။"]
    },
    quiz: [
      {
        id: "q-html-16",
        question: "HTML တွင် အမြင်အရော၊ နည်းပညာအရပါ အလွန်အရေးကြီးသော စာသား (Strong Importance) အဖြစ် သတ်မှတ်ရန် မည်သည့် tag ကို သုံးသနည်း။",
        options: [
          "<strong>",
          "<b>",
          "<i>",
          "<em_tag>"
        ],
        correctOptionIndex: 0,
        explanation: "<strong> သည် စာသားကို ထူစေရုံသာမက screen reader များနှင့် စက်များအတွက် အရေးကြီးသော အပိုင်းဖြစ်ကြောင်း semantic အဓိပ္ပာယ်ရှိသည်။"
      }
    ],
    miniProject: {
      title: "Discount Price Badge",
      description: "စျေးနှုန်းဟောင်းနှင့် စျေးနှုန်းသစ်ကို formatting tags များ သုံးပြီး ပြသပါ။",
      guide: ["<del> ဖြင့် ဈေးဟောင်းကို မျဉ်းဖြတ်တားပြီး <strong> ဖြင့် ဈေးသစ်ကို ထင်ရှားအောင် ပြပါ။"],
      startingCode: "<p>Original Price: <del>$100</del></p>\n<p>Promo Price: <strong>$80</strong>!</p>"
    },
    learningObjectives: {
      what: "Text formatting tags (strong, em, mark, del, ins) ၏ ကွာခြားချက်ကို လေ့လာရန်။",
      why: "ဝဘ်စာမျက်နှာပေါ်ရှိ စာသားများကို ဖတ်ရှုရ ပိုမိုလွယ်ကူပြီး အမြင်ဆွဲဆောင်မှုရှိစေရန်။",
      when: "ဆောင်းပါးများ သို့မဟုတ် စာသားများအတွင်း အချို့စကားလုံးများကို အလေးပေးလိုသည့်အခါ သုံးသည်။",
      how: "Formatting tags များကို စာလုံးများ၏ ဘေးပတ်လည်တွင် ရေးသားခြင်း။"
    },
    myanmarExplanation: "စာလုံးပုံစံပြောင်းလဲရာတွင် physical elements (ဥပမာ - <b>, <i>) နှင့် semantic elements (ဥပမာ - <strong>, <em>) ဟူ၍ ရှိပြီး semantic ပုံစံများက ပိုမိုကောင်းမွန်သည်။",
    theory: "Screen readers များသည် <strong> သို့မဟုတ် <em> tags များကို ဖတ်ရှုသည့်အခါ အသံနေအသံထားကို ပိုမိုအလေးပေးဖတ်ရှုပေးသည်။",
    englishKeywords: ["Formatting", "Bold", "Italic", "Strong", "Emphasis"],
    stepByStepExplanation: [
      "ပြင်ဆင်လိုသည့် စာလုံးကို ရွေးပါ။",
      "၎င်း၏ ဘေးတွင် <strong> သို့မဟုတ် <em> tags ဖြင့် အုပ်ပေးပါ။"
    ],
    outputPreview: "Original Price: $100 (မျဉ်းဖြတ်တားထားသည်)\nPromo Price: $80! (စာလုံးအထူ)",
    tips: ["<mark> tag ကို သုံးပြီး စာသားနောက်ခံကို ဝါဂွမ်းရောင်ဖြင့် highlight လုပ်နိုင်သည်။"],
    assignment: {
      title: "Book Review Formatting",
      description: "စာအုပ်သုံးသပ်ချက်တစ်ခုကို စနစ်တကျ format လုပ်ပါ။",
      instructions: ["စာအုပ်အမည်ကို စာစောင်း (em) ဖြင့်ရေးပြီး၊ သဘောကျသော အပိုင်းကို highlight (mark) လုပ်ပါ။"]
    },
    lessonSummary: "Text formatting tags များသည် စာလုံးများကို အထူ၊ အစောင်း၊ highlight၊ မျဉ်းဖြတ် စသည်ဖြင့် အဓိပ္ပာယ်နှင့် အမြင်ပိုင်းဆိုင်ရာ ပြောင်းလဲပေးသည်။",
    nextLesson: "Links"
  },
  {
    id: "html-17",
    title: "Links",
    slug: "html-links",
    duration: "25 mins",
    whatIsIt: "<a> (Anchor) tag ဆိုသည်မှာ ဝက်ဘ်စာမျက်နှာတစ်ခုမှ အခြားစာမျက်နှာတစ်ခု သို့မဟုတ် ဝက်ဘ်ဆိုက်တစ်ခုသို့ ချိတ်ဆက်ပေးသည့် Hyperlink ဖြစ်ပါသည်။",
    whyImportant: "ဝက်ဘ် (Web) ဆိုသည်မှာ စာမျက်နှာများ အချင်းချင်း ချိတ်ဆက်မှုဖြင့် ဖွဲ့စည်းထားခြင်း ဖြစ်ပြီး လင့်ခ်များမရှိပါက စာမျက်နှာတစ်ခုမှ တစ်ခုသို့ ကူးသန်းသွားလာနိုင်မည် မဟုတ်ပါ။",
    realWorldUsage: "ဝက်ဘ်ဆိုက်များရှိ 'အသေးစိတ်ဖတ်ရန်'၊ 'ဆက်သွယ်ရန်ခလုတ်' သို့မဟုတ် Navigation menu ရှိ ခလုတ်အားလုံးသည် anchor tags များ ဖြစ်ကြပါသည်။",
    syntax: `<a href="https://example.com" target="_blank">လင့်ခ်စာသား</a>`,
    examples: [
      `<a href="https://google.com">Google သို့သွားရန်</a>`,
      `<a href="about.html" target="_blank">About Us စာမျက်နှာကို tab အသစ်တွင် ဖွင့်ရန်</a>`
    ],
    commonMistakes: [
      {
        mistake: "<a href=\"google.com\">Google</a>",
        correction: "<a href=\"https://google.com\">Google</a>",
        explanation: "ပြင်ပဝက်ဘ်ဆိုက်လင့်ခ်များကို ချိတ်ဆက်သည့်အခါ protocol (https://) အပြည့်အစုံ ထည့်သွင်းရပါမည်။ မဟုတ်ပါက local file ထဲတွင်သာ ရှာဖွေပါလိမ့်မည်။"
      }
    ],
    bestPractices: [
      "ပြင်ပဝက်ဘ်ဆိုက်လင့်ခ်များ ချိတ်ဆက်လျှင် target=\"_blank\" ကို သုံးပြီး tab အသစ်တွင် ပွင့်စေခြင်းဖြင့် အသုံးပြုသူ မိမိဆိုက်မှ ထွက်မသွားအောင် ထိန်းထားပါ။"
    ],
    miniExercise: {
      id: "ex-html-17",
      instruction: "<a> tag ကို အသုံးပြုပြီး Google (https://google.com) သို့ သွားရန် လင့်ခ်တစ်ခု ရေးသားပါ။",
      codeTemplate: "<a href=\"https://google.com\">Google</a>",
      expectedOutput: "<a href=\"https://google.com\">Google</a>",
      hints: ["href attribute တွင် https://google.com ထည့်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-17",
        question: "HTML တွင် hyperlink တစ်ခု ဖန်တီးရန် မည်သည့် tag ကို အသုံးပြုရသနည်း။",
        options: [
          "<a>",
          "<link>",
          "<href>",
          "<anchor>"
        ],
        correctOptionIndex: 0,
        explanation: "<a> (Anchor) tag ကို href (hypertext reference) attribute နှင့် ပေါင်းစပ်ပြီး လင့်ခ်များ ဖန်တီးရန် သုံးသည်။"
      }
    ],
    miniProject: {
      title: "Social Links Badge",
      description: "သင့်ရဲ့ Social Networks များကို ချိတ်ဆက်ပြသသော လင့်ခ်များ စုစည်းမှု ဖန်တီးပါ။",
      guide: ["<a> tags သုံးခုဆောက်ပြီး href တွင် သက်ဆိုင်ရာ links များ ချိတ်ပါ။"],
      startingCode: "<a href=\"https://facebook.com\">Facebook</a>\n<a href=\"https://github.com\">GitHub</a>"
    },
    learningObjectives: {
      what: "Anchor tag (<a>) နှင့် href, target attributes တို့၏ အသုံးဝင်ပုံကို လေ့လာရန်။",
      why: "ဝဘ်စာမျက်နှာများအကြား သွားလာနိုင်ရန် လမ်းကြောင်းများ ဖန်တီးရန်။",
      when: "အခြားစာမျက်နှာ၊ ဖိုင် သို့မဟုတ် ပြင်ပဆိုက်သို့ ညွှန်းလိုသည့်အခါ သုံးသည်။",
      how: "href attribute တွင် သွားမည့် လိပ်စာထည့်ပြီး ရေးသားခြင်း။"
    },
    myanmarExplanation: "<a> tag သည် anchor ကို ကိုယ်စားပြုပြီး href သည် Hypertext Reference ကို ဆိုလိုသည်။ target=\"_blank\" သည် အသုံးပြုသူအတွက် စာမျက်နှာသစ်ကို tab အသစ်တွင် ဖွင့်ပေးသည်။",
    theory: "Web navigation သည် URI/URL addressing system ပေါ်တွင် အခြေခံပြီး anchor tags များသည် client dynamic redirect များကို ဖန်တီးပေးသည်။",
    englishKeywords: ["Anchor", "Hypertext Reference", "Target Attribute", "Blank Target", "Hyperlink"],
    stepByStepExplanation: [
      "<a> tag ကို ရေးပါ။",
      "href attribute ထဲတွင် destination URL ထည့်ပါ။",
      "လင့်ခ်စာသားကို ဖွင့်ပိတ် tags ကြားတွင် ရေးပါ။"
    ],
    outputPreview: "Google (လင့်ခ်စာသားအား မျဉ်းတားလျက် အပြာရောင်ဖြင့် ပြသမည်)",
    tips: ["လင့်ခ်များ၏ default အပြာရောင်နှင့် မျဉ်းတားခြင်းကို CSS သုံးပြီး စိတ်ကြိုက် ပြောင်းလဲနိုင်သည်။"],
    assignment: {
      title: "Resource Hub Links",
      description: "သင်နှစ်သက်သော ဝဘ်ဆိုက် ၃ ခုကို ချိတ်ဆက်ပါ။",
      instructions: ["သင်နှစ်သက်သော နည်းပညာဆိုက် ၃ ခုကို target=\"_blank\" သုံးပြီး စုစည်းပြပါ။"]
    },
    lessonSummary: "<a> (Anchor) tag သည် href attribute သုံး၍ စာမျက်နှာများကို ချိတ်ဆက်ပေးပြီး target=\"_blank\" ဖြင့် tab အသစ်တွင် ဖွင့်နိုင်သည်။",
    nextLesson: "Relative URLs"
  },
  {
    id: "html-18",
    title: "Relative URLs",
    slug: "html-relative-urls",
    duration: "20 mins",
    whatIsIt: "Relative URLs ဆိုသည်မှာ မိမိဝက်ဘ်ဆိုက်အတွင်းရှိ အခြားစာမျက်နှာများ (Local files) ကို ချိတ်ဆက်ရာတွင် အသုံးပြုသည့် လက်ရှိတည်နေရာအခြေပြု လမ်းကြောင်းလိပ်စာများ ဖြစ်ပါသည်။",
    whyImportant: "ပရောဂျက်ကို hosting တင်သည့်အခါ သို့မဟုတ် folder များ ရွှေ့ပြောင်းသည့်အခါ domain name ပြောင်းလဲသော်လည်း links များ ပျက်စီးမသွားစေရန် အရေးကြီးပါသည်။",
    realWorldUsage: "ဝက်ဘ်ဆိုက်တစ်ခု၏ ပင်မစာမျက်နှာမှ About Us (about.html) သို့မဟုတ် Contact Us (contact.html) စာမျက်နှာများသို့ ချိတ်ဆက်ရာတွင် သုံးပါသည်။",
    syntax: `<a href="about.html">About Us</a>
<a href="contact.html">Contact</a>`,
    examples: [
      `<a href="./pages/services.html">Services</a>`,
      `<a href="../index.html">Go Back to Home</a>`
    ],
    commonMistakes: [
      {
        mistake: "<a href=\"C:/MyProject/about.html\">About</a>",
        correction: "<a href=\"about.html\">About</a>",
        explanation: "သင့်ကွန်ပျူတာ၏ local computer absolute drive (C:/) လမ်းကြောင်းများကို မသုံးပါနှင့်။ ၎င်းသည် server ပေါ်တင်လိုက်လျှင် လင့်ခ်ပျက်သွားပါလိမ့်မည်။"
      }
    ],
    bestPractices: [
      "ဖိုင်ချင်း ယှဉ်လျက်ရှိပါက တိုက်ရိုက်ဖိုင်အမည် သို့မဟုတ် ./ ကို သုံးပြီး၊ အပေါ်ဖိုဒါသို့ ပြန်တက်ရန် ../ ကို စနစ်တကျ အသုံးပြုပါ။"
    ],
    miniExercise: {
      id: "ex-html-18",
      instruction: "Relative URL သုံးပြီး 'about.html' ဖိုင်သို့ သွားရန် လင့်ခ်တစ်ခု ရေးသားပါ။",
      codeTemplate: "<a href=\"about.html\">About</a>",
      expectedOutput: "<a href=\"about.html\">About</a>",
      hints: ["href attribute ထဲတွင် about.html ဟုသာ ရေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-18",
        question: "မိမိဝဘ်ဆိုက်အတွင်းရှိ local ဖိုင်များကို ချိတ်ဆက်ရန် မည်သည့် URL အမျိုးအစားကို သုံးသင့်သနည်း။",
        options: [
          "Relative URL",
          "Absolute URL",
          "External URL",
          "Secure URL"
        ],
        correctOptionIndex: 0,
        explanation: "Relative URL သည် မိမိဝဘ်ဆိုက်အတွင်းရှိ ဖိုင်များကို hand-to-hand တည်နေရာအခြေပြု ချိတ်ဆက်ရန်အတွက် အကောင်းဆုံး ဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "Local Mini Navigation",
      description: "Home နှင့် Contact စာမျက်နှာနှစ်ခု ချိတ်ဆက်ထားသော navigation တစ်ခု ဆောက်ပါ။",
      guide: ["index.html နှင့် contact.html ကို relative links များဖြင့် အပြန်အလှန် ချိတ်ဆက်ပါ။"],
      startingCode: "<a href=\"index.html\">Home</a>\n<a href=\"contact.html\">Contact Us</a>"
    },
    learningObjectives: {
      what: "Relative URL ၏ အဓိပ္ပာယ်၊ ./ နှင့် ../ သင်္ကေတများ၏ လမ်းကြောင်းသွားပုံကို နားလည်ရန်။",
      why: "ဝက်ဘ်ဆိုက်ဖိုင်များကို server ပေါ်တွင် ပျက်စီးမှုမရှိဘဲ သယ်ဆောင်နိုင်ရန်။",
      when: "ကိုယ်ပိုင် ဆိုက်တွင်းရှိ စာမျက်နှာများအချင်းချင်း ချိတ်ဆက်သည့်အခါ အမြဲသုံးသည်။",
      how: "ဖိုင်လမ်းကြောင်းတည်နေရာအလိုက် relative path ကို href တွင် ထည့်ရေးခြင်း။"
    },
    myanmarExplanation: "Relative URL သည် လက်ရှိဖိုင်တည်ရှိရာနေရာကို အခြေခံပြီး လမ်းကြောင်းရှာဖွေသည်။ ဥပမာ- folder တစ်ခုထဲရှိနေပါက ဖိုင်အမည်ကို တိုက်ရိုက်ရေးရုံသာ ဖြစ်သည်။",
    theory: "Directory tree traversal တွင် '.' သည် လက်ရှိ directory ဖြစ်ပြီး '..' သည် parent directory ဖြစ်သည်။",
    englishKeywords: ["Relative Path", "Directory", "Local Links", "Traversal", "Parent Directory"],
    stepByStepExplanation: [
      "သွားလိုသော local file ၏ တည်နေရာကို စစ်ဆေးပါ။",
      "href တွင် relative path (ဥပမာ - about.html) ထည့်ပါ။"
    ],
    outputPreview: "About (လင့်ခ်ကို ကလစ်နှိပ်ပါက about.html သို့ ကူးပြောင်းမည်)",
    tips: ["Sub-folder များထဲရှိ ဖိုင်များကို ချိတ်ဆက်ရန် folder_name/file.html ဟု ရေးပါ။"],
    assignment: {
      title: "Directory Mapping",
      description: "Relative Paths များကို ချရေးပါ။",
      instructions: ["ဖိုင်တစ်ခုသည် subfolder ထဲတွင် ရှိနေပါက ချိတ်ဆက်ပုံ relative path ကို ချရေးပြပါ။"]
    },
    lessonSummary: "Relative URLs များသည် လက်ရှိ directory ပေါ်မူတည်၍ လမ်းကြောင်းရှာပြီး၊ ဆိုက်တွင်း စာမျက်နှာများ ချိတ်ဆက်ရန် အသုံးပြုသည်။",
    nextLesson: "Absolute URLs"
  },
  {
    id: "html-19",
    title: "Absolute URLs",
    slug: "html-absolute-urls",
    duration: "20 mins",
    whatIsIt: "Absolute URLs ဆိုသည်မှာ ဒိုမိန်းအမည်နှင့် ပရိုတိုကော (Protocol) အပါအဝင် အင်တာနက်ပေါ်ရှိ ဝက်ဘ်ဆိုက်တစ်ခု၏ တိကျပြည့်စုံသော လိပ်စာအပြည့်အစုံ ဖြစ်ပါသည်။",
    whyImportant: "ပြင်ပဝက်ဘ်ဆိုက်များ (ဥပမာ - Wikipedia, Google, YouTube) ကို ချိတ်ဆက်လိုသည့်အခါ ကမ္ဘာ့ မည်သည့်နေရာမှမဆို ရှာဖွေနိုင်ရန် လိပ်စာအပြည့်အစုံ လိုအပ်ပါသည်။",
    realWorldUsage: "သင့်ဆိုက်မှ အသုံးပြုသူများအား Wikipedia သို့မဟုတ် တရားဝင် စာရွက်စာတမ်းဆိုက်များသို့ လွှဲပြောင်းညွှန်းဆိုရန် သုံးပါသည်။",
    syntax: `<a href="https://www.wikipedia.org">Wikipedia</a>`,
    examples: [
      `<a href="https://www.youtube.com">YouTube</a>`,
      `<a href="https://github.com/profile">My GitHub Profile</a>`
    ],
    commonMistakes: [
      {
        mistake: "<a href=\"www.google.com\">Google</a>",
        correction: "<a href=\"https://www.google.com\">Google</a>",
        explanation: "http:// သို့မဟုတ် https:// မပါပါက browser သည် ၎င်းကို local relative file ဟု မှားယွင်းထင်မှတ်ပါလိမ့်မည်။"
      }
    ],
    bestPractices: [
      "Absolute links များသည် အမြဲတမ်း ပြင်ပဆိုက်များသို့ ညွှန်းသဖြင့် target=\"_blank\" ကို အမြဲတွဲသုံးရန် အကြံပြုပါသည်။"
    ],
    miniExercise: {
      id: "ex-html-19",
      instruction: "Absolute URL သုံးပြီး 'https://www.wikipedia.org' သို့ သွားရန် လင့်ခ်တစ်ခု ရေးပါ။",
      codeTemplate: "<a href=\"https://www.wikipedia.org\">Wikipedia</a>",
      expectedOutput: "<a href=\"https://www.wikipedia.org\">Wikipedia</a>",
      hints: ["href တွင် https:// ပါဝင်သော လိပ်စာအပြည့်အစုံ ရေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-19",
        question: "ပြင်ပဝဘ်ဆိုက်တစ်ခုသို့ လင့်ခ်ချိတ်ဆက်ရာတွင် မည်သည့် URL အမျိုးအစားကို အသုံးပြုရသနည်း။",
        options: [
          "Absolute URL",
          "Relative URL",
          "Internal URL",
          "Local URL"
        ],
        correctOptionIndex: 0,
        explanation: "ပြင်ပဝဘ်ဆိုက်တစ်ခုသို့ သွားရန်အတွက် protocol (https://) ပါဝင်သော လိပ်စာအပြည့်အစုံ (Absolute URL) ကို သုံးရမည်။"
      }
    ],
    miniProject: {
      title: "Global Tech Portal",
      description: "အဓိက နည်းပညာဆိုက်ကြီးများ၏ links များ စုစည်းမှုတစ်ခု တည်ဆောက်ပါ။",
      guide: ["Microsoft, Google, Apple တရားဝင်လင့်ခ်များကို absolute links ဖြင့် ချိတ်ဆက်ပါ။"],
      startingCode: "<a href=\"https://www.google.com\" target=\"_blank\">Google</a>\n<a href=\"https://www.microsoft.com\" target=\"_blank\">Microsoft</a>"
    },
    learningObjectives: {
      what: "Absolute URL ၏ ဖွဲ့စည်းပုံ၊ protocol (http/https) နှင့် relative နှင့် ကွာခြားပုံကို နားလည်ရန်။",
      why: "အင်တာနက်ပေါ်ရှိ မည်သည့် ပြင်ပရင်းမြစ်ကိုမဆို အောင်မြင်စွာ ချိတ်ဆက်နိုင်ရန်။",
      when: "ပြင်ပဝဘ်ဆိုက်များ၊ ပြင်ပပုံများ သို့မဟုတ် CDNs များကို ချိတ်ဆက်သည့်အခါ သုံးသည်။",
      how: "href attribute တွင် https:// သို့မဟုတ် http:// ဖြင့် စတင်သော ဒိုမိန်းအပြည့်အစုံ ထည့်ရေးခြင်း။"
    },
    myanmarExplanation: "Absolute URL တွင် protocol (https://)၊ domain name (google.com) နှင့် path (/index.html) တို့ ပြည့်စုံစွာ ပါဝင်သဖြင့် ကမ္ဘာတစ်ဝှမ်း မည်သည့်နေရာကမဆို လှမ်းခေါ်နိုင်သည်။",
    theory: "URL (Uniform Resource Locator) သည် ကမ္ဘာ့ဝဘ်ပေါ်ရှိ သီးခြားရင်းမြစ်တစ်ခု၏ absolute global address ဖြစ်သည်။",
    englishKeywords: ["Absolute URL", "Protocol", "Domain Name", "External Link", "URI"],
    stepByStepExplanation: [
      "သွားလိုသော ပြင်ပဆိုက်၏ လိပ်စာအပြည့်အစုံကို copy ကူးပါ။",
      "href attribute အတွင်း သေသပ်စွာ paste လုပ်ပါ။"
    ],
    outputPreview: "Wikipedia (ပြင်ပ Wikipedia စာမျက်နှာသို့ သွားပါလိမ့်မည်)",
    tips: ["လင့်ခ်များ အလုပ်လုပ်မလုပ် စမ်းသပ်ရန် အမြဲတမ်း click နှိပ်၍ စစ်ဆေးပါ။"],
    assignment: {
      title: "External Resource Page",
      description: "နည်းပညာ သင်ကြားရေးဆိုက်များ စုစည်းပြပါ။",
      instructions: ["W3Schools နှင့် MDN Web Docs တို့ကို absolute links သုံးပြီး ချိတ်ဆက်ပြပါ။"]
    },
    lessonSummary: "Absolute URLs များသည် protocol နှင့် domain name အပြည့်အစုံပါဝင်ပြီး ပြင်ပရင်းမြစ်များကို ချိတ်ဆက်ရန် သုံးသည်။",
    nextLesson: "Email Links"
  },
  {
    id: "html-20",
    title: "Email Links",
    slug: "html-email-links",
    duration: "20 mins",
    whatIsIt: "Email Links ဆိုသည်မှာ ဝက်ဘ်ဆိုက်ပေါ်ရှိ လင့်ခ်တစ်ခုကို နှိပ်လိုက်ရုံဖြင့် အသုံးပြုသူ၏ ဖုန်း သို့မဟုတ် ကွန်ပျူတာရှိ Email အပ်ပလီကေးရှင်း (ဥပမာ - Gmail, Outlook) တိုက်ရိုက်ပွင့်လာပြီး စာပို့နိုင်သည့် စနစ်ဖြစ်ပါသည်။",
    whyImportant: "အသုံးပြုသူများသည် contact address ကို copy ကူးစရာမလိုဘဲ လွယ်ကူလျင်မြန်စွာ အီးမေးလ် ပေးပို့ ဆက်သွယ်နိုင်သောကြောင့် UX (User Experience) ပိုမိုကောင်းမွန်စေပါသည်။",
    realWorldUsage: "ဝက်ဘ်ဆိုက်များ၏ 'Contact Us' သို့မဟုတ် 'Hire Me' ခလုတ်များတွင် info@company.com သို့ အီးမေးလ်ပို့ရန် သုံးပါသည်။",
    syntax: `<a href="mailto:info@example.com">Email ပို့ရန်</a>`,
    examples: [
      `<a href="mailto:hr@company.com?subject=Job Application">Apply Now</a>`
    ],
    commonMistakes: [
      {
        mistake: "<a href=\"info@example.com\">Mail</a>",
        correction: "<a href=\"mailto:info@example.com\">Mail</a>",
        explanation: "mailto: schema မပါဝင်ပါက browser သည် ၎င်းကို local file တစ်ခုဟုသာ ယူဆသွားပါလိမ့်မည်။"
      }
    ],
    bestPractices: [
      "mailto: နောက်တွင် space မခြားဘဲ email address ကို ကပ်လျက် ရေးသားပါ။"
    ],
    miniExercise: {
      id: "ex-html-20",
      instruction: "mailto schema သုံးပြီး 'test@example.com' သို့ အီးမေးလ် ပို့ရန် လင့်ခ်တစ်ခု ရေးသားပါ။",
      codeTemplate: "<a href=\"mailto:test@example.com\">Contact Us</a>",
      expectedOutput: "<a href=\"mailto:test@example.com\">Contact Us</a>",
      hints: ["href တွင် mailto:test@example.com ဟု ရေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-20",
        question: "HTML တွင် အီးမေးလ် တိုက်ရိုက်ပေးပို့နိုင်သော link တစ်ခု ဖန်တီးရန် မည်သည့် schema ကို သုံးရသနည်း။",
        options: [
          "mailto:",
          "email:",
          "sendmail:",
          "hrefmail:"
        ],
        correctOptionIndex: 0,
        explanation: "mailto: schema ကို href တွင် ထည့်သွင်းခြင်းဖြင့် email clients များကို browser မှတစ်ဆင့် လှမ်းဖွင့်နိုင်သည်။"
      }
    ],
    miniProject: {
      title: "Contact Desk Link",
      description: "အီးမေးလ် တိုက်ရိုက်ပို့နိုင်သော support desk link တစ်ခု တည်ဆောက်ပါ။",
      guide: ["mailto:support@tech.com ကို href တွင် အသုံးပြုပါ။"],
      startingCode: "<a href=\"mailto:support@tech.com\">Email Support</a>"
    },
    learningObjectives: {
      what: "mailto: prefix ၏ လုပ်ဆောင်ပုံနှင့် subject parameters များ ထည့်သွင်းပုံကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက်ရှိ အသုံးပြုသူများ သင့်ထံ တိုက်ရိုက် အီးမေးလ် ပို့နိုင်စေရန်။",
      when: "ဆက်သွယ်ရန် စာမျက်နှာ သို့မဟုတ် အကူအညီတောင်းခံသည့် နေရာများတွင် သုံးသည်။",
      how: "href=\"mailto:someone@example.com\" ဟု ရေးသားခြင်း။"
    },
    myanmarExplanation: "mailto: schema သည် browser အား စက်အတွင်းရှိ default email client ကို ဖွင့်ခိုင်းပြီး သတ်မှတ်ထားသော လိပ်စာသို့ စာရေးရန် ပြင်ဆင်ပေးသည်။",
    theory: "URI Schemes (ဥပမာ - mailto, tel) များသည် browser အား operating system level ရှိ သက်ဆိုင်ရာ protocols များနှင့် ချိတ်ဆက်လုပ်ဆောင်စေသည်။",
    englishKeywords: ["mailto", "Email Client", "URI Scheme", "Subject Parameter", "UX Improvement"],
    stepByStepExplanation: [
      "<a> tag ဆောက်ပါ။",
      "href attribute ထဲတွင် mailto: စာသားထည့်ပြီး email လိပ်စာကို ကပ်ရေးပါ။"
    ],
    outputPreview: "Email Support (နှိပ်လိုက်ပါက စက်၏ email app ပွင့်လာမည်)",
    tips: ["?subject=Hello ဟု href ၏ အဆုံးတွင် ပေါင်းထည့်ပြီး default Subject ကိုပါ သတ်မှတ်ပေးနိုင်သည်။"],
    assignment: {
      title: "Feedback Email Setup",
      description: "တုံ့ပြန်ချက် အီးမေးလ် ပေးပို့လင့်ခ်တစ်ခု ဖန်တီးပါ။",
      instructions: ["feedback@mysite.com သို့ 'Feedback App' ခေါင်းစဉ်ဖြင့် စာပို့နိုင်မည့် link ကို ရေးသားပါ။"]
    },
    lessonSummary: "mailto: scheme ကို သုံးပြီး အသုံးပြုသူများ browser မှတစ်ဆင့် အီးမေးလ်များ တိုက်ရိုက် ပို့ဆောင်နိုင်ရန် ဖန်တီးနိုင်သည်။",
    nextLesson: "Telephone Links"
  }
];
