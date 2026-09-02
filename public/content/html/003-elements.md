# Title: HTML Elements (စာမျက်နှာ အစိတ်အပိုင်းများ) အသေးစိတ်လေ့လာခြင်း

## Introduction
မင်္ဂလာပါ ခင်ဗျာ။ HTML မှာ စာမျက်နှာတစ်ခုကို တည်ဆောက်တဲ့အခါ Paragraph တွေ၊ Tables တွေ၊ Lists တွေ၊ Link တွေ စတဲ့ အစိတ်အပိုင်းအမျိုးမျိုး ပါဝင်ရပါမယ်။ ဒါတွေကို HTML Elements လို့ ခေါ်ဆိုပြီး ဘယ်လိုစနစ်တကျ ပုံဖော်မလဲဆိုတာ လေ့လာသွားပါမယ်။

## Learning Objectives
ဤသင်ခန်းစာ ပြီးမြောက်ပါက အောက်ပါတို့ကို တတ်မြောက်နိုင်မည် ဖြစ်ပါသည် -
1. HTML Elements ၏ သဘောတရားနှင့် Block vs Inline elements ကို ကွာခြားစွာ သိရှိခြင်း။
2. စာရင်း (Lists) များနှင့် ဇယား (Tables) များကို စနစ်တကျ ဖန်တီးတတ်ခြင်း။
3. ပုံရိပ်များနှင့် ဗီဒီယိုများကို ဝက်ဘ်စာမျက်နှာထဲသို့ ထည့်သွင်းတတ်ခြင်း။
4. Semantic tags (header, footer, section, article) တို့ကို နားလည်အသုံးပြုတတ်ခြင်း။

## Theory
HTML element ဆိုသည်မှာ opening tag တစ်ခုမှ စတင်၍ closing tag တစ်ခုဖြင့် ပြီးဆုံးသည့် block တစ်ခုလုံးကို ခေါ်သည်။ ၎င်းထဲတွင် attributes (ဂုဏ်သတ္တိများ) နှင့် context (စာသား/အရာဝတ္ထု) တို့ ပါဝင်သည်။
- **Block Elements**: စာမျက်နှာ၏ စာကြောင်းတစ်ကြောင်းလုံးကို နေရာယူသည်။ (ဥပမာ- `<div>`, `<p>`, `<h1>`)
- **Inline Elements**: လိုအပ်သည့် စာလုံးနေရာလောက်သာ ယူသည်။ (ဥပမာ- `<span>`, `<a>`, `<strong>`)

## Syntax
Element တစ်ခုတွင် opening tag ၌ Attribute ထည့်သွင်းပုံ -
```html
<tagname attribute_name="value">စာသားများ</tagname>
```

## Code Examples
```html
<!-- Table (ဇယား) ဖန်တီးပုံ -->
<table border="1">
  <tr>
    <th>ဘာသာရပ်</th>
    <th>ရမှတ်</th>
  </tr>
  <tr>
    <td>Python</td>
    <td>95</td>
  </tr>
</table>

<!-- Ordered & Unordered Lists -->
<ul>
  <li>Apple</li>
  <li>Orange</li>
</ul>
```

## Explanation
- `<tr>` သည် Table Row (ဇယားစာကြောင်း) ကို ကိုယ်စားပြုသည်။
- `<th>` သည် Table Header (ဇယားခေါင်းစဉ်ကွက်) ဖြစ်သည်။
- `<td>` သည် Table Data (ဇယားအကွက်ငယ်) ဖြစ်သည်။
- `<ul>` သည် Unordered List (ကျည်ဆန်စာရင်းပုံစံ) ဖြစ်သည်။

## Output
Browser တွင် ဇယားသပ်သပ်ရပ်ရပ်နှင့် အစက်လေးများပါသော စာရင်းစာသားများ ပေါ်ထွက်လာမည် ဖြစ်သည်။

## Common Mistakes
1. **Attributes ကို Attribute values မထည့်ဘဲ ရေးခြင်း**: `<img src>` ဟုသာရေးပြီး path မပေးမိပါက ပုံပေါ်မည် မဟုတ်ပါ။
2. **Table tags များ စနစ်တကျ မပိတ်ခြင်း**: `<tr>` ကိုမပိတ်ဘဲ `<td>` များ ရောထွေးရေးမိပါက layout ပျက်စီးမည်။

## Best Practices
- Semantic elements များကို ပိုမိုဦးစားပေးအသုံးပြုပါ။ ဥပမာ - `<div>` များချည်းသာ သုံးမည့်အစား `<header>`, `<main>`, `<section>`, `<footer>` စသည်ဖြင့် ခွဲခြားရေးပါ။
- ပုံရိပ်များ ထည့်သွင်းသည့်အခါ `alt` (alternative text) အမြဲတမ်း ထည့်သွင်းပေးပါ။

