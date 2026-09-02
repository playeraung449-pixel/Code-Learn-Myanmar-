# Title: Git ဆိုတာဘာလဲ နှင့် အခြေခံ Command များ

## Introduction
မင်္ဂလာပါ ခင်ဗျာ။ ကုဒ်တွေကို သိမ်းဆည်း၊ စီမံခန့်ခွဲပြီး အဖွဲ့အစည်းနဲ့ စနစ်တကျ လက်တွဲလုပ်ဆောင်တတ်စေဖို့ မဖြစ်မနေလိုအပ်တဲ့ Git tool အကြောင်း လေ့လာကြပါစို့ဗျာ။

## Learning Objectives
ဤသင်ခန်းစာ ပြီးမြောက်ပါက အောက်ပါတို့ကို တတ်မြောက်နိုင်မည် ဖြစ်ပါသည် -
1. Version Control System (VCS) နှင့် Git ၏ သဘောတရားကို နားလည်ခြင်း။
2. `git init`, `git status`, `git add`, `git commit` စသည့် အခြေခံ command များကို ရေးတတ်ခြင်း။
3. Local နှင့် Remote repository တို့၏ ကွာခြားပုံကို သိရှိခြင်း။
4. လုပ်ငန်းခွင်သုံး Git workflow အဆင့်ဆင့်ကို သဘောပေါက်ခြင်း။

## Theory
Git ဆိုသည်မှာ ကိုယ်ရေးလိုက်သော ဆော့ဖ်ဝဲကုဒ်များ၏ အပြောင်းအလဲ မှတ်တမ်းများကို အချိန်နှင့်တပြေးညီ မှတ်သားပေးသော "Version Control System" ဖြစ်သည်။ ကုဒ်ရေးနေရင်း မှားသွားခဲ့လျှင်လည်း အရင်အလုပ်လုပ်ခဲ့သော အချိန်ဆီသို့ နောက်ပြန်ဆုတ်သွားနိုင်သည့် "အချိန်ခရီးသွားစက်" နှင့် တူသည်။

## Syntax
Git ၏ အဓိက commands များကို terminal (သို့မဟုတ်) bash တွင် အောက်ပါအတိုင်း အသုံးပြုရသည် -
```bash
# repo စတင်တည်ဆောက်ခြင်း
git init

# အပြောင်းအလဲများကို stage လုပ်ခြင်း
git add file_name

# commit မှတ်တမ်းတင်ခြင်း
git commit -m "commit message"
```

## Code Examples
```bash
# ပြင်ဆင်ထားသည့်ဖိုင်အားလုံး စုစည်းရန်
git add .

# ပထမဆုံး commit ပြုလုပ်ခြင်း
git commit -m "initial commit"

# Remote သို့ တွန်းတင်ခြင်း
git push origin main
```

## Explanation
- `git init` သည် လက်ရှိ folder ကို Git repository အဖြစ် ပြောင်းလဲပေးသည်။
- `git status` သည် မည်သည့်ဖိုင်များ ပြင်ဆင်ထားပြီး၊ မည်သည့်ဖိုင်များ Stage မတင်ရသေးကြောင်း စစ်ဆေးပေးသည်။
- `git commit` သည် stage စင်မြင့်ပေါ်ရှိ ဖိုင်များကို snapshot အနေဖြင့် အပြီးသတ် သိမ်းဆည်းပေးသည်။

## Output
Terminal ပေါ်တွင် `git status` ဟု ရိုက်နှိပ်ပါက မြင်ရမည့် output မှာ -
```bash
On branch main
Nothing to commit, working tree clean
```

## Common Mistakes
1. **Commit message မပါဘဲ Commit လုပ်ခြင်း**: `git commit` (message မပါပါက default text editor ပွင့်လာပြီး ရှုပ်ထွေးသွားစေနိုင်သည်)
2. **`git add` မလုပ်ဘဲ commit လုပ်ရန် ကြိုးစားခြင်း** (ဘာအပြောင်းအလဲမှ stage ပေါ်မရှိပါက commit လုပ်၍ ရမည်မဟုတ်ပါ)

