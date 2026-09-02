# Title: Code Editor (ကုဒ်ရေးစနစ်များ) နှင့် VS Code တပ်ဆင်ခြင်း

## Introduction
မင်္ဂလာပါ ခင်ဗျာ။ HTML ကုဒ်တွေကို ရေးသားဖို့အတွက် ကျွန်တော်တို့မှာ ကုဒ်ရေးစနစ် သို့မဟုတ် Text Editor တစ်ခု မရှိမဖြစ် လိုအပ်ပါတယ်။ Notepad ထက် ပိုမိုမြန်ဆန်ပြီး ကူညီပေးနိုင်တဲ့ အကောင်းဆုံးကုဒ်ရေးဆော့ဖ်ဝဲဖြစ်တဲ့ VS Code အကြောင်းကို လေ့လာသွားပါမယ်။

## Learning Objectives
ဤသင်ခန်းစာ ပြီးမြောက်ပါက အောက်ပါတို့ကို တတ်မြောက်နိုင်မည် ဖြစ်ပါသည် -
1. Text Editor အမျိုးမျိုးနှင့် ၎င်းတို့၏ ကွာခြားချက်များကို သိရှိခြင်း။
2. VS Code (Visual Studio Code) ကို စနစ်တကျ ဒေါင်းလုဒ်လုပ်ပြီး တပ်ဆင်တတ်ခြင်း။
3. လိုအပ်သော Extensions (ဥပမာ - Live Server) များကို ထည့်သွင်းတတ်ခြင်း။
4. ပထမဆုံး HTML ဖိုင်ကို ဆောက်လုပ်ပြီး Live စမ်းသပ်ကြည့်ရှုနိုင်ခြင်း။

## Theory
Code Editor ဆိုသည်မှာ ကုဒ်များကို ရေးသားရာတွင် ကူညီပေးရန်အတွက် syntax highlighting (အရောင်ခွဲပြစနစ်)၊ auto-completion (အလိုအလျောက်ကုဒ်ဖြည့်စနစ်) စသည်တို့ ပါဝင်သော သီးသန့်ဆော့ဖ်ဝဲ ဖြစ်သည်။ ကမ္ဘာတစ်ဝှမ်းတွင် VS Code သည် လူသုံးအများဆုံး အခမဲ့ ကုဒ်အယ်ဒီတာ ဖြစ်သည်။

## Syntax
VS Code terminal ထဲတွင် project အသစ်တစ်ခု ဖွင့်ရန်အတွက် command ရေးနည်း -
```bash
code .
```

## Code Examples
HTML ဖိုင်သစ်တစ်ခုကို VS Code တွင် ဖန်တီးပြီး auto-complete အတိုကောက် `!` နှိပ်ပါက ထွက်ပေါ်လာမည့် အခြေခံကုဒ်ပုံစံ -
```html
<!DOCTYPE html>
<html lang="my">
<head>
    <meta charset="UTF-8">
    <title>VS Code Project</title>
</head>
<body>
    <h1>မင်္ဂလာပါ VS Code!</h1>
</body>
</html>
```

## Explanation
- `code .` သည် လက်ရှိ directory ကို VS Code တွင် ချက်ချင်းဖွင့်ပေးသည်။
- `lang="my"` သည် စာမျက်နှာသည် မြန်မာဘာသာစကား သုံးစွဲထားကြောင်း browser သို့ ပြောပြသည်။
- `<meta charset="UTF-8">` သည် မြန်မာစာလုံးများ အပါအဝင် နိုင်ငံတကာစာလုံးများ မပျက်စီးဘဲ မှန်ကန်စွာ ပေါ်ထွက်လာစေရန် ကုဒ်ပြောင်းပေးသည့် စနစ်ဖြစ်သည်။

## Output
Browser ပေါ်တွင် မြင်ရမည့် output -
```bash
မင်္ဂလာပါ VS Code!
```

## Common Mistakes
1. **ဖိုင် Extension မှားယွင်းသိမ်းဆည်းခြင်း**: `index` ဟုသာ ရေးပြီး `.html` မထည့်မိပါက browser မှ html ဖိုင်အဖြစ် အသိအမှတ်မပြုပါ။
2. **Auto-save မဖွင့်ထားခြင်း**: ကုဒ်များပြင်ပြီးတိုင်း save မလုပ်မိပါက browser တွင် update မဖြစ်ပါ။

