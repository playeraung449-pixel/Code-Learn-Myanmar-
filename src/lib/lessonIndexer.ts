/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { Course, Lesson, QuizQuestion } from "../types";

const KNOWN_COURSES: Record<string, Partial<Course>> = {
  "prog-basics-python": {
    id: "prog-basics-python",
    title: "Programming Basics with Python",
    slug: "programming-basics-python",
    description: "ကွန်ပြူတာပရိုဂရမ်မင်းအခြေခံသဘောတရားများကို Python ဘာသာစကားဖြင့် အစမှစတင်ပြီး နားလည်လွယ်ဆုံး လေ့လာပါ။",
    category: "basics",
    difficulty: "Level 1: Beginner",
    estimatedTime: "4 Hours",
    projectCount: 1,
    prerequisites: ["ကွန်ပျူတာ အခြေခံ အသုံးပြုတတ်ရပါမည်။ (Basic computer literacy)"],
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
    finalProject: {
      title: "Health & Fitness Care System (ကျန်းမာရေးစောင့်ရှောက်မှုစနစ်)",
      description: "အသုံးပြုသူ၏ ကိုယ်အလေးချိန်၊ အမြင့်နှင့် အသက်တို့ကို variable များဖြင့် သိမ်းဆည်းပြီး၊ BMI ကို တွက်ချက်ကာ အခြေအနေအလိုက် အကြံပြုချက်များကို အလိုအလျောက် သတ်မှတ်ပေးသော ပရိုဂရမ်တစ်ခု တည်ဆောက်ပါ။",
      guide: [
        "အဆင့် ၁ - အလေးချိန်၊ အမြင့်၊ အသက်နှင့် နာမည်တို့ကို ကိန်းရှင်များအဖြစ် ကြေညာပါ။",
        "အဆင့် ၂ - BMI ပုံသေနည်း (weight / height^2) ကို အသုံးပြု၍ တွက်ချက်ပါ။",
        "အဆင့် ၃ - If-Elif-Else ကို အသုံးပြု၍ ကျန်းမာရေးအခြေအနေနှင့် သင့်လျော်သော အကြံပြုချက်များကို ပြသပါ။"
      ],
      startingCode: `name = "Aung Aung"\nweight = 75\nheight = 1.8\n\n# ဤနေရာတွင် BMI ပုံသေနည်းအတိုင်း တွက်ချက်ပြီး ရလဒ်နှင့် အကြံပြုချက်များကို print ထုတ်ပါ`,
      solutionCode: `name = "Aung Aung"\nweight = 75\nheight = 1.8\n\nbmi = weight / (height ** 2)\nprint("Your BMI: " + str(round(bmi, 2)))\n\nif bmi < 18.5:\n    print("ကျန်းမာရေးအကြံပြုချက်: ကိုယ်အလေးချိန် နည်းလွန်းသဖြင့် အာဟာရပြည့်ဝအောင် စားသုံးပါ")\nelif bmi >= 18.5 and bmi <= 24.9:\n    print("ကျန်းမာရေးအကြံပြုချက်: ကျန်းမာသော ပုံမှန်ကိုယ်အလေးချိန် ဖြစ်ပါသည်")\nelse:\n    print("ကျန်းမာရေးအကြံပြုချက်: ကိုယ်အလေးချိန် များလွန်းသဖြင့် လေ့ကျင့်ခန်းပြုလုပ်ရန် အကြံပြုပါသည်")`
    },
    courseSummary: "ဂုဏ်ယူပါတယ်! ဤသင်တန်းကို ပြီးမြောက်ခြင်းဖြင့် သင်သည် ပရိုဂရမ်မင်း၏ အခြေခံအကျဆုံးနှင့် အရေးကြီးဆုံး သဘောတရားများဖြစ်သော ကိန်းရှင်များ၊ If-Else Logic များကို ကောင်းစွာ နားလည်သဘောပေါက်သွားပြီ ဖြစ်ပြီး နောက်တစ်ဆင့်တက်လှမ်းရန် အဆင်သင့် ဖြစ်နေပါပြီ။"
  },
  "web-dev-html": {
    id: "web-dev-html",
    title: "Web Development: HTML5 & CSS3 Essentials",
    slug: "web-dev-html",
    description: "ကမ္ဘာ့အသုံးအများဆုံး နည်းပညာဖြစ်တဲ့ ဝက်ဘ်ဆိုက်တည်ဆောက်ခြင်းကို HTML နှင့် CSS သုံးပြီး ကိုယ်တိုင်ရေးသားဖန်တီးနိုင်အောင် သင်ယူပါ။",
    category: "web",
    difficulty: "Level 1: Beginner",
    estimatedTime: "20-30 Hours",
    projectCount: 10,
    prerequisites: ["ကွန်ပျူတာ အခြေခံ အသုံးပြုတတ်ခြင်း သို့မဟုတ် ပရိုဂရမ်မင်း အခြေခံ သဘောတရားများကို နားလည်ထားခြင်း။"],
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
    finalProject: {
      title: "My Personal Landing Page (ကိုယ်ပိုင်ပင်မစာမျက်နှာ)",
      description: "သင့်ရဲ့ အချက်အလက်များ၊ ကျွမ်းကျင်မှုများ၊ ပရောဂျက်များနှင့် ဆက်သွယ်ရန်လိပ်စာများ ပါဝင်သော လှပသပ်ရပ်သည့် ကိုယ်ပိုင် Portfolio ဝက်ဘ်ဆိုက်တစ်ခုကို HTML5 structural tags များကို သုံးပြီး တည်ဆောက်ပါ။",
      guide: [
        "အဆင့် ၁ - HTML Structural tags များကို သုံးပြီး skeleton တည်ဆောက်ပါ။",
        "အဆင့် ၂ - Header၊ Main Content နှင့် Footer များကို ခွဲခြားပါ။",
        "အဆင့် ၃ - သင့်ဓာတ်ပုံတစ်ခုနှင့် အခြားသော social links များကို ချိတ်ဆက်ပါ။"
      ],
      startingCode: `<!DOCTYPE html>\n<html>\n<head>\n    <title>My Portfolio</title>\n</head>\n<body>\n    <!-- ဤနေရာတွင် သင့်ရဲ့ Portfolio ကိုယ်တိုင် ရေးသားတည်ဆောက်ပါ -->\n</body>\n</html>`,
      solutionCode: `<!DOCTYPE html>\n<html>\n<head>\n    <title>My Portfolio</title>\n</head>\n<body>\n    <header>\n        <h1>Aung Ko Portfolio</h1>\n        <p>Software Engineer</p>\n    </header>\n    <main>\n        <section>\n            <h2>ကျွမ်းကျင်မှုများ (Skills)</h2>\n            <ul>\n                <li>HTML5 / CSS3</li>\n                <li>Python Programming</li>\n            </ul>\n        </section>\n    </main>\n    <footer>\n        <p>Contact: aungko@email.com</p>\n    </footer>\n</body>\n</html>`
    },
    courseSummary: "ဂုဏ်ယူပါတယ်! သင်သည် HTML5 ကို သုံးပြီး ကိုယ်ပိုင်ဝက်ဘ်ဆိုက်တစ်ခု၏ တည်ဆောက်ပုံကို စနစ်တကျ ပုံဖော်တတ်သွားပါပြီ။"
  },
  "git-github-vcs": {
    id: "git-github-vcs",
    title: "Git & GitHub: Version Control",
    slug: "git-github-vcs",
    description: "ကုဒ်တွေကို သိမ်းဆည်း၊ စီမံခန့်ခွဲပြီး အဖွဲ့အစည်းနဲ့ လုပ်ဆောင်တတ်စေဖို့ မဖြစ်မနေလိုအပ်တဲ့ Git tool ကို ကျွမ်းကျင်အောင် လေ့လာပါ။",
    category: "git",
    difficulty: "Level 2: Basic",
    estimatedTime: "3 Hours",
    projectCount: 1,
    prerequisites: ["ကွန်ပျူတာ အခြေခံ အသုံးပြုတတ်ခြင်း သို့မဟုတ် ဖိုင်စနစ်များအကြောင်း နားလည်ထားခြင်း။"],
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
    courseSummary: "ဂုဏ်ယူပါတယ်! ယခုအခါ သင်သည် Git ကို အသုံးပြု၍ သင့်ကုဒ်များ၏ ဗားရှင်းများကို ပရော်ဖက်ရှင်နယ် ဆန်ဆန် ထိန်းချုပ်နိုင်စွမ်း ရှိသွားပါပြီ။"
  }
};