## Best Practices
- Commit messages များကို တိုတိုနှင့် လိုရင်းရှင်းလင်းစွာ ရေးပါ။ ဥပမာ - `git commit -m "fix login bug"`
- အပြောင်းအလဲ အနည်းငယ်ပြုလုပ်ပြီးတိုင်း Commit လုပ်ပေးပါ။ ကုဒ်အမြောက်အမြား ပြင်ပြီးမှ Commit တစ်ခုတည်းလုပ်ခြင်းကို ရှောင်ကြဉ်ပါ။

## Tips
💡 `.gitignore` ဟု အမည်ရသော ဖိုင်တစ်ခုကို ဆောက်လုပ်ထားပါက Git ထဲသို့ မထည့်သွင်းလိုသော လျှို့ဝှက်ဖိုင်များနှင့် ကြီးမားသော folder များကို လွယ်ကူစွာ ချန်လှပ်ထားနိုင်ပါသည်။

## Mini Exercise
ဖိုင်အားလုံးကို Stage စင်မြင့်ပေါ်သို့ တင်ရန်အတွက် အသုံးပြုရမည့် command ကို ရေးပါ။
```bash
# codeTemplate
git add .
```

## Quiz
**မေးခွန်း ၁**: Git တွင် ပြင်ဆင်ထားသည့် ဖိုင်များကို သမိုင်းမှတ်တမ်းအဖြစ် အပြီးသတ်သိမ်းဆည်းရန် မည်သည့် Command ကို သုံးရသနည်း။
- A: git save
- B: git commit
- C: git push
- D: git upload
*Correct Answer*: B
*Explanation*: `git commit` သည် ပြင်ဆင်မှုများကို repository ၏ သမိုင်းမှတ်တမ်းအဖြစ် သေသပ်စွာ သိမ်းဆည်းပေးသည့် command ဖြစ်သည်။

## Assignment
**အဆင့်သတ်မှတ်ချက်**: အခြေခံ (Beginner)
**ခန့်မှန်းကြာချိန်**: ၁၅ မိနစ်
**လိုအပ်ချက်များ**:
၁။ folder အသစ်တစ်ခုဆောက်ပြီး `git init` လုပ်ပါ။
၂။ `index.html` ဖိုင်တစ်ခုဆောက်ပြီး status စစ်ဆေးပါ။ ထို့နောက် stage လုပ်ပြီး commit လုပ်ပါ။
**မျှော်မှန်းရလဒ်**: Terminal တွင် 'working tree clean' ဟု ပြသမည့် အောင်မြင်သော commit တစ်ခု။

## Mini Project
**ခေါင်းစဉ်**: First Git Repo Setup (ပထမဆုံး Git ကုဒ်တိုက်)
**ဖော်ပြချက်**: ပရိုဂရမ်တစ်ခုကို Git အသုံးပြုပြီး စတင် initializing လုပ်ပါ၊ ဖိုင်များကို add လုပ်ကာ commit ပထမဆုံးတစ်ကြိမ် ပြုလုပ်ပါ။
**လုပ်ဆောင်ရန်အဆင့်များ**:
1. `git init` ဖြင့် စတင်ပါ။
2. `git add .` ဖြင့် ဖိုင်များစုစည်းပါ။
3. `git commit -m 'First Commit'` ဖြင့် စတင်သိမ်းဆည်းပါ။
**အရင်းအမြစ်များ**: Git CLI environment
**ကုဒ်အဖြေ**:
```bash
git init
git add .
git commit -m "First Commit"
```

## Summary
ဤသင်ခန်းစာတွင် Git version control ၏ သဘောတရား၊ workflow အဆင့်ဆင့်၊ terminal commands များနှင့် mistakes/best practices များကို အောင်မြင်စွာ သင်ယူခဲ့ပြီး ဖြစ်သည်။

## Next Lesson
နောက်သင်ခန်းစာများတွင် backend ပိုင်းကို cloud database ဖြင့် ချိတ်ဆက်နိုင်ရန် "Firebase & Storage" အကြောင်းကို ဆက်လက်လေ့လာသွားပါမည်။
