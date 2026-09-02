import { Lesson } from "../types";

export const lessons2: Lesson[] = [
  {
    id: "html-21",
    title: "Telephone Links",
    slug: "html-telephone-links",
    duration: "15 mins",
    whatIsIt: "Telephone Links ဆိုသည်မှာ ဝဘ်ဆိုက်ပေါ်ရှိ ဖုန်းနံပါတ်တစ်ခုကို နှိပ်လိုက်သည်နှင့် ဖုန်းခေါ်ဆိုမှု app (Dialer) တိုက်ရိုက်ပွင့်လာပြီး ဖုန်းခေါ်ဆိုနိုင်မည့် စနစ်ဖြစ်ပါသည်။",
    whyImportant: "အထူးသဖြင့် စမတ်ဖုန်းအသုံးပြုသူများအတွက် နံပါတ်ကို ကူးယူစရာမလိုဘဲ လုပ်ငန်းများထံ တိုက်ရိုက်ဖုန်းခေါ်ဆို ဆက်သွယ်နိုင်သဖြင့် အလွန်အဆင်ပြေစေပါသည်။",
    realWorldUsage: "E-commerce ဝဘ်ဆိုက်များ သို့မဟုတ် စားသောက်ဆိုင်ဝဘ်ဆိုက်များရှိ 'Call Us Now' သို့မဟုတ် 'အရေးပေါ်ဆက်သွယ်ရန်' ခလုတ်များတွင် သုံးပါသည်။",
    syntax: `<a href="tel:+95912345678">ဖုန်းခေါ်ဆိုရန်</a>`,
    examples: [
      `<a href="tel:+959777666555">Call Sales (+959777666555)</a>`
    ],
    commonMistakes: [
      {
        mistake: "<a href=\"phone:09123456\">Call</a>",
        correction: "<a href=\"tel:+959123456\">Call</a>",
        explanation: "ဖုန်းခေါ်ဆိုရန် schema မှာ phone: မဟုတ်ဘဲ tel: ဖြစ်ပါသည်။ နိုင်ငံတကာခေါ်ဆိုမှုအတွက် နိုင်ငံကုဒ် (+95) ထည့်သွင်းခြင်းသည် အကောင်းဆုံးဖြစ်ပါသည်။"
      }
    ],
    bestPractices: [
      "လင့်ခ်အတွင်း ဖုန်းနံပါတ်ရေးရာတွင် space များ၊ dash (-) များ မပါဝင်ဘဲ tel:+959... ပုံစံဖြင့် ကပ်ရေးပါ။"
    ],
    miniExercise: {
      id: "ex-html-21",
      instruction: "tel schema သုံးပြီး '+9599998888' သို့ ဖုန်းခေါ်ဆိုရန် link တစ်ခု တည်ဆောက်ပါ။",
      codeTemplate: "<a href=\"tel:+9599998888\">Call Us</a>",
      expectedOutput: "<a href=\"tel:+9599998888\">Call Us</a>",
      hints: ["href attribute တွင် tel:+9599998888 ဟု ရေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-21",
        question: "HTML တွင် ဖုန်းနံပါတ်တိုက်ရိုက်ခေါ်ဆိုရန် မည်သည့် schema အား သုံးရသနည်း။",
        options: [
          "phone:",
          "call:",
          "tel:",
          "mobile:"
        ],
        correctOptionIndex: 2,
        explanation: "tel: schema သည် href attributes အတွင်း သုံးပြီး ဖုန်းခေါ်ဆိုမှု စတင်ရန် ဖြစ်ပါသည်။"
      }
    ],
    miniProject: {
      title: "Hotline Hub",
      description: "အရေးပေါ် ဖုန်းခေါ်ဆိုမှု လင့်ခ်များ စုစည်းရာ စာမျက်နှာငယ်တစ်ခု ဆောက်ပါ။",
      guide: ["အရေးပေါ်ဖုန်းနံပါတ်များဖြစ်သော ရဲစခန်းနှင့် မီးသတ်ဌာနတို့အတွက် tel links များ သတ်မှတ်ပါ။"],
      startingCode: "<a href=\"tel:199\">Emergency Police</a>\n<a href=\"tel:191\">Fire Department</a>"
    },
    learningObjectives: {
      what: "tel: protocol နှင့် ဖုန်း dialer ချိတ်ဆက်ပုံကို လေ့လာရန်။",
      why: "မိုဘိုင်းအသုံးပြုသူများ ဆက်သွယ်ရလွယ်ကူပြီး conversion rate တက်စေရန်။",
      when: "စီးပွားရေးလုပ်ငန်း ဝဘ်ဆိုက်များ၊ ဆက်သွယ်ရန်စာမျက်နှာများတွင် သုံးသည်။",
      how: "href=\"tel:နံပါတ်\" ပုံစံဖြင့် ရေးသားအသုံးပြုခြင်း။"
    },
    myanmarExplanation: "tel: schema သည် browser နှင့် device system တို့ကို ချိတ်ဆက်ပေးပြီး phone keypad တွင် သတ်မှတ်ထားသော နံပါတ်ကို တိုက်ရိုက်ရိုက်ထည့်ပေးသည်။",
    theory: "မိုဘိုင်းဖုန်းခေါ်ဆိုမှုစနစ်များတွင် tel protocol သည် စက်၏ default dialer ဆော့ဖ်ဝဲလ်သို့ ဒေတာပေးပို့ရန် အသုံးပြုသည့် standard mechanism ဖြစ်သည်။",
    englishKeywords: ["tel link", "Dialer", "Mobile Friendly", "Conversion Rate", "Protocol"],
    stepByStepExplanation: [
      "<a> tag တည်ဆောက်ပါ။",
      "href attribute တန်ဖိုးတွင် tel: နှင့် နိုင်ငံကုဒ်ပါဝင်သော ဖုန်းနံပါတ်ထည့်ပါ။"
    ],
    outputPreview: "Call Us (မိုဘိုင်းဖုန်းတွင် နှိပ်ပါက ဖုန်းခေါ်ဆိုရန် app ပွင့်လာမည်)",
    tips: ["ဖုန်းနံပါတ်များတွင် ပြည်ပမှခေါ်ဆိုနိုင်ရန် နိုင်ငံကုဒ် (+95) အမြဲသုံးပေးပါ။"],
    assignment: {
      title: "Corporate Hotline Widget",
      description: "ကုမ္ပဏီ Hotline ဖုန်းခေါ်ဆိုရန် widget တစ်ခု ရေးဆွဲပါ။",
      instructions: ["Sales နှင့် Support ဌာနတို့အတွက် သီးခြား ဖုန်းလင့်ခ် ၂ ခု ဖန်တီးပါ။"]
    },
    lessonSummary: "tel: link များသည် မိုဘိုင်းဖုန်းများမှ တိုက်ရိုက်ဖုန်းခေါ်ဆိုနိုင်စေရန် ကူညီပေးသည်။",
    nextLesson: "Images Intro"
  },
  {
    id: "html-22",
    title: "Images Intro",
    slug: "html-images-intro",
    duration: "20 mins",
    whatIsIt: "Images Intro ဆိုသည်မှာ ဝဘ်စာမျက်နှာများပေါ်တွင် ရုပ်ပုံများ၊ ပိုစတာများနှင့် graphic များကို ဓာတ်ပုံဖိုင်များမှတစ်ဆင့် ပြသပေးသည့် စနစ်ဖြစ်ပါသည်။",
    whyImportant: "စာသားများသာရှိသော ဝဘ်ဆိုက်တစ်ခုသည် ငြီးငွေ့ဖွယ်ကောင်းပြီး၊ ပုံရိပ်များသည် အသုံးပြုသူ၏ စိတ်ဝင်စားမှုကို ဆွဲဆောင်ရန်နှင့် သတင်းအချက်အလက်ကို ပိုမိုမြန်ဆန်စွာ နားလည်စေရန် မရှိမဖြစ်လိုအပ်ပါသည်။",
    realWorldUsage: "E-commerce ဝဘ်ဆိုက်များတွင် ကုန်ပစ္စည်းပုံများပြသခြင်း၊ သတင်းဆိုက်များတွင် သတင်းဓာတ်ပုံများ ပြသခြင်းများတွင် သုံးပါသည်။",
    syntax: `<img src="image.jpg" alt="ပုံ၏ဖော်ပြချက်">`,
    examples: [
      `<img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809" alt="Colorful Abstract Background">`
    ],
    commonMistakes: [
      {
        mistake: "<img src='photo.jpg'></img>",
        correction: "<img src='photo.jpg' alt='Description'>",
        explanation: "<img> tag သည် Self-closing element ဖြစ်ပြီး ပိတ် tag </img> သုံးစရာမလိုပါ။ alt attribute လည်း မဖြစ်မနေ ထည့်သွင်းသင့်ပါသည်။"
      }
    ],
    bestPractices: [
      "ရုပ်ပုံများကို မြန်မြန်ပွင့်စေရန် ဖိုင်အရွယ်အစားကို web-optimized ဖြစ်အောင် အမြဲချုံ့ပေးပါ။",
      "alt (alternative text) ကို အမြဲထည့်သွင်းပါ။"
    ],
    miniExercise: {
      id: "ex-html-22",
      instruction: "src တွင် 'profile.jpg' နှင့် alt တွင် 'My Profile' ပါဝင်သော img tag တစ်ခု ရေးသားပါ။",
      codeTemplate: "<img src=\"profile.jpg\" alt=\"My Profile\">",
      expectedOutput: "<img src=\"profile.jpg\" alt=\"My Profile\">",
      hints: ["<img> element တွင် src နှင့် alt attribute များ ထည့်ပေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-22",
        question: "HTML တွင် ပုံတစ်ပုံ ပြသရန် မည်သည့် tag ကို သုံးသနည်း။",
        options: [
          "<image>",
          "<img>",
          "<picture>",
          "<src>"
        ],
        correctOptionIndex: 1,
        explanation: "<img> tag သည် ဝဘ်စာမျက်နှာပေါ်တွင် image များပြသရန် အသုံးပြုသည့် standard element ဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "Simple Gallery",
      description: "ရုပ်ပုံ ၃ ပုံပါဝင်သော ရိုးရှင်းသည့် ပုံပြခန်းငယ်တစ်ခု တည်ဆောက်ပါ။",
      guide: ["<img> tags သုံးခုကို သင့်လျော်သော src နှင့် alt များဖြင့် ဖန်တီးပါ။"],
      startingCode: "<img src=\"https://images.unsplash.com/photo-1507525428034-b723cf961d3e\" alt=\"Beach View\">\n<img src=\"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05\" alt=\"Forest\">"
    },
    learningObjectives: {
      what: "<img> tag ၏ src, alt attribute များအကြောင်းနှင့် empty element အမျိုးအစားဖြစ်ပုံကို လေ့လာရန်။",
      why: "ဝဘ်စာမျက်နှာများကို မြင်သာထင်သာရှိပြီး ဆွဲဆောင်မှုရှိစေရန် ပုံရိပ်များ ထည့်သွင်းတတ်ရန်။",
      when: "ဝဘ်ဆိုက်တွင် လိုဂို၊ ဓာတ်ပုံ၊ အိုင်ကွန်များ ပြသလိုသည့်အခါ သုံးသည်။",
      how: "<img> tag အတွင်း src link နှင့် alt စာသားထည့်ရေးခြင်းဖြင့် သုံးသည်။"
    },
    myanmarExplanation: "<img> tag သည် စာမျက်နှာပေါ်တွင် ပုံကို တိုက်ရိုက်မထည့်သွင်းဘဲ၊ src တွင် ပေးထားသော လိပ်စာမှ ပုံရိပ်ဖိုင်ကို လှမ်းယူပြီး browser ၌ ပေါင်းစပ်ပြသပေးခြင်း ဖြစ်သည်။",
    theory: "HTML တွင် <img> သည် empty content types (Void Element) တွင် ပါဝင်ပြီး closed tag မလိုဘဲ attributes များပေါ်တွင်သာ အလုပ်လုပ်သည်။",
    englishKeywords: ["img tag", "src attribute", "alt attribute", "Void Element", "Self-closing"],
    stepByStepExplanation: [
      "<img> tag ကို စတင်ပါ။",
      "src (Source) attribute တွင် ပုံတည်ရှိရာ URL သို့မဟုတ် file path ကို ရေးပါ။",
      "alt (Alternative) attribute တွင် ပုံကို ရှင်းပြသည့် စာသားရေးပါ။"
    ],
    outputPreview: "လှပသော သဘာဝရှုခင်းပုံတစ်ပုံကို မြင်တွေ့ရမည် ဖြစ်သည်။",
    tips: ["alt text ကို ရေးသားရာတွင် ပုံတွင် အမှန်တကယ် ပါဝင်သည့်အရာကို တိုတိုရှင်းရှင်း ဖော်ပြပါ။"],
    assignment: {
      title: "Logo Spotlight Page",
      description: "ကုမ္ပဏီလိုဂို ပြသသော စာမျက်နှာတစ်ခု တည်ဆောက်ပါ။",
      instructions: ["အမှတ်တံဆိပ် လိုဂိုပုံရိပ်တစ်ခုကို alt စာသား စနစ်တကျထည့်ပြီး ဝဘ်ပေါ်တင်ပြပါ။"]
    },
    lessonSummary: "<img> tag သည် ပုံများကို ပြသရန်သုံးပြီး src နှင့် alt attribute များ မဖြစ်မနေ ပါဝင်ရပါမည်။",
    nextLesson: "Image Alt Text"
  },
  {
    id: "html-23",
    title: "Image Alt Text",
    slug: "html-image-alt-text",
    duration: "15 mins",
    whatIsIt: "Image Alt Text (Alternative Text) ဆိုသည်မှာ အကြောင်းအမျိုးမျိုးကြောင့် ပုံမပွင့်သည့်အခါ သို့မဟုတ် မျက်မမြင်အသုံးပြုသူများ မျက်နှာပြင်ဖတ်ဆော့ဖ်ဝဲလ် (Screen Reader) သုံးသည့်အခါ ပုံအစား ပြသဖတ်ကြားပေးမည့် စာသားဖြစ်ပါသည်။",
    whyImportant: "Accessibility (လူတိုင်းဝင်ရောက်ကြည့်ရှုနိုင်မှု) နှင့် ဝဘ်ဆိုက်အား Google Search တွင် ရှာဖွေရလွယ်ကူစေသော SEO (Search Engine Optimization) တို့အတွက် အလွန်အရေးကြီးပါသည်။",
    realWorldUsage: "ပုံတစ်ပုံ၏ internet လိုင်းမကောင်း၍ မပွင့်လာချိန်တွင် 'Product Logo' ဟူသော စာသားလေး ပေါ်နေခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<img src="logo.png" alt="Company Official Logo">`,
    examples: [
      `<img src="avatar.jpg" alt="Aung Aung - Senior Developer Portrait">`
    ],
    commonMistakes: [
      {
        mistake: "<img src='car.png' alt='image'>",
        correction: "<img src='car.png' alt='Red sports car driving on mountain road'>",
        explanation: "'image' သို့မဟုတ် 'photo' ဟု ရေးခြင်းသည် ဘာမှအကျိုးမရှိပါ။ ပုံတွင် မည်သည့်အရာပါဝင်ကြောင်း သရုပ်ဖော်ပေးရန် လိုအပ်ပါသည်။"
      }
    ],
    bestPractices: [
      "အလှဆင်ရန်သက်သက်သုံးသော ပုံများအတွက် alt=\"\" (empty) ဟု ထားပေးခြင်းဖြင့် screen readers များအား ကျော်သွားစေနိုင်ပါသည်။",
      "စာလုံးရေ ၁၂၅ ထက် မကျော်ဘဲ တိုတိုနှင့် လိုရင်းကို ဖော်ပြပါ။"
    ],
    miniExercise: {
      id: "ex-html-23",
      instruction: "alt text တွင် 'Cute yellow puppy' ဟု ပါဝင်သော ခွေးလေးပုံတစ်ပုံ ရေးသားပါ။",
      codeTemplate: "<img src=\"dog.jpg\" alt=\"Cute yellow puppy\">",
      expectedOutput: "<img src=\"dog.jpg\" alt=\"Cute yellow puppy\">",
      hints: ["alt attribute တန်ဖိုးအား 'Cute yellow puppy' ဟု သတ်မှတ်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-23",
        question: "Image alt text ကို အဓိကအားဖြင့် အဘယ်ကြောင့် သုံးရသနည်း။",
        options: [
          "ပုံကို အရောင်လှပစေရန်",
          "မျက်မမြင်များအတွက် Screen Readers နှင့် SEO ကောင်းမွန်စေရန်",
          "ပုံ၏ အရွယ်အစားကို သတ်မှတ်ရန်",
          "ပုံကို background အဖြစ် သတ်မှတ်ရန်"
        ],
        correctOptionIndex: 1,
        explanation: "alt attribute သည် မမြင်ရသူများအတွက် screen reading utility များမှ ဖတ်ပြပေးရန်နှင့် SEO indexing အတွက် သုံးသည်။"
      }
    ],
    miniProject: {
      title: "Accessible Card",
      description: "Accessibility စံနှုန်းပြည့်ဝသော ကတ်ပြားတစ်ခု ဆောက်ပါ။",
      guide: ["ပုံတစ်ပုံ၊ ခေါင်းစဉ်တစ်ခုနှင့် alt text သရုပ်ဖော်ချက် အပြည့်အစုံ ပါဝင်ပါစေ။"],
      startingCode: "<div class=\"card\">\n  <img src=\"book.jpg\" alt=\"HTML5 and CSS3 Complete Guidebook\">\n  <h3>Book Cover</h3>\n</div>"
    },
    learningObjectives: {
      what: "alt attribute ၏ တန်ဖိုး၊ accessibility နှင့် SEO အပေါ် သက်ရောက်မှုများကို နားလည်ရန်။",
      why: "မသန်စွမ်းသူများအပါအဝင် ဝဘ်ဆိုက်ကို လူတိုင်း အဆင်ပြေပြေ အသုံးပြုနိုင်စေရန် (Web Accessibility)။",
      when: "ဝဘ်စာမျက်နှာများတွင် အဓိပ္ပာယ်ရှိသော ပုံများ ထည့်သွင်းတိုင်း သုံးသည်။",
      how: "alt=\"ပုံ၏ သရုပ်ဖော်ပုံ\" ဟု တိကျစွာ ရေးသားခြင်း။"
    },
    myanmarExplanation: "alt text သည် ပုံမမြင်ရသော အခြေအနေများတွင် ပုံ၏ ကိုယ်စားလှယ်အဖြစ် အသုံးဝင်ပြီး search engine crawlers များအတွက် ပုံကိုဖတ်ရှုနားလည်နိုင်ရန် တစ်ဦးတည်းသော နည်းလမ်းဖြစ်သည်။",
    theory: "Web Content Accessibility Guidelines (WCAG) အရ သတင်းအချက်အလက်ပေးသော ပုံရိပ်တိုင်းတွင် သင့်လျော်သော alternative text ဖော်ပြချက် ပါဝင်ရပါမည်။",
    englishKeywords: ["Accessibility", "WCAG", "Screen Reader", "SEO Indexing", "Alternative Text"],
    stepByStepExplanation: [
      "<img> element တစ်ခုကို သတ်မှတ်ပါ။",
      "alt attribute ကို ထည့်သွင်းပြီး ပုံကို မျက်စိပိတ်ကာ မြင်ယောင်စေမည့် စာသားတစ်ခု ရေးပါ။"
    ],
    outputPreview: "ပုံမပွင့်သောအခါ 'HTML5 and CSS3 Complete Guidebook' ဟူသော စာသားကို မြင်ရမည်။",
    tips: ["အလှဆင်ပုံရိပ် (Decorative images) များတွင် alt=\"\" ဟု အလွတ်ထားရန် မမေ့ပါနှင့်။"],
    assignment: {
      title: "SEO Friendly Product Catalog",
      description: "SEO ကောင်းမွန်သော ကုန်ပစ္စည်းပုံပြခန်း ဖန်တီးပါ။",
      instructions: ["ဖုန်း၊ လက်ပ်တော့နှင့် နာရီပုံ ၃ ပုံအတွက် alt attributes များကို SEO စံနှုန်းနှင့်အညီ ရေးသားပါ။"]
    },
    lessonSummary: "alt text သည် အလွန်အရေးကြီးသော accessibility နှင့် SEO elements တစ်ခု ဖြစ်ပြီး ပုံတိုင်းတွင် ပါဝင်သင့်သည်။",
    nextLesson: "Responsive Images"
  },
  {
    id: "html-24",
    title: "Responsive Images",
    slug: "html-responsive-images",
    duration: "20 mins",
    whatIsIt: "Responsive Images ဆိုသည်မှာ အသုံးပြုသူ၏ စခရင်အရွယ်အစား (ဖုန်း၊ တက်ဘလက်၊ ကွန်ပျူတာ) အလိုက် သင့်လျော်သော ပုံရိပ်အရွယ်အစား သို့မဟုတ် ပုံစံကို ရွေးချယ်ပြသပေးသည့် နည်းပညာဖြစ်ပါသည်။",
    whyImportant: "စခရင်သေးသော ဖုန်းပေါ်တွင် ကွန်ပျူတာသုံး ပုံကြီးများကို ဒေါင်းလုဒ်ဆွဲရန် မလိုတော့သဖြင့် internet data သက်သာစေပြီး ဝဘ်ဆိုက် ပွင့်နှုန်းကို အလွန်မြန်ဆန်စေပါသည်။",
    realWorldUsage: "သတင်းဆိုက်ကြီးများတွင် ဖုန်းဖြင့်ကြည့်လျှင် ပုံသေးပြပြီး၊ desktop ဖြင့်ကြည့်လျှင် high-resolution ပုံကြီးများ ပြသခြင်းတွင် သုံးပါသည်။",
    syntax: `<picture>
  <source media="(min-width: 800px)" srcset="large.jpg">
  <source media="(min-width: 400px)" srcset="medium.jpg">
  <img src="small.jpg" alt="Responsive Image">
</picture>`,
    examples: [
      `<picture>
  <source media="(min-width: 1024px)" srcset="banner-desktop.png">
  <img src="banner-mobile.png" alt="Summer Promo Sale">
</picture>`
    ],
    commonMistakes: [
      {
        mistake: "<img> element သက်သက်ဖြင့် responsive ဖြစ်စေရန် width=\"100%\" သာ သုံးပြီး mobile တွင် loading အလွန်ကြာခြင်း။",
        correction: "<picture> element သို့မဟုတ် srcset attribute ကို သုံးစွဲ၍ မတူညီသော ပုံအရွယ်အစားများကို သတ်မှတ်ပေးပါ။",
        explanation: "css ဖြင့် image ညှိရုံသည် network data ဒေါင်းလုဒ်ဆွဲမှုကို မလျှော့ချနိုင်ပါ။ <picture> သည် မတူညီသော file များကို သက်ဆိုင်ရာ စခရင်အလိုက် တိုက်ရိုက်ဒေါင်းလုဒ်လုပ်စေပါသည်။"
      }
    ],
    bestPractices: [
      "ခေတ်မီမြန်ဆန်သော WebP သို့မဟုတ် AVIF image formats များကို <source> tags တွင် ထည့်သွင်းသုံးစွဲပါ။"
    ],
    miniExercise: {
      id: "ex-html-24",
      instruction: "ကွန်ပြူတာ စခရင်ကြီးများ (min-width: 768px) အတွက် 'large.jpg' ကိုပြပြီး၊ ကျန်စခရင်များအတွက် 'small.jpg' ကိုပြသည့် picture element ကို ရေးဆွဲပါ။",
      codeTemplate: `<picture>
  <source media="(min-width: 768px)" srcset="large.jpg">
  <img src="small.jpg" alt="Responsive Screen">
</picture>`,
      expectedOutput: `<picture>\n  <source media="(min-width: 768px)" srcset="large.jpg">\n  <img src="small.jpg" alt="Responsive Screen">\n</picture>`,
      hints: ["<source> tags နှင့် fallback <img> ကို စနစ်တကျ အထက်အောက် စီစဉ်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-24",
        question: "စခရင်အရွယ်အစားအမျိုးမျိုးအလိုက် မတူညီသောပုံဖိုင်များကို ရွေးချယ်ပြသရန် မည်သည့် HTML5 tag ကို သုံးသနည်း။",
        options: [
          "<responsive>",
          "<picture>",
          "<media>",
          "<graphics>"
        ],
        correctOptionIndex: 1,
        explanation: "<picture> wrapper tag သည် <source> နှင့် <img> များကို အသုံးပြုပြီး multi-device support image rendering ကို ဖန်တီးပေးသည်။"
      }
    ],
    miniProject: {
      title: "Banner Switcher",
      description: "မတူညီသော device များတွင် လိုက်ဖက်ညီစွာ ပြောင်းလဲမည့် banner စနစ်တစ်ခု ရေးပါ။",
      guide: ["Desktop အတွက် 'desktop.jpg'၊ ဖုန်းအတွက် 'mobile.jpg' ကို picture tag သုံး၍ ရေးပါ။"],
      startingCode: "<picture>\n  <source media=\"(min-width: 1024px)\" srcset=\"desktop.jpg\">\n  <img src=\"mobile.jpg\" alt=\"Promo Banner\">\n</picture>"
    },
    learningObjectives: {
      what: "<picture> tag နှင့် <source> tag ၏ srcset, media attributes များအကြောင်း လေ့လာရန်။",
      why: "ဝဘ်ဆိုက်၏ performance ကို မြှင့်တင်ရန်နှင့် bandwidth လေလွင့်မှုကို သက်သာစေရန်။",
      when: "Hero banners များ၊ full-width ပုံရိပ်များကို device ပေါင်းစုံအတွက် optimized လုပ်လိုသည့်အခါ သုံးသည်။",
      how: "<picture> elements အတွင်း <source> tags များနှင့် <img> tag တို့ကို ပေါင်းစပ်ရေးသားခြင်း။"
    },
    myanmarExplanation: "<picture> element သည် media logic အပေါ် မူတည်ပြီး မည်သည့်ပုံရိပ်ဖိုင်ကို ဒေါင်းလုဒ်လုပ်ပြသရမည်ကို browser ကို ဆုံးဖြတ်စေသဖြင့် bandwidth သက်သာစေသော အကောင်းဆုံးစနစ်ဖြစ်သည်။",
    theory: "HTML5 adaptive design တွင် art direction နှင့် pixel density descriptor များသည် user-agent device profiles အလိုက် အထိရောက်ဆုံးပုံရိပ်များကို load စေသည်။",
    englishKeywords: ["Responsive Image", "picture element", "srcset attribute", "media query", "Bandwidth Saving"],
    stepByStepExplanation: [
      "<picture> wrapper tag ကို ရေးပါ။",
      "<source> tag ဖြင့် သက်ဆိုင်ရာ media condition (ဥပမာ min-width) နှင့် ပုံလမ်းကြောင်း srcset ကို သတ်မှတ်ပါ။",
      "နောက်ဆုံးတွင် media logic မကိုက်ညီပါက ပြသရန် fallback <img> ကို ထည့်ပါ။"
    ],
    outputPreview: "စခရင်ကို ချုံ့ချဲ့ကြည့်ပါက ပုံရိပ်များ အလိုအလျောက် ပြောင်းလဲသွားသည်ကို တွေ့ရမည်။",
    tips: ["ခေတ်မီ web formats ဖြစ်သော WebP ကို ပြောင်းသုံးခြင်းဖြင့် visual quality မကျဘဲ ဖိုင်အရွယ်အစားကို ပိုမိုသေးငယ်စေပါသည်။"],
    assignment: {
      title: "Hero Banner Art Direction",
      description: "စခရင်အမျိုးမျိုးအတွက် လိုက်ဖက်သော hero banner တည်ဆောက်ပါ။",
      instructions: ["Desktop, Tablet, Mobile စခရင် ၃ မျိုးစလုံးအတွက် picture element သုံးပြီး ရေးဆွဲစမ်းသပ်ပါ။"]
    },
    lessonSummary: "Responsive images များသည် <picture> tag သုံး၍ ဝဘ်ဆိုက် မြန်ဆန်ပျော့ပျောင်းစေရန် ကူညီပေးသည်။",
    nextLesson: "HTML Audio"
  },
  {
    id: "html-25",
    title: "HTML Audio",
    slug: "html-audio",
    duration: "20 mins",
    whatIsIt: "HTML Audio ဆိုသည်မှာ ဝဘ်စာမျက်နှာပေါ်တွင် ပြင်ပ music player များ မလိုဘဲ အသံဖိုင်များ၊ သီချင်းများနှင့် podcasts များကို တိုက်ရိုက်ဖွင့်နိုင်သည့် စနစ်ဖြစ်ပါသည်။",
    whyImportant: "ဝဘ်ဆိုက်များတွင် နောက်ခံတေးဂီတ၊ အသံရှင်းလင်းချက်များ၊ podcast episode များကို ထည့်သွင်းပြသနိုင်ရန်အတွက် အလွန်အသုံးဝင်ပါသည်။",
    realWorldUsage: "SoundCloud, Spotify-like music players နှင့် အွန်လိုင်း သင်တန်းများတွင် audio lectures များ ထည့်သွင်းရာတွင် သုံးပါသည်။",
    syntax: `<audio controls>
  <source src="song.mp3" type="audio/mpeg">
  သင့် browser သည် audio ကို support မလုပ်ပါ။
</audio>`,
    examples: [
      `<audio controls loop autoplay>
  <source src="ambient.ogg" type="audio/ogg">
  <source src="ambient.mp3" type="audio/mpeg">
</audio>`
    ],
    commonMistakes: [
      {
        mistake: "<audio src='voice.mp3'>",
        correction: "<audio src='voice.mp3' controls></audio>",
        explanation: "controls attribute မပါဝင်ပါက ဝဘ်စာမျက်နှာပေါ်တွင် ဖွင့်/ပိတ် ခလုတ်များ၊ volume bars များ ပေါ်လာမည် မဟုတ်ဘဲ အသံဖိုင်သည် ကွယ်ပျောက်နေပါလိမ့်မည်။"
      }
    ],
    bestPractices: [
      "အသုံးပြုသူများ စိတ်အနှောင့်အယှက်မဖြစ်စေရန် autoplay attribute အား မလိုအပ်ဘဲ အလွန်အကျွံ မသုံးစွဲပါနှင့်။",
      "အသံဖိုင် formats အမျိုးမျိုးကို support ဖြစ်စေရန် <source> tag များခွဲပြီး သုံးပါ။"
    ],
    miniExercise: {
      id: "ex-html-25",
      instruction: "controls attribute ပါဝင်ပြီး 'track.mp3' ကို ဖွင့်ပေးမည့် audio tag တစ်ခု ဖန်တီးပါ။",
      codeTemplate: "<audio controls>\n  <source src=\"track.mp3\" type=\"audio/mpeg\">\n</audio>",
      expectedOutput: "<audio controls>\n  <source src=\"track.mp3\" type=\"audio/mpeg\">\n</audio>",
      hints: ["<audio controls> tag အတွင်း <source> tag ထည့်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-25",
        question: "HTML တွင် audio player အား ဖွင့်ရန်၊ ရပ်ရန် နှင့် volume ထိန်းချုပ်ခလုတ်များ ပြသပေးသော attribute မှာ မည်သည်နည်း။",
        options: [
          "buttons",
          "controls",
          "player",
          "interfaces"
        ],
        correctOptionIndex: 1,
        explanation: "controls attribute သည် browser ၏ default audio play/pause, position slider နှင့် volume interfaces များကို ချက်ချင်း ပြသပေးသည်။"
      }
    ],
    miniProject: {
      title: "Podcast Embed",
      description: "သင်တန်းတစ်ခု၏ အသံသင်ခန်းစာ ဖွင့်စက် widget လေးတစ်ခု ဖန်တီးပါ။",
      guide: ["ခေါင်းစဉ်၊ podcast description နှင့် <audio> controls ပါဝင်သော layout တည်ဆောက်ပါ။"],
      startingCode: "<div class=\"podcast\">\n  <h3>Lesson 1: Introduction Podcast</h3>\n  <audio controls>\n    <source src=\"intro.mp3\" type=\"audio/mpeg\">\n  </audio>\n</div>"
    },
    learningObjectives: {
      what: "<audio> tag, <source> tag နှင့် controls, loop, autoplay attributes များအကြောင်း လေ့လာရန်။",
      why: "ဝဘ်ဆိုက်ပေါ်တွင် audio assets များကို third-party widgets များမလိုဘဲ တိုက်ရိုက်ထိန်းချုပ် ဖွင့်လှစ်နိုင်ရန်။",
      when: "ဝဘ်ဆိုက်များတွင် နောက်ခံသီချင်း၊ audiobooks နှင့် podcasts များ ထည့်သွင်းသည့်အခါ သုံးသည်။",
      how: "<audio controls> tags အကြား <source> ဖြင့် path နှင့် type သတ်မှတ်ရေးသားခြင်း။"
    },
    myanmarExplanation: "<audio> tag သည် browser ထဲတွင် native media playback engine ကို နှိုးဆော်ပြီး plugins များမလိုဘဲ အသံဖိုင်များကို ချောမွေ့စွာ ဖွင့်ပေးသည်။",
    theory: "HTML5 Multimedia APIs များသည် desktop နှင့် mobile devices များတွင် hardware acceleration ကို အသုံးချပြီး audio files များကို fluidic playback စွမ်းဆောင်ရည်ဖြင့် ဖွင့်လှစ်ပေးသည်။",
    englishKeywords: ["Audio element", "controls attribute", "autoplay", "loop attribute", "source types"],
    stepByStepExplanation: [
      "<audio controls> tag ကို စတင်ပါ။",
      "<source src=\"path.mp3\" type=\"audio/mpeg\"> ကို သတ်မှတ်ပါ။",
      "browser မပံ့ပိုးပါက ပြသရန် fallback text ရေးပါ။"
    ],
    outputPreview: "လှပသော Native Web Audio Player တစ်ခု စာမျက်နှာပေါ်တွင် ပေါ်လာမည်။",
    tips: ["လုံခြုံရေးနှင့် UX စံနှုန်းများအရ browser အများစုသည် သုံးစွဲသူ interaction (click) မရှိဘဲ autoplay လုပ်ခွင့်ကို ပိတ်ပင်ထားတတ်ပါသည်။"],
    assignment: {
      title: "Audio Album Widget",
      description: "သီချင်း ၃ ပုဒ်ပါသော Mini Audio Album ဖန်တီးပါ။",
      instructions: ["သီချင်းအမည်များနှင့် audio controls များ ပါဝင်သော audio list တစ်ခုကို HTML ဖြင့် တည်ဆောက်ပြပါ။"]
    },
    lessonSummary: "<audio> controls tag ကို သုံးပြီး ဝဘ်စာမျက်နှာပေါ်တွင် သီချင်းနှင့် အသံဖိုင်များကို လွယ်ကူစွာ ထည့်သွင်းနိုင်သည်။",
    nextLesson: "HTML Video"
  },
  {
    id: "html-26",
    title: "HTML Video",
    slug: "html-video",
    duration: "20 mins",
    whatIsIt: "HTML Video ဆိုသည်မှာ ဝဘ်စာမျက်နှာပေါ်တွင် YouTube သို့မဟုတ် ပြင်ပ player များမလိုဘဲ ရုပ်ရှင်ဖိုင်များ၊ ဗီဒီယိုလမ်းညွှန်များကို တိုက်ရိုက် ထည့်သွင်းပြသနိုင်သည့် စနစ်ဖြစ်ပါသည်။",
    whyImportant: "ယနေ့ခေတ်တွင် ဗီဒီယိုများသည် ဆက်သွယ်မှုအမြန်ဆုံး မီဒီယာများဖြစ်ရာ ကုန်ပစ္စည်းမိတ်ဆက်များ၊ tutorial များကို ဝဘ်စာမျက်နှာပေါ်တွင် တိုက်ရိုက်ဆွဲဆောင်ပြသနိုင်ပါသည်။",
    realWorldUsage: "Netflix-like streaming ဝဘ်ဆိုက်များ၊ landing pages များရှိ background video loops များနှင့် online class ဗီဒီယို သင်ခန်းစာများတွင် သုံးပါသည်။",
    syntax: `<video width="640" height="360" controls>
  <source src="movie.mp4" type="video/mp4">
  သင့် browser သည် ဗီဒီယိုကို မပံ့ပိုးပါ။
</video>`,
    examples: [
      `<video controls poster="thumbnail.jpg" width="100%">
  <source src="tutorial.mp4" type="video/mp4">
</video>`
    ],
    commonMistakes: [
      {
        mistake: "<video src='video.mp4'> (controls မပါဝင်ခြင်း)",
        correction: "<video src='video.mp4' controls></video>",
        explanation: "controls မပါဝင်ပါက အသုံးပြုသူသည် play/pause လုပ်၍ မရဘဲ ပထမဆုံး frame တွင်သာ ငြိမ်နေပါလိမ့်မည်။"
      }
    ],
    bestPractices: [
      "ဗီဒီယိုမပွင့်ခင် preview အဖြစ် ပြသပေးမည့် poster (thumbnail) attribute ကို သုံးစွဲပါ။",
      "မိုဘိုင်းဖုန်းများတွင် အဆင်ပြေစေရန် width=\"100%\" သို့မဟုတ် responsive classes များ သုံးပါ။"
    ],
    miniExercise: {
      id: "ex-html-26",
      instruction: "controls နှင့် 'clip.mp4' အရင်းအမြစ်ပါဝင်သော width 500px ရှိသည့် video tag တစ်ခု ဖန်တီးပါ။",
      codeTemplate: "<video width=\"500\" controls>\n  <source src=\"clip.mp4\" type=\"video/mp4\">\n</video>",
      expectedOutput: "<video width=\"500\" controls>\n  <source src=\"clip.mp4\" type=\"video/mp4\">\n</video>",
      hints: ["<video> element တွင် width=\"500\" နှင့် controls attribute ထည့်သွင်းပါ။"]
    },
    quiz: [
      {
        id: "q-html-26",
        question: "ဗီဒီယို မကစားမီ မျက်နှာပြင်ပေါ်တွင် preview အဖြစ် ပြသထားမည့် ပုံရိပ်ကို မည်သည့် attribute ဖြင့် သတ်မှတ်သနည်း။",
        options: [
          "preview",
          "poster",
          "thumbnail",
          "src"
        ],
        correctOptionIndex: 1,
        explanation: "poster attribute တွင် ပုံလမ်းကြောင်း ထည့်သွင်းခြင်းဖြင့် ဗီဒီယို play မလုပ်ခင် custom cover image အဖြစ် ပြသပေးနိုင်သည်။"
      }
    ],
    miniProject: {
      title: "Classroom Video Player",
      description: "ခေါင်းစဉ်နှင့် အတန်းသင်ခန်းစာ ဗီဒီယိုပြသခန်းငယ်တစ်ခု တည်ဆောက်ပါ။",
      guide: ["ဗီဒီယိုခေါင်းစဉ်၊ poster cover နှင့် video player controls ပါဝင်အောင် ရေးဆွဲပါ။"],
      startingCode: "<div class=\"video-class\">\n  <h2>HTML Lesson Video</h2>\n  <video controls poster=\"cover.jpg\" width=\"400\">\n    <source src=\"lesson.mp4\" type=\"video/mp4\">\n  </video>\n</div>"
    },
    learningObjectives: {
      what: "<video> tag, poster, muted, play, controls များနှင့် multi-format support အကြောင်း လေ့လာရန်။",
      why: "ဝဘ်စာမျက်နှာများကို multimedia experience အပြည့်အဝရရှိစေရန် ဗီဒီယိုဖြင့် အလှဆင် တည်ဆောက်တတ်စေရန်။",
      when: "ကုန်ပစ္စည်းသရုပ်ပြသမှု၊ နောက်ခံဗီဒီယို loops များနှင့် တရားဝင် သင်တန်းများ တည်ဆောက်သည့်အခါ သုံးသည်။",
      how: "<video controls poster=\"...\"> tag အား <source> ဖြင့် ပေါင်းစပ်အသုံးပြုခြင်း။"
    },
    myanmarExplanation: "<video> tag သည် external browser plugins (Flash player စသည်) မလိုဘဲ ဗီဒီယိုဖိုင်များကို HTML5 စံနှုန်းအဖြစ် တိုက်ရိုက်ချောမွေ့စွာ ဖွင့်ပေးနိုင်သည်။",
    theory: "HTML5 video element သည် user-agents များအား hardware acceleration အသုံးချစေပြီး video frames များကို layout engine အတွင်း dynamic graphics အဖြစ် pixel coordinate ညှိကာ render လုပ်ပေးသည်။",
    englishKeywords: ["Video element", "poster attribute", "muted attribute", "hardware acceleration", "native player"],
    stepByStepExplanation: [
      "<video controls poster=\"...\"> tag ကို တည်ဆောက်ပါ။",
      "အတွင်း၌ <source> tag ဖြင့် သက်ဆိုင်ရာ MP4 သို့မဟုတ် WebM format ဖိုင်ကို သတ်မှတ်ပါ။",
      "ဗီဒီယို စတင်ရန် player ကို preview စမ်းသပ်ပါ။"
    ],
    outputPreview: "သတ်မှတ်ထားသော poster thumbnail ဖြင့် ခမ်းနားသော ဗီဒီယိုဖွင့်စက် ပေါ်လာမည်။",
    tips: ["landing pages များရှိ background video loop အတွက် 'autoplay loop muted playsinline' attributes များကို သုံးစွဲပါ။"],
    assignment: {
      title: "Hero Background Video Section",
      description: "အလိုအလျောက် ပတ်လည်လည်မည့် နောက်ခံ ဗီဒီယို section တစ်ခု ဖန်တီးပါ။",
      instructions: ["controls မပါဝင်ဘဲ auto-loop ဖြစ်နေမည့် muted background video wrapper ကို ရေးသားပါ။"]
    },
    lessonSummary: "<video> tag ကို အသုံးပြု၍ poster, width, height နှင့် play controls များဖြင့် ဗီဒီယိုများကို native ကျစွာ ထည့်သွင်းနိုင်သည်။",
    nextLesson: "Unordered Lists"
  },
  {
    id: "html-27",
    title: "Unordered Lists",
    slug: "html-unordered-lists",
    duration: "15 mins",
    whatIsIt: "Unordered Lists ဆိုသည်မှာ အစီအစဉ်အမှတ်စဉ် (၁၊ ၂၊ ၃) မလိုအပ်ဘဲ အချက်အလက်များကို အစက်ကလေးများ (Bullet points) ဖြင့် စုစည်းပြသပေးသည့် စာရင်းပုံစံ ဖြစ်ပါသည်။",
    whyImportant: "ဝဘ်ဆိုက်၏ navigation bar menu ခလုတ်များ၊ Feature စာရင်းများ သို့မဟုတ် tasks များအား စနစ်တကျ စုစည်းပြသရန် အလွန်အသုံးဝင်ပါသည်။",
    realWorldUsage: "ဝဘ်ဆိုက် header ရှိ Navbar menus (Home, About, Services, Contact) များကို unordered lists ဖြင့် အခြေခံ ရေးသားလေ့ရှိပါသည်။",
    syntax: `<ul>
  <li>ပထမအချက်</li>
  <li>ဒုတိယအချက်</li>
</ul>`,
    examples: [
      `<ul>\n  <li>HTML5</li>\n  <li>CSS3</li>\n  <li>JavaScript</li>\n</ul>`
    ],
    commonMistakes: [
      {
        mistake: "<ul>Item 1</li>",
        correction: "<ul>\n  <li>Item 1</li>\n</ul>",
        explanation: "<ul> tag ရဲ့ အတွင်းထဲမှာ ရှိသော list items အားလုံးကို <li> tag ဖြင့် မဖြစ်မနေ အုပ်ပေးရပါမည်။ <ul> အောက်တွင် စာသားတိုက်ရိုက် ရေးခွင့်မရှိပါ။"
      }
    ],
    bestPractices: [
      "Semantic HTML စံနှုန်းအရ List items များကို အမြဲတမ်း <ul> သို့မဟုတ် <ol> အတွင်း၌သာ ကပ်လျက် ထည့်သွင်းပါ။"
    ],
    miniExercise: {
      id: "ex-html-27",
      instruction: "ul နှင့် li tags သုံးပြီး 'Coffee' နှင့် 'Tea' ပါဝင်သော unordered list တစ်ခု ရေးသားပါ။",
      codeTemplate: "<ul>\n  <li>Coffee</li>\n  <li>Tea</li>\n</ul>",
      expectedOutput: "<ul>\n  <li>Coffee</li>\n  <li>Tea</li>\n</ul>",
      hints: ["<ul> block အတွင်း၌ <li> element နှစ်ခု ထည့်သွင်းပေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-27",
        question: "HTML တွင် bullet point (အစက်လေးများ) ဖြင့် စတင်သော အစီအစဉ်မရှိ စာရင်းတစ်ခု ဖန်တီးရန် မည်သည့် tag ကို သုံးရသနည်း။",
        options: [
          "<ol>",
          "<ul>",
          "<list>",
          "<dl>"
        ],
        correctOptionIndex: 1,
        explanation: "<ul> (Unordered List) tag သည် bullet points များဖြင့် item list များကို တည်ဆောက်ရန် သုံးစွဲသည်။"
      }
    ],
    miniProject: {
      title: "Menu Navigator",
      description: "ဝဘ်ဆိုက် Navbar အတွက် အခြေခံ links list တစ်ခု ဖန်တီးပါ။",
      guide: ["<ul> နှင့် <li> များကို သုံးပြီး links <a> များကို nested ပုံစံဖြင့် ထည့်သွင်းပါ။"],
      startingCode: "<ul>\n  <li><a href=\"#home\">Home</a></li>\n  <li><a href=\"#about\">About</a></li>\n</ul>"
    },
    learningObjectives: {
      what: "<ul> နှင့် <li> tags တို့၏ ဆက်စပ်ပုံ၊ nesting rules များကို လေ့လာရန်။",
      why: "အချက်အလက်များကို အစဉ်လိုက်မဟုတ်ဘဲ သပ်ရပ်စွာ အပိုင်းလိုက် ခွဲခြားပြသတတ်ရန်။",
      when: "Feature lists, Navigation bars, lists of related articles များ တည်ဆောက်သည့်အခါ သုံးသည်။",
      how: "<ul> list container အတွင်း <li> items များ ထည့်သွင်းခြင်း။"
    },
    myanmarExplanation: "<ul> tag သည် list processing container ဖြစ်ပြီး ၎င်းအတွင်းရှိ <li> (List Item) တစ်ခုချင်းစီကို browser မှ custom bullet style icon ဖြင့် bullet point စာကြောင်းများအဖြစ် ထုတ်ပြပေးသည်။",
    theory: "Unordered list formatting သည် lists items များကို indentation (အတွင်းသို့ တန်းရွှေ့ခြင်း) ပြုလုပ်ပြီး typography layout အား bullet markers များဖြင့် ဖွဲ့စည်းပေးသည်။",
    englishKeywords: ["Unordered List", "List Item", "ul element", "Bullet Mark", "Nesting Lists"],
    stepByStepExplanation: [
      "<ul> tag ကို စတင်ရေးပါ။",
      "အတွင်းတွင် <li> tags များကို ရေးသားပြီး list content များထည့်ပါ။",
      "</ul> ပိတ် tag ဖြင့် list container အား အပြီးသတ်ပါ။"
    ],
    outputPreview: "- Coffee\n- Tea (အရှေ့တွင် အဝိုင်းစက်ကလေးများဖြင့် ပြသမည်)",
    tips: ["CSS list-style-type ပစ္စည်းကို သုံးပြီး bullet circles များကို square သို့မဟုတ် disc ပုံစံ ပြောင်းလဲနိုင်ပါသည်။"],
    assignment: {
      title: "Tech Stack Checklist",
      description: "သင်လေ့လာလိုသော နည်းပညာများ စာရင်း ပြုစုပါ။",
      instructions: ["အနည်းဆုံး နည်းပညာ ၄ ခုပါဝင်သော စာရင်းတစ်ခုကို unordered list သုံးပြီး ဖန်တီးပါ။"]
    },
    lessonSummary: "<ul> tag သည် li tags များနှင့် တွဲဖက်ကာ အချက်အလက်များအား အစီအစဉ်မရှိ သေသပ်စွာ bullet များဖြင့် ပြသပေးသည်။",
    nextLesson: "Ordered Lists"
  },
  {
    id: "html-28",
    title: "Ordered Lists",
    slug: "html-ordered-lists",
    duration: "15 mins",
    whatIsIt: "Ordered Lists ဆိုသည်မှာ အချက်အလက်များကို အမှတ်စဉ် (၁၊ ၂၊ ၃) သို့မဟုတ် အက္ခရာစဉ် (A, B, C) စနစ်တကျ နံပါတ်စဉ်များ တပ်ပြီး ပြသပေးသည့် စာရင်းပုံစံ ဖြစ်ပါသည်။",
    whyImportant: "လုပ်ငန်းစဉ် အဆင့်ဆင့် ရှင်းလင်းချက်များ၊ ချက်ပြုတ်နည်း ညွှန်ကြားချက်များ သို့မဟုတ် အဆင့်သတ်မှတ်ချက် (Rankings) များကို ဖော်ပြရန် အလွန်သင့်လျော်ပါသည်။",
    realWorldUsage: "ချက်ပြုတ်နည်း လမ်းညွှန် ဝဘ်ဆိုက်များရှိ 'ပြုလုပ်ပုံ အဆင့်ဆင့်' နှင့် အွန်လိုင်း စာမေးပွဲ ရလဒ်ဇယား Leaderboards များတွင် သုံးပါသည်။",
    syntax: `<ol>
  <li>ပထမအဆင့်</li>
  <li>ဒုတိယအဆင့်</li>
</ol>`,
    examples: [
      `<ol type="A">
  <li>Start coding HTML</li>
  <li>Apply CSS Styling</li>
</ol>`
    ],
    commonMistakes: [
      {
        mistake: "<ol><li>1. Item</li></ol>",
        correction: "<ol><li>Item</li></ol>",
        explanation: "Ordered list tag <ol> သည် နံပါတ်စဉ်များကို အလိုအလျောက် သတ်မှတ်ပေးသဖြင့် <li> အတွင်း၌ နံပါတ် (1., 2.) ကို ကိုယ်တိုင် ရေးသားထည့်သွင်းရန် မလိုပါ။"
      }
    ],
    bestPractices: [
      "type attribute ('1', 'a', 'A', 'i', 'I') အား အသုံးပြုပြီး နံပါတ်စဉ် အမျိုးအစားကို လွယ်ကူစွာ သတ်မှတ်ပြောင်းလဲပါ။"
    ],
    miniExercise: {
      id: "ex-html-28",
      instruction: "ol နှင့် li tags သုံးပြီး 'HTML', 'CSS' ပါဝင်သော ordered list တစ်ခု ရေးသားပါ။",
      codeTemplate: "<ol>\n  <li>HTML</li>\n  <li>CSS</li>\n</ol>",
      expectedOutput: "<ol>\n  <li>HTML</li>\n  <li>CSS</li>\n</ol>",
      hints: ["<ol> block အတွင်း၌ <li> tags နှစ်ခု ရေးထည့်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-28",
        question: "ordered list (<ol>) တွင် ရောမဂဏန်းအသေး (i, ii, iii) များဖြင့် နံပါတ်စဉ် တပ်လိုပါက မည်သည့် attribute code ကို သုံးရမည်နည်း။",
        options: [
          'type="i"',
          'type="1"',
          'type="a"',
          'style="roman"'
        ],
        correctOptionIndex: 0,
        explanation: 'type="i" attribute သည် ရောမနံပါတ်စဉ် အသေးများ (i, ii, iii) ကို list items များတွင် အလိုအလျောက် တပ်ဆင်ပေးသည်။'
      }
    ],
    miniProject: {
      title: "Recipe Stepper",
      description: "ကော်ဖီဖျော်နည်း အဆင့်ဆင့် လမ်းညွှန်ချက်တစ်ခု ရေးသားပါ။",
      guide: ["<ol> ကို သုံးပြီး အဆင့် ၃ ဆင့်ဖြင့် ရှင်းလင်းစွာ ရေးဆွဲပါ။"],
      startingCode: "<ol>\n  <li>Add coffee powder to cup.</li>\n  <li>Pour hot water.</li>\n  <li>Stir well.</li>\n</ol>"
    },
    learningObjectives: {
      what: "<ol> tag, type, start attributes များနှင့် auto-numbering concept အား နားလည်ရန်။",
      why: "အစဉ်လိုက် အဆင့်ဆင့် လုပ်ဆောင်ရမည့် လုပ်ငန်းစဉ်များကို စနစ်တကျ စုစည်းတင်ပြတတ်စေရန်။",
      when: "ချက်နည်းပြုတ်နည်းများ၊ Tutorial အဆင့်များ၊ Rank lists ဖော်ပြရာတွင် သုံးသည်။",
      how: "<ol> list container အတွင်း <li> tags များ ထည့်သွင်းအသုံးပြုခြင်း။"
    },
    myanmarExplanation: "<ol> tag သည် list marker layout အား နံပါတ်စဉ်အလိုက် အလိုအလျောက် incrementing တိုးပြီး items စာရင်းကို အစီအစဉ်တကျ display လုပ်ဆောင်ပေးသည်။",
    theory: "Ordered items rendering သည် markup parser မှ marker counter scope တန်ဖိုးအား index အလိုက် တွက်ချက်ကာ dynamic number strings များ ထုတ်ပေးခြင်း ဖြစ်သည်။",
    englishKeywords: ["Ordered List", "ol element", "type attribute", "start attribute", "Auto Numbering"],
    stepByStepExplanation: [
      "<ol> container tag ကို ကြေညာပါ။",
      "အတွင်း၌ li items များ တစ်ခုချင်းစီ ရေးသားပါ။",
      "</ol> ဖြင့် ပိတ်သိမ်းပါ။"
    ],
    outputPreview: "1. HTML\n2. CSS (အရှေ့တွင် နံပါတ်စဉ်များဖြင့် သေသပ်စွာ ပြသမည်)",
    tips: ["start=\"5\" attribute သုံးပြီး နံပါတ် ၅ မှ စတင်ရေတွက်စေရန် ပြောင်းလဲနိုင်ပါသည်။"],
    assignment: {
      title: "Daily Morning Routine",
      description: "မနက်ခင်း လုပ်ငန်းစဉ် ၄ ဆင့်ကို ရေးသားပါ။",
      instructions: ["<ol type='I'> (ရောမအက္ခရာကြီး) သုံးပြီး မနက်ခင်း လုပ်ငန်းစဉ်ကို နံပါတ်စဉ်တပ်ပြပါ။"]
    },
    lessonSummary: "<ol> tag သည် အချက်အလက်များအား အလိုအလျောက် နံပါတ်စဉ်များတပ်ပြီး စနစ်တကျ အစီအစဉ်လိုက် ပြသပေးသည်။",
    nextLesson: "Description Lists"
  },
  {
    id: "html-29",
    title: "Description Lists",
    slug: "html-description-lists",
    duration: "15 mins",
    whatIsIt: "Description Lists (ယခင် Definition Lists) ဆိုသည်မှာ စကားလုံး ဝေါဟာရ တစ်ခုနှင့် ၎င်း၏ အဓိပ္ပာယ် ဖွင့်ဆိုချက်များကို တွဲဖက်ပြီး ပြသပေးသည့် ထူးခြားသော စာရင်းပုံစံ ဖြစ်ပါသည်။",
    whyImportant: "အဘိဓာန်များ၊ Glossary (ဝေါဟာရစုဆောင်းမှုများ) သို့မဟုတ် metadata တန်ဖိုးများ (ဥပမာ- စာအုပ်အမည် - ရေးသူ) တို့ကို ရှင်းလင်းစွာ ဖော်ပြရန် သုံးပါသည်။",
    realWorldUsage: "ဝဘ်ဆိုက် FAQ (မေးလေ့ရှိသော မေးခွန်းများ) စာမျက်နှာတွင် မေးခွန်းနှင့် အဖြေများကို အမေးအဖြေအတွဲလိုက် တည်ဆောက်ပြသရာတွင် သုံးပါသည်။",
    syntax: `<dl>
  <dt>စကားလုံး</dt>
  <dd>၎င်း၏ အဓိပ္ပာယ် ရှင်းလင်းချက်</dd>
</dl>`,
    examples: [
      `<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language</dd>
</dl>`
    ],
    commonMistakes: [
      {
        mistake: "<dl><dt>HTML</dt><dt>CSS</dt></dl>",
        correction: "<dl><dt>HTML</dt><dd>Markup language</dd></dl>",
        explanation: "<dt> (Description Term) ရှိပြီးပါက ၎င်းနှင့်တွဲဖက်ရန် ရှင်းလင်းချက် <dd> (Description Details) မဖြစ်မနေ ပါဝင်ရပါမည်။"
      }
    ],
    bestPractices: [
      "ဝေါဟာရတစ်ခုတည်းအတွက် ရှင်းလင်းချက် <dd> tag အများအပြား တွဲသုံးနိုင်ကြောင်း သတိရပါ။"
    ],
    miniExercise: {
      id: "ex-html-29",
      instruction: "dl, dt, dd သုံးပြီး 'Coffee' ဟူသော term နှင့် 'Hot black beverage' ဟူသော detailအတွဲကို ရေးသားပါ။",
      codeTemplate: "<dl>\n  <dt>Coffee</dt>\n  <dd>Hot black beverage</dd>\n</dl>",
      expectedOutput: "<dl>\n  <dt>Coffee</dt>\n  <dd>Hot black beverage</dd>\n</dl>",
      hints: ["dl အတွင်း၌ dt (term) နှင့် dd (details) အတွဲကို ရေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-29",
        question: "HTML description lists တွင် ဖွင့်ဆိုမည့် စကားလုံး သို့မဟုတ် Term အတွက် မည်သည့် tag ကို သုံးသနည်း။",
        options: [
          "<dl>",
          "<dd>",
          "<dt>",
          "<term>"
        ],
        correctOptionIndex: 2,
        explanation: "<dt> (Description Term) tag သည် ဖွင့်ဆိုချက်ပေးမည့် စကားလုံးခေါင်းစဉ်ကို သတ်မှတ်သည်။"
      }
    ],
    miniProject: {
      title: "Vocabulary Hub",
      description: "အခြေခံ နည်းပညာဝေါဟာရ ဖွင့်ဆိုချက် Glossary စာမျက်နှာတစ်ခု ဖန်တီးပါ။",
      guide: ["HTML, CSS နှင့် JS တို့ကို dt, dd တွဲဖက်ပြီး dl wrapper ဖြင့် စနစ်တကျ စုစည်းပါ။"],
      startingCode: "<dl>\n  <dt>HTML</dt>\n  <dd>Defines web skeleton.</dd>\n  <dt>CSS</dt>\n  <dd>Designs web style.</dd>\n</dl>"
    },
    learningObjectives: {
      what: "<dl>, <dt>, <dd> tags များ၏ ဆက်စပ်တည်ဆောက်ပုံနှင့် semantic usage ကို လေ့လာရန်။",
      why: "ဝေါဟာရအတွဲလိုက်များ သို့မဟုတ် FAQ key-value pairs များကို browser အား ရှင်းလင်းစွာ သိရှိစေရန်။",
      when: "ဝဘ်ဆိုက် Glossary၊ ဝေါဟာရဖွင့်ဆိုချက်များနှင့် FAQs များ ရေးဆွဲသည့်အခါ သုံးသည်။",
      how: "<dl> wrapper အတွင်း <dt> နှင့် <dd> tags အတွဲလိုက်များကို ထည့်သွင်းခြင်း။"
    },
    myanmarExplanation: "<dl> သည် description list layout ကို စတင်ပြီး၊ <dt> (Term) နှင့် <dd> (Details) တွဲလုံးများကို သုံးကာ browser က dd စာသားအား indentation တစ်ဆင့် ခြားပြီး သပ်ရပ်စွာ ပြသပေးသည်။",
    theory: "Description list processing သည် web layouts တွင် metadata structure သို့မဟုတ် dictionary terms formatting အတွက် standard model တစ်ခုအဖြစ် သတ်မှတ်ထားသည်။",
    englishKeywords: ["Description List", "dl element", "Description Term", "Description Detail", "Glossary Layout"],
    stepByStepExplanation: [
      "<dl> tag ဖွင့်ပါ။",
      "<dt> tag ဖြင့် စကားလုံး သတ်မှတ်ပါ။",
      "<dd> tag ဖြင့် အဓိပ္ပာယ် ရှင်းလင်းချက်ကို indent ပုံစံဖြင့် ထည့်သွင်းပါ။",
      "</dl> ဖြင့် ပိတ်သိမ်းပါ။"
    ],
    outputPreview: "Coffee\n   Hot black beverage (ရှင်းလင်းချက်အား အတွင်းသို့ အနည်းငယ် ချန်၍ ပြသမည်)",
    tips: ["FAQ (မေးခွန်းနှင့် အဖြေ) အမေးအဖြေများကို display ပြသရန်လည်း ဤ tag စနစ်သည် အလွန်ကောင်းမွန်ပါသည်။"],
    assignment: {
      title: "Tech Glossary Guide",
      description: "နည်းပညာ glossary အသေးစား ၃ ခု အတွဲလိုက် ရေးဆွဲပါ။",
      instructions: ["Frontend, Backend, Database စကားလုံး ၃ ခုအား ၎င်းတို့၏ တိုတိုရှင်းရှင်း ဖွင့်ဆိုချက်များနှင့် dl layout တည်ဆောက်ပြပါ။"]
    },
    lessonSummary: "Description lists (dl, dt, dd) များသည် စကားလုံးနှင့် ဖွင့်ဆိုချက်အတွဲလိုက်များကို သပ်ရပ်လှပစွာ နေရာချပြသပေးသည်။",
    nextLesson: "Basic HTML Tables"
  },
  {
    id: "html-30",
    title: "Basic HTML Tables",
    slug: "html-basic-tables",
    duration: "20 mins",
    whatIsIt: "Basic HTML Tables ဆိုသည်မှာ အချက်အလက်များ၊ စာရင်းဇယားများကို အတန်းလိုက် (Rows) နှင့် ကော်လံလိုက် (Columns) အကွက်များဖြင့် စနစ်တကျ ဖွဲ့စည်းပြသပေးသည့် ဇယားစနစ် ဖြစ်ပါသည်။",
    whyImportant: "ငွေစာရင်းဇယားများ၊ အတန်းအချိန်ဇယားများနှင့် နှိုင်းယှဉ်ချက်အချက်အလက်များကို လူတစ်ယောက်ချင်းစီ နားလည်လွယ်စေရန် စနစ်တကျ နေရာချပေးသည်။",
    realWorldUsage: "E-commerce ဝဘ်ဆိုက်များရှိ ဈေးနှုန်းနှိုင်းယှဉ်ချက်ဇယားများ၊ ကျောင်းဝဘ်ဆိုက်ရှိ အတန်းအချိန်ဇယားများတွင် သုံးပါသည်။",
    syntax: `<table>
  <tr>
    <td>အကွက် ၁</td>
    <td>အကွက် ၂</td>
  </tr>
</table>`,
    examples: [
      `<table>
  <tr>
    <th>Item</th>
    <th>Price</th>
  </tr>
  <tr>
    <td>Apple</td>
    <td>$1.00</td>
  </tr>
</table>`
    ],
    commonMistakes: [
      {
        mistake: "<table><td>Data 1</td></tr>",
        correction: "<table>\n  <tr>\n    <td>Data 1</td>\n  </tr>\n</table>",
        explanation: "ဇယားကုဒ်ရေးရာတွင် table row <tr> wrapper မရှိဘဲ data cell <td> ကို တိုက်ရိုက် မရေးရပါ။ အမြဲတမ်း table rows (tr) များ အတွင်း၌သာ cells (td) ကို ထည့်သွင်းရပါမည်။"
      }
    ],
    bestPractices: [
      "ခေါင်းစဉ်အကွက်များအတွက် <td> အစား စာလုံးအထူဖြင့် အလယ်ဗဟိုကျသော <th> (Table Header) ကို သုံးစွဲပါ။"
    ],
    miniExercise: {
      id: "ex-html-30",
      instruction: "table, tr, td သုံးပြီး အတန်းတစ်တန်းအတွင်း 'A1' နှင့် 'B1' ပါဝင်သော basic table တစ်ခု ဆောက်ပါ။",
      codeTemplate: "<table>\n  <tr>\n    <td>A1</td>\n    <td>B1</td>\n  </tr>\n</table>",
      expectedOutput: "<table>\n  <tr>\n    <td>A1</td>\n    <td>B1</td>\n  </tr>\n</table>",
      hints: ["<table> အတွင်း၌ <tr> တစ်ခုနှင့် ၎င်းအတွင်း <td> နှစ်ခု ထည့်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-30",
        question: "HTML table တွင် data cell (အတန်းတစ်ခုအတွင်းရှိ အကွက်ငယ်) တစ်ခုကို သတ်မှတ်ရန် မည်သည့် tag ကို သုံးသနည်း။",
        options: [
          "<tr>",
          "<td>",
          "<th>",
          "<cell>"
        ],
        correctOptionIndex: 1,
        explanation: "<td> (Table Data) tag သည် table block အတွင်း standard cell အကွက်များ ဖန်တီးရန် သုံးစွဲသည်။"
      }
    ],
    miniProject: {
      title: "Student Score Board",
      description: "ကျောင်းသား ၂ ဦး၏ ရမှတ်ပြ ဇယားအသေးစားတစ်ခု ဖန်တီးပါ။",
      guide: ["Name, Subject, Score ခေါင်းစဉ်များ (th) နှင့် tr/td များကို စနစ်တကျ စုစည်းပါ။"],
      startingCode: "<table>\n  <tr>\n    <th>Name</th>\n    <th>Score</th>\n  </tr>\n  <tr>\n    <td>Min Min</td>\n    <td>95</td>\n  </tr>\n</table>"
    },
    learningObjectives: {
      what: "<table>, <tr>, <td>, <th> tags များ၏ ဆက်စပ်ပုံနှင့် HTML layout mechanics အား နားလည်ရန်။",
      why: "ဝဘ်စာမျက်နှာပေါ်တွင် structured tabular data များကို သပ်ရပ်စွာ ပုံဖော်ပေးနိုင်ရန်။",
      when: "အချိန်ဇယားများ၊ စာရင်းအင်းများနှင့် နှိုင်းယှဉ်ချက်ဇယားများ ရေးဆွဲသည့်အခါ သုံးသည်။",
      how: "<table> element ထဲတွင် <tr> များဖြင့် အတန်းဆောက်ပြီး <th>/<td> ဖြင့် အကွက်များ ထည့်သွင်းခြင်း။"
    },
    myanmarExplanation: "<table> tag သည် tabular grid ကို စတင်ဆောက်လုပ်ပြီး၊ <tr> သည် အလျားလိုက်အတန်းများကို ဖန်တီးကာ <td>/<th> များသည် အကွက်များကို အလျားလိုက် columns အတွင်း ပိုင်းခြားပေးသည်။",
    theory: "HTML Table formatting model သည် tabular layout cells တန်ဖိုးများကို dynamic widths တွက်ချက်ကာ dynamic structural alignment ဖြင့် အကွက်ချပေးသည်။",
    englishKeywords: ["Table layout", "Table row", "Table data", "Table header", "Tabular structures"],
    stepByStepExplanation: [
      "<table> wrapper tag ရေးပါ။",
      "<tr> ဖြင့် အတန်းတစ်ခု သတ်မှတ်ပါ။",
      "အတွင်း၌ <th> (ခေါင်းစဉ်) သို့မဟုတ် <td> (ဒေတာ) cells များ စုစည်းထည့်သွင်းပါ။",
      "</table> ဖြင့် ပိတ်သိမ်းပါ။"
    ],
    outputPreview: "သေသပ်သော rows & columns ဖြင့် စာရင်းဇယားတစ်ခု ထွက်လာမည်။",
    tips: ["ဇယားဘောင်များ ထင်ထင်ရှားရှား ပေါ်စေရန် CSS တွင် border properties ကို သုံးစွဲရပါမည်။"],
    assignment: {
      title: "Sales Report Table",
      description: "ထုတ်ကုန်ပစ္စည်း ရောင်းအားပြ ဇယားတစ်ခု တည်ဆောက်ပါ။",
      instructions: ["Product, Qty, Price ခေါင်းစဉ်များပါဝင်သော အတန်း ၃ တန်းရှိ အရောင်းဇယားကို HTML သက်သက်ဖြင့် ရေးသားတင်ပြပါ။"]
    },
    lessonSummary: "<table> tag သည် data များကို အတန်းနှင့် ကော်လံပုံစံဖြင့် စနစ်တကျ နေရာချရန် tr, th, td tags များနှင့် ပေါင်းစပ်အလုပ်လုပ်သည်။",
    nextLesson: "Table Headers & Spacing"
  },
  {
    id: "html-31",
    title: "Table Headers & Spacing",
    slug: "html-table-headers-spacing",
    duration: "15 mins",
    whatIsIt: "Table Headers & Spacing ဆိုသည်မှာ ဇယား၏ ခေါင်းစဉ်အကွက်များ (<th>) ကို အသုံးပြု၍ ဒေတာများကို ပိုမိုထင်ရှားစေပြီး ဇယားအကွက်များ၏ နေရာလွတ် အကွာအဝေးကို ညှိနှိုင်းစီမံခြင်း ဖြစ်ပါသည်။",
    whyImportant: "ဇယားတစ်ခုအား ကြည့်ရှုသူသည် မည်သည့်အကွက်သည် ခေါင်းစဉ်ဖြစ်ပြီး မည်သည့်အကွက်သည် ဒေတာဖြစ်ကြောင်း ချက်ချင်းမျက်စိဖြင့် ခွဲခြားသိရှိနိုင်စေရန် ကူညီပေးပါသည်။",
    realWorldUsage: "ကုမ္ပဏီ ဝန်ထမ်းအချက်အလက် ဇယားများတွင် ထိပ်ဆုံးတန်းအား <th> သုံး၍ စာလုံးမည်းအထူဖြင့် အလယ်ဗဟိုကျကျ ပေါ်လွင်အောင် ရေးသားခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<table>
  <tr>
    <th>Header Column 1</th>
    <th>Header Column 2</th>
  </tr>
</table>`,
    examples: [
      `<table>\n  <tr>\n    <th>Name</th>\n    <th>Role</th>\n  </tr>\n</table>`
    ],
    commonMistakes: [
      {
        mistake: "<td> ကို သုံးပြီး header စာသားအား <b> tag ဖြင့် ကိုယ်တိုင် စာလုံးမည်းလိုက်ရေးခြင်း။",
        correction: "ခေါင်းစဉ်အကွက်များအတွက် စံသတ်မှတ်ချက် <th> tag ကို တိုက်ရိုက် ပြောင်းလဲ သုံးစွဲပါ။",
        explanation: "<th> သည် semantic element ဖြစ်ပြီး browser နှင့် search engine များအား ခေါင်းစဉ်အဖြစ် ကောင်းစွာ သိရှိစေသဖြင့် screen readers များအတွက်လည်း ဖတ်ကြားရန် ပိုမိုလွယ်ကူစေသည်။"
      }
    ],
    bestPractices: [
      "ဇယားခေါင်းစဉ်များတွင် text alignment နှင့် visibility ကောင်းမွန်စေရန် <th> tag ကို စနစ်တကျ သုံးပါ။"
    ],
    miniExercise: {
      id: "ex-html-31",
      instruction: "<th> tag ကို သုံးပြီး 'Product Name' ဟူသော header cell တစ်ခု တည်ဆောက်ပါ။",
      codeTemplate: "<th>Product Name</th>",
      expectedOutput: "<th>Product Name</th>",
      hints: ["<th> element ကို ဖွင့်ပြီး ပိတ်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-31",
        question: "HTML Table row အတွင်းရှိ ခေါင်းစဉ်ဆဲလ် (Header Cell) တစ်ခုကို သတ်မှတ်ရန် မည်သည့် tag ကို သုံးသနည်း။",
        options: [
          "<head>",
          "<td>",
          "<th>",
          "<theader>"
        ],
        correctOptionIndex: 2,
        explanation: "<th> (Table Header) tag သည် table headers များကို default အနေဖြင့် စာလုံးအထူနှင့် alignment center ဖြင့် ပြသပေးသည်။"
      }
    ],
    miniProject: {
      title: "Menu Price Guide",
      description: "စားသောက်ဆိုင်မီနူး ဈေးနှုန်းပြ ဇယားတစ်ခု ဖန်တီးပါ။",
      guide: ["Item, Category, Price ဟူသော th ခေါင်းစဉ်များ ပါဝင်သော ဇယားကို ဆောက်ပါ။"],
      startingCode: "<table>\n  <tr>\n    <th>Dish Name</th>\n    <th>Price</th>\n  </tr>\n  <tr>\n    <td>Fried Rice</td>\n    <td>$3.50</td>\n  </tr>\n</table>"
    },
    learningObjectives: {
      what: "<th> tag ၏ usage နှင့် semantic table layers များအကြောင်း လေ့လာရန်။",
      why: "ဇယား၏ semantic structure ကို ကောင်းမွန်စေပြီး visual representation တိုးတက်စေရန်။",
      when: "ဇယား၏ ကော်လံခေါင်းစဉ်များ သို့မဟုတ် တန်းခေါင်းစဉ်များကို သတ်မှတ်ရာတွင် သုံးသည်။",
      how: "<tr> block အတွင်း <td> အစား <th> ကို ရေးသားအသုံးပြုခြင်း။"
    },
    myanmarExplanation: "<th> tag သည် cell content အား default formatting စာလုံးအထူ ပြုလုပ်ပေးပြီး ၎င်းအကွက်သည် အောက်ပါ data များကို ကိုယ်စားပြုသော tag ခေါင်းစဉ် ဖြစ်ကြောင်း browser အား အသိပေးသည်။",
    theory: "HTML5 tables structure တွင် <th> Element သည် table column scope သို့မဟုတ် row scope metadata နှင့် dynamic accessibility layers များကို ချိတ်ဆက်ပေးသည်။",
    englishKeywords: ["Table Header", "th element", "Column Header", "Tabular Semantics", "Text Alignment"],
    stepByStepExplanation: [
      "<table> element တည်ဆောက်ပါ။",
      "ပထမဆုံး <tr> ထဲတွင် <th> tags များသုံး၍ ကော်လံခေါင်းစဉ်များ ထည့်သွင်းပါ။"
    ],
    outputPreview: "စာလုံးမည်းအထူဖြင့် အလယ်ဗဟိုကျသော ခေါင်းစဉ်ပါ ဇယားကွက် ပေါ်လာမည်။",
    tips: ["ဇယား spacing ကို သပ်ရပ်စေရန် CSS padding attribute ကို table cells တွင် အသုံးပြုပါ။"],
    assignment: {
      title: "Employee Directory Header",
      description: "ဝန်ထမ်းအမည်စာရင်း ဇယားထိပ်စီး section ကို ရေးဆွဲပါ။",
      instructions: ["ID, Name, Email, Department စသည့် columns <th> ၄ ခုပါဝင်သော row တစ်ခုအား ရေးသားပြပါ။"]
    },
    lessonSummary: "<th> tag သည် table heading ဆဲလ်များကို စာလုံးအထူ၊ alignment center ဖြင့် semantic ကျစွာ ပုံဖော်ဖန်တီးပေးသည်။",
    nextLesson: "Table Colspan & Rowspan"
  },
  {
    id: "html-32",
    title: "Table Colspan & Rowspan",
    slug: "html-table-colspan-rowspan",
    duration: "20 mins",
    whatIsIt: "Table Colspan & Rowspan ဆိုသည်မှာ ဇယားကွက်အချင်းချင်း ပေါင်းစပ်ပြီး ကော်လံများစွာ (Colspan) သို့မဟုတ် အတန်းများစွာ (Rowspan) ကို အကွက်တစ်ခုတည်းအဖြစ် ပေါင်းစည်းပြသသည့် စနစ်ဖြစ်ပါသည်။",
    whyImportant: "ရှုပ်ထွေးသော ဇယားများ၊ ပြက္ခဒိန်များ သို့မဟုတ် ဘတ်ဂျက်ဇယားများတွင် တူညီသောအမျိုးအစားများကို တစ်ကွက်တည်းအဖြစ် လှပသပ်ရပ်စွာ ပေါင်းစပ်ရန် မရှိမဖြစ် လိုအပ်ပါသည်။",
    realWorldUsage: "ကျောင်းအချိန်ဇယားတွင် 'နေ့လည်စာ နားချိန်' ကဲ့သို့ ကော်လံအားလုံး ပေါင်းစည်းထားသော အကွက်ရှည်ကြီး တည်ဆောက်ရာတွင် သုံးပါသည်။",
    syntax: `<!-- ကော်လံ ၂ ခုကို ၁ ကွက်တည်းအဖြစ် ပေါင်းခြင်း -->
<td colspan="2">ပေါင်းစပ်အကွက်</td>`,
    examples: [
      `<tr>
  <td colspan="3">Total Summary Row</td>
</tr>`,
      `<tr>
  <td rowspan="2">Group A</td>
  <td>Member 1</td>
</tr>`
    ],
    commonMistakes: [
      {
        mistake: "colspan သုံးပြီးနောက် tr အတွင်းရှိ ကျန်ဆဲလ်အရေအတွက်ကို မလျှော့ချဘဲ ဇယားဘောင်အပြင်ဘက်သို့ အကွက်များ ထွက်ကုန်ခြင်း။",
        correction: "colspan သို့မဟုတ် rowspan ဖြင့် ပေါင်းလိုက်သော ဆဲလ်အရေအတွက်အတိုင်း ကျန် cells (td) များကို tr ထဲမှ ဖယ်ထုတ်ပေးပါ။",
        explanation: "colspan='2' သုံးပါက ၎င်းသည် ဆဲလ် ၂ ကွက်စာ နေရာယူသွားသဖြင့် ၎င်းအတန်းအတွင်း ကျန်ရှိသော cells စုစုပေါင်း အရေအတွက်ကို ၁ ကွက် လျှော့ချပေးရမည်။"
      }
    ],
    bestPractices: [
      "colspan နှင့် rowspan တန်ဖိုးများကို တိကျမှန်ကန်စွာ တွက်ချက်ပြီး ဇယားပုံမပျက်စေရန် အထူးဂရုပြုပါ။"
    ],
    miniExercise: {
      id: "ex-html-32",
      instruction: "colspan='2' ပါဝင်သော 'Double Column Cell' td tag တစ်ခု ရေးဆွဲပါ။",
      codeTemplate: "<td colspan=\"2\">Double Column Cell</td>",
      expectedOutput: "<td colspan=\"2\">Double Column Cell</td>",
      hints: ["td element တွင် colspan attribute အား တန်ဖိုး 2 ထည့်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-32",
        question: "ကော်လံ (Columns) ၂ ခု သို့မဟုတ် ထိုထက်မကကို တစ်ကွက်တည်းအဖြစ် ဘေးတိုက် ပေါင်းစည်းရန် မည်သည့် attribute ကို သုံးသနည်း။",
        options: [
          "rowspan",
          "colspan",
          "merge",
          "combine"
        ],
        correctOptionIndex: 1,
        explanation: "colspan attribute (Column Span) သည် ဘေးတိုက် ကော်လံအကွက်များကို အလျားလိုက် ပေါင်းစည်းပေးသည်။"
      }
    ],
    miniProject: {
      title: "Invoice Sheet Generator",
      description: "အောက်ခြေတွင် စုစုပေါင်းပေါင်းလဒ်အား ကော်လံပေါင်းစည်းထားသော ပြေစာဇယားတစ်ခု ဆောက်ပါ။",
      guide: ["Item နှင့် Price ဆဲလ်များဆောက်ပြီး၊ နောက်ဆုံး tr တွင် colspan='2' ဖြင့် total ကို ပြသပါ။"],
      startingCode: "<table>\n  <tr>\n    <th>Item</th>\n    <th>Price</th>\n  </tr>\n  <tr>\n    <td>MacBook</td>\n    <td>$1200</td>\n  </tr>\n  <tr>\n    <td colspan=\"2\">Grand Total: $1200</td>\n  </tr>\n</table>"
    },
    learningObjectives: {
      what: "colspan, rowspan attributes များ၏ ကွာခြားချက်နှင့် grid spanning concept ကို လေ့လာရန်။",
      why: "ရှုပ်ထွေးရှည်လျားသော data sheets များကို သပ်ရပ်စွာ ပေါင်းစပ်နေရာချတတ်စေရန်။",
      when: "ပြက္ခဒိန်ရက်များ၊ အချိန်ဇယားများ၊ Invoice total rows များ ရေးဆွဲသည့်အခါ သုံးသည်။",
      how: "td သို့မဟုတ် th tag အတွင်း colspan='အရေအတွက်' သို့မဟုတ် rowspan='အရေအတွက်' ထည့်ရေးခြင်း။"
    },
    myanmarExplanation: "colspan သည် horizontal cells (ကော်လံများ) ကို ပေါင်းစပ်ပြီး၊ rowspan သည် vertical cells (အောက်အတန်းများ) ကို ဒေါင်လိုက် ပေါင်းစပ်ပေးကာ နေရာယူစေသည်။",
    theory: "HTML Table model layout rules များအရ cell spanning props များသည် default grid matrix resolution တွင် cell dimensions ပွားယူမှုကို dynamics algorithm အားဖြင့် ပြောင်းလဲပေးသည်။",
    englishKeywords: ["Colspan", "Rowspan", "Cell Merging", "Spanning Table", "Grid Integration"],
    stepByStepExplanation: [
      "<tr> element တစ်ခုအတွင်း td element ရေးပါ။",
      "colspan='3' စသည်ဖြင့် attribute ပေါင်းထည့်ကာ ကော်လံ ၃ ခုစာ နေရာယူစေရန် သတ်မှတ်ပါ။"
    ],
    outputPreview: "ကော်လံနှစ်ခုစာ ကျယ်ဝန်းသော ဇယားအကွက်တစ်ခု ပေါ်လာမည်။",
    tips: ["rowspan သုံးပါက ၎င်းအောက်ရှိ tr များတွင် cell အရေအတွက်ကို လျှော့ချရန် မမေ့ပါနှင့်။"],
    assignment: {
      title: "Multidimensional Calendar Block",
      description: "ရက်သတ္တပတ် ဇယားကတ်တစ်ခု ဖန်တီးပါ။",
      instructions: ["ဒေါင်လိုက် အတန်း ၂ ခုအား ပေါင်းစပ်မည့် rowspan='2' ပါဝင်သော ဇယားကုဒ်တစ်ခု ရေးသားဖော်ပြပါ။"]
    },
    lessonSummary: "colspan နှင့် rowspan attributes များသည် cell များကို ကော်လံ သို့မဟုတ် အတန်းလိုက် ပေါင်းစည်းပြီး ဇယားများကို လှပစေသည်။",
    nextLesson: "Intro to HTML Forms"
  },
  {
    id: "html-33",
    title: "Intro to HTML Forms",
    slug: "html-forms-intro",
    duration: "20 mins",
    whatIsIt: "Intro to HTML Forms ဆိုသည်မှာ အသုံးပြုသူများထံမှ အချက်အလက်များ (နာမည်၊ email၊ လျှို့ဝှက်စကားလုံး) ကို လက်ခံရယူပြီး server ဆီသို့ ပေးပို့နိုင်သည့် dynamic web components များ ဖြစ်ပါသည်။",
    whyImportant: "ဝဘ်ဆိုက်တစ်ခုတွင် login ဝင်ခြင်း၊ register ပြုလုပ်ခြင်း၊ ဆက်သွယ်ရန် စာမျက်နှာနှင့် ရှာဖွေမှုများ (Search bars) ပြုလုပ်ရန် dynamic interactive form များသည် မရှိမဖြစ်လိုအပ်ပါသည်။",
    realWorldUsage: "Facebook Register page၊ Google Sign-in screen များနှင့် Contact us forms အားလုံးသည် HTML <form> element ကို အခြေခံ၍ ဆောက်ထားခြင်း ဖြစ်ပါသည်။",
    syntax: `<form>
  <!-- Form content inputs go here -->
</form>`,
    examples: [
      `<form>\n  <label>User Name:</label>\n  <input type="text">\n</form>`
    ],
    commonMistakes: [
      {
        mistake: "input fields များကို နေရာတကာ <form> wrapper မပါဘဲ တိုက်ရိုက် ရေးသားပြီး server သို့ submit လုပ်၍မရဖြစ်ခြင်း။",
        correction: "အပြန်အလှန် ဒေတာပို့ဆောင်မှုအတွက် input items အားလုံးကို အမြဲတမ်း <form> tags အတွင်း၌ စုစည်းရေးသားပါ။",
        explanation: "<form> block သည် browser အား ၎င်းအတွင်းရှိ input field တန်ဖိုးများကို packet data အဖြစ် ပြောင်းလဲပေးပို့စေသော စည်းကမ်း wrapper ဖြစ်သည်။"
      }
    ],
    bestPractices: [
      "အသုံးပြုသူများ ဘာဖြည့်ရမှန်း သိသာထင်ရှားစေရန် input တိုင်းအတွက် သင့်လျော်သော <label> tag ကို တွဲသုံးပေးပါ။"
    ],
    miniExercise: {
      id: "ex-html-33",
      instruction: "form element တစ်ခုကို ဖွင့်ပြီး ပိတ်ကာ ၎င်းအတွင်း label တစ်ခုနှင့် input တစ်ခု ထည့်သွင်းပါ။",
      codeTemplate: "<form>\n  <label>Name</label>\n  <input type=\"text\">\n</form>",
      expectedOutput: "<form>\n  <label>Name</label>\n  <input type=\"text\">\n</form>",
      hints: ["<form> container tags အတွင်း၌ label နှင့် input elements ကို nested ရေးသားပါ။"]
    },
    quiz: [
      {
        id: "q-html-33",
        question: "အသုံးပြုသူများထံမှ dynamic inputs အချက်အလက်များ လက်ခံရန် အသုံးပြုသည့် wrapper container tag မှာ မည်သည်နည်း။",
        options: [
          "<input>",
          "<form>",
          "<fields>",
          "<submit>"
        ],
        correctOptionIndex: 1,
        explanation: "<form> element သည် input items အားလုံးကို server data packets အဖြစ် စုစည်းပေးသည့် form area interface ကြီး ဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "Simple Join Form",
      description: "အခြေခံ အဖွဲ့ဝင်ဝင်ရန် အချက်အလက်ဖြည့် စာမျက်နှာတစ်ခု ဖန်တီးပါ။",
      guide: ["form tag အတွင်း အမည်ဖြည့်ရန် label နှင့် text input တစ်ခု စနစ်တကျ ရေးသားပါ။"],
      startingCode: "<form>\n  <label>Your Name:</label>\n  <input type=\"text\">\n</form>"
    },
    learningObjectives: {
      what: "<form> element ၏ အခန်းကဏ္ဍ၊ label နှင့် input တို့၏ အခြေခံသဘောကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက်အား static အဖြစ်မှ အသုံးပြုသူများနှင့် စကားပြောနိုင်သော interactive dynamic app အဖြစ်သို့ ပြောင်းလဲရန်။",
      when: "User registration, contact sections, feedback forms ဆောက်သည့်အခါတိုင်း သုံးသည်။",
      how: "<form> element အတွင်း labeling နှင့် inputs types အမျိုးမျိုးကို nested ရေးသားအသုံးပြုခြင်း။"
    },
    myanmarExplanation: "<form> tag သည် စာမျက်နှာပေါ်တွင် interactive user field sections များကို စုစည်းပေးပြီး backend logic ဆီသို့ browser မှတစ်ဆင့် dynamic requests ပေးပို့ရန် တံခါးပေါက်တစ်ခုဖြစ်သည်။",
    theory: "HTML Form control elements များသည် user input values များကို dynamic browser session variables သို့မဟုတ် form-data packets အဖြစ် encode လုပ်ပြီး endpoints များသို့ transport လုပ်ပေးသည်။",
    englishKeywords: ["form element", "input control", "label element", "Interactive Form", "User Input"],
    stepByStepExplanation: [
      "<form> wrapper ကို စတင်ရေးပါ။",
      "<label> ဖြင့် input အကြောင်းအရာကို ရှင်းပြပါ။",
      "<input> tag ဖြင့် ဖြည့်စွက်ရမည့် အကွက်ငယ်တစ်ခုကို ဖန်တီးပါ။",
      "</form> ဖြင့် block အား ပိတ်ပါ။"
    ],
    outputPreview: "ဖြည့်သွင်းရမည့် အမည်အကွက်ငယ်နှင့် label အညွှန်းစာတန်းလေး ပေါ်လာမည်။",
    tips: ["label element ၏ 'for' attribute နှင့် input id တို့ကို တွဲချိတ်ပေးခြင်းဖြင့် click targets ပိုကောင်းစေပါသည်။"],
    assignment: {
      title: "Client Feedback Form Scaffold",
      description: "အခြေခံ Feedback form တည်ဆောက်ပုံ အရိုးစုတစ်ခု ရေးဆွဲပါ။",
      instructions: ["<form> စံနှုန်းနှင့်အညီ feedback input placeholder တစ်ခုပါဝင်သော interface လေးအား ရေးဆွဲပြပါ။"]
    },
    lessonSummary: "<form> tag သည် browser နှင့် user ကြား အပြန်အလှန်ဒေတာများကို interact လုပ်ရန် dynamic input controls များကို စုစည်းပေးသော အဓိက wrapper ဖြစ်သည်။",
    nextLesson: "Form Actions & Methods"
  },
  {
    id: "html-34",
    title: "Form Actions & Methods",
    slug: "html-form-actions-methods",
    duration: "20 mins",
    whatIsIt: "Form Actions & Methods ဆိုသည်မှာ form ထဲရှိ အချက်အလက်များကို backend server သို့ မည်သည့် endpoint လိပ်စာ (Action) သို့၊ မည်သည့် ပို့ဆောင်မှုပုံစံ (Method - GET သို့မဟုတ် POST) ဖြင့် ပေးပို့မည်ကို သတ်မှတ်ပေးခြင်း ဖြစ်ပါသည်။",
    whyImportant: "ဒေတာများကို server မှ စနစ်တကျ လက်ခံသိမ်းဆည်းနိုင်ရန်နှင့် လုံခြုံမှုရှိရှိ backend APIs များနှင့် ချိတ်ဆက်လုပ်ဆောင်နိုင်ရန် မဖြစ်မနေ လိုအပ်ပါသည်။",
    realWorldUsage: "Search form တွင် ဒေတာများကို url ၌ ဖော်ပြပေးသော GET method သုံးပြီး၊ login form တွင် လုံခြုံရေးအတွက် url ၌ ဒေတာဖုံးကွယ်ပေးသော POST method သုံးခြင်း ဖြစ်ပါသည်။",
    syntax: `<form action="/submit-data" method="POST">
  <!-- Form Inputs -->
</form>`,
    examples: [
      `<form action="https://api.example.com/search" method="GET">
  <input type="text" name="query">
</form>`
    ],
    commonMistakes: [
      {
        mistake: "<form method='post'> (action လုံးဝ မပါဝင်ခြင်း သို့မဟုတ် query query form တွင် post သုံးခြင်း)",
        correction: "<form action='/save' method='POST'>",
        explanation: "action attribute မပါပါက browser သည် data အား လက်ရှိ page သို့သာ ပြန်လည် postback လုပ်ပါမည်။ query query functions များအတွက် GET ကို သုံးစွဲပါ။"
      }
    ],
    bestPractices: [
      "လျှို့ဝှက်နံပါတ်များ၊ password ဒေတာများ သို့မဟုတ် ကိုယ်ရေးကိုယ်တာ အချက်အလက်များ ပို့သည့်အခါ အမြဲတမ်း method=\"POST\" ကို သုံးစွဲပါ။"
    ],
    miniExercise: {
      id: "ex-html-34",
      instruction: "action='/register' နှင့် method='POST' ရှိသော HTML form element တစ်ခု တည်ဆောက်ပါ။",
      codeTemplate: "<form action=\"/register\" method=\"POST\">\n  <input type=\"text\" name=\"user\">\n</form>",
      expectedOutput: "<form action=\"/register\" method=\"POST\">\n  <input type=\"text\" name=\"user\">\n</form>",
      hints: ["form opening tag တွင် action และ method attributes ကို ထည့်သွင်းပေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-34",
        question: "လျှို့ဝှက်နံပါတ် သို့မဟုတ် ကိုယ်ရေးကိုယ်တာ အချက်အလက်များကို url တွင် မပြသဘဲ လုံခြုံစွာ backend သို့ပို့ရန် မည်သည့် method ကို သုံးရမည်နည်း။",
        options: [
          "GET",
          "POST",
          "PUSH",
          "REQUEST"
        ],
        correctOptionIndex: 1,
        explanation: "POST method သည် header body packets များအတွင်း values များကို ဖုံးကွယ်ပို့ဆောင်ပေးသဖြင့် လုံခြုံရေး ကောင်းမွန်စေသည်။"
      }
    ],
    miniProject: {
      title: "Query Dispatcher",
      description: "Google Search သို့ အလိုအလျောက် search query လှမ်းပို့နိုင်မည့် dynamic GET form တစ်ခု ဆောက်ပါ။",
      guide: ["action တွင် 'https://www.google.com/search' နှင့် input name='q' ကို အသုံးပြုပါ။"],
      startingCode: "<form action=\"https://www.google.com/search\" method=\"GET\">\n  <input type=\"text\" name=\"q\">\n</form>"
    },
    learningObjectives: {
      what: "action attribute နှင့် GET/POST methods တို့၏ ကွာခြားချက်များကို လေ့လာရန်။",
      why: "ဒေတာများကို စနစ်တကျ backend database သို့ လုံခြုံစိတ်ချရသော endpoints များမှတစ်ဆင့် တိုက်ရိုက်ပေးပို့တတ်စေရန်။",
      when: "Frontend မှ user variables များကို backend Node.js, Python server ဆီသို့ ပေးပို့သည့်အခါ သုံးသည်။",
      how: "action='api_endpoint' နှင့် method='POST/GET' ပုံစံဖြင့် attribute ကြေညာခြင်း။"
    },
    myanmarExplanation: "action attribute သည် browser အား submit နှိပ်ချိန်တွင် မည်သည့် server link သို့ သွားရမည်ကို ညွှန်ကြားပြီး၊ method သည် load ဒေတာအား မည်သို့ သယ်ယူရမည်ကို သတ်မှတ်သည်။",
    theory: "Hypertext Transfer Protocol (HTTP) တွင် GET query strings များသည် URLs များတွင် append ဖြစ်ပြီး၊ POST payloads များကို request message body streaming မှတစ်ဆင့် transports လုပ်ပေးသည်။",
    englishKeywords: ["Form action", "HTTP Method", "GET request", "POST request", "Request Body"],
    stepByStepExplanation: [
      "<form> tag ဆောက်ပါ။",
      "action attribute တွင် လက်ခံမည့် API endpoint ထည့်ပါ။",
      "method တွင် GET သို့မဟုတ် POST ထည့်သွင်းပြီး အပြီးသတ်ပါ။"
    ],
    outputPreview: "action နှင့် method သတ်မှတ်ချက်ပါဝင်သော dynamic communication form ဆောက်လုပ်ပြီးဖြစ်သည်။",
    tips: ["GET method ကို သုံးပါက input fields တစ်ခုချင်းစီတွင် 'name' attribute မဖြစ်မနေ ပါဝင်မှသာ query string တန်ဖိုး သယ်ဆောင်သွားနိုင်ပါလိမ့်မည်။"],
    assignment: {
      title: "Login Secure Gateway",
      description: "လုံခြုံသော login စနစ်အတွက် form scaffold တစ်ခု ဖန်တီးပါ။",
      instructions: ["action='/auth/login' နှင့် သင့်လျော်သော POST method သုံး၍ interactive login wrapper ရေးသားပါ။"]
    },
    lessonSummary: "action နှင့် method attributes များသည် HTML form ဒေတာများကို backend server ဆီသို့ မည်သို့နှင့် မည်သည့်နေရာသို့ စနစ်တကျ ပို့ပေးမည်ကို ကူညီညွှန်ကြားပေးသည်။",
    nextLesson: "Text & Password Inputs"
  },
  {
    id: "html-35",
    title: "Text & Password Inputs",
    slug: "html-text-password-inputs",
    duration: "20 mins",
    whatIsIt: "Text & Password Inputs ဆိုသည်မှာ စာလုံးအက္ခရာများ တိုက်ရိုက်ရိုက်ထည့်နိုင်သည့် text input နှင့် ရိုက်ထည့်လိုက်သော စာလုံးများကို အစက်ကလေးများ (Bullet points) ဖြင့် ဖုံးကွယ်ပြသပေးသော password input အမျိုးအစားများ ဖြစ်ပါသည်။",
    whyImportant: "အသုံးပြုသူ၏ အမည်များ၊ လိပ်စာများကို အတိအလင်း မြင်သာစွာ ရေးသားစေရန်နှင့် လျှို့ဝှက်နံပါတ်များကို ဘေးလူမမြင်စေဘဲ ကာကွယ်ရိုက်ထည့်နိုင်ရန် မရှိမဖြစ်လိုအပ်ပါသည်။",
    realWorldUsage: "လုံခြုံစိတ်ချရသော မည်သည့် login စာမျက်နှာတွင်မဆို Username ကွက်လပ် (text) နှင့် Password ကွက်လပ် (password) တွဲဖက်ပါရှိခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<!-- Text Input -->
<input type="text" placeholder="အမည်ဖြည့်ပါ">

<!-- Password Input -->
<input type="password" placeholder="စကားဝှက်ထည့်ပါ">`,
    examples: [
      `<input type="text" id="username" name="user_name">
<input type="password" id="p_word" name="pass_word">`
    ],
    commonMistakes: [
      {
        mistake: "<input type='text' id='pass'> (စကားဝှက်ဖြည့်ရန် text type ကို သုံးခြင်း)",
        correction: "<input type='password' id='pass'>",
        explanation: "စကားဝှက်များအတွက် text type ကို သုံးပါက ရိုက်သမျှ စာလုံးများအား ဘေးလူမှ အလွယ်တကူ မြင်တွေ့သွားနိုင်သဖြင့် လုံခြုံရေး လုံးဝမရှိပါ။ password type ကိုသာ သုံးရပါမည်။"
      }
    ],
    bestPractices: [
      "အသုံးပြုသူများ ဘာဖြည့်ရမည်ကို အရိပ်အမြွက် သိစေရန် input ထဲတွင် ဖျော့ဖျော့လေး ပေါ်နေမည့် placeholder attribute ကို အမြဲသုံးပေးပါ။"
    ],
    miniExercise: {
      id: "ex-html-35",
      instruction: "type='password' နှင့် placeholder='Enter password' ရှိသော input tag တစ်ခု တည်ဆောက်ပါ။",
      codeTemplate: "<input type=\"password\" placeholder=\"Enter password\">",
      expectedOutput: "<input type=\"password\" placeholder=\"Enter password\">",
      hints: ["<input> တွင် type='password' နှင့် placeholder text ကို ထည့်ပေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-35",
        question: "ရိုက်ထည့်လိုက်သော အက္ခရာများကို အစက် သို့မဟုတ် ကြယ်ပွင့်များဖြင့် အလိုအလျောက် ဖုံးကွယ်ပေးသည့် input type မှာ မည်သည်နည်း။",
        options: [
          "text",
          "hidden",
          "password",
          "secure"
        ],
        correctOptionIndex: 2,
        explanation: "type='password' attribute သည် browser အား payload input characters များကို visual masked dots များဖြင့် ဖုံးကွယ်ခိုင်းစေသည်။"
      }
    ],
    miniProject: {
      title: "Credentials Panel",
      description: "လုံခြုံစိတ်ချရသော account register visual panel တစ်ခု ဆောက်ပါ။",
      guide: ["Username text input နှင့် Password secure input အတွဲကို inputs များအဖြစ် Form အတွင်း တည်ဆောက်ပါ။"],
      startingCode: "<form>\n  <label>Username:</label>\n  <input type=\"text\" placeholder=\"Enter name\">\n  <label>Password:</label>\n  <input type=\"password\" placeholder=\"Enter pass\">\n</form>"
    },
    learningObjectives: {
      what: "type='text' နှင့် type='password' ၏ attributes များနှင့် placeholder, name concept ကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက်ရှိ အသုံးပြုသူ၏ variables အချက်အလက်များနှင့် လျှို့ဝှက်နံပါတ်များကို ကာကွယ်လက်ခံနိုင်ရန်။",
      when: "Login, Register, Admin setup views များ ရေးဆွဲတည်ဆောက်သည့်အခါ သုံးသည်။",
      how: "<input type='text'> နှင့် <input type='password'> စသည့် tags များကို ရေးသားခြင်း။"
    },
    myanmarExplanation: "<input> tag သည် variable bindings များကို ဖန်တီးပေးပြီး text နှင့် password fields များသည် screen visualization controls ကို text layer အလိုက် runtime ခွဲခြားပေးသည်။",
    theory: "HTML5 Text-based input controls များသည် standard text layers constraints များကို browser rendering engine မှတစ်ဆင့် secure virtual fields အဖြစ် execute လုပ်ဆောင်ပေးခြင်း ဖြစ်သည်။",
    englishKeywords: ["text input", "password input", "placeholder", "input visibility", "Masked Characters"],
    stepByStepExplanation: [
      "<input> element ရေးပါ။",
      "type='text' သို့မဟုတ် type='password' သတ်မှတ်ပါ။",
      "placeholder='...' attribute သုံးပြီး သင့်လျော်သော အကြံပြုချက်စာသားထည့်ပါ။"
    ],
    outputPreview: "စာရိုက်နိုင်သော အမည်ဖြည့်အကွက်နှင့် လျှို့ဝှက်စွာ ဖုံးကွယ်ပေးသော password field ကွက်လပ်တို့ ပေါ်လာမည်။",
    tips: ["လုံခြုံရေးအတွက် auto-fill controls များ မလိုအပ်ပါက autocomplete='off' ကို သုံးစွဲနိုင်သည်။"],
    assignment: {
      title: "Simple Sign In Interface",
      description: "အခြေခံ login inputs section တည်ဆောက်ပါ။",
      instructions: ["Email text input နှင့် secure password input ၂ ခုအား form အတွင်း သပ်ရပ်စွာ ပုံစံထုတ်ရေးသားပြပါ။"]
    },
    lessonSummary: "type='text' နှင့် type='password' input tags များသည် အသုံးပြုသူအမည်များနှင့် လျှို့ဝှက်စကားလုံးများကို လုံခြုံစိတ်ချစွာ စာမျက်နှာပေါ်တွင် လက်ခံရယူပေးသည်။",
    nextLesson: "Radio & Checkbox Inputs"
  },
  {
    id: "html-36",
    title: "Radio & Checkbox Inputs",
    slug: "html-radio-checkbox-inputs",
    duration: "20 mins",
    whatIsIt: "Radio & Checkbox Inputs ဆိုသည်မှာ ပေးထားသော ရွေးချယ်စရာများအနက်မှ တစ်ခုတည်းကိုသာ ရွေးချယ်စေလိုသော (Radio button) နှင့် တစ်ခုထက်မက အများအပြားကို ရွေးချယ်ခွင့်ပေးသော (Checkbox) ဆန်းသစ်သည့် input အမျိုးအစားများ ဖြစ်ပါသည်။",
    whyImportant: "မေးခွန်းများဖြေဆိုခြင်း၊ ကျား/မ ရွေးချယ်ခြင်း (Radio) နှင့် မိမိစိတ်ဝင်စားသည့် ဝါသနာများ အစုံလိုက် ရွေးချယ်ခြင်း (Checkboxes) တို့ကို စနစ်တကျ ပြုလုပ်ရန် လိုအပ်ပါသည်။",
    realWorldUsage: "ကျား/မ ရွေးချယ်ရာတွင် တစ်ခုသာရွေးချယ်ခွင့်ပေးသော ရေဒီယိုခလုတ်များနှင့် Terms and Conditions 'သဘောတူပါသည်' box ကလေးများတွင် သုံးပါသည်။",
    syntax: `<!-- Radio (တစ်ခုသာ ရွေးရမည်) -->
<input type="radio" name="gender" value="male"> Male
<input type="radio" name="gender" value="female"> Female

<!-- Checkbox (အများကြီး ရွေးနိုင်သည်) -->
<input type="checkbox" name="hobby" value="reading"> Reading`,
    examples: [
      `<input type="radio" name="plan" value="pro" checked> Premium Pro`
    ],
    commonMistakes: [
      {
        mistake: "<input type='radio'> Yes <input type='radio'> No (name attribute မပါဝင်ခြင်း)",
        correction: "<input type='radio' name='agree'> Yes <input type='radio' name='agree'> No",
        explanation: "Radio button များတွင် 'name' attribute တန်ဖိုး တူညီအောင် မပေးပါက browser သည် ၎င်းတို့ကို အုပ်စုတစ်ခုတည်းဟု မသိရှိသဖြင့် Yes ရော No ပါ နှစ်ခုစလုံးကို တစ်ပြိုင်နက် ရွေးချယ်ခွင့် ပေးသွားပါလိမ့်မည်။"
      }
    ],
    bestPractices: [
      "အသုံးပြုသူများ စာသားကို နှိပ်လိုက်ရုံဖြင့် အမှန်ခြစ်အလိုအလျောက် ဖြစ်စေရန် input နှင့် <label> တိုကို စနစ်တကျ တွဲသုံးပါ။"
    ],
    miniExercise: {
      id: "ex-html-36",
      instruction: "type='checkbox' နှင့် name='terms' ပါဝင်သော checkbox element တစ်ခု ရေးသားပါ။",
      codeTemplate: "<input type=\"checkbox\" name=\"terms\">",
      expectedOutput: "<input type=\"checkbox\" name=\"terms\">",
      hints: ["type check attribute အား checkbox ဟု သတ်မှတ်ပေးပါ။"]
    },
    quiz: [
      {
        id: "q-html-36",
        question: "ရွေးချယ်စရာများစွာအနက်မှ အသုံးပြုသူအား တစ်ခုတည်းကိုသာ သီးသန့်ရွေးချယ်ခိုင်းလိုပါက မည်သည့် input type ကို သုံးရမည်နည်း။",
        options: [
          "checkbox",
          "radio",
          "select",
          "button"
        ],
        correctOptionIndex: 1,
        explanation: "type='radio' button များသည် scope တူညီသော name attribute အောက်တွင် တစ်ခုတည်းသော exclusive selection ကိုသာ ရရှိစေသည်။"
      }
    ],
    miniProject: {
      title: "Preference Form",
      description: "အသုံးပြုသူ၏ စိတ်ကြိုက်ဘာသာစကားနှင့် သဘောတူညီချက် စစ်ဆေးသည့် box ကလေးတစ်ခု ဆောက်ပါ။",
      guide: ["Radio button (English/Myanmar) နှင့် terms agreements checkbox တစ်ခုကို form အတွင်း တည်ဆောက်ပါ။"],
      startingCode: "<form>\n  <h3>Choose Language:</h3>\n  <input type=\"radio\" name=\"lang\" value=\"my\"> Myanmar\n  <input type=\"radio\" name=\"lang\" value=\"en\"> English\n  <br><br>\n  <input type=\"checkbox\" name=\"agree\"> I agree\n</form>"
    },
    learningObjectives: {
      what: "type='radio' နှင့် type='checkbox' tags တို့၏ details, checked attribute, group-naming logic ကို လေ့လာရန်။",
      why: "multiple choice selection features များနှင့် Boolean checking inputs များကို user interfaces တွင် ဖန်တီးနိုင်ရန်။",
      when: "Survey forms, user settings selection panel, sign-up constraints တွေမှာ သုံးသည်။",
      how: "<input type='radio'> သို့မဟုတ် <input type='checkbox'> များကို ရေးသားခြင်းဖြင့် သုံးသည်။"
    },
    myanmarExplanation: "<input type='radio'> သည် group validation အပေါ် မူတည်ပြီး user အား exclusive choice တစ်ခုတည်းပေးပြီး၊ <input type='checkbox'> သည် independent check buttons အဖြစ် သုံးစွဲစေသည်။",
    theory: "Form inputs specification တွင် radio buttons selections များသည် shared variable name attributes များအတွင်း အပြန်အလှန် selection state တန်ဖိုးများကို toggles ပြုလုပ်ပေးသော state logic ဖြစ်သည်။",
    englishKeywords: ["radio button", "checkbox element", "checked attribute", "exclusive selection", "Multiple Choices"],
    stepByStepExplanation: [
      "exclusive list အတွက် radio inputs ကို သတ်မှတ်ပြီး name attribute အား အတူတူ ပေးပါ။",
      "multiple check အတွက် checkbox tag ကို type အလိုက် သီးခြား သတ်မှတ်ပေးပါ။"
    ],
    outputPreview: "ရွေးချယ်ရန် ဝိုင်းဝိုင်းခလုတ်လေးများနှင့် အမှန်ခြစ်ခြစ်ရန် အကွက်ငယ်လေး ပေါ်လာမည်။",
    tips: ["စာမျက်နှာ စပွင့်ကတည်းက automatic checked ဖြစ်စေလိုပါက 'checked' attribute ကို input tag တွင် ထည့်သွင်းထားပါ။"],
    assignment: {
      title: "Survey Demographics Widget",
      description: "စစ်တမ်းမေးခွန်းများ စာမျက်နှာငယ်တစ်ခု ရေးဆွဲပါ။",
      instructions: ["အသက်အုပ်စု (Radio buttons ၃ ခု) နှင့် စိတ်ဝင်စားသော ဘာသာရပ်များ (Checkboxes ၃ ခု) ပါဝင်သော widgets ကို ဖန်တီးပြပါ။"]
    },
    lessonSummary: "type='radio' နှင့် type='checkbox' inputs များသည် dynamic select workflows များနှင့် boolean checks များကို form ထဲတွင် အလွယ်တကူ တည်ဆောက်ပေးသည်။",
    nextLesson: "Select Dropdowns"
  },
  {
    id: "html-37",
    title: "Select Dropdowns",
    slug: "html-select-dropdowns",
    duration: "20 mins",
    whatIsIt: "Select Dropdowns ဆိုသည်မှာ ဝဘ်စာမျက်နှာပေါ်တွင် နေရာလွတ်အမြောက်အမြား မယူဘဲ၊ နှိပ်လိုက်သည့်အခါမှသာ အောက်သို့ ရွေးချယ်စရာစာရင်းများ (Dropdown list) ဆင်းလာသည့် သပ်ရပ်လှပသော ရွေးချယ်မှုစနစ် ဖြစ်ပါသည်။",
    whyImportant: "နိုင်ငံများ၊ မြို့ကြီးများ သို့မဟုတ် မွေးသက္ကရာဇ်များကို visual နေရာအကျယ်ကြီး မသုံးဘဲ သပ်ရပ်ကျစ်လစ်စွာ ရွေးချယ်စေနိုင်သောကြောင့် UI အလွန်လှပစေပါသည်။",
    realWorldUsage: "လိပ်စာဖြည့်သွင်းရာတွင် မိမိနေထိုင်ရာ 'ပြည်နယ်နှင့် တိုင်းဒေသကြီး' ကို dropdown စာရင်းမှတစ်ဆင့် ရွေးချယ်ရခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<select name="country">
  <option value="mm">Myanmar</option>
  <option value="th">Thailand</option>
</select>`,
    examples: [
      `<select name="tier" id="user-tier">
  <option value="free">Free Member</option>
  <option value="vip" selected>VIP Member</option>
</select>`
    ],
    commonMistakes: [
      {
        mistake: "<select><option>Option 1</option></select> (option values များ လုံးဝမထည့်ခြင်း)",
        correction: "<select name='opt'><option value='1'>Option 1</option></select>",
        explanation: "option tags တွင် 'value' attribute ထည့်သွင်းရန် မေ့လျော့တတ်ကြပါသည်။ value သည် backend server သို့ ဒေတာပို့သည့်အခါ အမှန်တကယ် လက်ခံမည့် dynamic code key ဖြစ်ပါသည်။"
      }
    ],
    bestPractices: [
      "ပထမဆုံး option ကို value='' အလွတ်ထားပြီး 'ရွေးချယ်ပါ (Choose...)' ဟု ပြသကာ placeholder အဖြစ် သုံးပါ။"
    ],
    miniExercise: {
      id: "ex-html-37",
      instruction: "select element တစ်ခုအတွင်း 'Yangon' အား value='ygn' ဖြင့် option တစ်ခု ဖန်တီးပါ။",
      codeTemplate: "<select name=\"city\">\n  <option value=\"ygn\">Yangon</option>\n</select>",
      expectedOutput: "<select name=\"city\">\n  <option value=\"ygn\">Yangon</option>\n</select>",
      hints: ["<select> block အတွင်း၌ <option value='ygn'>Yangon</option> ကို ထည့်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-37",
        question: "HTML တွင် အောက်သို့ဆင်းလာသော Dropdown list တစ်ခု ဖန်တီးရန် မည်သည့် tag ကို အသုံးပြုရသနည်း။",
        options: [
          "<dropdown>",
          "<select>",
          "<list>",
          "<option>"
        ],
        correctOptionIndex: 1,
        explanation: "<select> tag သည် option item elements များကို dynamically dropdown menu အဖြစ် ပြသပေးသည့် select wrapper ဖြစ်သည်။"
      }
    ],
    miniProject: {
      title: "Course Picker",
      description: "လေ့လာလိုသော programming course ရွေးချယ်ရန် selector dropdown တစ်ခု ဆောက်ပါ။",
      guide: ["HTML, Python, Git သင်တန်းများကို options များအဖြစ် dropdown table အတွင်း တည်ဆောက်ပါ။"],
      startingCode: "<form>\n  <label>Choose Course:</label>\n  <select name=\"course\">\n    <option value=\"\">-- Select --</option>\n    <option value=\"html\">HTML Complete</option>\n    <option value=\"python\">Python Basics</option>\n  </select>\n</form>"
    },
    learningObjectives: {
      what: "<select> tag, <option> tag နှင့် selected, value attributes များ၏ အသုံးဝင်ပုံကို လေ့လာရန်။",
      why: "ဝဘ်စာမျက်နှာကို layout နေရာချွေတာပြီး အကန့်အသတ်ရှိသော variables တန်ဖိုးများကို စနစ်တကျ ရွေးချယ်စေရန်။",
      when: "လိပ်စာများ၊ ဘာသာစကားရွေးချယ်မှုများ၊ settings options များ ရေးဆွဲသည့်အခါ သုံးသည်။",
      how: "<select> tag အတွင်း <option> elements များကို nesting ရေးသားအသုံးပြုခြင်း။"
    },
    myanmarExplanation: "<select> tag သည် dropdown panel view ကို စတင်ဖွင့်လှစ်ပြီး ၎င်းအတွင်းရှိ <option> tags တစ်ခုချင်းစီသည် user မှ နှိပ်ယူနိုင်သော discrete values data များ ဖြစ်လာသည်။",
    theory: "HTML option lists structure သည် standard options matrix အဖြစ် browser internal OS rendering interface ကို အသုံးချပြီး desktop သို့မဟုတ် mobile selection sheet များကို dialog system အဖြစ် dynamics ဖွင့်ပြသည်။",
    englishKeywords: ["select menu", "option tag", "dropdown list", "selected attribute", "Menu interface"],
    stepByStepExplanation: [
      "<select> wrapper tag ဖွင့်ပါ။",
      "အတွင်း၌ option elements သတ်မှတ်ပြီး default selection အတွက် 'selected' prop သုံးနိုင်သည်။"
    ],
    outputPreview: "နှိပ်လိုက်ပါက ရွေးချယ်စရာ Yangon စသည့် မြို့အမည်များ ကျလာမည့် dropdown ခလုတ်လေး ပေါ်လာမည်။",
    tips: ["option tag တွင် 'selected' attribute သုံးစွဲထားပါက ၎င်းအကွက်သည် default အဖြစ် အလိုအလျောက် ရွေးချယ်ပြီးသား ဖြစ်နေပါလိမ့်မည်။"],
    assignment: {
      title: "Country Selector Block",
      description: "နိုင်ငံပေါင်းစုံ ရွေးချယ်စရာ dropdown list တစ်ခု တည်ဆောက်ပါ။",
      instructions: ["မြန်မာ၊ ထိုင်း၊ စင်ကာပူ နိုင်ငံ ၃ ခု ရွေးချယ်နိုင်မည့် select-dropdown tags စနစ်ကို တည်ဆောက်ပြပါ။"]
    },
    lessonSummary: "<select> tag သည် option tags များနှင့် တွဲဖက်ကာ နေရာလွတ် ချွေတာပြီး အချက်အလက်များကို သပ်ရပ်စွာ dropdown ပုံစံဖြင့် ရွေးချယ်ခွင့်ပေးသည်။",
    nextLesson: "Textarea & File Upload"
  },
  {
    id: "html-38",
    title: "Textarea & File Upload",
    slug: "html-textarea-file-upload",
    duration: "20 mins",
    whatIsIt: "Textarea & File Upload ဆိုသည်မှာ စာကြောင်းရေအမြောက်အမြား (စာပိုဒ်များ၊ မှတ်ချက်များ) ရိုက်ထည့်ရန် (Textarea) နှင့် သင့်စက်အတွင်းရှိ ရုပ်ပုံများ၊ စာရွက်စာတမ်းများကို ဝဘ်ပေါ်သို့ တင်ရန် (File Upload Input) အဆင့်မြင့် form options များ ဖြစ်ပါသည်။",
    whyImportant: "သုံးသပ်ချက် ဝေဖန်စာများ၊ အကြံပြုစာများ ရှည်ရှည်ရေးနိုင်ရန်နှင့် Profile ဓာတ်ပုံ တင်ခြင်း၊ CV စာရွက်စာတမ်းများ ပေးပို့နိုင်ရန် အလွန်လိုအပ်ပါသည်။",
    realWorldUsage: "Facebook Post ရေးသားရာတွင် သုံးသော text area ရှည်ကြီးများနှင့် အလုပ်လျှောက်လွှာတင်ရာတွင် CV PDF ဖိုင် တင်ရခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<!-- Textarea -->
<textarea rows="4" cols="50">မှတ်ချက်ရေးရန်...</textarea>

<!-- File Upload -->
<input type="file" name="cv_file">`,
    examples: [
      `<textarea name="message" placeholder="စာတိုချန်ခဲ့ပါ..."></textarea>
<input type="file" name="photo" accept="image/*">`
    ],
    commonMistakes: [
      {
        mistake: "<textarea value='Comment'></textarea> (value attribute သုံးခြင်း)",
        correction: "<textarea>Comment</textarea>",
        explanation: "<textarea> element တွင် single <input> ကဲ့သို့ value attribute မသုံးရပါ။ Default စာသားများကို opening tag နှင့် closing tag များကြားတွင်သာ ရေးသားရပါမည်။"
      }
    ],
    bestPractices: [
      "File Upload တွင် သတ်မှတ်ထားသော photo သို့မဟုတ် document formats သီးသန့်သာ တင်ခိုင်းစေရန် 'accept' attribute ကို သုံးစွဲပါ။",
      "textarea အား user မှ screen size ဆွဲချုံ့ချဲ့မရစေရန် CSS size properties များ သုံးနိုင်သည်။"
    ],
    miniExercise: {
      id: "ex-html-38",
      instruction: "type='file' နှင့် accept='image/*' ပါဝင်သော input tag တစ်ခု ဖန်တီးပါ။",
      codeTemplate: "<input type=\"file\" accept=\"image/*\">",
      expectedOutput: "<input type=\"file\" accept=\"image/*\">",
      hints: ["<input> tag ထဲတွင် type='file' နှင့် accept attribute ထည့်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-38",
        question: "အသုံးပြုသူ၏ စက်အတွင်းမှ file တစ်ခုခုကို select လုပ်ပြီး server သို့ တင်ရန် မည်သည့် input type ကို သုံးသနည်း။",
        options: [
          "text",
          "file",
          "document",
          "upload"
        ],
        correctOptionIndex: 1,
        explanation: "type='file' attribute သည် browser system file picker selector dialog ကို ဖွင့်လှစ်ပေးသည်။"
      }
    ],
    miniProject: {
      title: "CV Builder Form",
      description: "အလုပ်လျှောက်ရန် ကိုယ်ရေးအကျဉ်းနှင့် CV pdf တင်မည့် form section တစ်ခု ဆောက်ပါ။",
      guide: ["textarea ဖြင့် cover letter နှင့် CV တင်မည့် pdf file upload inputs အတွဲကို Form အတွင်း ဆောက်ပါ။"],
      startingCode: "<form>\n  <label>Cover Letter:</label>\n  <textarea name=\"cover\"></textarea>\n  <br>\n  <label>Upload CV (PDF):</label>\n  <input type=\"file\" name=\"cv\" accept=\".pdf\">\n</form>"
    },
    learningObjectives: {
      what: "<textarea> element, type='file' attribute နှင့် files format validations ကို လေ့လာရန်။",
      why: "ဝဘ်စာမျက်နှာပေါ်တွင် ရှည်လျားသော user stories များနှင့် binary static assets များကို interactive ပုံစံဖြင့် လက်ခံစုဆောင်းရန်။",
      when: "Contact, support requests, feedback dashboards များနှင့် jobs portals များတွင် သုံးသည်။",
      how: "<textarea> opening/closing tag နှင့် <input type='file'> များကို ရေးဆွဲခြင်း။"
    },
    myanmarExplanation: "<textarea> သည် multi-row text box ကို render လုပ်ပေးပြီး၊ <input type='file'> သည် device operating system database နှင့် link ချိတ်ကာ file system blocks များကို reference လုပ်ပေးသည်။",
    theory: "Form-data streams validation တွင် file uploads ဒေတာများကို base64 encode သို့မဟုတ် multipart/form-data binary binary formats များဖြင့် transport encoding layers အဖြစ် browser မှ encode လုပ်ဆောင်သည်။",
    englishKeywords: ["textarea element", "file input", "accept attribute", "Multipart data", "CV upload"],
    stepByStepExplanation: [
      "စာပိုဒ်ရေးသားရန် <textarea> tags သုံးပြီး block စတင်ပါ။",
      "ဖိုင်တင်ရန် <input type='file'> element အား format constraints accept ဖြင့် ထည့်ပါ။"
    ],
    outputPreview: "စာအမြောက်အမြားရေးနိုင်မည့် box ကြီးနှင့် 'Choose File' ဖိုင်ရွေးချယ်ရန် ခလုတ်လေး ပေါ်လာမည်။",
    tips: ["form tags တွင် file uploads ပါဝင်ပါက form tag definition ၌ enctype='multipart/form-data' attribute အား မဖြစ်မနေ ထည့်ပေးရမည်။"],
    assignment: {
      title: "Profile Avatar Setup Panel",
      description: "ကိုယ်ပိုင် ပရိုဖိုင်ဓာတ်ပုံတင်သည့် စနစ်ငယ်တစ်ခု ရေးဆွဲပါ။",
      instructions: ["အသုံးပြုသူ၏ ဓာတ်ပုံတင်ရန် input (JPG, PNG သာ လက်ခံမည့်) နှင့် caption ရေးရန် textarea ပါဝင်သော layout ရေးဆွဲပြပါ။"]
    },
    lessonSummary: "Textarea နှင့် type='file' components များသည် ရှည်လျားသော စာသားများနှင့် ဖိုင်တင်သွင်းမှုလုပ်ငန်းစဉ်များကို HTML forms တွင် လွယ်ကူချောမွေ့စေသည်။",
    nextLesson: "Form Buttons"
  },
  {
    id: "html-39",
    title: "Form Buttons",
    slug: "html-form-buttons",
    duration: "15 mins",
    whatIsIt: "Form Buttons ဆိုသည်မှာ form ဖြည့်သွင်းပြီးနောက် ဒေတာများကို server ဆီသို့ အတည်ပြုပေးပို့စေသော အစပျိုးခလုတ် (Submit Button) နှင့် ရိုက်ထည့်ထားသမျှ ဒေတာများကို ပယ်ဖျက်ကာ မူလအတိုင်း ပြန်လည်ရှင်းလင်းပေးသည့် ခလုတ် (Reset Button) များ ဖြစ်ပါသည်။",
    whyImportant: "ဖြည့်သွင်းထားသော ဒေတာများကို လက်တွေ့ အကောင်အထည်ဖော်ပြီး application process များ စတင်လည်ပတ်စေရန် ဤခလုတ်များ မပါဝင်ဘဲ မဖြစ်နိုင်ပါ။",
    realWorldUsage: "လိပ်စာဖြည့်ပြီးနောက် နှိပ်လိုက်သော 'အတည်ပြုသည် (Submit)' ခလုတ်နှင့် 'ပြန်လည်စတင်မည် (Reset)' ခလုတ်များ ဖြစ်ပါသည်။",
    syntax: `<button type="submit">ပေးပို့မည်</button>
<button type="reset">ဖျက်သိမ်းမည်</button>`,
    examples: [
      `<input type="submit" value="Register Now">
<button type="button" onclick="alert('Hello')">Normal Button</button>`
    ],
    commonMistakes: [
      {
        mistake: "<button>Submit</button> (type attribute မပါဘဲ nested form တွင် သုံးခြင်း)",
        correction: "<button type='submit'>Submit</button> သို့မဟုတ် type='button'",
        explanation: "form code block အတွင်း button element တစ်ခုအား type မသတ်မှတ်ဘဲ သုံးပါက browser သည် ၎င်းကို အလိုအလျောက် type='submit' အဖြစ် သတ်မှတ်သဖြင့် form data များကို trigger လုပ်ပြီး page reload ဖြစ်စေတတ်သည်။ သာမန် ခလုတ်များအတွက် type='button' အမြဲသုံးပါ။"
      }
    ],
    bestPractices: [
      "ခလုတ်များတွင် type attribute (submit, reset, button) အား ရှင်းလင်းပြတ်သားစွာ အမြဲတမ်း သတ်မှတ်ပေးပါ။"
    ],
    miniExercise: {
      id: "ex-html-39",
      instruction: "type='submit' ပါဝင်ပြီး 'Send Data' ဟု စာသားရှိသော button တစ်ခု တည်ဆောက်ပါ။",
      codeTemplate: "<button type=\"submit\">Send Data</button>",
      expectedOutput: "<button type=\"submit\">Send Data</button>",
      hints: ["button element တွင် type='submit' ရေးပြီး စာသားထည့်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-39",
        question: "Form အတွင်း ရိုက်ထည့်ထားသော ဒေတာအားလုံးကို မူလအခြေအနေအတိုင်း ချက်ချင်း ပြန်လည်ရှင်းလင်းပစ်ရန် မည်သည့် button type ကို သုံးသနည်း။",
        options: [
          "submit",
          "reset",
          "clear",
          "remove"
        ],
        correctOptionIndex: 1,
        explanation: "type='reset' attribute သည် browser forms field entries အားလုံးကို client-side တွင် ချက်ချင်း reset ရှင်းလင်းစေသည်။"
      }
    ],
    miniProject: {
      title: "Interactive Clicker",
      description: "Submit ခလုတ်နှင့် Clear ခလုတ်ပါဝင်သော active panel တစ်ခု ဆောက်ပါ။",
      guide: ["form input တစ်ခုအောက်တွင် type='submit' နှင့် type='reset' buttons အတွဲကို တည်ဆောက်ပါ။"],
      startingCode: "<form>\n  <input type=\"text\" placeholder=\"Write name\">\n  <br><br>\n  <button type=\"submit\">Submit</button>\n  <button type=\"reset\">Reset</button>\n</form>"
    },
    learningObjectives: {
      what: "button types (submit, reset, button) တို့၏ ကွာခြားချက်နှင့် application behavior ကို လေ့လာရန်။",
      why: "ဝဘ်ဆိုက် forms များ၏ user execution commands များကို စတင်လည်ပတ် အောင်မြင်စေရန်။",
      when: "Forms dynamic submission panels, user input validations control pages တွေမှာ သုံးသည်။",
      how: "<button type='submit'> သို့မဟုတ် <button type='reset'> များကို ရေးသားခြင်း။"
    },
    myanmarExplanation: "<button> tag သည် visual call-to-action item ကို render ပြုလုပ်ပေးပြီး submit type သည် dynamic form transport mechanism ကို activate လုပ်ပေးသည်။",
    theory: "HTML5 Button controls များသည် default visual interaction state ကို backend APIs pipeline triggers များ သို့မဟုတ် UI controllers များအဖြစ် context layers အလိုက် trigger လုပ်ဆောင်ပေးသည်။",
    englishKeywords: ["submit button", "reset button", "button type", "Form interaction", "Action Trigger"],
    stepByStepExplanation: [
      "<button> opening tag ရေးပြီး type='submit' ကို explicit သတ်မှတ်ပါ။",
      "အတွင်း၌ visual name စာသားရေးသားပြီး button အား ပိတ်ပါ။"
    ],
    outputPreview: "နှိပ်နိုင်သော အတည်ပြုတင်ပြရန် ခလုတ်နှင့် ရှင်းလင်းရန် ခလုတ်ကလေး ပေါ်လာမည်။",
    tips: ["type='button' ခလုတ်များကို custom JavaScript function များနှင့် ချိတ်ဆက်ပြီး dynamic actions များ ပြုလုပ်လေ့ရှိပါသည်။"],
    assignment: {
      title: "Multi-Action Dashboard Buttons",
      description: "ခလုတ်အတွဲလိုက် layout တစ်ခု ဖန်တီးပါ။",
      instructions: ["Form control area တစ်ခုအတွင်း Submit, Reset, Cancel (type='button') ၃ မျိုးစလုံးပါဝင်သော layout ရေးသားပြပါ။"]
    },
    lessonSummary: "Submit နှင့် Reset button tags များသည် အသုံးပြုသူများ ဖြည့်စွက်ထားသော dynamic form ဒေတာများကို server သို့ ပို့ဆောင်ခြင်း သို့မဟုတ် ဖျက်သိမ်းခြင်းတို့ကို တာဝန်ယူပေးသည်။",
    nextLesson: "Form Validation"
  },
  {
    id: "html-40",
    title: "Form Validation",
    slug: "html-form-validation",
    duration: "20 mins",
    whatIsIt: "Form Validation ဆိုသည်မှာ အသုံးပြုသူများ ဖြည့်စွက်လိုက်သော အချက်အလက်များသည် သတ်မှတ်ထားသော ပုံစံ၊ လမ်းညွှန်ချက်များနှင့် ကိုက်ညီမှု ရှိမရှိ (ဥပမာ- password ဖြည့်ရန် မေ့ကျန်ခဲ့ခြင်း၊ email တွင် @ မပါဝင်ခြင်း) ကို browser မှ တိုက်ရိုက် စစ်ဆေးတားဆီးပေးသည့် စနစ်ဖြစ်ပါသည်။",
    whyImportant: "မပြည့်စုံသော ဒေတာများ သို့မဟုတ် အမှားအယွင်းရှိသော ဒေတာများ backend server သို့ မရောက်ရှိမီ client-side တွင် ကြိုတင်ကာကွယ်ပေးသဖြင့် web performance ကို မြင့်တင်ပေးပြီး data leaks ဖြစ်ခြင်းကို လျှော့ချပေးသည်။",
    realWorldUsage: "လိပ်စာဖြည့်ရာတွင် email field မဖြစ်မနေ လိုအပ်သော 'required' warning error တက်လာခြင်းမျိုး ဖြစ်ပါသည်။",
    syntax: `<input type="text" required>
<input type="email" placeholder="Email">`,
    examples: [
      `<input type="password" minlength="8" required>
<input type="number" min="18" max="100">`
    ],
    commonMistakes: [
      {
        mistake: "<input type='text' name='mail'> (email ဖြည့်ခိုင်းရန် type text သက်သက်ကိုသာ သုံးစွဲခြင်း)",
        correction: "<input type='email' name='mail' required>",
        explanation: "email format verification အား browser မှ စနစ်တကျ trigger လုပ်စေရန် type='email' ကို သုံးစွဲရပါမည်။ value validations error ကို automatic တားဆီးပေးမည် ဖြစ်သည်။"
      }
    ],
    bestPractices: [
      "မဖြည့်မနေရ ကွင်းပြင်များအတွက် HTML default required attributes ကို အမြဲထည့်သွင်းသုံးစွဲပါ။",
      "အသုံးပြုသူများ ဖြည့်စွက်ရမည့် rules များကို placeholder သို့မဟုတ် labels များတွင် ကြိုတင်ဖော်ပြပေးပါ။"
    ],
    miniExercise: {
      id: "ex-html-40",
      instruction: "type='email' ဖြစ်ပြီး required attribute ပါဝင်သော input တစ်ခု တည်ဆောက်ပါ။",
      codeTemplate: "<input type=\"email\" required>",
      expectedOutput: "<input type=\"email\" required>",
      hints: ["input component တွင် type='email' နှင့် validation tag require parameters ကို ထည့်ပါ။"]
    },
    quiz: [
      {
        id: "q-html-40",
        question: "အသုံးပြုသူအား input field တစ်ခုအား မဖြစ်မနေ ဖြည့်စွက်ခိုင်းရန် မည်သည့် boolean attribute အား ထည့်သွင်းရသနည်း။",
        options: [
          "validate",
          "required",
          "mandatory",
          "checked"
        ],
        correctOptionIndex: 1,
        explanation: "required boolean attribute သည် form submit မလုပ်ခင် client inputs အားလုံးတွင် values မဖြစ်မနေ ရှိနေရမည်ဟု browser အား ညွှန်ကြားသည်။"
      }
    ],
    miniProject: {
      title: "Secure Member Application",
      description: "အခြေခံ format validation များ အပြည့်အဝ ပါဝင်သော အဖွဲ့ဝင်လျှောက်လွှာ စနစ်တစ်ခု ဆောက်ပါ။",
      guide: ["Email ဖြည့်ရန် type='email' နှင့် required password input minlength='8' တို့ကို form အတွင်း တည်ဆောက်ပါ။"],
      startingCode: "<form>\n  <label>Email Address:</label>\n  <input type=\"email\" required placeholder=\"mail@domain.com\">\n  <br><br>\n  <label>Password (Min 8 chars):</label>\n  <input type=\"password\" minlength=\"8\" required>\n  <br><br>\n  <button type=\"submit\">Join Us</button>\n</form>"
    },
    learningObjectives: {
      what: "required, minlength, maxlength, min, max, pattern validation HTML characteristics ကို နားလည်ရန်။",
      why: "ဝဘ်ဆိုက်၏ input data integrity ကို မြှင့်တင်ရန်နှင့် server traffic load သက်သာစေရန်။",
      when: "User inputs check, financial entry pages, dynamic login templates တွေမှာ သုံးသည်။",
      how: "input field properties တွင် rules keywords (required, minlength) တို့အား တိုက်ရိုက် ကြေညာခြင်း။"
    },
    myanmarExplanation: "validation attributes များသည် dynamic regular expressions ကို default native form control module အောက်တွင် browser မှ dynamic checking flags များဖြင့် စစ်ဆေးပေးသဖြင့် JS ကုဒ်ရေးရန် မလိုဘဲ အမှားများကို ချက်ချင်း ပြသပေးသည်။",
    theory: "HTML5 Constraint Validation APIs model သည် form input validity states များကို UI parsing level တွင် intercept လုပ်ပြီး invalid structures payloads များကို server ဆီသို့ မပို့မီ submit actions ကို prevent lock လုပ်ပေးသည်။",
    englishKeywords: ["Form Validation", "required attribute", "minlength constraint", "pattern attribute", "Data Integrity"],
    stepByStepExplanation: [
      "<input> element တစ်ခုကို ဖန်တီးပါ။",
      "required property ထည့်သွင်းပြီး browser validity rules ကို constraint triggers စနစ်တကျ ပြောင်းလဲအသုံးပြုပါ။"
    ],
    outputPreview: "ကွင်းပြင်ကို အလွတ်ထားပြီး submit လုပ်ပါက 'Please fill out this field' ဟူသော သတိပေးချက် တက်လာမည်။",
    tips: ["'pattern' attribute တွင် Regular Expression (Regex) ကုဒ်များ ထည့်သွင်းပြီး အဆင့်မြင့် စာလုံးပုံစံများပါ စစ်ဆေးနိုင်ပါသည်။"],
    assignment: {
      title: "Age Verification Block",
      description: "အသက် ၁၈ နှစ်အထက်သာ လက်ခံမည့် dynamic user age verification field တည်ဆောက်ပါ။",
      instructions: ["type='number' နှင့် min='18' validation boundaries ပါဝင်သော input setup layout ရေးဆွဲစမ်းသပ်ပြပါ။"]
    },
    lessonSummary: "HTML5 Constraint forms validation properties (required, minlength, etc.) များသည် data errors များကို server သို့မရောက်မီ client-side တွင် ချက်ချင်း တားဆီးစစ်ဆေးပေးသည်။",
    nextLesson: "Div vs Span"
  }
];