/**
 * Parses frontmatter (YAML block delimited by ---) from file content.
 */
function parseFrontmatter(fileContent: string): { metadata: Record<string, any>; body: string } {
  const metadata: Record<string, any> = {};
  let body = fileContent;

  if (fileContent.startsWith("---")) {
    const endIdx = fileContent.indexOf("---", 3);
    if (endIdx !== -1) {
      const yamlBlock = fileContent.substring(3, endIdx);
      body = fileContent.substring(endIdx + 3).trim();

      const lines = yamlBlock.split("\n");
      for (const line of lines) {
        const colonIdx = line.indexOf(":");
        if (colonIdx !== -1) {
          const key = line.substring(0, colonIdx).trim();
          let valStr = line.substring(colonIdx + 1).trim();

          // Clean values (quotes, arrays, etc.)
          if (valStr.startsWith("[") && valStr.endsWith("]")) {
            metadata[key] = valStr
              .substring(1, valStr.length - 1)
              .split(",")
              .map((item) => item.replace(/['"]/g, "").trim())
              .filter(Boolean);
          } else {
            // strip surrounding quotes
            if ((valStr.startsWith("'") && valStr.endsWith("'")) || (valStr.startsWith('"') && valStr.endsWith('"'))) {
              valStr = valStr.substring(1, valStr.length - 1);
            }
            metadata[key] = valStr;
          }
        }
      }
    }
  }
  return { metadata, body };
}

/**
 * Parses markdown file structure into Lesson object
 */
export function parseMarkdownToLesson(filePath: string, relativePath: string): Lesson {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const fileName = path.basename(filePath, ".md");
  const folderName = path.basename(path.dirname(filePath)); // e.g. "html", "css", "python"

  const { metadata, body } = parseFrontmatter(fileContent);

  // Split by "## " to extract heading sections
  const sections: Record<string, string> = {};
  const splitParts = body.split(/\n##\s+/);
  
  // The first part is everything before the first "## " heading
  const firstPart = splitParts[0] || "";
  
  for (let i = 1; i < splitParts.length; i++) {
    const part = splitParts[i];
    const newlineIdx = part.indexOf("\n");
    if (newlineIdx !== -1) {
      const heading = part.substring(0, newlineIdx).trim();
      const content = part.substring(newlineIdx + 1).trim();
      sections[heading] = content;
    } else {
      sections[part.trim()] = "";
    }
  }

  // Get title
  let title = metadata.title || "";
  if (!title) {
    const titleMatch = firstPart.match(/^#\s+Title:\s*(.+)$/m) || firstPart.match(/^#\s*(.+)$/m);
    title = titleMatch ? titleMatch[1].trim() : fileName.replace(/^\d+-/, "").replace(/-/g, " ");
  }

  // Determine course ID
  let courseId = metadata.course || "";
  if (!courseId) {
    if (folderName === "html" || folderName === "css" || folderName === "javascript") {
      courseId = "web-dev-html";
    } else if (folderName === "python") {
      courseId = "prog-basics-python";
    } else if (folderName === "git" || folderName === "github") {
      courseId = "git-github-vcs";
    } else {
      courseId = `course-${folderName}`;
    }
  }

  const id = metadata.id || `${folderName}-${fileName}`;
  const slug = metadata.slug || fileName;
  const duration = metadata.estimatedTime || "30 mins";

  // Parse Introduction section
  const introText = sections["Introduction"] || firstPart.replace(/^#\s+.*/m, "").trim();
  const whatIsIt = introText.split("\n\n")[0]?.trim() || "အခြေခံပရိုဂရမ်မင်း သင်ခန်းစာ ဖြစ်ပါသည်။";

  // Parse Learning Objectives
  const objectivesText = sections["Learning Objectives"] || "";
  const objectivesLines = objectivesText
    .split("\n")
    .map((l) => l.replace(/^\d+[\.\)]\s*/, "").replace(/^-\s*/, "").trim())
    .filter((l) => l.length > 0 && !l.includes("ပြီးမြောက်ပါက") && !l.includes("တတ်မြောက်နိုင်မည်"));

  const learningObjectives = {
    what: objectivesLines[0] || "အခြေခံ သဘောတရားကို နားလည်ခြင်း။",
    why: objectivesLines[1] || "ပရိုဂရမ်ရေးသားရာတွင် အရေးကြီးပုံကို သိရှိခြင်း။",
    when: objectivesLines[2] || "လက်တွေ့လုပ်ငန်းများတွင် စတင်အသုံးပြုခြင်း။",
    how: objectivesLines[3] || "နမူနာပရောဂျက်ငယ်များ တည်ဆောက်နိုင်ခြင်း။"
  };

  // Theory
  const theory = sections["Theory"] || "";

  // Syntax
  const syntaxText = sections["Syntax"] || "";
  const syntaxMatch = syntaxText.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  const syntax = syntaxMatch ? syntaxMatch[1].trim() : syntaxText;

  // Code Examples
  const examplesText = sections["Code Examples"] || sections["Examples"] || "";
  const examples: string[] = [];
  const rx = /```[a-zA-Z]*\n([\s\S]*?)```/g;
  let match;
  while ((match = rx.exec(examplesText)) !== null) {
    examples.push(match[1].trim());
  }
  if (examples.length === 0) {
    examples.push(syntax);
  }

  // Common Mistakes
  const mistakesText = sections["Common Mistakes"] || "";
  const mistakesLines = mistakesText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.match(/^\d+[\.\)]/) || l.startsWith("-"));

  const commonMistakes = mistakesLines.map((line) => {
    const clean = line.replace(/^\d+[\.\)]\s*/, "").replace(/^-\s*/, "");
    const titleMatch = clean.match(/\*\*(.*?)\*\*/);
    const titleText = titleMatch ? titleMatch[1] : "မှားယွင်းမှု";
    
    const codeMatch = clean.match(/`(.*?)`/);
    const wrongCode = codeMatch ? codeMatch[1] : clean;
    const explanation = clean.replace(/\*\*.*?\*\*\s*:?\s*/, "").replace(/`.*?`/, "").replace(/[\(\)]/g, "").trim();

    return {
      mistake: wrongCode,
      correction: "Correction listed in details.",
      explanation: `${titleText}: ${explanation || "စနစ်တကျ ရေးသားရန် လိုအပ်ပါသည်။"}`
    };
  });

  if (commonMistakes.length === 0) {
    commonMistakes.push({
      mistake: "Semicolon or closing brackets missing",
      correction: "Check code syntax completeness",
      explanation: "ရေးထုံးစည်းကမ်းများကို သေချာစွာ လိုက်နာရန် လိုအပ်ပါသည်။"
    });
  }

  // Best Practices
  const bestPracticesText = sections["Best Practices"] || "";
  const bestPractices = bestPracticesText
    .split("\n")
    .map((l) => l.replace(/^-\s*/, "").replace(/^\d+[\.\)]\s*/, "").trim())
    .filter((l) => l.length > 0);
  if (bestPractices.length === 0) {
    bestPractices.push("ကုဒ်များကို သန့်ရှင်းသပ်ရပ်စွာ Indentation ချန်ပြီး ရေးသားပါ။");
    bestPractices.push("Variable များနှင့် Functions နာမည်များကို အဓိပ္ပာယ်ရှိစွာ ပေးပါ။");
  }

  // Mini Exercise
  const exerciseText = sections["Mini Exercise"] || sections["Exercises"] || "";
  const exerciseCodeMatch = exerciseText.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  const exerciseCode = exerciseCodeMatch ? exerciseCodeMatch[1].trim() : "";
  const exerciseInstruction = exerciseText.replace(/```[\s\S]*?```/, "").trim() || "အောက်ပါ လေ့ကျင့်ခန်းကို ပြီးမြောက်အောင် ဖြေဆိုပါ။";

  const miniExercise = {
    id: `ex-${id}`,
    instruction: exerciseInstruction,
    codeTemplate: exerciseCode || "# ဤနေရာတွင် ကုဒ်ဖြည့်စွက်ပါ",
    expectedOutput: exerciseCode ? exerciseCode.split("\n").pop()?.replace(/^print\(|^\s*console\.log\(|[\)'"]/g, "").trim() || "Web Dev" : "Web Dev",
    hints: ["သင်ခန်းစာတွင် လေ့လာခဲ့သည့် syntax အတိုင်း ရေးဆွဲပါ။", "ကုဒ်ရေးထုံးစည်းကမ်းကို လိုက်နာပါ။"]
  };

  // Quiz questions
  const quizText = sections["Quiz"] || sections["Quizzes"] || "";
  const quiz: QuizQuestion[] = [];
  const qBlocks = quizText.split(/\*\*(?:မေးခွန်း|Question)\s*\d+.*?\*\*:/i);
  const qHeaders = quizText.match(/\*\*(?:မေးခွန်း|Question)\s*(\d+).*?\*\*:/gi) || [];

  for (let i = 1; i < qBlocks.length; i++) {
    const block = qBlocks[i];
    const questionNum = qHeaders[i - 1] ? qHeaders[i - 1].replace(/[^\d]/g, "") : String(i);
    const optionStartIndex = block.search(/-\s*A:/i);
    if (optionStartIndex === -1) continue;

    const questionStatement = block.substring(0, optionStartIndex).trim();
    const options: string[] = [];

    const optAMatch = block.match(/-\s*A:\s*(.*?)(?=\r?\n-\s*B:|\r?\n-\s*C:|\r?\n-\s*D:|\r?\n\*Correct|\r?\n\*Explanation|$)/is);
    const optBMatch = block.match(/-\s*B:\s*(.*?)(?=\r?\n-\s*A:|\r?\n-\s*C:|\r?\n-\s*D:|\r?\n\*Correct|\r?\n\*Explanation|$)/is);
    const optCMatch = block.match(/-\s*C:\s*(.*?)(?=\r?\n-\s*A:|\r?\n-\s*B:|\r?\n-\s*D:|\r?\n\*Correct|\r?\n\*Explanation|$)/is);
    const optDMatch = block.match(/-\s*D:\s*(.*?)(?=\r?\n-\s*A:|\r?\n-\s*B:|\r?\n-\s*C:|\r?\n\*Correct|\r?\n\*Explanation|$)/is);

    if (optAMatch) options.push(optAMatch[1].trim());
    if (optBMatch) options.push(optBMatch[1].trim());
    if (optCMatch) options.push(optCMatch[1].trim());
    if (optDMatch) options.push(optDMatch[1].trim());

    const correctMatch = block.match(/\*Correct\s*Answer\*:\s*([A-D])/i) || block.match(/Correct\s*Answer:\s*([A-D])/i);
    const correctLetter = correctMatch ? correctMatch[1].toUpperCase() : "A";
    const correctOptionIndex = ["A", "B", "C", "D"].indexOf(correctLetter);

    const explanationMatch = block.match(/\*Explanation\*:\s*([\s\S]*?)$/i) || block.match(/Explanation:\s*([\s\S]*?)$/i);
    const explanation = explanationMatch ? explanationMatch[1].replace(/^\*/, "").replace(/\*$/, "").trim() : "မှန်ကန်သော အဖြေဖြစ်ပါသည်။";

    quiz.push({
      id: `q-${id}-${questionNum}-${i}`,
      question: questionStatement,
      options: options.length === 4 ? options : ["Option A", "Option B", "Option C", "Option D"],
      correctOptionIndex: correctOptionIndex !== -1 ? correctOptionIndex : 0,
      explanation
    });
  }

  if (quiz.length === 0) {
    // Add default quiz question if none parsed
    quiz.push({
      id: `q-${id}-default`,
      question: `${title} ၏ အခြေခံ သဘောတရားနှင့် ကိုက်ညီသော ဖော်ပြချက်ကို ရွေးချယ်ပါ။`,
      options: [
        "စနစ်တကျနှင့် မှန်ကန်စွာ ရေးသားအသုံးပြုရပါမည်။",
        "မမှန်ကန်သော ပုံစံများကိုသာ သုံးရပါမည်။",
        "မည်သည့်ပုံစံမဆို ကွန်ပျူတာက နားလည်နိုင်ပါသည်။",
        "အင်္ဂလိပ်ဝေါဟာရများ သုံးရန် မလိုအပ်ပါ။"
      ],
      correctOptionIndex: 0,
      explanation: "ပရိုဂရမ်မင်းတွင် စနစ်ကျပြီး ရေးထုံးမှန်ကန်သော ကုဒ်များကိုသာ ကွန်ပျူတာက နားလည်ဆောင်ရွက်နိုင်ပါသည်။"
    });
  }

  // Mini Project parsing
  const projText = sections["Mini Project"] || "";
  const projTitleMatch = projText.match(/\*\*ခေါင်းစဉ်\*\*:\s*(.*?)(?=\n|$)/);
  const projTitle = projTitleMatch ? projTitleMatch[1].trim() : `${title} Project Challenge`;

  const projDescMatch = projText.match(/\*\*ဖော်ပြချက်\*\*:\s*([\s\S]*?)(?=\n\*\*|$)/);
  const projDesc = projDescMatch ? projDescMatch[1].trim() : "သင်ခန်းစာမှ သင်ယူခဲ့သည်များကို အသုံးပြု၍ လက်တွေ့စိန်ခေါ်မှုတစ်ခု ဖန်တီးပါ။";

  const projGuideLines = projText.match(/\*\*လုပ်ဆောင်ရန်အဆင့်များ\*\*:\s*([\s\S]*?)(?=\n\*\*|$)/);
  const projGuide = projGuideLines
    ? projGuideLines[1].split("\n").map((l) => l.replace(/^\d+[\.\)]\s*/, "").replace(/^-\s*/, "").trim()).filter(Boolean)
    : ["အခြေခံ တည်ဆောက်ပုံကို ရေးဆွဲပါ။", "ကုဒ်များကို စမ်းသပ်ပြီး Output ကို စစ်ဆေးပါ။"];

  const projCodes: string[] = [];
  const rxProj = /```[a-zA-Z]*\n([\s\S]*?)```/g;
  let mProj;
  while ((mProj = rxProj.exec(projText)) !== null) {
    projCodes.push(mProj[1].trim());
  }

  const miniProject = {
    title: projTitle,
    description: projDesc,
    guide: projGuide,
    startingCode: projCodes[0] || "// Write your code here",
    solutionCode: projCodes[1] || projCodes[0] || ""
  };

  // Additional sections for 17 Myanmar platform parts
  const englishKeywords = metadata.keywords || ["Syntax", "Structure"];
  const myanmarExplanation = theory || whatIsIt;
  const outputPreview = sections["Output Preview"] || sections["Output"] || "Success";
  const tips = sections["Tips"] ? [sections["Tips"]] : ["ကုဒ်များကို အမြဲ လက်တွေ့ ရေးသားစမ်းသပ်ပါ။"];
  const lessonSummary = sections["Summary"] || "ယခု သင်ခန်းစာကို အောင်မြင်စွာ လေ့လာပြီးမြောက်သွားပြီ ဖြစ်ပါသည်။";
  const nextLesson = sections["Next Lesson"] || "နောက်တစ်ဆင့်ကို ဆက်လက် လေ့လာပါ။";

  const assignmentText = sections["Assignment"] || "";
  const assignmentTitleMatch = assignmentText.match(/\*\*လိုအပ်ချက်များ\*\*:\s*([\s\S]*?)(?=\n\*\*|$)/i) || assignmentText.match(/\*\*ခေါင်းစဉ်\*\*:\s*(.*?)(?=\n|$)/i);
  const assignment = {
    title: assignmentTitleMatch ? "စိန်ခေါ်မှု အိမ်စာ" : "Assignment Challenge",
    description: assignmentText.split("\n\n")[0]?.trim() || "သင်ခန်းစာကို လေ့လာပြီး အောက်ပါ အိမ်စာအား လက်တွေ့ လုပ်ဆောင်ပါ။",
    instructions: assignmentText.split("\n").map(l => l.trim()).filter(l => l.length > 0 && (l.startsWith("၁") || l.startsWith("1") || l.startsWith("-")))
  };

  return {
    id,
    title,
    slug,
    duration,
    markdownPath: relativePath,
    whatIsIt,
    whyImportant: theory.split("\n\n")[0]?.trim() || whatIsIt,
    realWorldUsage: "Facebook, Google, YouTube စသည့် နည်းပညာလုပ်ငန်းကြီးများတွင် နေ့စဉ်အသုံးချလျက် ရှိသည်။",
    syntax,
    examples,
    commonMistakes,
    bestPractices,
    miniExercise,
    quiz,
    miniProject,
    learningObjectives,
    myanmarExplanation,
    englishKeywords,
    theory,
    outputPreview,
    tips,
    assignment,
    lessonSummary,
    nextLesson
  };
}

/**
 * Automatically discovers all lessons inside content/ folder recursively,
 * parses them, builds Courses array, and outputs the result.
 */
export function discoverAndIndexLessons(): Course[] {
  const rootContentPath = path.join(process.cwd(), "public", "content");
  if (!fs.existsSync(rootContentPath)) {
    console.warn("Content directory not found:", rootContentPath);
    return [];
  }

  // Scanned files map grouped by courseId
  const courseLessonsMap: Record<string, Lesson[]> = {};

  const categories = fs.readdirSync(rootContentPath);

  for (const cat of categories) {
    const catPath = path.join(rootContentPath, cat);
    if (!fs.statSync(catPath).isDirectory()) continue;

    const files = fs.readdirSync(catPath);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;

      const filePath = path.join(catPath, file);
      const relativePath = `/content/${cat}/${file}`;

      try {
        const lesson = parseMarkdownToLesson(filePath, relativePath);
        
        // Find or determine course ID
        let courseId = lesson.markdownPath ? lesson.markdownPath.split("/")[2] : ""; // e.g. "html"
        // map folder to standard courseIds
        if (courseId === "html" || courseId === "css" || courseId === "javascript") {
          courseId = "web-dev-html";
        } else if (courseId === "python") {
          courseId = "prog-basics-python";
        } else if (courseId === "git" || courseId === "github") {
          courseId = "git-github-vcs";
        } else {
          courseId = `course-${courseId}`;
        }

        if (!courseLessonsMap[courseId]) {
          courseLessonsMap[courseId] = [];
        }
        courseLessonsMap[courseId].push(lesson);
      } catch (err) {
        console.error(`Error parsing lesson file ${filePath}:`, err);
      }
    }
  }

  // Construct complete typed Course array
  const indexedCourses: Course[] = [];

  for (const [courseId, lessons] of Object.entries(courseLessonsMap)) {
    // Sort lessons by lessonNumber or file name sequence (001, 002, etc.)
    lessons.sort((a, b) => {
      const aPath = a.markdownPath || "";
      const bPath = b.markdownPath || "";
      return aPath.localeCompare(bPath);
    });

    const baseShell = KNOWN_COURSES[courseId] || {
      id: courseId,
      title: `Learn ${courseId.replace("course-", "").toUpperCase()}`,
      slug: courseId,
      description: `${courseId.replace("course-", "").toUpperCase()} ပရိုဂရမ်မင်းနှင့် အခြေခံသဘောတရားများကို အစမှအဆုံး စနစ်တကျ လေ့လာပါ။`,
      category: "basics",
      difficulty: "Level 1: Beginner",
      estimatedTime: "10 Hours",
      projectCount: 1,
      prerequisites: ["ကွန်ပျူတာ အခြေခံ အသုံးပြုတတ်ရပါမည်။"],
      learningOutcomes: [`${courseId.toUpperCase()} အခြေခံသဘောတရားများကို နားလည်သဘောပေါက်ခြင်း`],
      certificateAvailable: true,
      introduction: `${courseId.toUpperCase()} သင်တန်းမှ ကြိုဆိုပါသည်။`,
      roadmap: [{ step: "၁", title: "Introduction", description: "အခြေခံ မိတ်ဆက်များ လေ့လာခြင်း" }],
      finalProject: {
        title: "Final Challenge Project",
        description: "သင်ခန်းစာများအားလုံး ပေါင်းစပ်၍ ကိုယ်ပိုင် ဖန်တီးမှုတစ်ခု တည်ဆောက်ပါ။",
        guide: ["အဆင့်ဆင့် ဖြေရှင်းပါ"],
        startingCode: "// Write your code",
        solutionCode: "// Solution code"
      },
      courseSummary: "သင်ခန်းစာအားလုံး အောင်မြင်စွာ လေ့လာပြီးမြောက်သွားပြီ ဖြစ်ပါသည်။"
    };

    // Calculate dynamic stats
    const totalDurationMins = lessons.reduce((acc, curr) => {
      const num = parseInt(curr.duration.replace(/[^\d]/g, "")) || 30;
      return acc + num;
    }, 0);
    const estimatedTime = `${Math.ceil(totalDurationMins / 60)} Hours`;

    indexedCourses.push({
      ...baseShell,
      id: courseId,
      lessons,
      lessonCount: lessons.length,
      quizzesCount: lessons.length,
      assignmentsCount: lessons.length,
      estimatedTime
    } as Course);
  }

  // Sort final courses to maintain stable ordering: basics first, web second, git third, then any dynamic ones
  const order = ["prog-basics-python", "web-dev-html", "git-github-vcs"];
  indexedCourses.sort((a, b) => {
    const idxA = order.indexOf(a.id);
    const idxB = order.indexOf(b.id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.title.localeCompare(b.title);
  });

  return indexedCourses;
}