## Tips
💡 Web Page ထဲသို့ YouTube ဗီဒီယိုထည့်လိုပါက YouTube ရှိ Share -> Embed ခလုတ်ကို နှိပ်ပြီး ရရှိလာသော `<iframe>` tag ကို သင်၏ html ထဲသို့ ကော်ပီကူးထည့်ရုံဖြင့် တိုက်ရိုက်ကြည့်ရှုနိုင်မည်။

## Mini Exercise
`<ul>` နှင့် `<li>` tag ကို သုံးပြီး "Python", "HTML" ဟူသော စာရင်းနှစ်ခုကို ဖန်တီးပါ။
```html
# codeTemplate
<ul>
  <li>Python</li>
  <li>HTML</li>
</ul>
```

## Quiz
**မေးခွန်း ၁**: အောက်ပါတို့အနက် မည်သည်သည် Block Element တစ်ခု ဖြစ်သနည်း။
- A: <span>
- B: <a>
- C: <p>
- D: <strong>
*Correct Answer*: C
*Explanation*: `<p>` (Paragraph) tag သည် စာမျက်နှာတစ်ကြောင်းလုံးကို နေရာအပြည့်ယူသဖြင့် ၎င်းသည် Block Element တစ်ခု ဖြစ်သည်။ အခြား tags များမှာ inline elements များ ဖြစ်သည်။

## Assignment
**အဆင့်သတ်မှတ်ချက်**: အခြေခံ (Beginner)
**ခန့်မှန်းကြာချိန်**: ၂၀ မိနစ်
**လိုအပ်ချက်များ**:
၁။ ဘောလုံးအသင်း ၃ သင်း၏ အမှတ်ပေးဇယားကို `<table>` tag သုံးပြီး ဆောက်ပါ။
၂။ ခေါင်းစဉ်တွင် အသင်းအမည်နှင့် ရမှတ်များ ပါဝင်စေရပါမည်။
**မျှော်မှန်းရလဒ်**: လှပသော ဇယားပုံစံတစ်ခု browser တွင် ပေါ်လာခြင်း။

## Mini Project
**ခေါင်းစဉ်**: Simple Course Catalog (ရိုးရှင်းသော သင်တန်းလမ်းညွှန်ဇယား)
**ဖော်ပြချက်**: Code Learn Myanmar တွင် သင်ကြားနေသော သင်တန်းများကို ဇယားဖြင့်လည်းကောင်း၊ စာရင်းများဖြင့်လည်းကောင်း အကျဉ်းချုပ်ဖော်ပြသည့် စာမျက်နှာတစ်ခု တည်ဆောက်ပါ။
**လုပ်ဆောင်ရန်အဆင့်များ**:
1. Header, Main, Footer စသည့် Semantic tags များသုံးပါ။
2. သင်တန်းအချက်အလက်များကို ဇယားနှင့် ပုံစံတကျ ရေးသားပြသပါ။
**အရင်းအမြစ်များ**: Semantic tags, Table elements, Image attributes
**ကုဒ်အဖြေ**:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Course Catalog</title>
</head>
<body>
    <header>
        <h1>Code Learn Myanmar Course Catalog</h1>
    </header>
    <main>
        <h2>သင်ကြားပေးနေသော သင်တန်းများ</h2>
        <table border="1">
            <tr>
                <th>Course Name</th>
                <th>Estimated Time</th>
            </tr>
            <tr>
                <td>Python Basics</td>
                <td>4 Hours</td>
            </tr>
            <tr>
                <td>HTML Essentials</td>
                <td>6 Hours</td>
            </tr>
        </table>
    </main>
    <footer>
        <p>&copy; 2026 Code Learn Myanmar</p>
    </footer>
</body>
</html>
```

## Summary
ဤသင်ခန်းစာတွင် HTML Elements များ၏ ကွဲပြားခြားနားပုံ၊ Table နှင့် List အသုံးပြုပုံ၊ ပုံရိပ်များနှင့် semantic tag ဖွဲ့စည်းပုံများကို ပြည့်စုံစွာ နားလည်လေ့လာခဲ့ပြီး ဖြစ်သည်။

## Next Lesson
နောင်တွင် ဝက်ဘ်စာမျက်နှာများကို အရောင်အသွေးလှပပြီး စွဲဆောင်မှုရှိစေရန် ပြင်ဆင်နိုင်ဖို့ "CSS Essentials (စတိုင်သတ်မှတ်ခြင်း)" သင်ခန်းစာကို ဆက်လက်လေ့လာပါမည်။