## Best Practices
- VS Code တွင် Auto-save စနစ်ကို ဖွင့်ထားပါ။ (`File -> Auto Save` သို့ သွားပါ)
- 'Live Server' extension ကို ထည့်သွင်းပြီး ကုဒ်ပြင်တိုင်း browser တွင် ချက်ချင်းပြောင်းလဲမှုကို ကြည့်ရှုပါ။

## Tips
💡 Shortcuts များကို လေ့လာထားပါ။ VS Code တွင် `!` ကိုရိုက်ပြီး `Tab` ကို နှိပ်ရုံဖြင့် အခြေခံ HTML Boilerplate ကုဒ်တစ်ခုလုံး ပေါ်လာပါလိမ့်မည်။

## Mini Exercise
VS Code တွင် header tag တစ်ခုဖြစ်သော `<h2>` ကိုသုံးပြီး "VS Code Setup" ဟူသော စာလုံးကို ဖန်တီးစမ်းသပ်ပါ။
```html
# codeTemplate
<h2>VS Code Setup</h2>
```

## Quiz
**မေးခွန်း ၁**: VS Code တွင် HTML ကို browser တွင် ချက်ချင်း တိုက်ရိုက် auto-refresh ပုံစံဖြင့် စမ်းသပ်ရန် မည်သည့် Extension ကို သုံးရသနည်း။
- A: Auto Save
- B: Live Server
- C: Code Runner
- D: Prettier
*Correct Answer*: B
*Explanation*: 'Live Server' သည် local development server တစ်ခုကို တည်ဆောက်ပေးပြီး browser တွင် auto-refresh ပုံစံဖြင့် ချက်ချင်း ပြသပေးသည်။

## Assignment
**အဆင့်သတ်မှတ်ချက်**: အခြေခံ (Beginner)
**ခန့်မှန်းကြာချိန်**: ၁၅ မိနစ်
**လိုအပ်ချက်များ**:
၁။ သင်၏စက်တွင် VS Code ကို ဒေါင်းလုဒ်လုပ်ပြီး Live Server extension ကို ထည့်သွင်းပါ။
၂။ folder အသစ်တစ်ခုဆောက်ပြီး browser တွင် live display လုပ်ပါ။
**မျှော်မှန်းရလဒ်**: Live Server အောင်မြင်စွာ တည်ဆောက်ပြီး ကုဒ်စမ်းသပ်ပြသနိုင်ခြင်း။

## Mini Project
**ခေါင်းစဉ်**: Basic Editor Environment Guide (ကုဒ်အယ်ဒီတာ လမ်းညွှန်ချက်စာမျက်နှာ)
**ဖော်ပြချက်**: အခြေခံ developer တစ်ဦး သိရှိထားရမည့် VS Code တပ်ဆင်ပုံနှင့် short-keys များကို စုစည်းထားသည့် စာမျက်နှာငယ်တစ်ခု တည်ဆောက်ပါ။
**လုပ်ဆောင်ရန်အဆင့်များ**:
1. `index.html` ဖိုင်သစ်ဆောက်ပါ။
2. Shortcuts (ဥပမာ- Ctrl+S, Ctrl+P) များကို `<ul>` နှင့် `<li>` သုံးပြီး စာရင်းပြုလုပ်ပါ။
**အရင်းအမြစ်များ**: VS Code documentations, list elements
**ကုဒ်အဖြေ**:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Shortcuts Guide</title>
</head>
<body>
    <h1>My VS Code Shortcuts</h1>
    <ul>
        <li>Ctrl + S: Save file</li>
        <li>Ctrl + P: Quick Open File</li>
        <li>Alt + Shift + F: Format code</li>
    </ul>
</body>
</html>
```

## Summary
ဤသင်ခန်းစာတွင် Code Editor ၏ သဘောတရား၊ VS Code တပ်ဆင်အသုံးပြုပုံနှင့် keyboard shortcuts အချို့ကို အောင်မြင်စွာ လေ့လာပြီး ဖြစ်သည်။

## Next Lesson
နောက်သင်ခန်းစာတွင် ဝက်ဘ်စာမျက်နှာပေါ်ရှိ အခြားသော အဓိက အစိတ်အပိုင်းများကို ရေးသားရန်အတွက် "HTML Elements (စာမျက်နှာ အစိတ်အပိုင်းများ)" အကြောင်းကို ဆက်လက်လေ့လာပါမည်။
