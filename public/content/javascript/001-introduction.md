# Title: JavaScript Essentials (ဝက်ဘ်ဆိုက်ကို သက်ဝင်လှုပ်ရှားစေခြင်း)

## Introduction
မင်္ဂလာပါ ခင်ဗျာ။ ကျွန်တော်တို့ HTML နဲ့ အရိုးစုဆောက်၊ CSS နဲ့ အလှပြင်ပြီးပြီ ဆိုရင်တော့ ဝက်ဘ်ဆိုက်ကို လူတစ်ယောက်လို လှုပ်ရှားသက်ဝင်လာအောင်၊ ခလုတ်နှိပ်ရင် အလုပ်လုပ်အောင် "ဦးနှောက်" ထည့်သွင်းပေးမယ့် JavaScript အကြောင်းကို လေ့လာကြပါစို့ဗျာ။

## Learning Objectives
ဤသင်ခန်းစာ ပြီးမြောက်ပါက အောက်ပါတို့ကို တတ်မြောက်နိုင်မည် ဖြစ်ပါသည် -
1. JavaScript ၏ သဘောတရားနှင့် ဝက်ဘ်ဆိုက်များတွင် ၎င်း၏အခန်းကဏ္ဍကို နားလည်ခြင်း။
2. JS variables ကြေညာပုံ (`let`, `const`) နှင့် data types များကို ခွဲခြားသိမြင်ခြင်း။
3. ရိုးရှင်းသော လုပ်ဆောင်ချက်များ (Functions) ရေးသားတတ်ခြင်း။
4. ခလုတ်နှိပ်ခြင်း (Button click events) များကို သုံးစွဲ၍ အပြန်အလှန်တုံ့ပြန်တတ်ခြင်း။

## Theory
JavaScript သည် ဝက်ဘ်ဆိုက်များကို dynamic ဖြစ်အောင် ဖန်တီးပေးသည့် client-side programming language ဖြစ်သည်။ HTML နှင့် CSS တို့သည် ငြိမ်နေသော်လည်း JavaScript က ဝက်ဘ်ဆိုက်ပေါ်ရှိ အရာဝတ္ထုများကို ရွေ့လျားစေခြင်း၊ တွက်ချက်ခြင်း၊ ဒေတာများ ပြောင်းလဲခြင်းတို့ကို ဆောင်ရွက်ပေးသည်။

## Syntax
JavaScript တွင် function တည်ဆောက်ပြီး ခေါ်ယူသုံးစွဲပုံ ရိုးရှင်းသော syntax -
```javascript
function functionName() {
  // လုပ်ဆောင်မည့် အပိုင်း
}
```

## Code Examples
```javascript
// Variable သတ်မှတ်ခြင်း
const pi = 3.1415;
let score = 100;

// Function တည်ဆောက်ခြင်း
function greetUser(name) {
  return "မင်္ဂလာပါ " + name + " ခင်ဗျာ။";
}

// Function ခေါ်ယူသုံးစွဲခြင်း
let message = greetUser("Aung Aung");
console.log(message);
```

## Explanation
- `const` သည် ပြန်လည်မပြောင်းလဲနိုင်သော တန်ဖိုး (Constant) များကို သတ်မှတ်ရန် သုံးသည်။
- `let` သည် အပြောင်းအလဲရှိနိုင်သော တန်ဖိုးများကို သတ်မှတ်ရန် သုံးသည်။
- `greetUser(name)` function သည် name ဟူသော parameter ကို လက်ခံပြီး နှုတ်ခွန်းဆက်စာသားကို ပြန်ထုတ် (return) ပေးသည်။

## Output
Browser Console တွင် ပေါ်လာမည့် output မှာ -
```bash
မင်္ဂလာပါ Aung Aung ခင်ဗျာ။
```

## Common Mistakes
1. **`const` variable တန်ဖိုးကို ထပ်မံပြောင်းလဲရန် ကြိုးစားခြင်း**:
   ```javascript
   const score = 10;
   score = 20; // TypeError တက်ပါမည်
   ```
2. **Variable name ကို Number ဖြင့်စတင်ခြင်း**: `let 1stPlace = "Aung";` (ဂဏန်းဖြင့် စတင်ခွင့်မရှိပါ)

## Best Practices
- တန်ဖိုး ပြန်လည်မပြောင်းလဲမည့် variable များကို အမြဲတမ်း `const` ဖြင့်သာ ကြေညာပါ။ လိုအပ်မှသာ `let` ကို သုံးပါ။
- Variable နှင့် function နာမည်များကို camelCase (စာလုံးအသေးဖြင့်စတင်ပြီး နောက်စာလုံးကြီးများဆက်ရေးခြင်း) ပုံစံကို သုံးပါ။ ဥပမာ - `calculateTotalScore`

