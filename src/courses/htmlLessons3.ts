import { Lesson } from "../types";

export const lessons3: Lesson[] = [
  {
    id: "html-41",
    title: "Div vs Span",
    slug: "html-div-vs-span",
    duration: "20 mins",
    whatIsIt: "Div vs Span ဆိုသည်မှာ HTML တွင် Layout များ စုစည်းရန်နှင့် style သတ်မှတ်ရန် သုံးသော အခြေခံအကျဆုံး generic tags နှစ်ခုဖြစ်ပြီး ၎င်းတို့သည် Block-level (<div>) နှင့် Inline-level (<span>) ဟု ကွဲပြားကြပါသည်။",
    whyImportant: "<div> သည် block အလိုက် အလျားလိုက် နေရာတစ်ခုလုံးကို ယူပြီး အောက်ကြောင်းဆင်းစေကာ၊ <span> သည် စာကြောင်းတစ်ခုတည်းအတွင်းရှိ စာလုံးအချို့ကိုသာ ကွက်ပြီး style သတ်မှတ်နိုင်စေသဖြင့် ဝဘ်ဒီဇိုင်းရေးဆွဲရာတွင် အလွန်အရေးကြီးပါသည်။",
    realWorldUsage: "ဝဘ်ဆိုက်တစ်ခုတွင် card boxes ကြီးများ ဆောက်ရာ၌ <div> ကို သုံးပြီး၊ စာကြောင်းတစ်ကြောင်းအတွင်းရှိ ဈေးနှုန်း သို့မဟုတ် အထူးစာလုံးများကို အရောင်ပြောင်းရန် <span> ကို သုံးပါသည်။",
    syntax: `<!-- Block-level -->
<div>
  <h3>Card Title</h3>
</div>

<!-- Inline-level -->
<p>This is a <span style="color:red">red</span> word.</p>`,
    examples: [
      `<div class="container">\n  <span>Badge Tag</span>\n</div>`
    ],
    commonMistakes: [
      {
        mistake: "<span><div>စာအကွက်</div></span> (span အတွင်း div ထည့်သွင်းခြင်း)",
        correction: "<div><span>စာအကွက်</span></div>",
        explanation: "Inline elements (<span>) ၏ အတွင်းထဲတွင် block-level elements (<div>) များကို ထည့်သွင်းခွင့် မရှိပါ။ စည်းကမ်းချက်အရ block elements အတွင်း၌သာ inline elements ကို ထည့်သွင်းရပါမည်။"
      }
    ],
    bestPractices: [
      "ဝဘ်ဆိုက်၏ အပိုင်းကြီးများကို ပိုင်းခြားရန် <div> ကို သုံးပြီး၊ စာလုံးအသေးစားများကို style ပြင်ရန် <span> ကို သုံးပါ။"
    ],
    miniExercise: {
      id: "ex-html-41",
      instruction: "span tag ကို သုံးပြီး 'Warning' ဟူသော စာသားကို inline အဖြစ် ဖန်တီးပါ။",
      codeTemplate: "<span>Warning</span>",
      expectedOutput: "<span>Warning</span>",
      hints: ["<span> element အတွင်း 'Warning' ဟု ရေးသားပါ။"]
    },
    quiz: [
      {
        id: "q-html-41",
        question: "အောက်ပါတို့အနက် block-level element ဖြစ်ပြီး အလျားလိုက် တစ်ကြောင်းလုံးကို နေရာယူသည့် generic container မှာ မည်သည်နည်း။",
        options: [
          "<span>",
          "<div>",
          "<a>",
          "<img>"
        ],
        correctOptionIndex: 1,
        explanation: "<div> သည် default block-level container ဖြစ်ပြီး vertical stacking visual layouts များကို ဖန်တီးပေးသည်။"
      }
    ],
    miniProject: {
      title: "Feature Block Card",
      description: "div နှင့် span တို့ကို ပေါင်းစပ်အသုံးပြုပြီး သပ်ရပ်သော layout card တစ်ခု ဆောက်ပါ။",
      guide: ["div wrapper အတွင်း ခေါင်းစဉ်တစ်ခုနှင့် span element ပါဝင်သော static card လေးအား ရေးဆွဲပါ။"],
      startingCode: "<div class=\"feature-card\">\n  <h3>Premium Course</h3>\n  <p>Learn web with <span style=\"color:blue\">HTML5</span>.</p>\n</div>"
    },
    learningObjectives: {
      what: "div (block-level) နှင့် span (inline-level) ၏ display layouts ကွာခြားချက်များကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက်၏ elements stacking နှင့် CSS selectors logic ကို အခြေခံကျကျ စနစ်တကျ နားလည်စေရန်။",
      when: "ဝဘ်စာမျက်နှာများကို layout sections ပိုင်းခြားခြင်း သို့မဟုတ် inline text style ပြောင်းလဲလိုသည့်အခါ သုံးသည်။",
      how: "div elements များဖြင့် structural groupings ဆောက်လုပ်ပြီး spans သုံး၍ inline text styles သတ်မှတ်ခြင်း။"
    },
    myanmarExplanation: "div tag သည် block container အဖြစ် စာမျက်နှာပေါ်တွင် box structural divisions များကို ဖန်တီးပေးပြီး span tag သည် text flows အတွင်း character level styles များ သတ်မှတ်ရာတွင် သုံးစွဲသည်။",
    theory: "HTML Document Object Model (DOM) visual formatting model တွင် block formatting context (div) သည် width 100% stack layout ယူပြီး inline formatting context (span) သည် inline character widths တန်ဖိုးသာ ယူဆောင်သည်။",
    englishKeywords: ["div element", "span element", "Block-level", "Inline-level", "Display layout"],
    stepByStepExplanation: [
      "Layout components အတွက် div tag အား သုံးပါ။",
      "Inline words style ပြောင်းရန် spans elements ကို text elements ကြား nested ထည့်သွင်းပါ။"
    ],
    outputPreview: "သီးခြား အကွက်တစ်ခုအဖြစ် div card ပေါ်လာပြီး ၎င်းအတွင်း စာလုံးအချို့သည် အရောင်ပြောင်းလဲပြသမည်။",
    tips: ["ခေတ်မီ semantic web ဒီဇိုင်းတွင် div များကို အလွန်အကျွံသုံးခြင်း (Divitis) ကို ရှောင်ကြဉ်ပြီး သက်ဆိုင်ရာ semantic semantic elements များကို ဦးစားပေးပါ။"],
    assignment: {
      title: "Hero Text Decoration Block",
      description: "Div နှင့် Span သုံးပြီး interactive hero section layout ဆောက်ပါ။",
      instructions: ["Div card layout တစ်ခုအတွင်း span element သုံးပြီး Highlight စာလုံးများအား သီးခြားအရောင်သတ်မှတ် ရေးဆွဲပြပါ။"]
    },
    lessonSummary: "Div သည် block level layout partitioning အတွက် သုံးပြီး span သည် inline element text modification အတွက် သုံးစွဲသည်။",
    nextLesson: "Header & Footer"
  },
  {
    id: "html-42",
    title: "Header & Footer",
    slug: "html-header-footer",
    duration: "20 mins",
    whatIsIt: "Header & Footer ဆိုသည်မှာ ဝဘ်စာမျက်နှာတစ်ခု၏ ထိပ်ဆုံးရှိ မိတ်ဆက်၊ လိုဂိုနှင့် navigation များ ပါဝင်သော အပိုင်း (<header>) နှင့် စာမျက်နှာ၏ အောက်ခြေရှိ ပိုင်ဆိုင်မှုမူပိုင်ခွင့် (Copyright) နှင့် contact links များ ပါဝင်သော အပိုင်း (<footer>) တို့ ဖြစ်ကြပါသည်။",
    whyImportant: "ယခင်က div tags များကိုသာ သုံးခဲ့သော်လည်း ယခုအခါ ရှာဖွေရေး search engine များနှင့် browser များမှ ဝဘ်ဆိုက်၏ ထိပ်ဆုံးနှင့် အောက်ခြေကို ရှင်းလင်းစွာ သိရှိစေသော Semantic HTML markup အတွက် အလွန်အရေးကြီးပါသည်။",
    realWorldUsage: "ကမ္ဘာ့ဝဘ်ဆိုက်တိုင်း၏ ထိပ်ဆုံးရှိ logo/navbar အဝိုင်းကြီးနှင့် အောက်ဆုံးရှိ '© 2026 Code Learn Myanmar. All rights reserved.' စာတန်းငယ်လေးများ ဖြစ်ပါသည်။",
    syntax: `<header>
  <h1>Logo</h1>
</header>

<footer>
  <p>© 2026 Company</p>
</footer>`,
    examples: [
      `<header>\n  <nav>\n    <a href="/">Home</a>\n  </nav>\n</header>`
    ],
    commonMistakes: [
      {
        mistake: "<div class='header'>Logo</div> (class style ဖြင့်သာ semantic သတ်မှတ်ခြင်း)",
        correction: "<header><h1>Logo</h1></header>",
        explanation: "<div class='header'> သည် သာမန် div မျှသာ ဖြစ်သဖြင့် search engine robots များအတွက် header ဖြစ်ကြောင်း အလိုအလျောက် နားမလည်နိုင်ပါ။ <header> semantic tag ကို တိုက်ရိုက် သုံးစွဲရပါမည်။"
      }
    ],
    bestPractices: [
      "ဝဘ်ဆိုက်၏ ပင်မစာမျက်နှာ layout တွင် header ကို ထိပ်ဆုံး၌လည်းကောင်း၊ footer ကို အောက်ဆုံး၌လည်းကောင်း အမြဲတမ်း စနစ်တကျ သုံးစွဲပါ။"
    ],
    miniExercise: {
      id: "ex-html-42",
      instruction: "header tag တစ်ခုဖန်တီးပြီး ၎င်းအတွင်း <h1> tag ဖြင့် 'Welcome' ဟူသော စာတန်းကို ထည့်သွင်းပါ။",
      codeTemplate: "<header>\n  <h1>Welcome</h1>\n</header>",
      expectedOutput: "<header>\n  <h1>Welcome</h1>\n</header>",
      hints: ["<header> container tags အတွင်း၌ <h1>Welcome</h1> ကို ရေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-42",
        question: "ဝဘ်စာမျက်နှာတစ်ခု၏ အောက်ခြေ (Copyright, Contact details, links) ကို semantic ကျစွာ ရေးသားရန် မည်သည့် tag ကို သုံးရသနည်း။",
        options: [
          "<bottom>",
          "<footer>",
          "<header>",
          "<end>"
        ],
        correctOptionIndex: 1,
        explanation: "<footer> semantic tag သည် page layout သို့မဟုတ် sections များ၏ အောက်ခြေအချက်အလက် ဧရိယာကို သတ်မှတ်သည်။"
      }
    ],
    miniProject: {
      title: "Landing Shell",
      description: "Semantic header နှင့် footer ပါဝင်သော ဝဘ်ဆိုက် framework အခြေခံတစ်ခု ရေးဆွဲပါ။",
      guide: ["header ထဲတွင် h1 title နှင့် footer ထဲတွင် copyright text ထည့်သွင်းပါ။"],
      startingCode: "<header>\n  <h1>Tech Blog</h1>\n</header>\n<main>\n  <p>Welcome to our tech feed.</p>\n</main>\n<footer>\n  <p>&copy; 2026 Tech Blog</p>\n</footer>"
    },
    learningObjectives: {
      what: "<header> နှင့် <footer> semantic tags များ၏ ရည်ရွယ်ချက်နှင့် အကျိုးကျေးဇူးများကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက်၏ layout structure ကို SEO friendly ဖြစ်စေရန်နှင့် search rankings တက်စေရန်။",
      when: "ဝဘ်စာမျက်နှာများ သို့မဟုတ် blog articles layout များ ရေးဆွဲသည့်အခါ သုံးသည်။",
      how: "အပေါ်ဆုံး section အား <header> ဖြင့်လည်းကောင်း၊ အောက်ခြေအား <footer> ဖြင့်လည်းကောင်း ရေးသားခြင်း။"
    },
    myanmarExplanation: "<header> နှင့် <footer> tags များသည် layout partitions ကို dynamic semantic metadata properties များအဖြစ် browser crawlers များအား document mapping logic ကို ထင်ရှားစွာ မြင်စေသည်။",
    theory: "HTML5 semantic outline specification အရ header/footer block elements များသည် nested content segments များအတွက် context headers/footers အဖြစ် relational nodes mappings ကို coordinate ပြုလုပ်ပေးသည်။",
    englishKeywords: ["header element", "footer element", "Semantic Web", "SEO Friendly", "Page Layout"],
    stepByStepExplanation: [
      "စာမျက်နှာထိပ်ပိုင်းအတွက် <header> tag ကို ဖွင့်ပြီး contents များထည့်သွင်းပါ။",
      "စာမျက်နှာအောက်ခြေအတွက် <footer> tag သုံးပြီး copyright details များကို ထည့်ပါ။"
    ],
    outputPreview: "ထိပ်စီးတွင် header title နှင့် အောက်ခြေတွင် Copyright စာတန်းလေး သပ်ရပ်စွာ ပေါ်လာမည်။",
    tips: ["&copy; ဟူသော HTML character entities ကုဒ်ကို သုံးပြီး © သင်္ကေတလေးကို လှပစွာ ဖော်ပြနိုင်ပါသည်။"],
    assignment: {
      title: "Standard Corporate Page Layout",
      description: "ကုမ္ပဏီ website စာမျက်နှာ အပေါ်အောက် အရိုးစု တည်ဆောက်ပါ။",
      instructions: ["Header (Logo နှင့် Navbar ပါဝင်သော) နှင့် Footer (Copyright နှင့် Social lists ပါဝင်သော) HTML layout အပြည့်အစုံ ရေးဆွဲပြပါ။"]
    },
    lessonSummary: "Header & Footer tags များသည် ဝဘ်စာမျက်နှာများ၏ အပေါ်ပိုင်းနှင့် အောက်ခြေပိုင်းကို semantic ကျကျ ခွဲခြားသတ်မှတ်ပေးသော layout controllers များ ဖြစ်ကြသည်။",
    nextLesson: "Nav & Aside"
  },
  {
    id: "html-43",
    title: "Nav & Aside",
    slug: "html-nav-aside",
    duration: "20 mins",
    whatIsIt: "Nav & Aside ဆိုသည်မှာ ဝဘ်ဆိုက်ပေါ်တွင် links မီနူးများ ပါဝင်သော navigation area အား သတ်မှတ်ပေးသည့် <nav> tag နှင့် ပင်မစာမျက်နှာနှင့် တိုက်ရိုက်မသက်ဆိုင်သော ဘေးဘား (Sidebar/Ad/Related links) များကို သတ်မှတ်ပေးသည့် <aside> tag တို့ ဖြစ်ပါသည်။",
    whyImportant: "Search engine screen readers များသည် <nav> tag ကို ကြည့်ပြီး ဝဘ်ဆိုက်၏ အဓိက လမ်းညွှန် menu ဖြစ်ကြောင်း ချက်ချင်း နားလည်စေပြီး၊ <aside> သည် ဒုတိယဦးစားပေး contents များကို သတ်မှတ်ပေးသဖြင့် layout separation ကောင်းမွန်စေသည်။",
    realWorldUsage: "ဝဘ်ဆိုက်၏ navbar link ခလုတ်များအား <nav> ဖြင့်လည်းကောင်း၊ ဘေးတွင် ပြသထားသော ကြော်ငြာ သို့မဟုတ် ဆောင်းပါးသစ်စာရင်းများကို <aside> ဖြင့်လည်းကောင်း ရေးဆွဲခြင်း ဖြစ်ပါသည်။",
    syntax: `<nav>
  <a href="#home">Home</a>
  <a href="#about">About</a>
</nav>

<aside>
  <h4>Sponsored Ads</h4>
</aside>`,
    examples: [
      `<nav>\n  <ul>\n    <li><a href="/docs">Documentation</a></li>\n  </ul>\n</nav>`
    ],
    commonMistakes: [
      {
        mistake: "ဝဘ်ဆိုက် menu links အားလုံးကို <div class='menu'> ဖြင့်သာ အမြဲရေးသားပြီး nav tag မသုံးစွဲခြင်း။",
        correction: "<nav><a href='/'>Home</a></nav>",
        explanation: "<nav> tag မပါဝင်ပါက assistive technologies မျက်မမြင် screen readers များသည် ဝဘ်ဆိုက်၏ navigation links မီနူးကို လွယ်ကူစွာ ရှာဖွေတွေ့ရှိနိုင်မည် မဟုတ်ပါ။"
      }
    ],
    bestPractices: [
      "ဝဘ်ဆိုက်၏ ပင်မ navigation panel အတွက် <nav> tag ကို မဖြစ်မနေ အသုံးပြုပါ။",
      "<aside> tag အား sidebars, widget groups များနှင့် secondary banners များအတွက်သာ သုံးစွဲပါ။"
    ],
    miniExercise: {
      id: "ex-html-43",
      instruction: "nav tag တစ်ခုအတွင်း href='#services' ရှိသော link တစ်ခု ဖန်တီးပါ။",
      codeTemplate: "<nav>\n  <a href=\"#services\">Services</a>\n</nav>",
      expectedOutput: "<nav>\n  <a href=\"#services\">Services</a>\n</nav>",
      hints: ["<nav> block အတွင်း၌ <a> tag အား ထည့်သွင်းပေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-43",
        question: "ဝဘ်ဆိုက်တစ်ခုလုံး၏ core links navbar navigation blocks ကို စည်းစနစ်တကျ semantic ကျစွာ ရေးသားရန် မည်သည့် tag ကို သုံးရမည်နည်း။",
        options: [
          "<links>",
          "<nav>",
          "<aside>",
          "<menu>"
        ],
        correctOptionIndex: 1,
        explanation: "<nav> semantic block သည် ဝဘ်ဆိုက်၏ အဓိက menus များနှင့် links sections များကို dynamic scope mappings ပြုလုပ်ပေးသည်။"
      }
    ],
    miniProject: {
      title: "Sidebar Portal",
      description: "Navbar နှင့် Sidebar ကြော်ငြာဘား ပါဝင်သော landing web interface တစ်ခု ဖန်တီးပါ။",
      guide: ["nav tag ဖြင့် အဓိက menu links များနှင့် aside tag ဖြင့် side promotion section တည်ဆောက်ပါ။"],
      startingCode: "<nav>\n  <a href=\"#home\">Home</a>\n  <a href=\"#blog\">Blog</a>\n</nav>\n<aside>\n  <h4>Recent Posts</h4>\n  <p>Learn HTML in 10 Days.</p>\n</aside>"
    },
    learningObjectives: {
      what: "<nav> နှင့် <aside> ၏ structural roles, page rankings နှင့် accessibility usage ကို လေ့လာရန်။",
      why: "ဝဘ်စာမျက်နှာ၏ core navigation elements နှင့် complementary auxiliary layouts များကို ရှင်းလင်းစွာ ခွဲခြားရန်။",
      when: "Headers navbar menus နှင့် left/right widgets sidebars များ ရေးဆွဲသည့်အခါ သုံးသည်။",
      how: "links အစုအဝေးများအား <nav> wrapper ဖြင့်လည်းကောင်း၊ ဘေးထွက်အချက်အလက်များအား <aside> ဖြင့်လည်းကောင်း ရေးသားခြင်း။"
    },
    myanmarExplanation: "<nav> element သည် document paths index ကို database crawlers များအတွက် optimized layout scope အဖြစ် dynamic tracking ပြုလုပ်ပြီး၊ <aside> သည် tangential contents segments ကို group လုပ်ပေးသည်။",
    theory: "HTML5 Outline structural specification အရ nav element သည် major navigation content flow ဖြစ်ပြီး aside element သည် main section stream နှင့် ဆက်စပ်သော်လည်း သီးခြားခွဲထုတ်နိုင်သော auxiliary structures ဖြစ်သည်။",
    englishKeywords: ["nav element", "aside element", "Navigation menu", "Sidebar container", "Document outline"],
    stepByStepExplanation: [
      "Navigation area အတွက် <nav> tag သုံးပြီး nested links များထည့်ပါ။",
      "Sidebar သို့မဟုတ် auxiliary features များအတွက် <aside> tag ကို သုံးပြီး layout ဖွဲ့စည်းပါ။"
    ],
    outputPreview: "ပင်မ links menu များနှင့် ဘေးတွင် secondary related links widgets များကို စာမျက်နှာပေါ်တွင် တွေ့ရမည်။",
    tips: ["<nav> element ကို စာမျက်နှာတစ်ခုတည်းတွင် footer navigation, main navigation စသည်ဖြင့် အကြိမ်ရေများစွာ သုံးနိုင်ပါသည်။"],
    assignment: {
      title: "Blog Grid Skeleton",
      description: "ဘလော့ဆိုက်တစ်ခု၏ grid structure အခြေခံအား ရေးဆွဲပါ။",
      instructions: ["Header menu <nav> နှင့် ဘေးဘက် side widgets panel <aside> တို့ပါဝင်သော standard blog outline HTML ကို ရေးသားတင်ပြပါ။"]
    },
    lessonSummary: "Nav နှင့် Aside semantic tags များသည် ဝဘ်ဆိုက်များ၏ links navigation မီနူးများနှင့် sidebars ဘေးဘားအလှဆင်ကွက်များကို စနစ်တကျ သတ်မှတ်ပိုင်းခြားပေးသည်။",
    nextLesson: "Article & Section"
  },
  {
    id: "html-44",
    title: "Article & Section",
    slug: "html-article-section",
    duration: "20 mins",
    whatIsIt: "Article & Section ဆိုသည်မှာ ဝဘ်ဆိုက်ပေါ်တွင် သီးသန့်လွတ်လပ်စွာ ခွဲထုတ်ဖတ်ရှုနိုင်သော contents များ (ဘလော့ဆောင်းပါး၊ သတင်း) အတွက် <article> tag နှင့် စာမျက်နှာတစ်ခုတည်းရှိ ဆက်စပ်အကြောင်းအရာ အစုအဖွဲ့များ (Features, Services) အတွက် <section> tag တို့ ဖြစ်ကြပါသည်။",
    whyImportant: "ဝဘ်ဆိုက်တစ်ခုလုံးကို စနစ်တကျ အခန်းကဏ္ဍများ ပိုင်းခြားပြီး search crawlers များနှင့် RSS feeds reader apps များမှ ဆောင်းပါးများကို အလွယ်တကူ ဆွဲယူနိုင်ရန် ကူညီပေးသဖြင့် SEO အတွက် မရှိမဖြစ်လိုအပ်ပါသည်။",
    realWorldUsage: "News website တစ်ခုတွင် သတင်းတစ်ပုဒ်ချင်းစီကို <article> ဖြင့် ရေးဆွဲပြီး၊ 'အားကစားကဏ္ဍ' သို့မဟုတ် 'နိုင်ငံတကာသတင်းကဏ္ဍ' အလိုက် <section> များ ခွဲခြားခြင်း ဖြစ်ပါသည်။",
    syntax: `<section id="services">
  <h2>Our Services</h2>
</section>

<article>
  <h2>How to Learn HTML</h2>
  <p>Step by step guide...</p>
</article>`,
    examples: [
      `<section>\n  <article>\n    <h3>Article Inside Section</h3>\n  </article>\n</section>`
    ],
    commonMistakes: [
      {
        mistake: "ဆောင်းပါးတစ်ခုလုံးကို <div class='post'> ဖြင့်သာ အမြဲရေးသားပြီး article tag မသုံးစွဲခြင်း။",
        correction: "<article><h2>My Title</h2><p>Content...</p></article>",
        explanation: "<article> သည် self-contained independent tag ဖြစ်ပြီး div မဟုတ်သဖြင့် ပြင်ပ feed reader များမှ ဆောင်းပါးကို သီးခြား sync ဆွဲယူ၍ မရနိုင်ဖြစ်တတ်သည်။"
      }
    ],
    bestPractices: [
      "လွတ်လပ်စွာ standalone syndication ဖြစ်နိုင်သော မည်သည့် post သို့မဟုတ် widget အတွက်မဆို <article> tag ကို သုံးပါ။",
      "အကြောင်းအရာတူရာ စုစည်းရန် <section> ကို သုံးပြီး ၎င်းအတွင်း အမြဲတမ်း <h2>-<h6> heading တစ်ခု ထည့်ပေးပါ။"
    ],
    miniExercise: {
      id: "ex-html-44",
      instruction: "article tag တစ်ခုအတွင်း h2 title ဖြင့် 'JS Tutorial' စာသား ရေးသားပါ။",
      codeTemplate: "<article>\n  <h2>JS Tutorial</h2>\n</article>",
      expectedOutput: "<article>\n  <h2>JS Tutorial</h2>\n</article>",
      hints: ["<article> wrapper အတွင်း <h2>JS Tutorial</h2> ကို ရေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-44",
        question: "ဝဘ်ဆိုက်တစ်ခုမှ သီးခြားလွတ်လပ်စွာ ဖတ်ရှုဖြန့်ဝေနိုင်သော (ဘလော့ပို့စ်၊ သတင်းဆောင်းပါး) များကို semantic ရေးသားရန် မည်သည့် tag ကို သုံးသနည်း။",
        options: [
          "<section>",
          "<article>",
          "<div>",
          "<aside>"
        ],
        correctOptionIndex: 1,
        explanation: "<article> tag သည် standard dynamic dynamic distribution သို့မဟုတ် standalone syndication structures များအတွက် သီးသန့် သတ်မှတ်ထားသော content wrappers ဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "News Feed Grid",
      description: "သတင်းနှစ်ပုဒ်ပါဝင်သော သတင်း feed panel လေးတစ်ခု ဆောက်ပါ။",
      guide: ["<section> ဖြင့် သတင်း block စတင်ပြီး ၎င်းအတွင်း <article> tags ၂ ခု ဆောက်လုပ်ပါ။"],
      startingCode: "<section id=\"news-feed\">\n  <h2>Latest Updates</h2>\n  <article>\n    <h3>HTML5 Released</h3>\n    <p>New tags are available.</p>\n  </article>\n</section>"
    },
    learningObjectives: {
      what: "<article> နှင့် <section> ၏ parameters, stand-alone content flow နှင့် thematic groupings အကြောင်း လေ့လာရန်။",
      why: "ဝဘ်ဆိုက်အား dynamic syndication modules အဖြစ် ပြောင်းလဲပြီး SEO schema mappings ကောင်းမွန်စေရန်။",
      when: "Blog feeds, multi-theme documents, landings sections များ ရေးဆွဲသည့်အခါ သုံးသည်။",
      how: "ခေါင်းစဉ်အလိုက် thematic divisions ကို <section> ဖြင့်လည်းကောင်း၊ standalone items ကို <article> ဖြင့်လည်းကောင်း ရေးသားခြင်း။"
    },
    myanmarExplanation: "<article> element သည် independent self-contained segment အဖြစ် context snippets index ကို feeds links များသို့ dynamic data feeds အဖြစ် ပေးပို့ရန် အကောင်းဆုံးဖြစ်ပြီး section သည် document structure grouping tool ဖြစ်သည်။",
    theory: "HTML5 semantic tags semantics spec အရ section elements များသည် structural thematic group boundaries ကို define လုပ်ပြီး heading element references များကို document outline map အတွင်း registration ပြုလုပ်စေသည်။",
    englishKeywords: ["article element", "section element", "Thematic grouping", "Self-contained content", "RSS syndication"],
    stepByStepExplanation: [
      "thematic groupings အတွက် <section> tags သုံးပြီး headings တစ်ခု အမြဲထည့်ပါ။",
      "independent posts, comments, news ဓာတ်ပုံများအတွက် <article> tags ကို သုံးပြီး structural encapsulation လုပ်ဆောင်ပါ။"
    ],
    outputPreview: "သေသပ်စွာ ပိုင်းခြားထားသော အခန်းကဏ္ဍတစ်ခုအတွင်း သီးခြားဖတ်ရှုနိုင်သော သတင်းဆောင်းပါးကတ်လေး ပေါ်လာမည်။",
    tips: ["article elements များအောက်တွင် user comments list တည်ဆောက်ပါကလည်း nested <article> tags ကို ထပ်ဆင့် အသုံးပြုနိုင်ပါသည်။"],
    assignment: {
      title: "Blog Feed Architecture Layout",
      description: "ဘလော့ဂ်ဝဘ်ဆိုက်တစ်ခု၏ ပင်မ articles catalog ကို ဖန်တီးပါ။",
      instructions: ["'Tech News' section အောက်တွင် ဘလော့ဆောင်းပါး ၃ ခုပါဝင်သော dynamic article layout HTML ကို ရေးဆွဲပြပါ။"]
    },
    lessonSummary: "Article နှင့် Section tags များသည် dynamic elements grouping နှင့် independent posts layouts များကို သေသပ်လှပစွာ format လုပ်နိုင်ရန် ကူညီပေးသည်။",
    nextLesson: "Main & Address"
  },
  {
    id: "html-45",
    title: "Main & Address",
    slug: "html-main-address",
    duration: "20 mins",
    whatIsIt: "Main & Address ဆိုသည်မှာ ဝဘ်စာမျက်နှာတစ်ခုလုံးတွင် မထပ်မလဲ တစ်ကြိမ်တည်းသာ ပါဝင်သော ပင်မအချက်အလက် ဧရိယာကြီးကို သတ်မှတ်ပေးသည့် <main> tag နှင့် စာရေးသူ သို့မဟုတ် လုပ်ငန်း၏ ဆက်သွယ်ရန်လိပ်စာများကို ဖော်ပြပေးသည့် <address> tag တို့ ဖြစ်ကြပါသည်။",
    whyImportant: "ဝဘ်ဆိုက်၏ core content သည် မည်သည့်နေရာတွင် ရှိသည်ကို browser များနှင့် search bots များ တိုက်ရိုက်သိရှိစေပြီး headers, sidebars, footers များထဲမှ core data ကို ချက်ချင်း ကွက်ထုတ်ယူနိုင်စေရန် ကူညီပေးသည်။",
    realWorldUsage: "ဝဘ်ဆိုက်တစ်ခုတွင် အပေါ်ဆုံး header နှင့် အောက်ခြေ footer ကြားရှိ အမှန်တကယ် ဖတ်ရှုရမည့် core paragraphs များကို <main> ဖြင့် သတ်မှတ်ပြီး၊ contact section ရှိ လိပ်စာနှင့် email ကို <address> ဖြင့် ရေးဆွဲခြင်း ဖြစ်ပါသည်။",
    syntax: `<main>
  <h2>Main Content Area</h2>
</main>

<address>
  Written by <a href="mailto:web@example.com">John Doe</a><br>
  Yangon, Myanmar
</address>`,
    examples: [
      `<main>\n  <section>Primary Data Section</section>\n</main>`
    ],
    commonMistakes: [
      {
        mistake: "စာမျက်နှာတစ်ခုတည်းတွင် <main> tag အမြောက်အမြား ထည့်သွင်းအသုံးပြုခြင်း။",
        correction: "စာမျက်နှာတစ်ခုတွင် <main> tag သည် တစ်ခုတည်းသာ တည်ရှိရပါမည်။",
        explanation: "Main element သည် စာမျက်နှာ၏ core unique information wrapper ဖြစ်သဖြင့် header သို့မဟုတ် footer ကဲ့သို့ အကြိမ်ရေများစွာ သုံးခွင့်မရှိပါ။ unique ဖြစ်ရပါမည်။"
      }
    ],
    bestPractices: [
      "<main> wrapper Tag ကို layout grid တစ်ခုလုံး၏ unique center area အဖြစ်သာ သုံးစွဲပါ။",
      "<address> tag အတွင်း physical addresses, mailto, phone references စသည့် contact info များကိုသာ semantic သန့်သန့် ထည့်သွင်းပါ။"
    ],
    miniExercise: {
      id: "ex-html-45",
      instruction: "address tag ကို အသုံးပြုပြီး 'Yangon' ဟူသော စာသားပါဝင်သည့် ဆက်သွယ်ရန်လိပ်စာတစ်ခု ဖန်တီးပါ။",
      codeTemplate: "<address>Yangon</address>",
      expectedOutput: "<address>Yangon</address>",
      hints: ["<address> element အား ဖွင့်ပြီး ပိတ်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-45",
        question: "ဝဘ်စာမျက်နှာတစ်ခုလုံး၏ အဓိက အနှစ်သာရအချက်အလက် (Unique main information) များအားလုံးကို စုစည်းပေးသော unique tag မှာ မည်သည်နည်း။",
        options: [
          "<body>",
          "<main>",
          "<section>",
          "<content>"
        ],
        correctOptionIndex: 1,
        explanation: "<main> tag သည် page documents ၏ core unique element ဖြစ်ပြီး document flow တွင် တစ်ခုတည်းသာ သုံးခွင့်ရှိသည်။"
      }
    ],
    miniProject: {
      title: "Contact Section Layout",
      description: "ပင်မအချက်အလက်နှင့် ဆက်သွယ်ရန် လိပ်စာကတ်ပြားတစ်ခု ပေါင်းစပ်ရေးဆွဲပါ။",
      guide: ["main tag အတွင်း content ရေးသားပြီး ၎င်းအောက်တွင် address tag သုံး၍ contact link များ စုစည်းပါ။"],
      startingCode: "<main>\n  <h2>Developer Portal</h2>\n  <p>Learn web tech with us.</p>\n  <address>\n    Contact: <a href=\"mailto:admin@tech.com\">admin@tech.com</a>\n  </address>\n</main>"
    },
    learningObjectives: {
      what: "<main> container နှင့် <address> semantic elements တို့၏ specificity, SEO features ကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက်၏ core page content priority ကို မြှင့်တင်ရန်နှင့် address directories indexing ကို ကူညီရန်။",
      when: "ဝဘ်ဆိုက်တစ်ခုချင်းစီ၏ unique visual body layouts နှင့် footer directory lists တွေမှာ သုံးသည်။",
      how: "ပင်မ content ဧရိယာအား <main> ဖြင့် ရစ်ပတ်ပြီး လိပ်စာများအား <address> tags သုံး၍ ရေးသားခြင်း။"
    },
    myanmarExplanation: "<main> element သည် layout template ထဲမှ unique components ကို filter လုပ်ယူရန် web browsers crawlers ကို ကူညီပေးပြီး address tag သည် document authority source ကို validate လုပ်ပေးသည်။",
    theory: "HTML5 dynamic outlining specification အရ main element သည် landmark role core wrapper ဖြစ်ပြီး documents layout logic components hierarchy ၏ top hierarchical core container node အဖြစ် အလုပ်လုပ်သည်။",
    englishKeywords: ["main element", "address element", "Unique content", "Landmark role", "Contact info"],
    stepByStepExplanation: [
      "ထပ်ခါတလဲလဲ မဟုတ်သော ပင်မ core content block အတွက် <main> tags ကို ဖွင့်လှစ်ပြီး ရေးသားပါ။",
      "ဆက်သွယ်ရန် ညွှန်းဆိုချက်များအတွက် <address> elements များကို စာတန်းချပြီး စုစည်းထည့်သွင်းပါ။"
    ],
    outputPreview: "စာမျက်နှာ၏ core elements များအောက်တွင် စာလုံးစောင်းလေးများဖြင့် ဆက်သွယ်ရန်လိပ်စာ ပေါ်လာမည်။",
    tips: ["<address> tag အတွင်းရှိ စာသားများကို browser များသည် default အားဖြင့် စာလုံးစောင်း (italic text) ပုံစံဖြင့် လှပစွာ ပြသပေးလေ့ရှိပါသည်။"],
    assignment: {
      title: "Corporate Landmark Outline",
      description: "လုပ်ငန်းသုံး website homepage layout စနစ်တစ်ခု ဖန်တီးပါ။",
      instructions: ["Main contents ဧရိယာ <main> တစ်ခုနှင့် ၎င်းအောက်တွင် ကုမ္ပဏီရုံးချုပ်လိပ်စာ <address> ပါဝင်သော သပ်ရပ်သည့် semantic layouts အား ရေးဆွဲစမ်းသပ်ပါ။"]
    },
    lessonSummary: "Main နှင့် Address semantic tags များသည် ဝဘ်ဆိုက်တစ်ခုချင်းစီ၏ core content areas များနှင့် official contact directories ကို ရှင်းလင်းစွာ သတ်မှတ်ပေးသည်။",
    nextLesson: "Semantic Best Practices"
  },
  {
    id: "html-46",
    title: "Semantic Best Practices",
    slug: "html-semantic-best-practices",
    duration: "20 mins",
    whatIsIt: "Semantic Best Practices ဆိုသည်မှာ ဝဘ်ဆိုက်ရေးသားရာတွင် div tags များကိုသာ နေရာတကာ အသုံးပြုခြင်းကို ရှောင်ကြဉ်ပြီး အဓိပ္ပာယ် ရှင်းလင်းလှပသော Semantic tags (header, nav, section, footer) များကို စနစ်တကျ ရောနှောအသုံးပြုခြင်း ဖြစ်ပါသည်။",
    whyImportant: "သပ်ရပ်သန့်ရှင်းသော ကုဒ်ဖွဲ့စည်းပုံ (Clean Code Structure) ကို ရရှိစေသည့်အပြင် Google Crawler များမှ သင့်ဝဘ်ဆိုက်ကို လွယ်ကူစွာ ဖတ်ရှုနိုင်သဖြင့် SEO search rank သိသိသာသာ တက်စေပြီး web accessibility ကို မြှင့်တင်ပေးပါသည်။",
    realWorldUsage: "Professional developer တစ်ဦးသည် ဝဘ်ဆိုက်တစ်ခု စတင်ရေးဆွဲတိုင်း div tag စုစုပေါင်းထက် semantic tags များကို ၈၀ ရာခိုင်နှုန်းခန့်အထိ ပေါင်းစပ်အသုံးပြုခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<!-- ❌ BAD PRACTICE (Non-semantic divitis) -->
<div class="header">
  <div class="nav">Links</div>
</div>

<!-- ✅ GOOD PRACTICE (Semantic layout) -->
<header>
  <nav>Links</nav>
</header>`,
    examples: [
      `<!-- Semantically correct article wrap -->\n<article>\n  <header><h3>Article Title</h3></header>\n  <p>Article body content...</p>\n</article>`
    ],
    commonMistakes: [
      {
        mistake: "နေရာတကာ div elements များကိုသာ အသုံးပြုပြီး web layout elements outline တည်ဆောက်ခြင်း။",
        correction: "ဝဘ်ဆိုက်၏ သဘာဝအလိုက် header, main, nav, section tags များကို စနစ်တကျ ပြောင်းလဲအသုံးပြုပါ။",
        explanation: "div များကိုသာ အလွန်အကျွံသုံးစွဲခြင်းသည် browser accessibility tree mapping ကို ထိခိုက်ပျက်စီးစေပြီး search ranking index ကို ကျဆင်းစေတတ်သည်။"
      }
    ],
    bestPractices: [
      "ဝဘ်ဆိုက် မဆောက်မီ layout wireframe အား စက္ကူပေါ်တွင် ဆွဲကြည့်ပြီး မည်သည့်နေရာတွင် မည်သည့် semantic tags သုံးမည်ကို ကြိုတင်စီစဉ်ပါ။",
      "headings hierarchy (h1, h2, h3) ကို စည်းစနစ်တကျ အထက်အောက် အစဉ်အလိုက် သုံးစွဲပါ။"
    ],
    miniExercise: {
      id: "ex-html-46",
      instruction: "non-semantic div blocks အစား semantic html tag elements သုံးပြီး 'Article' title တစ်ခု ရေးဆွဲပါ။",
      codeTemplate: "<article>\n  <h2>Semantic Post</h2>\n</article>",
      expectedOutput: "<article>\n  <h2>Semantic Post</h2>\n</article>",
      hints: ["<div> tag အစား semantic <article> layout tags ပြောင်းလဲအသုံးပြုပါ။"]
    },
    quiz: [
      {
        id: "q-html-46",
        question: "ဝဘ်ဆိုက်တစ်ခုတွင် နေရာတကာ non-semantic div elements များကိုသာ အလွန်အကျွံ သုံးစွဲခြင်းကို developer လောက၌ မည်သို့ ခေါ်သနည်း။",
        options: [
          "Divitis",
          "Nesting Error",
          "Tag Clutter",
          "Layout Abuse"
        ],
        correctOptionIndex: 0,
        explanation: "div elements များကိုသာ နေရာအနှံ့ အလွန်အကျွံ သုံးစွဲခြင်းကို 'Divitis' ဟု သရော်ခေါ်ဆိုလေ့ရှိပြီး ၎င်းကို ရှောင်ကြဉ်ရန် တိုက်တွန်းသည်။"
      }
    ],
    miniProject: {
      title: "Clean Web Scaffold",
      description: "Semantic layouts standards အပြည့်အဝ ကိုက်ညီသော website skeletal frame တစ်ခု ဖန်တီးပါ။",
      guide: ["header, nav, main, section, footer semantic elements ၅ မျိုးစလုံးကို သပ်ရပ်လှပစွာ nesting တည်ဆောက်ပါ။"],
      startingCode: "<header>\n  <nav>\n    <a href=\"#\">Home</a>\n  </nav>\n</header>\n<main>\n  <section>\n    <h2>Our Missions</h2>\n    <p>Educate everyone with clean code.</p>\n  </section>\n</main>\n<footer>\n  <p>Code Learn Myanmar &copy; 2026</p>\n</footer>"
    },
    learningObjectives: {
      what: "Semantic web guidelines, WCAG, divitis constraints နှင့် tag selection flow charts အား နားလည်ရန်။",
      why: "ဝဘ်ဆိုက်၏ ကုဒ်များကို ကမ္ဘာ့စံချိန်စံညွှန်းမီ သပ်ရပ်သန့်ရှင်းပြီး rankings အမြင့်မားဆုံး ရရှိစေရန်။",
      when: "ဝဘ်ဆိုက်တစ်ခုလုံး၏ structural wireframing များနှင့် design blocks တည်ဆောက်တိုင်း သုံးသည်။",
      how: "wireframes logic အပေါ် မူတည်၍ တိကျသော semantic elements standard tags များကိုသာ ရွေးချယ်ရေးသားခြင်း။"
    },
    myanmarExplanation: "Semantic Best Practices ကို လိုက်နာခြင်းဖြင့် ကုဒ်ဖတ်ရလွယ်ကူခြင်း၊ browser interpretation ကောင်းမွန်ခြင်းနှင့် user accessibility interfaces များအား hardware interfaces များမှ အလွယ်ဆုံး sync ချိတ်ဆက်နိုင်စေသည်။",
    theory: "W3C Semantic Web vision Specification အရ web documents outlines များသည် machines ဖတ်ရှုနားလည်နိုင်သော datasets structural semantic metadata tree elements များအဖြစ် optimized layouts indexing ရှိရမည်။",
    englishKeywords: ["Semantic best practices", "Clean markup", "Divitis mitigation", "Accessibility outline", "W3C standards"],
    stepByStepExplanation: [
      "Wireframe specs အတိုင်း non-semantic နေရာများတွင် markup options များကို semantic tags အဖြစ် ပြောင်းလဲပါ။",
      "ထိပ်ဆုံးမှ အောက်ခြေထိ nested nodes elements structure အား clear flow ဖြင့် တန်းညှိပြီး coding ပြုလုပ်ပါ။"
    ],
    outputPreview: "ကုဒ်ဖွဲ့စည်းပုံ အလွန်သပ်ရပ်ပြီး browser outline mappings ပြည့်စုံသော Semantic Scaffold ပေါ်လာမည်။",
    tips: ["HTML code block အား ရေးသားပြီးတိုင်း w3.org validators တွင် semantic check လုပ်ပေးခြင်းသည် အလွန်အကျိုးရှိသော အလေ့အကျင့်ဖြစ်ပါသည်။"],
    assignment: {
      title: "Semantic Transformation Project",
      description: "Non-semantic code blocks အား semantic tags များအဖြစ် ပြောင်းလဲရေးဆွဲပါ။",
      instructions: ["div and span သက်သက်ဖြင့်သာ ရေးထားသော ကုဒ်ဟောင်းတစ်ခုအား header, nav, section, footer tags သုံး၍ semantic transform ပြုလုပ်ပြပါ။"]
    },
    lessonSummary: "Semantic best practices စံနှုန်းများကို လိုက်နာခြင်းဖြင့် ရှာဖွေရေး search engine များမှ သင့်ဝဘ်ဆိုက်ကို ချစ်ခင်ပြီး SEO and accessibility အားလုံး အကောင်းဆုံး ဖြစ်စေသည်။",
    nextLesson: "Introduction to SEO"
  },
  {
    id: "html-47",
    title: "Introduction to SEO",
    slug: "html-seo-intro",
    duration: "20 mins",
    whatIsIt: "Introduction to SEO (Search Engine Optimization) ဆိုသည်မှာ သင့်ဝဘ်ဆိုက်အား Google သို့မဟုတ် Bing ကဲ့သို့သော ရှာဖွေရေး အင်ဂျင်ကြီးများတွင် ရှာဖွေလိုက်သည့်အခါ ထိပ်ဆုံးစာမျက်နှာများတွင် ပေါ်လာစေရန် HTML tags များကို အသုံးပြု၍ ပိုမိုကောင်းမွန်အောင် ပြင်ဆင်ဖန်တီးပေးသည့် နည်းပညာဖြစ်ပါသည်။",
    whyImportant: "ဝဘ်ဆိုက်တစ်ခုသည် မည်မျှပင် လှပစေကာမူ Google တွင် ရှာမတွေ့ပါက အသုံးပြုသူများ လုံးဝရောက်ရှိလာမည် မဟုတ်သဖြင့် စီးပွားရေးလုပ်ငန်းများ အောင်မြင်ရန် SEO သည် အလွန်အရေးကြီးပါသည်။",
    realWorldUsage: "ကမ္ဘာကျော် e-commerce ဆိုက်များ၊ ဘလော့ဆိုက်များသည် ၎င်းတို့၏ ထုတ်ကုန်များကို ရှာဖွေသူများ ပထမဆုံးတွေ့ရှိစေရန် နောက်ကွယ်တွင် HTML SEO tags များကို စနစ်တကျ ပြောင်းလဲပြင်ဆင်ထားခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<head>
  <title>SEO Friendly Web Title</title>
  <!-- SEO Elements -->
</head>`,
    examples: [
      `<!-- Heading SEO structures -->\n<h1>My Unique Web Brand</h1>`
    ],
    commonMistakes: [
      {
        mistake: "စာမျက်နှာတစ်ခုလုံးတွင် h1 tags အမြောက်အမြားကို နေရာအနှံ့ အဓိပ္ပာယ်မရှိ ထည့်သွင်းသုံးစွဲခြင်း။",
        correction: "စာမျက်နှာတစ်ခုလုံးတွင် <h1> tag သည် အဓိက keyword ခေါင်းစဉ်တစ်ခုတည်းသာ ဖြစ်ရပါမည်။",
        explanation: "<h1> tags အများအပြားသုံးပါက Google crawler bots များသည် မည်သည့်စာသားသည် ဤစာမျက်နှာ၏ ပင်မခေါင်းစဉ်ဖြစ်ကြောင်း ဝေခွဲမရဖြစ်ပြီး search rankings ကျဆင်းသွားတတ်သည်။"
      }
    ],
    bestPractices: [
      "ဝဘ်ဆိုက်၏ ခေါင်းစဉ် <title> အား အဓိက keywords များပါဝင်အောင် စွဲဆောင်မှုရှိရှိ ရေးသားပါ။",
      "alternative text (alt) attributes များကို tags ပုံရိပ်တိုင်းတွင် SEO friendly ဖြစ်အောင် ထည့်သွင်းပါ။"
    ],
    miniExercise: {
      id: "ex-html-47",
      instruction: "title tag အား အသုံးပြုပြီး 'Learn HTML Free - Step by Step' ဟူသော SEO title တစ်ခု တည်ဆောက်ပါ။",
      codeTemplate: "<title>Learn HTML Free - Step by Step</title>",
      expectedOutput: "<title>Learn HTML Free - Step by Step</title>",
      hints: ["<title> element node အတွင်း highlight keyword စာတန်းကို ရေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-47",
        question: "ဝဘ်ဆိုက်တစ်ခုအား Google search page တွင် လူများရှာဖွေတွေ့ရှိရန် tags များကို ပိုမိုကောင်းမွန်အောင် ပြင်ဆင်ခြင်းကို မည်သို့ခေါ်သနည်း။",
        options: [
          "SEO",
          "SEM",
          "SMM",
          "SPA"
        ],
        correctOptionIndex: 0,
        explanation: "SEO (Search Engine Optimization) သည် ဝဘ်စာမျက်နှာများ၏ search index visibility တက်လှမ်းရန် နည်းလမ်းများကို ဆိုလိုသည်။"
      }
    ],
    miniProject: {
      title: "SEO Meta Card",
      description: "SEO ကောင်းမွန်သော head section layout အခြေခံတစ်ခု ရေးသားပါ။",
      guide: ["ခေါင်းစဉ် title tag အား keyword စုံစုံလင်လင်ဖြင့် သပ်ရပ်စွာ ထည့်သွင်းဆောက်လုပ်ပါ။"],
      startingCode: "<head>\n  <title>Web Development Course in Myanmar | Free Study</title>\n</head>"
    },
    learningObjectives: {
      what: "SEO ၏ အဓိကသဘောတရား၊ crawlers အလုပ်လုပ်ပုံနှင့် HTML tags နှင့် SEO ဆက်စပ်ပုံကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက်အား အခမဲ့ organic search traffic များ အဆက်မပြတ် ဝင်ရောက်စီးဆင်းလာစေရန်။",
      when: "ဝဘ်ဆိုက်တည်ဆောက်စတင်သည့် ပထမဆုံး အချိန်တိုင်းတွင် design logic နှင့်အတူ သုံးသည်။",
      how: "head content areas နှင့် headings structural tag selection ကို SEO guidelines နှင့်အညီ ရေးသားခြင်း။"
    },
    myanmarExplanation: "SEO သည် browser crawlers (Googlebot) မှ သင့်ကုဒ်များကို လွယ်ကူစွာဖတ်ရှုပြီး ၎င်းတို့၏ search engine directories database အတွင်း index အဆင့်အတန်း ကောင်းမွန်စွာ သတ်မှတ်ပေးရန် ကူညီပေးသော structural codes ပြင်ဆင်မှု ဖြစ်သည်။",
    theory: "Search Engine Optimization guidelines specification အရ algorithms crawlers များသည် structural semantic metadata များကို keywords density references နှင့် document context mappings အပေါ် တွက်ချက်အဆင့်သတ်မှတ်သည်။",
    englishKeywords: ["SEO intro", "search engine crawling", "Organic Traffic", "SEO index", "search visibility"],
    stepByStepExplanation: [
      "head areas တွင် descriptive <title> tag အား keyword parameters ဖြင့် ရေးပါ။",
      "body tags တွင် structural outline structure headings hierarchies ကို စနစ်တကျ ရေးသားအသုံးပြုပါ။"
    ],
    outputPreview: "Google search directories တွင် rankings တက်လွယ်စေမည့် SEO metadata frame စတင်တည်ဆောက်ပြီး ဖြစ်သည်။",
    tips: ["ဝဘ်ဆိုက် မြန်ဆန်ပွင့်နှုန်း (Loading Speed) သည်လည်း Google SEO algorithms များအတွက် အလွန်အရေးကြီးသော rankings parameters ဖြစ်သည်။"],
    assignment: {
      title: "Core SEO Checklist Wireframe",
      description: "SEO စံနှုန်းများ သတ်မှတ်ထားသော HTML scaffold တစ်ခု တည်ဆောက်ပါ။",
      instructions: ["Keyword title, single h1 header, structural components ပါဝင်သော SEO basic outline markup ရေးဆွဲစမ်းသပ်ပြပါ။"]
    },
    lessonSummary: "SEO နည်းပညာသည် ဝဘ်ဆိုက်များအား ရှာဖွေရေး search engines စာမျက်နှာများတွင် အလွယ်ဆုံး ရှာဖွေတွေ့ရှိရန် HTML semantic tags ကို သုံးစွဲ၍ အကောင်းဆုံး optimization ပြုလုပ်ပေးသည်။",
    nextLesson: "Meta Tags"
  },
  {
    id: "html-48",
    title: "Meta Tags",
    slug: "html-meta-tags",
    duration: "20 mins",
    whatIsIt: "Meta Tags ဆိုသည်မှာ ဝဘ်စာမျက်နှာပေါ်တွင် ပုံမှန်အားဖြင့် မမြင်တွေ့ရဘဲ၊ head tag (<head>) အတွင်း၌သာ ထည့်သွင်းရပြီး browser များနှင့် search engine crawler များအတွက် စာမျက်နှာအကြောင်းအရာ ဖော်ပြချက် (Description)၊ အသုံးပြုထားသော ဘာသာစကားစနစ် (Charset UTF-8) စသည့် metadata များကို သတ်မှတ်ပေးသည့် ထူးခြားသော tags များ ဖြစ်ပါသည်။",
    whyImportant: "Google search တွင် သင့်ဝဘ်ဆိုက်အောက်၌ ပြသပေးမည့် description စာတန်းများကို သတ်မှတ်ပေးနိုင်ပြီး၊ လူမှုကွန်ရက် (Facebook, Viber) တို့တွင် လင့်ခ်မျှဝေသည့်အခါ preview ပုံရိပ်နှင့် စာသားများ လှပစွာ ပေါ်လာစေရန် တာဝန်ယူပေးသောကြောင့် အလွန်အရေးကြီးပါသည်။",
    realWorldUsage: "ဝဘ်ဆိုက်လင့်ခ်ကို Facebook messenger တွင် copy နှိပ်၍ share လိုက်ချိန်တွင် လှပသော banner ပုံလေးနှင့် header titles များ auto ပေါ်လာခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<meta name="description" content="ဝဘ်သင်ခန်းစာများ လေ့လာရန်နေရာ။">
<meta charset="UTF-8">`,
    examples: [
      `<meta name="keywords" content="html, coding, myanmar">\n<meta property="og:title" content="Code Learn Myanmar">`
    ],
    commonMistakes: [
      {
        mistake: "<meta name='description'> (content attribute မပါဝင်ခြင်း)",
        correction: "<meta name='description' content='Beautiful courses.'>",
        explanation: "meta tag များတွင် description ကို သတ်မှတ်ပါက description contents text များကို 'content' attribute အတွင်း၌သာ သတ်မှတ်ရေးသားပေးရပါမည်။"
      }
    ],
    bestPractices: [
      "ဘာသာစကားစာလုံးများ စာမျက်နှာပေါ်တွင် မပျက်မစီး အဆင်ပြေစေရန် <meta charset=\"UTF-8\"> ကို head အစဆုံးတွင် အမြဲထည့်ပါ။",
      "Facebook share parameters အတွက် Open Graph (og:) meta properties များကို ထည့်သွင်းသုံးစွဲပါ။"
    ],
    miniExercise: {
      id: "ex-html-48",
      instruction: "meta tag description content attribute အား 'Free Coding Study' ဟု ရေးဆွဲပါ။",
      codeTemplate: "<meta name=\"description\" content=\"Free Coding Study\">",
      expectedOutput: "<meta name=\"description\" content=\"Free Coding Study\">",
      hints: ["<meta> properties tags scope scope rules ကို content value နှင့် တွဲဖက်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-48",
        question: "ဝဘ်စာမျက်နှာပေါ်တွင် မမြင်ရသော်လည်း browser များနှင့် search engine crawlers များအတွက် စာမျက်နှာအကြောင်းအရာ description ကို သတ်မှတ်ရန် မည်သည့် tag ကို သုံးရသနည်း။",
        options: [
          "<title>",
          "<meta>",
          "<head>",
          "<link>"
        ],
        correctOptionIndex: 1,
        explanation: "<meta> elements tags များသည် document metadata specifications (charset, descriptions, viewports) ကို သတ်မှတ်ဖန်တီးပေးသည်။"
      }
    ],
    miniProject: {
      title: "Open Graph Shell",
      description: "Facebook links share previews စနစ်ကို meta tags သုံးပြီး ရေးသားပါ။",
      guide: ["og:title, og:description, og:image meta tags အစုအဝေးကို head အတွင်း သေသပ်စွာ ထည့်သွင်းပါ။"],
      startingCode: "<head>\n  <meta charset=\"UTF-8\">\n  <meta property=\"og:title\" content=\"Study Web Tech Free\">\n  <meta property=\"og:description\" content=\" Myanmar's premier coding applet.\">\n</head>"
    },
    learningObjectives: {
      what: "meta elements, charset character encodings, viewport control, descriptions metadata roles ကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက်၏ search ranking profiles features နှင့် social platform links optimization စံနှုန်းများကို ကောင်းမွန်စေရန်။",
      when: "ဝဘ်ဆိုက်၏ index metadata initialization configuration head section ရေးဆွဲတိုင်း သုံးသည်။",
      how: "head element block ထဲတွင် meta variables များကို self-closing specifications ဖြင့် သတ်မှတ်ရေးသားခြင်း။"
    },
    myanmarExplanation: "<meta> tags များသည် visual elements မဟုတ်ဘဲ ဝဘ်စာမျက်နှာ၏ identity profiles data properties ဖြစ်သဖြင့် search crawlers indexers များမှ keywords mapping analysis လုပ်ရန် အဓိက အသုံးပြုသည်။",
    theory: "HTML5 Document metadata specifications spec အရ meta empty elements tags များသည် documents attribute bindings name-value keys parameters များကို parsing levels တွင် configuration inputs အဖြစ် processing parameters ပေးသည်။",
    englishKeywords: ["meta tag", "document description", "Open Graph meta", "meta charset", "Metadata schema"],
    stepByStepExplanation: [
      "<meta> element templates ကို head tag အောက်တွင် ထည့်သွင်းပါ။",
      "charset UTF-8 initialization control attribute အား ထိပ်ဆုံးတွင် အမြဲထားရှိရေးသားပါ။"
    ],
    outputPreview: "Social platform previews များနှင့် search crawler indexing descriptions များ ပါဝင်သော meta frame ဆောက်လုပ်ပြီးဖြစ်သည်။",
    tips: ["description meta tags content အား စာလုံးရေ ၁၅၀ မှ ၁၆၀ အတွင်းသာ တိုတိုကျစ်ကျစ်နှင့် keyword highlights ပါဝင်အောင် ရေးသားခြင်းသည် အထိရောက်ဆုံး ဖြစ်သည်။"],
    assignment: {
      title: "SEO Rich Document Head Metadata",
      description: "SEO settings ပြည့်စုံသော html head config section ကို ဖန်တီးပါ။",
      instructions: ["Charset, viewport metadata, meta description, meta keywords, Open Graph settings tags ၅ ခုစလုံး ပါဝင်သော head code ရေးသားပြပါ။"]
    },
    lessonSummary: "Meta tags များသည် ဝဘ်စာမျက်နှာများ၏ indexing profiles, descriptions, viewports configurations metadata များကို browser and search engines များအတွက် သေသပ်စွာ သတ်မှတ်ပေးသည်။",
    nextLesson: "Heading Structure for SEO"
  },
  {
    id: "html-49",
    title: "Heading Structure for SEO",
    slug: "html-heading-seo-structure",
    duration: "15 mins",
    whatIsIt: "Heading Structure for SEO ဆိုသည်မှာ ဝဘ်စာမျက်နှာပေါ်ရှိ Heading tags (<h1> မှ <h6>) များကို စိတ်ကြိုက် နေရာအနှံ့ အဓိပ္ပာယ်မရှိ အသုံးမပြုဘဲ စာအုပ်တစ်အုပ်၏ မာတိကာ (Outline) ကဲ့သို့ ခေါင်းစဉ်ကြီး၊ ခေါင်းစဉ်ခွဲများအဖြစ် အဆင့်ဆင့် စနစ်တကျ ရေးဆွဲခြင်း ဖြစ်ပါသည်။",
    whyImportant: "Google Crawlers များသည် သင့်စာမျက်နှာ၏ visual code hierarchical patterns ကိုဖတ်ရှုပြီး headings tags အစီအစဉ်မှတစ်ဆင့် စာမျက်နှာ၏ core keywords flow ကို တွက်ချက်ရယူသဖြင့် SEO rankings အတွက် အလွန်သက်ရောက်မှု ကြီးမားပါသည်။",
    realWorldUsage: "ဘလော့ပို့စ်တစ်ခုတွင် ပင်မခေါင်းစဉ်အား <h1> ဖြင့်လည်းကောင်း၊ ၎င်းအောက်ရှိ headings အခွဲငယ်များကို <h2> နှင့် <h2> အောက်မှ အချက်အလက်ခွဲများကို <h3> ဖြင့် စနစ်တကျ nested ရေးဆွဲခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<h1>ပင်မခေါင်းစဉ် (တစ်ခုတည်းသာရှိရမည်)</h1>
<h2>အခန်းခေါင်းစဉ်ခွဲ</h2>
<h3>အချက်အလက်ခွဲငယ်</h3>`,
    examples: [
      `<h1>How to Build a Website</h1>\n<h2>Step 1: Setup Environment</h2>\n<h3>Downloading Editor</h3>`
    ],
    commonMistakes: [
      {
        mistake: "h1 element ကျော်ပြီး h3 သို့မဟုတ် h4 tags များကို စာမျက်နှာထိပ်ပိုင်းတွင် visual size ကြောင့် တိုက်ရိုက် ခုန်သုံးစွဲခြင်း။",
        correction: "အစဉ်အလိုက် h1 -> h2 -> h3 hierarchical outline ကိုသာ သုံးပါ။ design blocks text size အတွက် CSS class ကိုသာ သုံးစွဲပါ။",
        explanation: "headers levels များကို skip ကျော်ခွသုံးစွဲခြင်းသည် search crawler document indexing outline structures ကို ပျက်စီးစေပြီး search readability scoring ကို ဆိုးရွားစွာ ကျဆင်းစေတတ်သည်။"
      }
    ],
    bestPractices: [
      "စာမျက်နှာတစ်ခုလုံးတွင် <h1> tag ကို exact key values keywords ဖြင့် တစ်ကြိမ်တည်းသာ သုံးစွဲပါ။",
      "headings outline sequential nodes elements rankings pattern အား အမြဲတမ်း စောင့်ထိန်းပါ။"
    ],
    miniExercise: {
      id: "ex-html-49",
      instruction: "h2 hierarchical sub-heading tag တစ်ခု ဖန်တီးပြီး 'HTML Tutorial' စာသား ရေးဆွဲပါ။",
      codeTemplate: "<h2>HTML Tutorial</h2>",
      expectedOutput: "<h2>HTML Tutorial</h2>",
      hints: ["<h2> heading element အား စံစနစ်တကျ ရေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-49",
        question: "ဝဘ်စာမျက်နှာတစ်ခုလုံး၏ ပင်မ title (SEO focus title) အား သတ်မှတ်ရန် မည်သည့် heading levels tag ကို သုံးရမည်နည်း။",
        options: [
          "<h1>",
          "<h2>",
          "<h6>",
          "<head>"
        ],
        correctOptionIndex: 0,
        explanation: "<h1> tag သည် document core heading ဖြစ်သဖြင့် browser screen and search rank outlines elements တွင် index score အမြင့်မားဆုံး ရရှိသည်။"
      }
    ],
    miniProject: {
      title: "Outline Generator",
      description: "SEO hierarchy outline rules များနှင့် ကိုက်ညီသော website outline architecture တစ်ခု ဆောက်ပါ။",
      guide: ["h1, h2, h3 tags များကို အဆင့်ဆင့် အစဉ်အလိုက် nesting structure layouts ဖွဲ့စည်းတည်ဆောက်ပါ။"],
      startingCode: "<h1>Learn Software Engineering</h1>\n<h2>Module 1: Web Development</h2>\n<h3>Lesson 1: Intro to HTML</h3>"
    },
    learningObjectives: {
      what: "headings levels (h1-h6) ၏ outline mappings, document trees structures, accessibility headings map ကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက်၏ content architecture tags ကို readable and machine-optimized SEO rankings အဖြစ် အဆင့်မြှင့်တင်ရန်။",
      when: "စာမျက်နှာများ၊ ဘလော့ဆောင်းပါးများ၊ document bodies configuration headings layout ရေးဆွဲတိုင်း သုံးသည်။",
      how: "h1 -> h2 -> h3 nesting hierarchical outline rules parameters နှင့်အညီ coding ပြုလုပ်ခြင်း။"
    },
    myanmarExplanation: "headings outline pattern သည် browser structure mapping validation tree ကို define လုပ်ပေးသဖြင့် search indexer robots မှ dynamic reading paths များကို optimized headings အတိုင်း score အဆင့် သတ်မှတ်ပေးသည်။",
    theory: "HTML outline algorithm specification semantics guidelines spec အရ heading nodes h1-h6 elements များသည် content grouping partitions tags configurations maps များကို dynamic directory layout mapping tree structures အဖြစ် registry ပေးသည်။",
    englishKeywords: ["heading hierarchy", "heading levels", "Outline algorithm", "document outlines", "header nesting"],
    stepByStepExplanation: [
      "ပင်မခေါင်းစဉ် တစ်ခုတည်းအတွက် <h1> tag tags templates ကို body အစပိုင်းတွင် ထည့်ပါ။",
      "အခန်းခွဲများအတွက် <h2>, <h3> subsets elements tags structure ကို sequential အစီအစဉ်အတိုင်း ရေးပါ။"
    ],
    outputPreview: "သေသပ်ပြီး outlines indices analysis standards ပြည့်စုံသော heading outline architectures ပေါ်လာမည်။",
    tips: ["headings style design properties controls ပြင်ဆင်ရန် headings size attributes မသုံးဘဲ CSS sizing properties ကိုသာ အသုံးပြုပါ။"],
    assignment: {
      title: "Thematic Syllabus Blueprint Outline",
      description: "SEO friendly syllabus header map layout တစ်ခု ဆောက်ပါ။",
      instructions: ["သင်တန်းမာတိကာ outline code အား h1, h2, h3 tags hierarchy standards အပြည့်အဝ ကိုက်ညီစွာ ရေးဆွဲပြပါ။"]
    },
    lessonSummary: "Heading tags levels h1-h6 structures များသည် ဝဘ်ဆိုက်၏ contents hierarchies များကို စနစ်တကျ outlined structured mappings အဖြစ် search engine index analysis guides ပေးသည်။",
    nextLesson: "Introduction to Accessibility"
  },
  {
    id: "html-50",
    title: "Introduction to Accessibility",
    slug: "html-accessibility-intro",
    duration: "20 mins",
    whatIsIt: "Introduction to Accessibility (Web Accessibility သို့မဟုတ် a11y) ဆိုသည်မှာ ဝဘ်ဆိုက်များကို သာမန်လူများသာမက မသန်စွမ်းသူများ (မျက်မမြင်များ၊ မျက်စိအားနည်းသူများ၊ နားမကြားသူများ) ပါ အဆင်ပြေပြေ တန်းတူညီမျှ အသုံးပြုနိုင်ရန် HTML tags များကို အထူးစံနှုန်းများဖြင့် ရေးသားပြင်ဆင်ပေးသည့် နည်းပညာဖြစ်ပါသည်။",
    whyImportant: "ကမ္ဘာ့လူဦးရေ၏ ၁၅ ရာခိုင်နှုန်းခန့်သည် မသန်စွမ်းမှုတစ်မျိုးမျိုး ရှိကြသဖြင့် ဝဘ်ဆိုက်ကို လူတိုင်း အသုံးပြုနိုင်ရန် (Inclusive Web) ပြင်ဆင်ပေးခြင်းသည် တရားဝင် ဥပဒေစံနှုန်းများ ကိုက်ညီစေသည့်အပြင် လူသားချင်းစာနာသော အဆင့်မြင့် design craft ဖြစ်သောကြောင့် အလွန်အရေးကြီးပါသည်။",
    realWorldUsage: "ကမ္ဘာကျော် တက္ကသိုလ် ဝဘ်ဆိုက်များ၊ ဘဏ်ဝဘ်ဆိုက်များသည် interactive form controls များနှင့် content reading workflows များကို မသန်စွမ်းသူများအဆင်ပြေစေရန် coding patterns များကို custom tags စံနှုန်းများဖြင့် ရေးဆွဲထားခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<div role="button" aria-label="Play Video">Play</div>`,
    examples: [
      `<!-- Accessible button components -->\n<button aria-label="Close modal">X</button>`
    ],
    commonMistakes: [
      {
        mistake: "click action mappings ပြုလုပ်ရန် <button> အစား <div> သက်သက်ကိုသာ အမြဲသုံးပြီး visual features သာ တည်ဆောက်ခြင်း။",
        correction: "interactive targets events အတွက် generic <button> element component ကိုသာ အမြဲသုံးစွဲပါ။",
        explanation: "div တွင် mouse visual features ရှိသော်လည်း visual reader, key arrows tabs interaction options များ လုံးဝမရရှိသဖြင့် မျက်မမြင် screen readers များအတွက် လုံးဝ ကလစ်နှိပ်၍ မရဖြစ်သွားတတ်သည်။"
      }
    ],
    bestPractices: [
      "ဝဘ်ဆိုက် interactive tags elements တိုင်းတွင် keyboard navigation tab indexes controls လွယ်ကူချောမွေ့အောင် coding ရေးပါ။",
      "ရုပ်ပုံတိုင်းတွင် alternative description alt attribute tags properties ကို စနစ်တကျ ထည့်သွင်းပါ။"
    ],
    miniExercise: {
      id: "ex-html-50",
      instruction: "button accessibility control parameter 'Close' ဖြစ်သော aria-label attribute ပါဝင်သည့် button တစ်ခု ဖန်တီးပါ။",
      codeTemplate: "<button aria-label=\"Close\">X</button>",
      expectedOutput: "<button aria-label=\"Close\">X</button>",
      hints: ["button tag templates parameters input configuration elements တွင် aria-label='Close' ကို ရေးသားပါ။"]
    },
    quiz: [
      {
        id: "q-html-50",
        question: "ဝဘ်ဒီဇိုင်း developer လောကတွင် 'Accessibility' ဟူသော စကားလုံးကို တိုတိုကျဉ်းကျဉ်း သင်္ကေတအဖြစ် မည်သို့ ရေးသားလေ့ရှိသနည်း။",
        options: [
          "a11y",
          "SEO",
          "W3C",
          "UX"
        ],
        correctOptionIndex: 0,
        explanation: "a11y သည် Accessibility ဟူသော စကားလုံး၏ အစ 'A' နှင့် အဆုံး 'Y' ကြားရှိ စာလုံးရေ ၁၁ လုံးကို ကိုယ်စားပြုသော global technical abbreviation ဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "Accessible Card Panel",
      description: "Screen reader test screens အားလုံး အောင်မြင်နိုင်မည့် accessible profile card တစ်ခု ဆောက်ပါ။",
      guide: ["card structure components visual layers တွင် attributes dynamic options a11y guides များကို ထည့်သွင်းပါ။"],
      startingCode: "<div class=\"user-card\" role=\"region\" aria-label=\"User Profile\">\n  <h3>Aung Ko</h3>\n  <button aria-label=\"Send email to Aung Ko\">Contact</button>\n</div>"
    },
    learningObjectives: {
      what: "Web Accessibility, WCAG criteria levels, Screen Readers mechanics, a11y standards tags roles ကို လေ့လာရန်။",
      why: "မသန်စွမ်းသူများအပါအဝင် ဝဘ်ဆိုက်အား လူတိုင်းလွယ်ကူစွာ ချိတ်ဆက်ကြည့်ရှုနိုင်သော universal web ဖန်တီးရန်။",
      when: "interactive user design components coding, forms, media element controls တည်ဆောက်တိုင်း သုံးသည်။",
      how: "semantic elements values selection နှင့် visual configurations interactive attributes properties ကို tags အဖြစ် ထည့်သွင်းခြင်း။"
    },
    myanmarExplanation: "Accessibility (a11y) စနစ်ကို HTML ဖြင့် ရေးသားခြင်းသည် mouse interfaces သက်သက်သာမက screen reader softwares, keyboard arrows elements စသည့် cross-platform hardware tools များမှ codes mapping logic ကို အလွယ်ဆုံး sync ချိတ်ဆက်နိုင်စေသည်။",
    theory: "W3C Web Content Accessibility Guidelines (WCAG) standard spec specifications protocols အရ dynamic rich UI components parameters များသည် role mappings metadata attributes (ARIA) ဖြင့် accessible tree structures အဖြစ် parsing ရှိရမည်။",
    englishKeywords: ["Accessibility intro", "a11y guidelines", "Universal inclusive design", "WCAG criteria", "assistive devices"],
    stepByStepExplanation: [
      "semantic interactive buttons, links components tags templates ကို body visual areas တွင် ထည့်ပါ။",
      "complex nodes components elements tags role maps profiles ကို configuration parameters အဖြစ် ရေးသားအသုံးပြုပါ။"
    ],
    outputPreview: "Keyboard arrows indexes and screen reader tests views configurations အောင်မြင်စွာ ပါဝင်သော a11y scaffold ဖန်တီးပြီး ဖြစ်သည်။",
    tips: ["ဝဘ်ဆိုက် background layout panels core text contrasts levels သည် WCAG criteria အဆင့်အလိုက် အနည်းဆုံး 4.5:1 ratio balance ရှိရပါမည်။"],
    assignment: {
      title: "Accessible Interaction Scaffold Setup",
      description: "Accessibility test components UI interface framework တစ်ခု ရေးဆွဲပါ။",
      instructions: ["လင့်ခ်များ၊ icons ခလုတ်များ၊ images alt attributes visual interactive tags features a11y specifications tags layout ရေးသားပြပါ။"]
    },
    lessonSummary: "Accessibility tags specifications configurations guidelines (a11y) ညွှန်ကြားချက်များသည် သင့်ဝဘ်ဆိုက်အား မသန်စွမ်းသူများအပါအဝင် မည်သူမဆို တန်းတူညီမျှ အသုံးပြုနိုင်အောင် interactive HTML controls ပြောင်းလဲဖန်တီးပေးသည်။",
    nextLesson: "Alt Attributes & ARIA Labels"
  },
  {
    id: "html-51",
    title: "Alt Attributes & ARIA Labels",
    slug: "html-alt-attributes-aria-labels",
    duration: "20 mins",
    whatIsIt: "Alt Attributes & ARIA Labels ဆိုသည်မှာ ရုပ်ပုံများအတွက် မျက်မမြင်ဖတ်ကြားရန် ဓာတ်ပုံဖော်ပြချက် alt attribute နှင့် visual text မရှိသော graphic items (ဥပမာ- icon ခလုတ်ငယ်များ) ၏ လုပ်ဆောင်ချက်များကို screen readers များဖတ်ပြနိုင်စေရန် သတ်မှတ်ပေးသည့် aria-label attributes များ ဖြစ်ကြပါသည်။",
    whyImportant: "icons သက်သက်သာပါသော interactive widgets များအား computer text-to-speech reader apps များမှ ဖတ်သည့်အခါ မည်သည့်ခလုတ်ဖြစ်ကြောင်း ညွှန်ကြားချက် ရှင်းလင်းစွာ ဖတ်ပြပေးနိုင်ရန် ARIA core system သည် မရှိမဖြစ် လိုအပ်ပါသည်။",
    realWorldUsage: "ဝဘ်ဆိုက်ထိပ်ရှိ 'အိမ်ပုံသဏ္ဌာန်' icon လေးကို screen reader ဆော့ဖ်ဝဲလ်မှ ဖတ်ကြားချိန်တွင် 'Home Screen Button' ဟု aria-label အတိုင်း ရှင်းလင်းစွာ အသံထွက်ဖတ်ပြခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<button aria-label="Search Web Site">🔍</button>
<img src="avatar.png" alt="Aung Ko, CEO profile photo">`,
    examples: [
      `<!-- Accessible social media links -->\n<a href="#" aria-label="Visit our Official Facebook Page">FB</a>`
    ],
    commonMistakes: [
      {
        mistake: "<button aria-label='Search'>🔍 Search</button> (visual text ရော label ရော redundant အတူတူ ထည့်သွင်းခြင်း)",
        correction: "<button aria-label='Search Site'>🔍</button> သို့မဟုတ် label မပါဘဲ 🔍 Search သက်သက်သာ ရေးပါ။",
        explanation: "ခလုတ်အတွင်း စာသား 'Search' ပါဝင်ပြီးသား ဖြစ်ပါက aria-label ထပ်ရေးရန် မလိုပါ။ Screen readers မှ 'Search Search' ဟု နှစ်ခါထပ်ခါ ဖတ်ကြားသဖြင့် visual redundancy error ဖြစ်စေတတ်သည်။"
      }
    ],
    bestPractices: [
      "icon widgets elements buttons များနှင့် abstract charts visual metrics တွေမှာ aria-label attribute control ကို အမြဲထည့်ပါ။",
      "decorative graphic templates outlines တွေမှာ alt='' text အား attributes properties rules အလိုက် null system ထားရှိပေးပါ။"
    ],
    miniExercise: {
      id: "ex-html-51",
      instruction: "button inline block attribute parameter 'Play Music' ဖြစ်သော aria-label elements သတ်မှတ်ပါ။",
      codeTemplate: "<button aria-label=\"Play Music\">▶</button>",
      expectedOutput: "<button aria-label=\"Play Music\">▶</button>",
      hints: ["button tag variables parameters configuration metrics scope တွင် aria-label='Play Music' ကို ရေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-51",
        question: "visual စာသား လုံးဝ မပါဝင်ဘဲ interactive graphics (icons, shapes) သက်သက်သာ သုံးထားသော components များတွင် Screen Reader ညွှန်ကြားချက် သတ်မှတ်ရန် မည်သည့် attribute ကို သုံးရမည်နည်း။",
        options: [
          "alt-text",
          "aria-label",
          "role",
          "description"
        ],
        correctOptionIndex: 1,
        explanation: "aria-label attribute သည် text label visible မရှိသော component visual metrics element tags များကို dynamic a11y accessibility engine guides text ပေးသည်။"
      }
    ],
    miniProject: {
      title: "Audio Controller Widget",
      description: "a11y standards elements parameters metrics test အောင်မြင်သော icon panel တစ်ခု ဆောက်ပါ။",
      guide: ["icon keys tags list wrapper area elements layout visual controllers aria-labels configurations နှင့် ဆောက်ပါ။"],
      startingCode: "<div class=\"music-controls\">\n  <button aria-label=\"Previous Song\">⏮</button>\n  <button aria-label=\"Play Ambient Audio\">▶</button>\n  <button aria-label=\"Next Song\">⏭</button>\n</div>"
    },
    learningObjectives: {
      what: "alt, ARIA, aria-label, attributes usage scenarios, Screen Readers logic, accessibility elements spec ကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက် interactive tools panels interfaces များကို visually-impaired users အားလုံး လွယ်ကူစွာ သုံးနိုင်စေရန်။",
      when: "visual navigation buttons, icon nodes panels, responsive charts layouts ရေးဆွဲတိုင်း သုံးသည်။",
      how: "interactive controls values selectors parameters meta tags scope standard ဖြင့် aria-label ထည့်သွင်းခြင်း။"
    },
    myanmarExplanation: "alt attributes & ARIA specifications specifications guidelines သည် semantic layout configurations parameters nodes elements are mapping screen reading systems guides layers ပေးသည်။",
    theory: "W3C Accessible Rich Internet Applications (WAI-ARIA) standard outlines specs controllers tags parameters attributes သည် elements tags accessibility layers features mapping indexes analysis coordinate ပြုလုပ်ပေးသည်။",
    englishKeywords: ["aria label", "alt attribute", "WAI-ARIA standards", "accessibility metadata", "icon accessibility"],
    stepByStepExplanation: [
      "graphic labels nodes button elements visual controls templates တွင် aria-label tags parameters ထည့်ပါ။",
      "images graphic nodes element tags layout parameters settings options တွင် alt configurations metrics ရေးပါ။"
    ],
    outputPreview: "Screen Readers မျက်နှာပြင်ဖတ်စနစ်များမှ စနစ်တကျ အသံထွက် ဖတ်ပြနိုင်မည့် accessible tools widgets panel ဆောက်လုပ်ပြီးဖြစ်သည်။",
    tips: ["aria-label tags values ရေးသားရာတွင် interactive action commands verbs (ဥပမာ- Edit, Close, Play, Delete) များကို highlight သုံးပါ။"],
    assignment: {
      title: "Social Portal Accessibility Framework",
      description: "Social header links accessibility parameters configurations setup HTML ရေးဆွဲပါ။",
      instructions: ["Icons social link elements tags widgets panels aria-labels specifications code tags layouts ရေးသားပြပါ။"]
    },
    lessonSummary: "Alt values and aria-label attributes properties settings configurations controls templates tags များသည် UI widgets များနှင့် images များကို accessibility စံနှုန်းအပြည့်အဝ ကိုက်ညီအောင် ပြောင်းလဲဖန်တီးပေးသည်။",
    nextLesson: "Semantic Layout Accessibility"
  },
  {
    id: "html-52",
    title: "Semantic Layout Accessibility",
    slug: "html-semantic-layout-accessibility",
    duration: "20 mins",
    whatIsIt: "Semantic Layout Accessibility ဆိုသည်မှာ ဝဘ်ဆိုက်၏ visual blocks patterns (header, nav, main, section, footer) layout hierarchy များအား a11y စံနှုန်းများနှင့် ကိုက်ညီအောင် semantic tags structures များကို system layouts specs ပေါင်းစပ်ရေးဆွဲခြင်း ဖြစ်ပါသည်။",
    whyImportant: "visual users များသည် layout မျက်စိဖြင့် အပိုင်းခွဲမြင်ရသော်လည်း မျက်မမြင် a11y users များသည် documents blocks tags semantic guides lines tree outlines maps ကို အခြေခံပြီး screen reader shortcuts keys ဖြင့် navigation shortcuts jumps ပြုလုပ်နိုင်သောကြောင့် layout semantic setup သည် အလွန်အရေးကြီးပါသည်။",
    realWorldUsage: "A11y validator filters checking views frameworks layouts tests configurations များကို professional design agencies တွေမှာ မဖြစ်မနေ codes parameters optimization လုပ်ဆောင်ခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<main id="main-content" tabindex="-1">
  <!-- Core unique context landmarks -->
</main>`,
    examples: [
      `<!-- Skip link logic layout sample -->\n<a href="#main-content" class="skip-link">Skip to main content</a>`
    ],
    commonMistakes: [
      {
        mistake: "tab index values numbers flow configuration errors types order logic rules skipped keys values controls.",
        correction: "standard keyboard interactions outline dynamic sequence elements tabs layouts metrics prioritize.",
        explanation: "tab indexes loops logic validation configurations attributes layout outline mappings standards values properties coordinate options error patterns skips."
      }
    ],
    bestPractices: [
      "landmark web structures panels header, footer, sidebars, main content outlines elements semantic parameters tags သုံးပါ။",
      "documents dynamic outlines interactive nodes lists lists tabindex options standards properties ညှိနှိုင်းပါ။"
    ],
    miniExercise: {
      id: "ex-html-52",
      instruction: "semantic landmarks elements tags code logic blocks components parameters options templates ဆောက်လုပ်ပါ။",
      codeTemplate: "<main id=\"core-content\">\n  <h2>Content</h2>\n</main>",
      expectedOutput: "<main id=\"core-content\">\n  <h2>Content</h2>\n</main>",
      hints: ["<main> core elements structural tags scope template parameters update ရေးဆွဲပါ။"]
    },
    quiz: [
      {
        id: "q-html-52",
        question: "Keyboard သုံးစွဲသူများ ဝဘ်ဆိုက် header navigation links များကို ကျော်ခွပြီး main content ဆီသို့ ချက်ချင်းခုန်ကူးနိုင်ရန် ဆောက်လုပ်လေ့ရှိသော a11y component မှာ မည်သည်နည်း။",
        options: [
          "Skip Link",
          "Jump Tag",
          "Fast Track",
          "Direct Menu"
        ],
        correctOptionIndex: 0,
        explanation: "Skip Link (Skip to main content) သည် keyboard a11y links interaction elements setups tags options တစ်ခု ဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "Sitemap Landmark",
      description: "Screen readers mappings checks tests configurations views landmarks frame layout ဆောက်ပါ။",
      guide: ["landmark elements dynamic scope structural navigation sections outlines nested configuration ရေးဆွဲပါ။"],
      startingCode: "<header>\n  <nav aria-label=\"Primary Navigation\">\n    <a href=\"#\">Home</a>\n  </nav>\n</header>\n<main id=\"main-content\">\n  <h2>Core Hub</h2>\n</main>"
    },
    learningObjectives: {
      what: "Landmarks, Skip links, keyboard tab index sequences flows, layout accessibility specs rules ကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက် system frameworks outlines accessibility trees data structure flows optimal optimization တက်စေရန်။",
      when: "homepage framework profiles design architecture, global layout structural frames စတင်ရေးဆွဲတိုင်း သုံးသည်။",
      how: "W3C landmarks mappings specifications attributes tags rules template options values configuration ရေးဆွဲခြင်း။"
    },
    myanmarExplanation: "Semantic layout system standard layout formatting outline indexes သည် custom screen read structures devices layout interaction guides ပေးသော navigation landmarks nodes mappings layers ဖြစ်သည်။",
    theory: "W3C Document outlines mappings system constraints model specifications controllers layouts attributes သည် design mapping trees structural landmarks parsing scopes parameters update coordinate ပြုလုပ်ပေးသည်။",
    englishKeywords: ["semantic accessibility", "layout landmarks", "tabindex attributes", "skip links", "accessibility trees"],
    stepByStepExplanation: [
      "primary structural outlines semantic tags configurations logic controls layout tags block စတင်ပါ။",
      "skip to main sections visual navigation shortcuts links buttons metadata tags scope templates ထည့်ပါ။"
    ],
    outputPreview: "Keyboard interaction logic visual tests tests outlines frameworks landmark mappings ပြီးပြည့်စုံစွာ ပါဝင်သော layouts တွေ့ရမည်။",
    tips: ["tabindex='0' attribute ကို သုံးစွဲပြီး non-interactive graphic elements များအား keyboard focus scope nodes interaction indicators အဖြစ် visual parameters values ညှိနိုင်သည်။"],
    assignment: {
      title: "Advanced Inclusive Core Grid Layout",
      description: "Accessibility checking grid landmark systems framework components code setup HTML ရေးဆွဲပါ။",
      instructions: ["Skip to content link, structural nav lists, main content sections tabindex features structural HTML panels စမ်းသပ်ပြပါ။"]
    },
    lessonSummary: "Semantic layouts landmark frameworks models techniques guides parameters are formatting accessible web structures guidelines optimal options တည်ဆောက်ပေးသည်။",
    nextLesson: "Clean Code & Indentation"
  },
  {
    id: "html-53",
    title: "Clean Code & Indentation",
    slug: "html-clean-code-indentation",
    duration: "20 mins",
    whatIsIt: "Clean Code & Indentation ဆိုသည်မှာ HTML tags ရေးသားရာတွင် စာကြောင်းချပ်များ၊ ဘယ်ဘက်မှ ကွက်လပ်ချန်ခြင်းများ (Indentation - 2 spaces သို့မဟုတ် 4 spaces) ကို စနစ်တကျ အထက်အောက် ဘယ်ညာ ညီညာစွာ စီစဉ်ရေးသားခြင်း ဖြစ်ပါသည်။",
    whyImportant: "ကုဒ်များကို တစ်ဦးတည်းမဟုတ်ဘဲ အဖွဲ့အစည်းနှင့် လုပ်ဆောင်သည့်အခါ အလွယ်တကူဖတ်ရှုပြင်ဆင်နိုင်စေရန်နှင့် tags ပိတ်/ဖွင့် မှားယွင်းမှုများကို အမှားရှာဖွေရလွယ်ကူစေရန် (Debugging ease) မရှိမဖြစ်လိုအပ်ပါသည်။",
    realWorldUsage: "ကမ္ဘာကျော် software ကုမ္ပဏီများတွင် developer တိုင်းသည် ကုဒ်များကို prettier formatter tools စံနှုန်းများနှင့်အညီ သပ်သပ်ရပ်ရပ် ရေးသားကြခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<!-- ✅ GOOD INDENTATION (2 spaces) -->
<div>
  <p>Hello World</p>
</div>`,
    examples: [
      `<!-- Nesting standard layout alignment sample -->\n<ul>\n  <li>Apple</li>\n</ul>`
    ],
    commonMistakes: [
      {
        mistake: "<div>\n<p>Hello\n</p> (ကွက်လပ်ချန်ခြင်း မညီမညာ ရေးသားခြင်း)",
        correction: "<div>\n  <p>Hello</p>\n</div>",
        explanation: "Indentation မရှိဘဲ ကုဒ်များကို တစ်ဖြောင့်တည်း ရေးသားပါက tags များ မည်သည့်နေရာတွင် ပိတ်ဖွင့်သည်ကို ခွဲခြားရခက်ခဲပြီး ကုဒ်ပြင်ဆင်ရန် အလွန်ပင်ပန်းစေသည်။"
      }
    ],
    bestPractices: [
      "အဆင့်ဆင့် (Nesting) ဝင်သွားတိုင်း Space ၂ ကွက် သို့မဟုတ် ၄ ကွက် (Tab ၁ ခု) စနစ်တကျ ပုံမှန် ခြားရေးပါ။",
      "ကုဒ်များကို ရှင်းလင်းစွာ formatting ဆွဲရန် Visual Studio Code plugin Prettier သုံးစွဲပါ။"
    ],
    miniExercise: {
      id: "ex-html-53",
      instruction: "ul နှင့် li nested structures standard indentation ဖြင့် သေသပ်စွာ နေရာချ ရေးဆွဲပါ။",
      codeTemplate: "<ul>\n  <li>Clean Code</li>\n</ul>",
      expectedOutput: "<ul>\n  <li>Clean Code</li>\n</ul>",
      hints: ["ul tags line block အောက်တွင် li alignment spaces settings values constraints ညှိပါ။"]
    },
    quiz: [
      {
        id: "q-html-53",
        question: "HTML တွင် ကုဒ်များ ဖတ်ရလွယ်ကူစေရန် lines spaces, blocks levels indentation nesting guides system specifications စံနှုန်းမှာ မည်သည်နည်း။",
        options: [
          "2 Spaces သို့မဟုတ် Tab 1 ခု",
          "10 Spaces",
          "Space လုံးဝမခြားရပါ",
          "Semicolons ခြားခြင်း"
        ],
        correctOptionIndex: 0,
        explanation: "indentation alignments metrics default variables guidelines standard setups options parameters တွင် 2 spaces သို့မဟုတ် 4 spaces Tab structure configuration သုံးစွဲသည်။"
      }
    ],
    miniProject: {
      title: "Syllabus Formatter",
      description: "Clean code indentation guides code logic frameworks visual tests metrics outlines template ဆောက်ပါ။",
      guide: ["nesting tag parameters specifications alignment controls များကို formatting ပြုလုပ်ပါ။"],
      startingCode: "<div>\n  <h2>Course outline</h2>\n  <ul>\n    <li>Clean html</li>\n  </ul>\n</div>"
    },
    learningObjectives: {
      what: "Indentation logic, nestings codes, line wraps controls, clean code guidelines parameters update ကို လေ့လာရန်။",
      why: "ကုဒ်ရေးသားမှုစွမ်းရည်ကို ပရော်ဖက်ရှင်နယ်အဆင့်သို့ မြှင့်တင်ရန်နှင့် coding errors ရာခိုင်နှုန်း လျှော့ချရန်။",
      when: "ဝဘ်ဆိုက် ကုဒ်ဖိုင်များ စတင်ရေးသားချိန်မှစ၍ နေ့စဉ် တစ်သက်လုံး coding ပြုလုပ်တိုင်း သုံးသည်။",
      how: "nested tags elements features layouts indentation structures formats standard controls logic နှင့်အညီ ရေးသားခြင်း။"
    },
    myanmarExplanation: "Clean code alignments formatting layouts rules guidelines သည် standard web layouts codes patterns updates and bug checking views configurations ကို အလွန်လွယ်ကူစေသည်။",
    theory: "W3C Coding Styles standards formatting guidelines specs configurations properties types rules elements mapping codes formatting parameters coordinates optimize rules is essential.",
    englishKeywords: ["clean code", "code indentation", "prettier formatting", "readable markup", "developer standards"],
    stepByStepExplanation: [
      "parent block containers scope tag tags line formats ကို body tags visual areas တွင် စတင်ရေးပါ။",
      "children variables elements tags indentation tab positions settings settings specs guides layouts ခြားပါ။"
    ],
    outputPreview: "သေသပ်သန့်ရှင်းပြီး ဖတ်ရှုရအလွန်လွယ်ကူသော ကုဒ်ပုံစံစနစ် တွေ့ရမည်။",
    tips: ["Prettier automatic document formatting tool configurations shortcuts Alt+Shift+F key bindings သုံး၍ automatic tidy လုပ်ဆောင်နိုင်သည်။"],
    assignment: {
      title: "Code Formatting Clean Up",
      description: "Indentation ချွတ်ယွင်းနေသော html code block တစ်ခုအား စနစ်တကျ formatting ပြန်ပြင်ပါ။",
      instructions: ["Nesting errors codes formatting structures aligns templates codes formats layout system configurations parameters update ပြုလုပ်ပြပါ။"]
    },
    lessonSummary: "Clean code indentation standards rules guidelines များသည် ကုဒ်များဖတ်ရလွယ်ကူပြီး debugging templates error tracking optimization updates workflow ကို မြန်ဆန်ပျော့ပျောင်းစေသည်။",
    nextLesson: "Validation of HTML"
  },
  {
    id: "html-54",
    title: "Validation of HTML",
    slug: "html-validation",
    duration: "20 mins",
    whatIsIt: "Validation of HTML ဆိုသည်မှာ မိမိရေးသားထားသော HTML codes Markup များသည် ကမ္ဘာ့ဝဘ်စံနှုန်းသတ်မှတ်ရေးအဖွဲ့ (W3C - World Wide Web Consortium) ၏ စံချိန်စံညွှန်း စည်းကမ်းချက်များနှင့် ကိုက်ညီမှု ရှိမရှိကို error validator tools များဖြင့် စစ်ဆေးခြင်း ဖြစ်ပါသည်။",
    whyImportant: "ကုဒ်များတွင် syntax errors များ၊ tags ပိတ်ရန် မေ့ကျန်ခဲ့ခြင်းများ သို့မဟုတ် မကိုက်ညီသော elements nested rules types များ ပါဝင်နေပါက browser အသစ်များတွင် visual designs ပျက်စီးနိုင်သဖြင့် validation စစ်ဆေးခြင်းသည် အလွန်အရေးကြီးပါသည်။",
    realWorldUsage: "ဝဘ်ဆိုက်များ တရားဝင် deploy မလုပ်မီ W3C Official HTML Markup Validator filter checking tools တွင် error test filters templates updates configurations လုပ်ဆောင်ခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<!-- W3C official checks tools reference validation link -->
<!-- https://validator.w3.org -->`,
    examples: [
      `<!-- Valid HTML5 minimal document standard structure -->\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Valid</title>\n</head>\n<body></body>\n</html>`
    ],
    commonMistakes: [
      {
        mistake: "<ul><p>Paragraph inside ul</p></ul> (ul အတွင်း p တိုက်ရိုက် ထည့်သွင်းခြင်း)",
        correction: "<ul><li>Paragraph inside ul</li></ul>",
        explanation: "ul elements nested specification standard validation rules formats tags patterns elements check options links elements tags skip errors."
      }
    ],
    bestPractices: [
      "W3C Validator tools (validator.w3.org) links files checks controls tests များကို dynamic deploy rules templates အဖြစ် အမြဲစမ်းသပ်ပါ။",
      "invalid code warning indicators alerts warnings fixes coordinate loops logic mappings optimize update ပြုလုပ်ပါ။"
    ],
    miniExercise: {
      id: "ex-html-54",
      instruction: "valid dynamic markup structure elements blocks templates config setup options parameters ရေးဆွဲပါ။",
      codeTemplate: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Valid Title</title>\n</head>\n<body>\n  <p>Test</p>\n</body>\n</html>",
      expectedOutput: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Valid Title</title>\n</head>\n<body>\n  <p>Test</p>\n</body>\n</html>",
      hints: ["valid parameters node update structures code elements ရေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-54",
        question: "HTML ကုဒ်များ၏ စံစနစ်ကို တရားဝင် စစ်ဆေးပေးသော ကမ္ဘာ့ဝဘ်စံနှုန်းသတ်မှတ်ရေးအဖွဲ့ကြီး၏ အမည်မှာ မည်သည်နည်း။",
        options: [
          "W3C",
          "WHATWG",
          "IEEE",
          "IETF"
        ],
        correctOptionIndex: 0,
        explanation: "W3C (World Wide Web Consortium) သည် web standard validations specifications tools and formats rules controls templates အဖွဲ့ကြီး ဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "W3C Standard Compliance Document",
      description: "Validation check testing options indicators standards frames outlines layouts template ဆောက်ပါ။",
      guide: ["syntax standards elements HTML5 parameters document setup structures codes templates formatting ညှိနှိုင်းပါ။"],
      startingCode: "<!DOCTYPE html>\n<html lang=\"my\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Compliance study</title>\n</head>\n<body>\n  <h1>Compliance Test</h1>\n</body>\n</html>"
    },
    learningObjectives: {
      what: "W3C core guidelines, Constraint checker engines, warnings codes solutions, standard compliant outline profiles update ကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက် ကုဒ်များအားလုံး အမှားကင်းပြီး browser devices အားလုံးတွင် တစ်ပြေးညီ အလုပ်လုပ်နိုင်စေရန်။",
      when: "ဝဘ်ဆိုက် စာမျက်နှာများ ရေးဆွဲပြီးစီးပြီး live production platforms များပေါ်သို့ တင်ခါနီးတိုင်း သုံးသည်။",
      how: "Official validators interfaces parameters dynamic links file test setups guidelines rules များနှင့်အညီ testing templates စမ်းသပ်ခြင်း။"
    },
    myanmarExplanation: "Validation of HTML သည် browser render algorithms levels တွင် code parsing errors parsing triggers ကို pre-checks algorithms indicators ဖြင့် design layouts stability errors ကို optimize profiles update လုပ်ဆောင်ပေးသည်။",
    theory: "W3C Markup Validation Service specification coordinates is dynamic codes standards parsing systems logic coordinates models components tags checks controls templates types parameters update guidelines.",
    englishKeywords: ["W3C validator", "HTML validation", "compliant code", "standard compliance", "document parsing"],
    stepByStepExplanation: [
      "html code standard setups tag tags parameters body formats files contents references ရေးဆွဲပါ။",
      "W3C tools checking visual areas scopes validators results checks profiles fix warnings nodes parameters values config ညှိပါ။"
    ],
    outputPreview: "errors results warnings '0 errors found' visual checks templates စံစနစ်ပြည့်စုံသော html layouts တွေ့ရမည်။",
    tips: ["HTML validation results alerts lines error messages lines guides numbers levels fixes ကို direct IDE code panels တွင် visual hints patterns ဖြင့်လည်း visual warnings alerts ရနိုင်သည်။"],
    assignment: {
      title: "Broken Code Audit",
      description: "broken markup tags code lines layouts formats systems formatting ပြန်လည်စစ်ဆေးပါ။",
      instructions: ["tags nesting nested levels lines error warning structures codes alignments formatting codes profiles update ပြုလုပ်ပြပါ။"]
    },
    lessonSummary: "W3C Validation tests controls systems and guidelines metrics options attributes parameters များသည် web pages structural codes logic codes error errors checks layouts optimal options coordinates ပေးသည်။",
    nextLesson: "Browser Compatibility"
  },
  {
    id: "html-55",
    title: "Browser Compatibility",
    slug: "html-browser-compatibility",
    duration: "20 mins",
    whatIsIt: "Browser Compatibility ဆိုသည်မှာ မိမိရေးသားလိုက်သော HTML tags များနှင့် dynamic media elements များသည် ကမ္ဘာပေါ်ရှိ မတူညီသော browsers အမျိုးမျိုး (Chrome, Safari, Firefox, Edge) အားလုံးတွင် visual display and interactions ပုံစံတူညီစွာ ကောင်းမွန်ချောမွေ့စွာ အလုပ်လုပ်နိုင်ရန် ပြင်ဆင်ရေးသားခြင်း ဖြစ်ပါသည်။",
    whyImportant: "အသုံးပြုသူတစ်ဦးသည် Chrome ကို သုံးပြီး အခြားတစ်ဦးသည် iPhone custom Safari browser ကို သုံးစွဲနိုင်သဖြင့် browsers algorithms rendering ကွာခြားချက်များကြောင့် ဒီဇိုင်းများ ပျက်ယွင်းမသွားစေရန် စံသတ်မှတ်ချက် codes များ ရေးဆွဲရန် အလွန်အရေးကြီးပါသည်။",
    realWorldUsage: "Netflix-like media streaming app layout views သို့မဟုတ် complex forms validation scripts systems are devices layouts browser engines compatibility logic structures updates parameters configurations.",
    syntax: `<!-- Standard HTML5 tags are backward compatible by default design patterns -->
<video controls>
  <source src="video.mp4" type="video/mp4">
</video>`,
    examples: [
      `<!-- Fallback text structures compatibility layout sample -->\n<canvas>Browser does not support canvas element</canvas>`
    ],
    commonMistakes: [
      {
        mistake: "HTML5 dynamic elements (video, audio, canvas) attributes tags functions custom variables without fallback links texts skips.",
        correction: "fallback alerts text layout system constraints parameters settings indicators templates updates incorporate.",
        explanation: "browser engines old versions support types rules components tags validation coordinates options skip errors browser errors patterns."
      }
    ],
    bestPractices: [
      "elements properties specifications checks (caniuse.com) parameters links checking controls tests များကို development frameworks logic တွင် အမြဲစမ်းသပ်ပါ။",
      "backward compatible formatting structures elements profiles frameworks templates updates coordinates updates options configurations ရေးဆွဲပါ။"
    ],
    miniExercise: {
      id: "ex-html-55",
      instruction: "compatibility standard fallback layout element templates metrics parameters structures codes templates formatting updates ညှိနှိုင်းပါ။",
      codeTemplate: "<canvas>Your browser does not support canvas</canvas>",
      expectedOutput: "<canvas>Your browser does not support canvas</canvas>",
      hints: ["fallback specifications tag text updates parameters scope values write ရေးဆွဲပါ။"]
    },
    quiz: [
      {
        id: "q-html-55",
        question: "ဝဘ်ဆိုက်တစ်ခုတွင် အသုံးပြုမည့် HTML tags များနှင့် CSS rules များသည် မည်သည့် Browsers များတွင် အလုပ်လုပ်နိုင်ကြောင်း အသေးစိတ် စစ်ဆေးနိုင်သည့် ကမ္ဘာကျော် ဝဘ်ဆိုက်အမည်မှာ မည်သည်နည်း။",
        options: [
          "Can I Use",
          "W3Schools",
          "StackOverflow",
          "GitHub"
        ],
        correctOptionIndex: 0,
        explanation: "Can I Use (caniuse.com) သည် browsers engine tags features elements levels compatibility data directories lists စနစ်ကြီး ဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "Universal Media Box",
      description: "cross-browser dynamic multimedia formats parameters formats tests outlines layouts template ဆောက်ပါ။",
      guide: ["fallback content variables tags multi-format code templates formatting ညှိနှိုင်းပါ။"],
      startingCode: "<audio controls>\n  <source src=\"audio.ogg\" type=\"audio/ogg\">\n  <source src=\"audio.mp3\" type=\"audio/mpeg\">\n  Your browser does not support audio.\n</audio>"
    },
    learningObjectives: {
      what: "caniuse tools data, fallback engines structure, browser rendering engine differences (Blink, WebKit, Gecko) updates ကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက်အား မည်သည့် စက်ပစ္စည်း၊ မည်သည့် ဘရောက်ဆာအမျိုးအစားဖြင့် ကြည့်ရှုသည်ဖြစ်စေ စံချိန်စံညွှန်းကိုက်ညီစွာ ပြသနိုင်စေရန်။",
      when: "multimedia features logic components dynamic interactive templates, canvas grids, HTML5 API elements ရေးဆွဲတိုင်း သုံးသည်။",
      how: "multi-source fallback layouts specifications parameters metadata options codes standards guidelines rules နှင့်အညီ ရေးသားခြင်း။"
    },
    myanmarExplanation: "Browser Compatibility coding rules are formatting layouts guides indicators သည် cross-browsers tests outlines setups metrics validations controls, custom display errors patterns variables optimal updates options configurations ပေးသည်။",
    theory: "HTML5 Multimedia dynamic outlines specification coordinates coordinates models components validation compatibility engine parsing levels profiles settings coordinate links parameters update.",
    englishKeywords: ["browser compatibility", "caniuse database", "rendering engine", "fallback content", "cross browser test"],
    stepByStepExplanation: [
      "compatibility outlines standard fallback tags templates formats body variables ရေးဆွဲပါ။",
      "caniuse check tools links scopes checks fix variables formats update values config ညှိပါ။"
    ],
    outputPreview: "browsers browsers engines support 'fallback checks' models updates frameworks compliant layouts တွေ့ရမည်။",
    tips: ["multi-source elements tags scope audio and video tags parameters value configurations values type metadata specify updates အမြဲလုပ်ပါ။"],
    assignment: {
      title: "Cross-Browser Video Embed Setup",
      description: "multi-browser standard supports HTML5 video outline configs setups html ရေးဆွဲပါ။",
      instructions: ["Multiple sources codes parameters configs tags formats, webm, mp4 layout system parameters controls patterns ရေးဆွဲပြပါ။"]
    },
    lessonSummary: "Browser compatibility rules coordinate browser tests outlines variables and guides levels parameters codes layouts configurations optimal options coordinates တည်ဆောက်ပေးသည်။",
    nextLesson: "Responsive Meta Viewport"
  },
  {
    id: "html-56",
    title: "Responsive Meta Viewport",
    slug: "html-responsive-meta-viewport",
    duration: "20 mins",
    whatIsIt: "Responsive Meta Viewport ဆိုသည်မှာ မိုဘိုင်းဖုန်းစခရင်များတွင် ဝဘ်ဆိုက်စာမျက်နှာများ အလိုအလျောက် သင့်လျော်သော အရွယ်အစားသို့ ကျုံ့နိုင်၊ ချဲ့နိုင်ရန် (Responsive layout scaling) head tag အတွင်း၌ မဖြစ်မနေ ထည့်သွင်းရသည့် viewport settings meta tag ဖြစ်ပါသည်။",
    whyImportant: "ဤ viewport meta tag မပါဝင်ပါက မိုဘိုင်းဖုန်းပေါ်တွင် ဝဘ်ဆိုက်သည် desktop layout အတိုင်း စာလုံးအလွန်သေးငယ်စွာ ပေါ်လာပြီး ဖတ်ရခက်ခဲကာ zoom ဆွဲကြည့်နေရသဖြင့် mobile usability, SEO scoring ကို ဆိုးရွားစွာ ကျဆင်းစေတတ်သည်။",
    realWorldUsage: "မိုဘိုင်းဖုန်းဖြင့် ဝဘ်ဆိုက်တစ်ခုအား ကြည့်ရှုလိုက်ချိန်တွင် စခရင်ဘောင်အလျားအတိုင်း စာသားများနှင့် ပုံများ သေသပ်လှပစွာ auto-adjust ညှိပြီး ပေါ်လာခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    examples: [
      `<!-- Standard viewport parameters configuration sample -->\n<meta name="viewport" content="width=device-width, initial-scale=1.0">`
    ],
    commonMistakes: [
      {
        mistake: "viewport tag rules missing on mobile pages configuration and trying to fix layout with css width manual keys value limits.",
        correction: "<meta name='viewport' content='width=device-width, initial-scale=1.0'>",
        explanation: "viewport tags constraints missing parameters types values guides templates elements outline options mappings standards variables skip errors browser scaling errors patterns."
      }
    ],
    bestPractices: [
      "HTML5 framework template setup index files configuration head meta variables တွင် ဤ viewport tag အား အမြဲထည့်သွင်းပါ။",
      "user zoom controls constraints attributes options (user-scalable=no) specifications properties levels updates ကို လိုအပ်မှသာ သုံးစွဲပါ။"
    ],
    miniExercise: {
      id: "ex-html-56",
      instruction: "viewport scale parameters options standard template code elements properties format update ရေးဆွဲပါ။",
      codeTemplate: "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
      expectedOutput: "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
      hints: ["viewport meta tag logic parameters values config write ရေးဆွဲပါ။"]
    },
    quiz: [
      {
        id: "q-html-56",
        question: "မိုဘိုင်းဖုန်းစခရင်များတွင် ဝဘ်ဆိုက်၏ visual grid scaling ကို အလိုအလျောက် device scope အတိုင်း dynamic configurations meta tag မှာ မည်သည်နည်း။",
        options: [
          '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
          '<meta name="responsive" content="true">',
          '<meta name="mobile-device" content="all">',
          '<meta name="scale-layout" content="default">'
        ],
        correctOptionIndex: 0,
        explanation: "viewport metadata parameters device-width settings configurations dynamic options rules is essential on mobile layouts."
      }
    ],
    miniProject: {
      title: "Mobile Friendly Shell",
      description: "mobile layout checks configuration validation setups frameworks metadata template ဆောက်ပါ။",
      guide: ["head element nested responsive tags viewport templates formats layout codes setups ညှိနှိုင်းပါ။"],
      startingCode: "<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Mobile study</title>\n</head>"
    },
    learningObjectives: {
      what: "viewport metadata variables, width scale options, initial-scale attributes, devices pixels density dynamic logic updates ကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက်အား စမတ်ဖုန်းများတွင် ဇူးမ်ဆွဲရန်မလိုဘဲ အဆင့်မြင့် မိုဘိုင်းဒီဇိုင်း (Mobile First Design) ဖြင့် ချောမွေ့စွာ ပြသရန်။",
      when: "ဝဘ်ဆိုက်တစ်ခုလုံး၏ global templates html structures index configurations ရေးဆွဲတိုင်း သုံးသည်။",
      how: "head settings values တွင် device parameters metadata rules logic tags option values configurations ရေးဆွဲခြင်း။"
    },
    myanmarExplanation: "Responsive meta viewport system standard outlines configs templates guides indicators is mobile displays rules setups configurations checks variables options updates configurations တည်ဆောက်ပေးသည်။",
    theory: "HTML5 Outlining meta metadata viewport layouts specifications is standard parameters web design logic rendering engine viewport bounds initialization maps updates coordinates.",
    englishKeywords: ["viewport tag", "responsive layouts", "mobile viewport scale", "responsive viewport config", "mobile first viewport"],
    stepByStepExplanation: [
      "global templates code layouts meta tag formats headers metrics configuration tags block စတင်ပါ။",
      "viewport details content values parameters specifications guides options configuration alignments ခြားပါ။"
    ],
    outputPreview: "mobile browsers visual scaling optimized views compliant outlines ပြီးပြည့်စုံသော html layouts တွေ့ရမည်။",
    tips: ["initial-scale=1.0 scale setting values coordinates dynamic viewport controls mobile standard responsive layouts options parameters update ပေးသည်။"],
    assignment: {
      title: "Universal Mobile Adaptive Scaffold Setup",
      description: "Mobile tests responsive outlines designs setup config html ရေးဆွဲပါ။",
      instructions: ["Head components metadata labels viewport, responsive scale tags standard HTML outline controls codes ရေးဆွဲပြပါ။"]
    },
    lessonSummary: "Responsive meta viewport parameters standard systems checks configurations attributes codes layouts optimal options coordinates updates guides တည်ဆောက်ပေးသည်။",
    nextLesson: "Comments & Documentation"
  },
  {
    id: "html-57",
    title: "Comments & Documentation",
    slug: "html-comments-documentation",
    duration: "15 mins",
    whatIsIt: "Comments & Documentation ဆိုသည်မှာ HTML ကုဒ်များအတွင်း visual browser screens ပေါ်တွင် လုံးဝ မပြသဘဲ၊ coding team developer အချင်းချင်း ကုဒ်များ မည်သို့ အလုပ်လုပ်ကြောင်း ရှင်းပြမှတ်သားရန် ရေးသားခဲ့သော မှတ်စု (Comments - <!-- -->) နှင့် စံစနစ်တကျ ကုဒ်မှတ်တမ်း (Documentation) ပြုစုခြင်း ဖြစ်ပါသည်။",
    whyImportant: "လအနည်းငယ်ကြာပြီးနောက် သို့မဟုတ် အခြား developer တစ်ဦးမှ သင့်ကုဒ်များကို လာရောက်ဖတ်ရှုပြင်ဆင်သည့်အခါ မည်သည့် section သည် မည်သည့်အတွက် ဖြစ်ကြောင်း ချက်ချင်း လွယ်ကူလျင်မြန်စွာ နားလည်သဘောပေါက်စေရန် အထူးလိုအပ်ပါသည်။",
    realWorldUsage: "ကုမ္ပဏီ ကုဒ်တိုက်များတွင် blocks ကြီးများအစရှိသော sections outlines frameworks scripts references comments sections tags setups updates configurations များကို ရေးသားခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<!-- ဤနေရာသည် Navbar အပိုင်း ဖြစ်သည် -->
<nav>
  <!-- Link elements -->
</nav>`,
    examples: [
      `<!-- Main content area starts here -->\n<main>\n</main>`
    ],
    commonMistakes: [
      {
        mistake: "// ဤသည်မှာ html comment ဖြစ်သည် ဟူ၍ text types codes tags ရေးဆွဲခြင်း။",
        correction: "<!-- ဤသည်မှာ html comment ဖြစ်သည် -->",
        explanation: "HTML comments format validation standard code rules systems rules is different from JS format. အမြဲတမ်း <!-- --> indicators scope parameter codes parameters values check lines tags skips."
      }
    ],
    bestPractices: [
      "အဓိက visual blocks start နေရာနှင့် end နေရာများတွင် descriptive codes blocks outlines comments patterns layouts အမြဲသုံးပါ။",
      "မလိုအပ်သော codes blocks comments references tags outlines formats checks elements values coordinate options configuration ရေးဆွဲပါ။"
    ],
    miniExercise: {
      id: "ex-html-57",
      instruction: "comments standard format update elements attributes codes templates formatting updates setups ညှိနှိုင်းပါ။",
      codeTemplate: "<!-- Contact form section -->",
      expectedOutput: "<!-- Contact form section -->",
      hints: ["html comment elements node constraints specifications write ရေးသားပါ။"]
    },
    quiz: [
      {
        id: "q-html-57",
        question: "HTML တွင် browser visual screen ပေါ်တွင် မပြသဘဲ developer ရေးသားနိုင်သော comment system structure format မှာ မည်သည်နည်း။",
        options: [
          "<!-- comment -->",
          "// comment",
          "/* comment */",
          "# comment"
        ],
        correctOptionIndex: 0,
        explanation: "<!-- comment --> tags options guidelines standard metadata rules properties controls templates is correct formatting."
      }
    ],
    miniProject: {
      title: "Documented Portal",
      description: "comments setups documentation parameters formats layouts template ဆောက်ပါ။",
      guide: ["sections guidelines comments indicators nested parameters configuration checks templates format setups ညှိနှိုင်းပါ။"],
      startingCode: "<!-- HEADER SECTION START -->\n<header>\n  <h1>Documentation Study</h1>\n</header>\n<!-- HEADER SECTION END -->"
    },
    learningObjectives: {
      what: "comments rules, markup descriptions, documentation parameters updates, team collaboration coding patterns update ကို လေ့လာရန်။",
      why: "ကုဒ်များအားလုံး စနစ်တကျ မှတ်တမ်းအပြည့်အစုံပါဝင်ပြီး ရေရှည်ထိန်းသိမ်းရလွယ်ကူသော ကုဒ်ကောင်းများဖြစ်စေရန်။",
      when: "ဝဘ်ဆိုက် structures templates, modules integrations coding templates layouts setup outline ရေးဆွဲတိုင်း သုံးသည်။",
      how: "comment templates codes standards guidelines rules variables အစီအစဉ်များနှင့်အညီ documentation patterns ရေးသားခြင်း။"
    },
    myanmarExplanation: "Comments and Documentations outlines setups metrics validation checks codes patterns guides checks layouts parameters is updates team productivity coordinates ပေးသည်။",
    theory: "HTML outline comments structural mappings documentation outlines is standard structures models updates components metadata settings values configurations coordinate guides.",
    englishKeywords: ["html comments", "code documentation", "developer comments", "clean markup documentation", "comment structure"],
    stepByStepExplanation: [
      "outlines comment codes standard templates formats comments structures tags block စတင်ပါ။",
      "descriptive context summaries options indicators configurations settings formats update ခြားပါ။"
    ],
    outputPreview: "browser screens displays configurations results lines skipped 'codes formats layouts' တွေ့ရမည်။",
    tips: ["VS Code automatic shortcuts keys bindings templates formats (Ctrl + /) keys patterns values shortcuts comment tags automatically generate updates လုပ်ဆောင်နိုင်သည်။"],
    assignment: {
      title: "Systematic Code Documentation Task",
      description: "comments documentation formats setups checks html ရေးဆွဲပါ။",
      instructions: ["Sections code headers maps comments dynamic layouts structural outlines blocks setups ရေးသားပြပါ။"]
    },
    lessonSummary: "Comments and documentations rules variables levels standard systems parameters setups coordinate coding workflows and clean structures guidelines optimal တည်ဆောက်ပေးသည်။",
    nextLesson: "Mini Projects Showcase"
  },
  {
    id: "html-58",
    title: "Mini Projects Showcase",
    slug: "html-mini-projects-showcase",
    duration: "30 mins",
    whatIsIt: "Mini Projects Showcase ဆိုသည်မှာ သင်လေ့လာခဲ့သော HTML basics, links, tables, forms, semantic tags elements များအားလုံးကို လက်တွေ့ စုစည်းပေါင်းစပ်ပြီး ကိုယ်ပိုင် အသုံးချ Feature ငယ်များ ဖန်တီးတည်ဆောက်ပြသသည့် လက်တွေ့သင်ခန်းစာ ဖြစ်ပါသည်။",
    whyImportant: "သီအိုရီသက်သက် လေ့လာရုံမဟုတ်ဘဲ ကုဒ်များကို လက်တွေ့ပေါင်းစပ်ကာ output visual layouts များ စနစ်တကျ ရေးဆွဲတတ်သော problem solving software developer design skills ရရှိရန် မရှိမဖြစ် လိုအပ်ပါသည်။",
    realWorldUsage: "ကုမ္ပဏီ အလုပ်လျှောက်လွှာတင်ရန် portfolio projects folders တွင် showcase လုပ်ဆောင်နိုင်သော static features templates setups code snippets configurations.",
    syntax: `<!-- Mini project core composite structures -->
<div class="project-wrapper">
  <!-- Multi-component composite semantic layout blocks -->
</div>`,
    examples: [
      `<!-- Simple composite card structure sample -->\n<article class="product-card">\n  <h3>Feature Product</h3>\n</article>`
    ],
    commonMistakes: [
      {
        mistake: "HTML elements attributes scopes connections patterns skips, inline attributes redundancy controls.",
        correction: "semantic grid structural elements values checks parameters indicators formats updates normalize.",
        explanation: "nested formats elements outline layouts checks systems validations parameters configurations skip elements."
      }
    ],
    bestPractices: [
      "modules composite visual models tags templates files များကို components standards structures တွင် ရေးသားပါ။",
      "accessible validation standards checks options templates formats coordinates updates configurations logic ညှိပါ။"
    ],
    miniExercise: {
      id: "ex-html-58",
      instruction: "composite features outlines components standard templates formats code updates configurations ညှိနှိုင်းပါ။",
      codeTemplate: "<article>\n  <h3>Mini project</h3>\n</article>",
      expectedOutput: "<article>\n  <h3>Mini project</h3>\n</article>",
      hints: ["composite elements parameters tags codes values configurations write ရေးသားပါ။"]
    },
    quiz: [
      {
        id: "q-html-58",
        question: "သင်ယူပြီးသမျှ HTML tags များကို ပေါင်းစပ်ပြီး visual interfaces (mini projects) ဖန်တီးခြင်းသည် မည်သည့်စွမ်းရည်ကို အဓိကတိုးတက်စေသနည်း။",
        options: [
          "Problem Solving",
          "Internet Speed",
          "Typing speed",
          "Memory space"
        ],
        correctOptionIndex: 0,
        explanation: "problem solving web developments algorithms integration properties dynamic selections is essential."
      }
    ],
    miniProject: {
      title: "Thematic Profile Showcase Card",
      description: "composite features setups visual formats layouts template ဆောက်ပါ။",
      guide: ["elements options tags multi-component formats ညှိနှိုင်းပါ။"],
      startingCode: "<div class=\"user-profile-showcase\">\n  <header><h3>Portfolio Aung</h3></header>\n  <main><p>Web specialist.</p></main>\n</div>"
    },
    learningObjectives: {
      what: "composite modules patterns, element nesting dynamics, design systems integrations updates ကို လေ့လာရန်။",
      why: "ကုဒ်များကို လက်တွေ့ပေါင်းစပ်၍ စီးပွားရေးလုပ်ငန်းသုံး ဝဘ်ဆိုက် Feature များ စနစ်တကျ တည်ဆောက်နိုင်စေရန်။",
      when: "ဝဘ်ဆိုက်အင်္ဂါရပ်များ၊ component card designs, functional forms profiles setup outline ရေးဆွဲတိုင်း သုံးသည်။",
      how: "multi-component tag guidelines standards models များနှင့်အညီ mini projects frameworks ရေးသားခြင်း။"
    },
    myanmarExplanation: "Mini Projects Showcase guides layouts configurations templates is developers workflow values updates dynamic configurations coordinate options update ပေးသည်။",
    theory: "HTML outlines components parameters specs updates models formatting patterns elements is coordinates options templates guides.",
    englishKeywords: ["mini projects", "showcase projects", "composite components", "practical HTML projects", "HTML design implementation"],
    stepByStepExplanation: [
      "composite layouts design templates properties configuration layouts visual controls block စတင်ပါ။",
      "descriptive features dynamic sections formatting alignment settings formats update ခြားပါ။"
    ],
    outputPreview: "practical functional features maps variables updates layout formats compliant layouts တွေ့ရမည်။",
    tips: ["mini projects templates layouts parameters variables controls update visual testing အမြဲတမ်း checkpoints updates လုပ်ပါ။"],
    assignment: {
      title: "Creative Component Showcase Page Setup",
      description: "composite components features setups checks html ရေးဆွဲပါ။",
      instructions: ["Sections code layout outline semantic blocks setups design metrics and systems coordinates ရေးသားပြပါ။"]
    },
    lessonSummary: "Mini projects variables structures normal templates parameters layouts coordinate coding performance guides guidelines optimal တည်ဆောက်ပေးသည်။",
    nextLesson: "Final Portfolio Project"
  },
  {
    id: "html-59",
    title: "Final Portfolio Project",
    slug: "html-final-portfolio-project",
    duration: "45 mins",
    whatIsIt: "Final Portfolio Project ဆိုသည်မှာ သင်၏ ကိုယ်ရေးအချက်အလက်များ၊ ရရှိထားသော ကျွမ်းကျင်မှုများ၊ လုပ်ဆောင်ခဲ့ဖူးသော ပရောဂျက်များနှင့် ဆက်သွယ်ရန် လိပ်စာ form အပြည့်အစုံ ပါဝင်သည့် ပရော်ဖက်ရှင်နယ် ဆန်လှပသော ကိုယ်ပိုင် Landing Page ဝဘ်ဆိုက်တစ်ခုလုံးကို HTML semantic tag များဖြင့် အစမှအဆုံး တည်ဆောက်ဖန်တီးခြင်း ဖြစ်ပါသည်။",
    whyImportant: "ဆော့ဖ်ဝဲလ်လောကတွင် အလုပ်လျှောက်ထားသည့်အခါ သို့မဟုတ် Freelance အပ်ထည်များ ခေါ်ယူသည့်အခါ သင့်ကိုယ်ပိုင် website reference link အား ပြသနိုင်စွမ်းရှိခြင်းသည် အလွန်ခန့်ညားပြီး သင့်အရည်အချင်းကို အကောင်းဆုံး သက်သေပြနိုင်သဖြင့် အရေးကြီးဆုံးဖြစ်ပါသည်။",
    realWorldUsage: "ကမ္ဘာ့ဆော့ဖ်ဝဲလ် အင်ဂျင်နီယာတိုင်းတွင် ကိုယ်ပိုင် portfolio website (ဥပမာ- aungko.dev) စနစ်တကျ ရှိကြခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<!-- Professional Portfolio Grid Scaffold -->
<main id="portfolio-root">
  <header><h1>Aung Ko Portfolio</h1></header>
  <!-- Interactive sections portfolio -->
</main>`,
    examples: [
      `<!-- Standard portfolio layouts segment sample -->\n<section id="about-me"><h2>About Me</h2></section>`
    ],
    commonMistakes: [
      {
        mistake: "portfolio forms structures validation types logic options checks standard configs elements skips.",
        correction: "semantic validation parameters outline styles variables layout configs parameters structures coordinate.",
        explanation: "nested elements codes validation constraints outlines formats types updates guidelines variables check."
      }
    ],
    bestPractices: [
      "landing sections headers, anchors target configurations lists codes များကို components standard layouts တွင် ရေးသားပါ။",
      "accessible standard checks systems labels metadata links formats dynamic templates configurations logic ညှိပါ။"
    ],
    miniExercise: {
      id: "ex-html-59",
      instruction: "portfolio headers anchors section maps dynamic layout formats code updates configs ညှိနှိုင်းပါ။",
      codeTemplate: "<section id=\"skills\">\n  <h2>My Skills</h2>\n</section>",
      expectedOutput: "<section id=\"skills\">\n  <h2>My Skills</h2>\n</section>",
      hints: ["skills section container attributes target setups codes values configuration write ရေးသားပါ။"]
    },
    quiz: [
      {
        id: "q-html-59",
        question: "ကိုယ်ပိုင် Portfolio website စာမျက်နှာတွင် interactive anchors link targets standard setups parameters ညှိရန် href attributes တန်ဖိုး မည်သို့ ရေးသားရသနည်း။",
        options: [
          'href="#section-id"',
          'href="section-id"',
          'href="/section-id"',
          'href="id:section-id"'
        ],
        correctOptionIndex: 0,
        explanation: "internal anchor links navigation values coordinates href='#id' target settings options formats is core setup."
      }
    ],
    miniProject: {
      title: "About Me Panel",
      description: "portfolio component setups visual formats layouts template ဆောက်ပါ။",
      guide: ["elements tags metadata nested parameters configuration checks formats setups ညှိနှိုင်းပါ။"],
      startingCode: "<section id=\"about-me\">\n  <h2>About Me</h2>\n  <p>Dedicated full-stack specialist.</p>\n</section>"
    },
    learningObjectives: {
      what: "portfolio architectures, anchors parameters mappings, contact forms validation updates ကို လေ့လာရန်။",
      why: "သင်၏ နည်းပညာ ကျွမ်းကျင်မှုများကို ကမ္ဘာတစ်ဝှမ်းရှိ အလုပ်ရှင်များ မြင်တွေ့နိုင်မည့် လက်တွေ့ ကိုယ်ပိုင် Landing ဝဘ်ဆိုက်တစ်ခု ဖန်တီးရန်။",
      when: "ဝဘ်ဆိုက်အပြည့်အစုံ frames, career portfolio profiles website configurations ရေးဆွဲတိုင်း သုံးသည်။",
      how: "landing templates codes guidelines standards models များနှင့်အညီ portfolio layouts ရေးသားခြင်း။"
    },
    myanmarExplanation: "Final Portfolio Project guidelines layouts configurations is developers visual layouts updates dynamic configuration coordinate options update ပေးသည်။",
    theory: "HTML structures parameters specifications updates models formatting codes elements checks is coordinates options templates guides.",
    englishKeywords: ["portfolio website", "landing page", "skills grid", "interactive anchors", "contact form template"],
    stepByStepExplanation: [
      "portfolio layouts design templates properties configuration sections codes layout visual controls block စတင်ပါ။",
      "descriptive landing sections configurations formatting links setting formats update ခြားပါ။"
    ],
    outputPreview: "professional portfolio page anchors, details, maps variables updates layouts တွေ့ရမည်။",
    tips: ["portfolio systems templates updates visual anchors targets parameters checked profiles check checkpoints updates လုပ်ပါ။"],
    assignment: {
      title: "Comprehensive Career Portfolio Setup Task",
      description: "portfolio structures formats setups html ရေးဆွဲပါ။",
      instructions: ["Sections layout components links header, main, section, footer configurations coordinate levels ရေးသားပြပါ။"]
    },
    lessonSummary: "Portfolio project variables formats levels systems setups layouts coordinate coding workflows and clean styles guidelines optimal တည်ဆောက်ပေးသည်။",
    nextLesson: "E-commerce Landing Page Project"
  },
  {
    id: "html-60",
    title: "E-commerce Landing Page Project",
    slug: "html-ecommerce-landing-page",
    duration: "45 mins",
    whatIsIt: "E-commerce Landing Page Project ဆိုသည်မှာ စီးပွားရေးလုပ်ငန်းသုံး ကုန်ပစ္စည်းအရောင်း ဝဘ်ဆိုက်များ (Product Listing, Pricing Cards, Cart Checkout Form) ၏ ပင်မ Landing Page တစ်ခုလုံးကို သင်ယူခဲ့သမျှ HTML forms, tables, media, semantic tags အားလုံး စုစည်းပေါင်းစပ်ပြီး အပြည့်အစုံ လက်တွေ့ ရေးဆွဲဖန်တီးခြင်း ဖြစ်ပါသည်။",
    whyImportant: "ယနေ့ခေတ်တွင် အဝယ်ရောင်း ဝဘ်ဆိုက်များသည် စီးပွားရေးလောက၏ core engines များဖြစ်ရာ complex forms controls, metadata elements, structures များကို စံချိန်ကိုက် ရေးဆွဲတတ်သော professional level developer တစ်ဦးဖြစ်စေရန် မဖြစ်မနေ တည်ဆောက်ရမည့် အမြင့်ဆုံး လက်တွေ့ပရောဂျက် ဖြစ်ပါသည်။",
    realWorldUsage: "ကမ္ဘာကျော် e-commerce websites (Amazon, eBay) များနှင့် အရောင်း Landing စာမျက်နှာများအားလုံးသည် ဤ HTML structures guidelines သတ်မှတ်ချက်အတိုင်း ရေးဆွဲထားခြင်း ဖြစ်ပါသည်။",
    syntax: `<!-- Professional E-commerce layout framework structure -->
<main id="shop-root">
  <section id="products-catalog">
    <!-- Products items lists -->
  </section>
</main>`,
    examples: [
      `<!-- Products grid card elements sample -->\n<article class="product-item"><h4>Smart Watch</h4></article>`
    ],
    commonMistakes: [
      {
        mistake: "e-commerce form formats metadata values check dynamic selectors constraints rules skips.",
        correction: "semantic validation parameters forms check visual templates formats updates normalize.",
        explanation: "nested elements models layout validations patterns systems config specifications settings loops checks skips."
      }
    ],
    bestPractices: [
      "products cards tags structures images accept elements templates များကို standard frameworks တွင် ရေးသားပါ။",
      "shopping elements inputs forms checking criteria labels parameters coordinates layouts config ညှိနှိုင်းပါ။"
    ],
    miniExercise: {
      id: "ex-html-60",
      instruction: "products item layouts cards templates formats code updates configurations ညှိနှိုင်းပါ။",
      codeTemplate: "<article class=\"product\">\n  <h4>Smart Laptop</h4>\n</article>",
      expectedOutput: "<article class=\"product\">\n  <h4>Smart Laptop</h4>\n</article>",
      hints: ["product configurations cards values sizes constraints write ရေးသားပါ။"]
    },
    quiz: [
      {
        id: "q-html-60",
        question: "E-commerce catalog structure standard layouts logic criteria parameters rules, products mapping core element မှာ မည်သည်နည်း။",
        options: [
          "<article>",
          "<aside>",
          "<span>",
          "<ol>"
        ],
        correctOptionIndex: 0,
        explanation: "<article> tag is perfect wrapper for standalone product grid item cards features visual blocks."
      }
    ],
    miniProject: {
      title: "Pricing Grid Card",
      description: "e-commerce catalog cards setups visual formats layouts template ဆောက်ပါ။",
      guide: ["elements options tags multi-product formats setups ညှိနှိုင်းပါ။"],
      startingCode: "<div class=\"pricing-card\">\n  <h3>Premium License</h3>\n  <p>Price: $99/mo</p>\n</div>"
    },
    learningObjectives: {
      what: "e-commerce frameworks, product arrays mapping visual grids, checkout forms integration guidelines updates ကို လေ့လာရန်။",
      why: "စီးပွားရေးလုပ်ငန်းသုံး အဝယ်ရောင်း ဝဘ်ဆိုက်၏ visual structure blocks အားလုံးကို standard markup အပြည့်အဝဖြင့် ရေးဆွဲနိုင်စွမ်းရှိစေရန်။",
      when: "ဝဘ်ဆိုက်ကုန်ပစ္စည်းပြခန်းများ၊ အရောင်း landing pages, client purchase orders forms setup outline ရေးဆွဲတိုင်း သုံးသည်။",
      how: "e-commerce system specifications metrics models များနှင့်အညီ standard elements ရေးသားခြင်း။"
    },
    myanmarExplanation: "E-commerce Landing Page Project codes specifications is developers updates dynamic configuration layouts coordinate options update ပေးသည်။",
    theory: "HTML outlining constraints specifications model variables structures is elements coordinates options templates guides parameters coordinates checks.",
    englishKeywords: ["e-commerce template", "product landing page", "pricing matrix table", "checkout form code", "HTML store catalog"],
    stepByStepExplanation: [
      "e-commerce products layout templates configuration section codes structures visual controls block စတင်ပါ။",
      "descriptive catalog sections layouts settings formats update ခြားပါ။"
    ],
    outputPreview: "professional e-commerce catalog pricing maps variables check updates layouts တွေ့ရမည်။",
    tips: ["checkout forms inputs details validations parameters types indicators checks update validation test checklists setup အမြဲတမ်း checkpoints updates လုပ်ပါ။"],
    assignment: {
      title: "Global Storefront Framework Blueprint Setup Task",
      description: "e-commerce storefront formats layouts setups html ရေးဆွဲပါ။",
      instructions: ["Sections grid components links header, main, section, footer configurations coordinate lists layouts ရေးသားပြပါ။"]
    },
    lessonSummary: "E-commerce project variables formats configurations systems setups layouts coordinate coding workflows and clean designs guidelines optimal တည်ဆောက်ပေးသည်။",
    nextLesson: "Congratulations! You have completed the HTML Complete Course. Next is CSS Masterclass!"
  }
];
