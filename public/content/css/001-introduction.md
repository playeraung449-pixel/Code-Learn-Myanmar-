# Title: CSS Essentials (စတိုင်သတ်မှတ်ခြင်း) အခြေခံ

## Introduction
မင်္ဂလာပါ ခင်ဗျာ။ ကျွန်တော်တို့ HTML နဲ့ ဝက်ဘ်ဆိုက်တစ်ခုရဲ့ အရိုးစုကို ဆောက်ပြီးတဲ့အခါ အဲဒီဆိုက်ကို အမြင်လှပလာအောင် အရောင်တွေ၊ layouts တွေနဲ့ အလှဆင်ဖို့ CSS (Cascading Style Sheets) ကို အသုံးပြုရပါတယ်။ CSS မပါဝင်တဲ့ ဝက်ဘ်ဆိုက်တစ်ခုဟာ အရောင်မပါတဲ့ အရိုးစုတစ်ခုလိုပါပဲ။

## Learning Objectives
ဤသင်ခန်းစာ ပြီးမြောက်ပါက အောက်ပါတို့ကို တတ်မြောက်နိုင်မည် ဖြစ်ပါသည် -
1. CSS ၏ သဘောတရားနှင့် ဝက်ဘ်ဒီဇိုင်းတွင် ၎င်း၏အရေးပါပုံကို နားလည်ခြင်း။
2. CSS selectors (Element, Class, ID) များကို ကျွမ်းကျင်စွာ အသုံးပြုတတ်ခြင်း။
3. စာသားများ၏ အရောင် (color)၊ စာလုံးဒီဇိုင်း (font-size, font-family) နှင့် နောက်ခံ (background) များကို စတိုင်ပြင်တတ်ခြင်း။
4. Box Model (Margin, Padding, Border, Width, Height) ၏ သဘောတရားကို ကောင်းစွာ သဘောပေါက်ခြင်း။

## Theory
CSS (Cascading Style Sheets) ဆိုသည်မှာ HTML စာမျက်နှာကို browser တွင် မည်သို့ လှပသပ်ရပ်စွာ ပြသမည်ကို ထိန်းချုပ်စတိုင်ပေးရသည့် ဒီဇိုင်းဘာသာစကား ဖြစ်သည်။ HTML သည် တည်ဆောက်ပုံကို ပြုလုပ်ပြီး CSS သည် အပြင်ပန်း အလှအပကို တာဝန်ယူသည်။

## Syntax
CSS ရေးသားရာတွင် Selector နှင့် Declaration block ပုံစံဖြင့် ရေးသားရသည် -
```css
selector {
  property: value;
}
```

## Code Examples
```css
/* Element Selector */
h1 {
  color: #3b82f6;
  font-size: 24px;
}

/* Class Selector */
.highlight {
  background-color: yellow;
  font-weight: bold;
}

/* ID Selector */
#main-banner {
  padding: 20px;
  border-radius: 10px;
}
```

## Explanation
- `h1` သည် Selector ဖြစ်ပြီး h1 tags အားလုံးကို ရွေးချယ်ကာ စတိုင်ပေးသည်။
- `color` သည် စာလုံးအရောင်ပြောင်းလဲသည့် CSS property ဖြစ်ပြီး `#3b82f6` သည် အပြာရောင်တန်ဖိုး ဖြစ်သည်။
- `.highlight` (class) ကို html တွင် `class="highlight"` ဟု ပေးထားသော မည်သည့် elements တွင်မဆို သုံးနိုင်သည်။
- `#main-banner` (id) ကို `id="main-banner"` ဟု ပေးထားသော သီးသန့် element တစ်ခုအတွက်သာ သုံးနိုင်သည်။

## Output
ဝက်ဘ်ဆိုက်၏ စာသားများ၊ ခေါင်းစဉ်များ၊ နောက်ခံများသည် သတ်မှတ်ထားသော ဒီဇိုင်းအတိုင်း လှပစွာ ပေါ်ထွက်လာမည်။

## Common Mistakes
1. **Semicolon `;` မေ့လျော့ခြင်း**: `color: red` ဟုရေးပြီး စာကြောင်းအဆုံး၌ `;` မပါပါက browser က နောက်စာကြောင်းများပါ ဖတ်မရတော့ဘဲ စတိုင်မတက်တော့ပါ။
2. **Class သတ်မှတ်ရာတွင် dot `.` မေ့လျော့ခြင်း**: `.highlight` အစား `highlight` ဟုသာ ရေးမိပါက tag ဟု ထင်သွားပါလိမ့်မည်။