## Tips
💡 Browser ၏ Inspect -> Console ထဲတွင် JavaScript ကုဒ်များကို တိုက်ရိုက်ရေးသားပြီး အချိန်မရွေး စမ်းသပ်လေ့ကျင့်နိုင်ပါသည်။

## Mini Exercise
"Aung Aung" အစား သင့်နာမည်ကို `greetUser` ထဲသို့ parameter အဖြစ် ထည့်သွင်းပြီး console ထုတ်ပြပါ။
```javascript
// codeTemplate
function greetUser(name) {
  return "မင်္ဂလာပါ " + name + " ခင်ဗျာ။";
}
console.log(greetUser("Mg Mg"));
```

## Quiz
**မေးခွန်း ၁**: JavaScript တွင် မည်သည့် Keyword သည် တန်ဖိုးပြန်လည်မပြောင်းလဲနိုင်သော variable ကို ကြေညာရာတွင် သုံးသနည်း။
- A: let
- B: var
- C: const
- D: static
*Correct Answer*: C
*Explanation*: `const` သည် constant ၏ အတိုကောက်ဖြစ်ပြီး တစ်ကြိမ်သတ်မှတ်ပြီးပါက ပြန်လည်မပြောင်းလဲနိုင်သော variables များအတွက် သုံးသည်။

## Assignment
**အဆင့်သတ်မှတ်ချက်**: အခြေခံ (Beginner)
**ခန့်မှန်းကြာချိန်**: ၂၀ မိနစ်
**လိုအပ်ချက်များ**:
၁။ ဂဏန်းနှစ်ခုကို ပေါင်းပေးမည့် `addNumbers(a, b)` function တစ်ခုကို ဆောက်ပါ။
၂။ ၎င်းကို နံပါတ် `5` နှင့် `10` ဖြင့် ခေါ်ယူပြီး ရလဒ်ကို console တွင် ပြသပါ။
**မျှော်မှန်းရလဒ်**: Console တွင် ရလဒ် `15` ဟု ပေါ်ထွက်လာခြင်း။

## Mini Project
**ခေါင်းစဉ်**: Click Counter (ကလစ်နှိပ်ခြင်း ရေတွက်စနစ်)
**ဖော်ပြချက်**: ဝက်ဘ်စာမျက်နှာပေါ်ရှိ ခလုတ်တစ်ခုကို နှိပ်လိုက်တိုင်း ရေတွက်သည့် ကိန်းဂဏန်း တစ်ခုချင်းစီ တိုးတက်သွားစေမည့် တုံ့ပြန်မှုစနစ်တစ်ခု ဖန်တီးပါ။
**လုပ်ဆောင်ရန်အဆင့်များ**:
1. HTML တွင် ခလုတ်တစ်ခုနှင့် `<p>` tag တစ်ခု ဆောက်ပါ။
2. Javascript တွင် `count` variable ကို ကြေညာပြီး ခလုတ်နှိပ်ပါက `count` ကို တိုးစေကာ စာသားထဲသို့ ပြန်လည်ထည့်သွင်းပါ။
**အရင်းအမြစ်များ**: Event listener, DOM innerText
**ကုဒ်အဖြေ**:
```html
<!DOCTYPE html>
<html>
<body>
    <button onclick="increaseCount()">နှိပ်ပါ</button>
    <p id="counter">နှိပ်ထားသော အရေအတွက် - 0</p>

    <script>
        let count = 0;
        function increaseCount() {
            count = count + 1;
            document.getElementById("counter").innerText = "နှိပ်ထားသော အရေအတွက် - " + count;
        }
    </script>
</body>
</html>
```

## Summary
ဤသင်ခန်းစာတွင် JavaScript ၏ dynamic အခန်းကဏ္ဍ၊ variable များ၊ Functions နှင့် dynamic event handling (ခလုတ်နှိပ်တုံ့ပြန်မှု) အခြေခံကို အောင်မြင်စွာ နားလည်ခဲ့ပြီး ဖြစ်သည်။

## Next Lesson
ဂုဏ်ယူပါတယ်ခင်ဗျာ။ အခြေခံသင်ခန်းစာများအားလုံးကို ပြီးဆုံးအောင် လေ့လာနိုင်ခဲ့ပြီဖြစ်လို့ ပိုမိုကျွမ်းကျင်သော စီမံကိန်းများကို ဆက်လက်လုပ်ဆောင်နိုင်ပါပြီ။