## Best Practices
- တတ်နိုင်သမျှ External CSS (ပြင်ပ `.css` ဖိုင်သီးသန့်ဆောက်ပြီး `<link>` ချိတ်သုံးခြင်း) ကိုသာ အသုံးပြုပါ။ ၎င်းသည် ကုဒ်များကို သီးခြားခွဲထုတ်ထားသဖြင့် အလွန်သပ်ရပ်သည်။
- Class နာမည်များကိုလည်း variable နာမည်များကဲ့သို့ အဓိပ္ပာယ်ရှိရှိ ပေးပါ။ ဥပမာ - `.red-text` ထက် `.error-message` က ပိုမိုကောင်းမွန်သည်။

## Tips
💡 Google Fonts မှတစ်ဆင့် သင့်ဝက်ဘ်ဆိုက်အတွက် လှပဆန်းသစ်သော စာလုံးဒီဇိုင်း (fonts) များကို အခမဲ့ယူပြီး CSS ထဲတွင် လွယ်ကူစွာ ထည့်သွင်းအသုံးပြုနိုင်ပါသည်။

## Mini Exercise
Class Selector ဖြစ်သော `.text-blue` ကိုသုံးပြီး အရောင်ကို `#0000ff` (အပြာ) ပြောင်းလဲပေးမည့် စတိုင်ကို ဖြည့်စွက်ပါ။
```css
/* codeTemplate */
.text-blue {
  color: #0000ff;
}
```

## Quiz
**မေးခွန်း ၁**: HTML Element တစ်ခုတွင် attribute အနေဖြင့် `style="..."` ဟု တိုက်ရိုက်ထည့်သွင်းရေးသားသော CSS ပုံစံကို မည်သို့ ခေါ်သနည်း။
- A: Inline CSS
- B: Internal CSS
- C: External CSS
- D: Styled CSS
*Correct Answer*: A
*Explanation*: HTML element ထဲတွင် `style` attribute ကို သုံး၍ တိုက်ရိုက်ရေးသားခြင်းကို Inline CSS ဟု ခေါ်သည်။

## Assignment
**အဆင့်သတ်မှတ်ချက်**: အခြေခံ (Beginner)
**ခန့်မှန်းကြာချိန်**: ၁၅ မိနစ်
**လိုအပ်ချက်များ**:
၁။ HTML file တစ်ခု ဖန်တီးပါ။
၂။ Internal CSS (`<style>` tag ကိုသုံးပြီး head ထဲတွင်ရေးပါ) သုံး၍ `<p>` tags အားလုံး၏ စာလုံးအရောင်ကို စိမ်းရောင်၊ စာလုံးဆိုဒ်ကို 18px ပြောင်းပါ။
**မျှော်မှန်းရလဒ်**: စာလုံးအရောင်ပြောင်းလဲသွားသော သပ်ရပ်သည့် စာပိုဒ်တစ်ခု။

## Mini Project
**ခေါင်းစဉ်**: Simple Alert Box (ရိုးရှင်းသော သတိပေးသေတ္တာဒီဇိုင်း)
**ဖော်ပြချက်**: သတင်းအချက်အလက် သို့မဟုတ် သတိပေးချက်တစ်ခုကို သပ်ရပ်သောဘောင်၊ လှပသော စာသားနှင့် နောက်ခံအရောင်များ သုံးပြီး dynamic alert box တစ်ခုအဖြစ် ပုံဖော်ပါ။
**လုပ်ဆောင်ရန်အဆင့်များ**:
1. `<div>` tag ကိုသုံးပြီး alert box တည်ဆောက်ပါ။
2. CSS box model (padding, margin, border-radius) များကို သုံးပြီး styling ပေးပါ။
**အရင်းအမြစ်များ**: CSS box properties, backgrounds, borders
**ကုဒ်အဖြေ**:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .alert-box {
            background-color: #fee2e2;
            border: 2px solid #ef4444;
            color: #991b1b;
            padding: 15px;
            margin: 20px auto;
            max-width: 400px;
            border-radius: 8px;
            font-family: sans-serif;
        }
    </style>
</head>
<body>
    <div className="alert-box">
        <strong>အရေးကြီး သတိပေးချက်!</strong> သင်၏ password ကို မည်သူ့ကိုမျှ မပြောပြပါနှင့်။
    </div>
</body>
</html>
```

## Summary
ဤသင်ခန်းစာတွင် CSS ၏ သဘောတရား၊ Element/Class/ID selector များ ခွဲခြားအသုံးပြုပုံ၊ အရောင်နှင့် layout ပြင်ဆင်ပုံများကို အောင်မြင်စွာ သင်ယူခဲ့ပြီး ဖြစ်သည်။

## Next Lesson
နောက်တစ်ဆင့်တွင် ဝက်ဘ်စာမျက်နှာများကို စာသားများတင်မကဘဲ အပြန်အလှန်တုံ့ပြန်မှုများ (Interactivity) ပြုလုပ်နိုင်ရန် "JavaScript Intro (အခြေခံ ဂျာဗားစခရစ်)" အကြောင်းကို ဆက်လက်လေ့လာပါမည်။
