/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  PlusCircle, 
  Search, 
  ArrowLeft, 
  User as UserIcon, 
  Calendar,
  Lock,
  Loader2,
  CheckCircle2,
  Award,
  Sparkles,
  Code,
  Image as ImageIcon,
  Tag,
  Flag,
  Shield,
  Trash2,
  Edit3,
  AlertTriangle,
  BookOpen,
  Filter,
  Share2,
  HelpCircle,
  Check,
  Copy,
  ExternalLink,
  Bot,
  Flame,
  CheckSquare
} from "lucide-react";
import { FORUM_POSTS } from "../courses/data";
import { ForumPost, Comment, UserProfile, ReportReasonType } from "../types";
import { auth } from "../lib/firebase";
import { 
  getForumPosts, 
  getPaginatedForumPosts,
  createForumPost, 
  likeForumPost, 
  addForumReply, 
  sanitizeInput,
  detectProfanityAndSpam,
  submitCommunityReport 
} from "../lib/db";
import KiboMascot from "../components/KiboMascot";
import CommunityRulesModal from "../components/CommunityRulesModal";
import ModerationDashboardModal from "../components/ModerationDashboardModal";

// 13 REQUIRED DISCUSSION CATEGORIES
const DISCUSSION_CATEGORIES = [
  "All Categories",
  "General Discussion",
  "HTML",
  "CSS",
  "JavaScript",
  "Java",
  "Kotlin",
  "Firebase",
  "Android Development",
  "AI Development",
  "Career Advice",
  "Projects",
  "Bug Fixing",
  "Suggestions"
];

// POST TYPES
const POST_TYPES = [
  "Question",
  "Discussion",
  "Programming Tip",
  "Project Showcase",
  "Learning Experience"
];

// PROGRAMMING LANGUAGES
const PROGRAMMING_LANGUAGES = [
  "None",
  "HTML",
  "CSS",
  "JavaScript",
  "Java",
  "Kotlin",
  "Python",
  "SQL",
  "Dart",
  "TypeScript"
];

// 7 SPECIFIED REPORT REASONS
const REPORT_REASONS: ReportReasonType[] = [
  "Spam",
  "Harassment",
  "Hate Speech",
  "Offensive Language",
  "False Information",
  "Malicious Links",
  "Copyright Violations"
];

export default function Community() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [lastPostDoc, setLastPostDoc] = useState<any>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // User Profile
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPostTypeFilter, setSelectedPostTypeFilter] = useState("All");
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showModDashboardModal, setShowModDashboardModal] = useState(false);
  const [filterWarningMsg, setFilterWarningMsg] = useState<string | null>(null);

  // New Post Form
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General Discussion");
  const [newPostType, setNewPostType] = useState<any>("Question");
  const [newLanguage, setNewLanguage] = useState("JavaScript");
  const [newCodeSnippet, setNewCodeSnippet] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newTags, setNewTags] = useState("");

  // New Reply Form & Reply Editing
  const [newReplyContent, setNewReplyContent] = useState("");
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");

  // Report Modal
  const [reportingItem, setReportingItem] = useState<{ type: "post" | "reply"; id: string; title: string } | null>(null);
  const [reportReason, setReportReason] = useState<ReportReasonType>(REPORT_REASONS[0]);
  const [reportSuccessMessage, setReportSuccessMessage] = useState<string | null>(null);

  // Moderation / Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [modUserAction, setModUserAction] = useState<{ user: string; action: "warn" | "suspend" } | null>(null);
  const [modWarningText, setModWarningText] = useState("");

  // Kibo AI Helper State
  const [kiboSummary, setKiboSummary] = useState<string | null>(null);
  const [isKiboAnalyzing, setIsKiboAnalyzing] = useState(false);

  // Notification Toast
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Copy code state
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  useEffect(() => {
    // Load local user profile for author info
    const savedProfile = localStorage.getItem("clm_user_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setCurrentUserProfile(parsed);
        if (parsed.email === "playeraung449@gmail.com" || parsed.role === "admin") {
          setIsAdminMode(true);
        }
      } catch (e) {
        console.error("Failed to parse local profile:", e);
      }
    }
  }, []);

  // Show Toast Helper
  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => {
      setNotificationToast(null);
    }, 4000);
  };

  // Load paginated posts from Firestore with incremental limit
  const fetchPostsBatch = async (cat: string, cursor: any = null, isInitial: boolean = false) => {
    if (isInitial) {
      setIsDbLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const res = await getPaginatedForumPosts({
        category: cat,
        pageSize: 10,
        lastDoc: cursor
      });

      if (isInitial) {
        if (res.posts.length > 0) {
          setPosts(res.posts);
          setLastPostDoc(res.lastDoc);
          setHasMorePosts(res.hasMore);
          localStorage.setItem("clm_forum_posts", JSON.stringify(res.posts));
        } else if (cat === "All Categories" || cat === "all") {
          // Seed initial rich posts if completely empty
          const initialSeed: ForumPost[] = [
            {
              id: "seed-1",
              title: "HTML & CSS Flexbox vs Grid မည်သည့်နေရာတွင် မည်သည်ကို သုံးသင့်သနည်း။",
              content: "မင်္ဂလာပါ ခင်ဗျာ။ Web Development စတင်လေ့လာချိန်မှာ Layout ဆွဲရာမှာ Flexbox နဲ့ CSS Grid ဘယ်ဟာကို ဘယ်နေရာမှာ ပိုမိုသုံးသင့်တယ်ဆိုတာ ရှင်းပြပေးစေလိုပါတယ်ခင်ဗျာ။",
              author: "Aung Aung (ကျောင်းသား)",
              authorId: "seed-user-1",
              date: new Date().toLocaleDateString(),
              likes: 12,
              likedBy: [],
              category: "HTML",
              tags: ["html", "css", "flexbox", "grid"],
              programmingLanguage: "HTML",
              postType: "Question",
              codeSnippet: `<div class="container">\n  <div class="item">1</div>\n  <div class="item">2</div>\n</div>`,
              replies: [
                {
                  id: "rep-1",
                  author: "Code Learn AI (ဆရာ)",
                  authorId: "ai-tutor",
                  content: "1D layout (အတန်းလိုက် သို့မဟုတ် ဒေါင်လိုက် လိုင်းတစ်ခုတည်း) အတွက် Flexbox ကို သုံးပြီး၊ 2D layout (ကွက်လပ် ဇယားကွက် Row + Column) များအတွက် CSS Grid ကို သုံးရန် ပိုမိုသင့်တော်ပါသည်။",
                  date: new Date().toLocaleDateString(),
                  isBestAnswer: true,
                  isHelpful: true,
                  likes: 8
                }
              ]
            },
            {
              id: "seed-2",
              title: "JavaScript Promises & Async/Await နားလည်လွယ်သော သင်ခန်းစာ အကျဉ်းချုပ်",
              content: "JavaScript မာ အဆင်မပြေဖြစ်လေ့ရှိတဲ့ Asynchronous Programming ကို တိုတိုနဲ့ ရှင်းရှင်း နားလည်အောင် ရေးသားထားတဲ့ ပရိုဂရမ်မင်း Tips လေး ဖြစ်ပါတယ်။",
              author: "Mya Mya (Developer)",
              authorId: "seed-user-2",
              date: new Date().toLocaleDateString(),
              likes: 25,
              likedBy: [],
              category: "JavaScript",
              tags: ["js", "async", "await", "promises"],
              programmingLanguage: "JavaScript",
              postType: "Programming Tip",
              codeSnippet: `async function fetchData() {\n  try {\n    const res = await fetch('https://api.example.com');\n    const data = await res.json();\n    console.log(data);\n  } catch (err) {\n    console.error(err);\n  }\n}`,
              replies: []
            }
          ];

          for (const post of initialSeed) {
            await createForumPost({
              title: post.title,
              content: post.content,
              author: post.author,
              authorId: post.authorId,
              date: post.date,
              category: post.category
            });
          }
          const seeded = await getPaginatedForumPosts({ category: cat, pageSize: 10 });
          setPosts(seeded.posts.length > 0 ? seeded.posts : initialSeed);
          setLastPostDoc(seeded.lastDoc);
          setHasMorePosts(seeded.hasMore);
          localStorage.setItem("clm_forum_posts", JSON.stringify(seeded.posts.length > 0 ? seeded.posts : initialSeed));
        } else {
          setPosts([]);
          setLastPostDoc(null);
          setHasMorePosts(false);
        }
      } else {
        // Appending subsequent batch
        setPosts(prev => {
          const map = new Map<string, ForumPost>();
          prev.forEach(p => map.set(p.id, p));
          res.posts.forEach(p => map.set(p.id, p));
          return Array.from(map.values());
        });
        setLastPostDoc(res.lastDoc);
        setHasMorePosts(res.hasMore);
      }
    } catch (err) {
      console.error("Firestore loading error, fallback to local storage:", err);
      const saved = localStorage.getItem("clm_forum_posts");
      if (saved) {
        const list: ForumPost[] = JSON.parse(saved);
        const filtered = (cat && cat !== "All Categories" && cat !== "all")
          ? list.filter(p => p.category === cat)
          : list;
        setPosts(filtered);
      } else {
        setPosts(FORUM_POSTS);
      }
      setHasMorePosts(false);
    } finally {
      if (isInitial) {
        setIsDbLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchPostsBatch(selectedCategory, null, true);
  }, [selectedCategory]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMorePosts && lastPostDoc) {
      fetchPostsBatch(selectedCategory, lastPostDoc, false);
    }
  };

  // Upvote post
  const handleLikePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("ဆွေးနွေးချက်များကို upvote ပေးရန်အတွက် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါဗျာ။");
      return;
    }

    try {
      const updated = posts.map(p => {
        if (p.id === postId) {
          const likedByList = p.likedBy || [];
          const alreadyLiked = likedByList.includes(currentUser.uid);
          const updatedLikes = alreadyLiked ? Math.max(0, p.likes - 1) : p.likes + 1;
          const updatedLikedBy = alreadyLiked 
            ? likedByList.filter(uid => uid !== currentUser.uid)
            : [...likedByList, currentUser.uid];

          if (!alreadyLiked) {
            showToast(`"${p.title.slice(0, 20)}..." အား တုံ့ပြန်မှုပေးခဲ့ပါသည်။ (+1 Like)`);
          }

          return { ...p, likes: updatedLikes, likedBy: updatedLikedBy };
        }
        return p;
      });
      setPosts(updated);
      localStorage.setItem("clm_forum_posts", JSON.stringify(updated));

      await likeForumPost(postId, currentUser.uid);
    } catch (err) {
      console.error("Failed to update vote in database:", err);
    }
  };

  // Upvote / Like Reply
  const handleLikeReply = (postId: string, replyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("ပြန်လည်ဆွေးနွေးချက်များကို Upvote ပေးရန်အတွက် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါဗျာ။");
      return;
    }

    const updated = posts.map(p => {
      if (p.id === postId) {
        const updatedReplies = (p.replies || []).map(r => {
          if (r.id === replyId) {
            const likedByList = r.likedBy || [];
            const alreadyLiked = likedByList.includes(currentUser.uid);
            const currentLikes = r.likes || 0;
            const updatedLikes = alreadyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
            const updatedLikedBy = alreadyLiked
              ? likedByList.filter(uid => uid !== currentUser.uid)
              : [...likedByList, currentUser.uid];
            return { ...r, likes: updatedLikes, likedBy: updatedLikedBy, isHelpful: updatedLikes > 2 };
          }
          return r;
        });
        return { ...p, replies: updatedReplies };
      }
      return p;
    });

    setPosts(updated);
    localStorage.setItem("clm_forum_posts", JSON.stringify(updated));
    showToast("တုံ့ပြန်ဆွေးနွေးချက်အား Helpful အဖြစ် မှတ်ချက်ပြုခဲ့ပါသည်။");
  };

  // Mark Best Answer
  const handleMarkBestAnswer = (postId: string, replyId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Only post author or admin can mark best answer
    if (post.authorId && post.authorId !== currentUser.uid && !isAdminMode) {
      alert("မေးခွန်းမေးမြန်းသူ သို့မဟုတ် မိုဒရေတာသာလျှင် အကောင်းဆုံးအဖြေ (Best Answer) ကို သတ်မှတ်ပိုင်ခွင့်ရှိပါသည်ခင်ဗျာ။");
      return;
    }

    const updated = posts.map(p => {
      if (p.id === postId) {
        const isCurrentlyBest = p.bestAnswerId === replyId;
        const newBestId = isCurrentlyBest ? undefined : replyId;

        const updatedReplies = (p.replies || []).map(r => ({
          ...r,
          isBestAnswer: r.id === replyId ? !isCurrentlyBest : false
        }));

        return {
          ...p,
          bestAnswerId: newBestId,
          replies: updatedReplies
        };
      }
      return p;
    });

    setPosts(updated);
    localStorage.setItem("clm_forum_posts", JSON.stringify(updated));
    showToast("🌟 အကောင်းဆုံးအဖြေ (Best Answer) အဖြစ် သတ်မှတ်လိုက်ပါပြီ!");
  };

  // Trigger AI Auto-reply in background
  const triggerAiAutoReply = async (postId: string, title: string, content: string, code?: string) => {
    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `A student has posted a new discussion in the community forum. Please provide a helpful, expert, encouraging answer as Kibo (Myanmar Computer Science Tutor) in simple Myanmar language with English programming terms.
              
Topic: ${title}
Details: ${content}
${code ? `Code Snippet:\n${code}` : ''}

Provide a clear, complete, and polite reply with code examples if relevant.`
            }
          ]
        })
      });

      if (!response.ok) return;

      const data = await response.json();
      const replyText = data.text;

      const aiComment: Comment = {
        id: `ai-${Date.now()}`,
        author: "Kibo AI Tutor (ဆရာ)",
        authorId: "ai-kibo",
        content: replyText,
        date: new Date().toLocaleDateString(),
        isHelpful: true,
        likes: 3
      };

      try {
        await addForumReply(postId, aiComment);
      } catch (dbErr) {
        console.warn("Could not save AI reply to cloud:", dbErr);
      }

      setPosts(prevPosts => {
        const updated = prevPosts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              replies: [...(p.replies || []), aiComment]
            };
          }
          return p;
        });
        localStorage.setItem("clm_forum_posts", JSON.stringify(updated));
        return updated;
      });

      showToast("🤖 Kibo AI မှ မေးခွန်းအတွက် အကြံပြုချက် ရေးသားပေးလိုက်ပါပြီ!");
    } catch (err) {
      console.error("AI Auto Reply Error:", err);
    }
  };

  // Create Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setFilterWarningMsg(null);
    
    const rawTitle = newTitle.trim();
    const rawContent = newContent.trim();

    if (!rawTitle || !rawContent) return;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("ဆွေးနွေးချက်အသစ်တင်ရန်အတွက် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါဗျာ။");
      return;
    }

    // Automated Profanity & Anti-Spam Check
    const check = detectProfanityAndSpam(rawTitle, rawContent + " " + (newCodeSnippet || ""));
    if (check.flagged) {
      setFilterWarningMsg(`⚠️ မသင့်လျော်သည့် စာသားများ သို့မဟုတ် Spam စာအုပ်ပုံစံ တွေ့ရှိထားပါသည်: ${check.reason}`);
      return;
    }

    const sanitizedTitle = sanitizeInput(rawTitle, 150);
    const sanitizedContent = sanitizeInput(rawContent, 3000);
    const sanitizedCode = newCodeSnippet ? sanitizeInput(newCodeSnippet, 2000) : undefined;

    let activeName = currentUserProfile?.name || "ကျောင်းသားသစ်";
    if (currentUserProfile?.isPremium) {
      activeName += " 💎 (Premium)";
    }

    const tagArray = newTags
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const postPayload: Partial<ForumPost> = {
      title: sanitizedTitle,
      content: sanitizedContent,
      author: activeName,
      authorId: currentUser.uid,
      date: new Date().toLocaleDateString(),
      category: newCategory,
      postType: newPostType,
      programmingLanguage: newLanguage !== "None" ? newLanguage : undefined,
      codeSnippet: sanitizedCode,
      imageUrl: newImageUrl.trim() || undefined,
      tags: tagArray.length > 0 ? tagArray : [newCategory.toLowerCase().replace(/\s+/g, '-')],
      likes: 0,
      likedBy: [],
      replies: []
    };

    let finalPostId = `local-${Date.now()}`;

    try {
      setIsLoading(true);
      const cloudId = await createForumPost(postPayload as any);
      if (cloudId) {
        finalPostId = cloudId;
      }
    } catch (err) {
      console.warn("Firestore fallback to local:", err);
    }

    const newPost: ForumPost = {
      id: finalPostId,
      title: postPayload.title!,
      content: postPayload.content!,
      author: postPayload.author!,
      authorId: postPayload.authorId,
      date: postPayload.date!,
      category: postPayload.category!,
      postType: postPayload.postType,
      programmingLanguage: postPayload.programmingLanguage,
      codeSnippet: postPayload.codeSnippet,
      imageUrl: postPayload.imageUrl,
      tags: postPayload.tags,
      likes: 0,
      likedBy: [],
      replies: []
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem("clm_forum_posts", JSON.stringify(updated));

    // Reset Form
    setNewTitle("");
    setNewContent("");
    setNewCodeSnippet("");
    setNewImageUrl("");
    setNewTags("");
    setShowNewPostForm(false);
    setIsLoading(false);

    showToast("🎉 ဆွေးနွေးချက် အသစ်အား အောင်မြင်စွာ တင်ပြီးပါပြီ!");

    // Trigger AI Auto-reply in background
    triggerAiAutoReply(finalPostId, postPayload.title!, postPayload.content!, postPayload.codeSnippet);
  };

  // Submit Reply
  const handleAddReply = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const rawReply = newReplyContent.trim();
    if (!rawReply) return;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("ပြန်လည်ဆွေးနွေးရန်အတွက် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါဗျာ။");
      return;
    }

    // Automated Profanity & Anti-Spam Check
    const check = detectProfanityAndSpam("", rawReply);
    if (check.flagged) {
      alert(`⚠️ မသင့်လျော်သော စာသား သို့မဟုတ် Spam ပုံစံ ပါဝင်နေပါသည်: ${check.reason}`);
      return;
    }

    const sanitizedReply = sanitizeInput(rawReply, 1500);

    let activeName = currentUserProfile?.name || "ကျောင်းသားသစ်";
    if (currentUserProfile?.isPremium) {
      activeName += " 💎";
    }

    const newComment: Comment = {
      id: `rep-${Date.now()}`,
      author: activeName,
      authorId: currentUser.uid,
      content: sanitizedReply,
      date: new Date().toLocaleDateString(),
      likes: 0,
      likedBy: []
    };

    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, replies: [...(p.replies || []), newComment] };
      }
      return p;
    });
    setPosts(updated);
    localStorage.setItem("clm_forum_posts", JSON.stringify(updated));
    setNewReplyContent("");

    try {
      await addForumReply(postId, newComment);
    } catch (err) {
      console.warn("Could not write reply to Cloud Firestore:", err);
    }

    showToast("💬 ပြန်လည်ဆွေးနွေးချက်အား တင်ပြလိုက်ပါပြီ!");
  };

  // Edit Reply
  const handleSaveEditedReply = (postId: string, replyId: string) => {
    if (!editReplyContent.trim()) return;

    const updated = posts.map(p => {
      if (p.id === postId) {
        const updatedReplies = (p.replies || []).map(r => {
          if (r.id === replyId) {
            return { ...r, content: editReplyContent.trim() };
          }
          return r;
        });
        return { ...p, replies: updatedReplies };
      }
      return p;
    });

    setPosts(updated);
    localStorage.setItem("clm_forum_posts", JSON.stringify(updated));
    setEditingReplyId(null);
    setEditReplyContent("");
    showToast("✏️ ပြန်လည်ဆွေးနွေးချက်အား ပြင်ဆင်ပြီးပါပြီ!");
  };

  // Delete Reply
  const handleDeleteReply = (postId: string, replyId: string) => {
    if (!confirm("ဤ ပြန်လည်ဆွေးနွေးချက်အား ဖျက်ပစ်ရန် သေချာပါသလား။")) return;

    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, replies: (p.replies || []).filter(r => r.id !== replyId) };
      }
      return p;
    });

    setPosts(updated);
    localStorage.setItem("clm_forum_posts", JSON.stringify(updated));
    showToast("🗑️ ပြန်လည်ဆွေးနွေးချက်အား ဖျက်ပစ်ပြီးပါပြီ။");
  };

  // Delete Post (Admin or Author)
  const handleDeletePost = (postId: string) => {
    if (!confirm("ဤ ဆွေးနွေးချက်တစ်ခုလုံးအား ဖျက်ပစ်ရန် သေချာပါသလား။")) return;

    const updated = posts.filter(p => p.id !== postId);
    setPosts(updated);
    localStorage.setItem("clm_forum_posts", JSON.stringify(updated));
    if (selectedPostId === postId) {
      setSelectedPostId(null);
    }
    showToast("🗑️ ဆွေးနွေးချက်အား အောင်မြင်စွာ ဖျက်ပစ်လိုက်ပါပြီ။");
  };

  // Lock Post (Admin / Moderator)
  const handleToggleLockPost = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const isLockedNow = !p.isLocked;
        showToast(isLockedNow ? "🔒 ဆွေးနွေးချက်အား ပိတ်လိုက်ပါပြီ (Locked)" : "🔓 ဆွေးနွေးချက်အား ပြန်ဖွင့်လိုက်ပါပြီ");
        return { ...p, isLocked: isLockedNow };
      }
      return p;
    });
    setPosts(updated);
    localStorage.setItem("clm_forum_posts", JSON.stringify(updated));
  };

  // Submit Report
  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingItem) return;

    const confidentialToken = `Anon-${Math.random().toString(36).substring(2, 8)}`;

    const updated = posts.map(p => {
      if (p.id === reportingItem.id || p.id === selectedPostId) {
        return { ...p, isReported: true, reportReason };
      }
      return p;
    });

    setPosts(updated);
    localStorage.setItem("clm_forum_posts", JSON.stringify(updated));

    // Submit report confidentially to database
    await submitCommunityReport({
      targetType: reportingItem.type,
      targetId: reportingItem.id,
      postId: selectedPostId || reportingItem.id,
      contentTitle: reportingItem.title,
      contentAuthor: reportingItem.type === "post" ? (activePost?.author || "User") : "Reply Author",
      contentSnippet: reportingItem.title,
      reporterAnonymousId: confidentialToken,
      reason: reportReason,
      details: "Submitted confidentially by community student"
    });

    setReportSuccessMessage("ကျေးဇူးတင်ပါသည်။ သင့်၏ တိုင်ကြားချက်အား မိုဒရေတာအဖွဲ့မှ သီးသန့် လျှို့ဝှက် စစ်ဆေးအရေးယူပေးပါမည်။ (Reporter Identity Protected)");
    setTimeout(() => {
      setReportingItem(null);
      setReportSuccessMessage(null);
    }, 2500);
  };

  // Kibo Summarize Discussion
  const handleKiboSummarize = async (post: ForumPost) => {
    setIsKiboAnalyzing(true);
    setKiboSummary(null);

    try {
      const allRepliesText = (post.replies || [])
        .map((r, idx) => `Reply ${idx + 1} by ${r.author}: ${r.content}`)
        .join("\n\n");

      const prompt = `Please analyze and summarize this programming discussion in Myanmar language for students.
Title: ${post.title}
Main Question: ${post.content}
Replies count: ${(post.replies || []).length}

Replies:
${allRepliesText || "No replies yet."}

Format the summary with:
1. 💡 **အဓိက မေးခွန်းအချက်အလက်** (Core Question)
2. 🔑 **ဆရာများနှင့် ကျောင်းသားများ၏ အဓိက အကြံပြုချက်များ** (Key Takeaways)
3. 🎯 **ထပ်မံ လေ့လာသင့်သော အကြောင်းအရာများ** (Recommended Topics)`;

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setKiboSummary(data.text);
      } else {
        setKiboSummary("ဆွေးနွေးချက် အကျဉ်းချုပ် ရယူရာတွင် အခက်အခဲရှိနေပါသည်။ ကျေးဇူးပြု၍ ခဏအကြာတွင် ပြန်လည်ကြိုးစားပေးပါခင်ဗျာ။");
      }
    } catch (err) {
      console.error(err);
      setKiboSummary("Kibo AI အနှစ်ချုပ် စနစ်တွင် ခေတ္တချို့ယွင်းချက် ဖြစ်ပေါ်နေပါသည်။");
    } finally {
      setIsKiboAnalyzing(false);
    }
  };

  // Copy Code Snippet
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Filter Logic
  const filteredPosts = posts.filter(p => {
    // Search match
    const matchQuery = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.programmingLanguage || "").toLowerCase().includes(searchQuery.toLowerCase());

    // Category match
    const matchCategory = selectedCategory === "All Categories" || p.category === selectedCategory;

    // Post type match
    const matchType = selectedPostTypeFilter === "All" || p.postType === selectedPostTypeFilter;

    // Language match
    const matchLang = selectedLanguageFilter === "All" || p.programmingLanguage === selectedLanguageFilter;

    return matchQuery && matchCategory && matchType && matchLang;
  });

  const activePost = selectedPostId !== null ? posts.find(p => p.id === selectedPostId) || null : null;

  // Sort replies: Best Answer first
  const sortedReplies = activePost ? [...(activePost.replies || [])].sort((a, b) => {
    if (a.isBestAnswer) return -1;
    if (b.isBestAnswer) return 1;
    return (b.likes || 0) - (a.likes || 0);
  }) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-8 relative">
      
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-[999] bg-slate-900 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-bounce text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Guest Banner */}
      {!auth.currentUser && !isDbLoading && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-300 flex items-center gap-2">
            <Lock className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />
            <span><strong>ဧည့်သည်အဖြစ် ကြည့်ရှုနေပါသည်။</strong> မေးခွန်းများ မေးမြန်းရန်၊ ပြန်လည်ဖြေကြားရန်နှင့် ဆွေးနွေးချက်များကို Upvote ပေးရန် ကျေးဇူးပြု၍ အကောင့်ဝင်ရောက်ပေးပါ။</span>
          </p>
        </div>
      )}

      {isDbLoading ? (
        <div className="bg-slate-800/25 border border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading discussions from cloud database...</p>
        </div>
      ) : activePost === null ? (
        
        /* FORUM POSTS LIST VIEW */
        <div className="space-y-8">
          
          {/* Header & New Post Button */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                  🤝 CODE LEARN COMMUNITY
                </span>
                {isAdminMode && (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1">
                    <Shield className="w-3 h-3 text-purple-400" />
                    <span>MODERATOR MODE</span>
                  </span>
                )}
              </div>
              <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight">
                ကျောင်းသားများ အမေး/အဖြေနှင့် ဗဟုသုတမျှဝေရေး ကွန်မြူနတီ
              </h1>
              <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
                ပရိုဂရမ်မင်း လေ့လာနေသူချင်း အခက်အခဲများကို စုပေါင်းဖြေရှင်းရန်၊ မေးခွန်းများမေးမြန်းရန်နှင့် နည်းပညာ ဗဟုသုတများ ဆွေးနွေးဖလှယ်ရန် လုံခြုံစိတ်ချရသော နေရာ။
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setShowRulesModal(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>စည်းကမ်းချက်များ (Rules)</span>
              </button>

              {isAdminMode && (
                <button
                  onClick={() => setShowModDashboardModal(true)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-xs font-bold text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>မိုဒရေရှင်း မန်နေဂျာ</span>
                </button>
              )}

              <button
                onClick={() => setShowNewPostForm(!showNewPostForm)}
                className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>မေးခွန်း/ဆွေးနွေးချက်သစ် တင်မည်</span>
              </button>
            </div>
          </div>

          {/* New Post Form Modal/Card */}
          {showNewPostForm && (
            <form onSubmit={handleCreatePost} className="bg-[#1E293B] border border-blue-500/30 p-6 md:p-8 rounded-3xl space-y-5 animate-scale-up shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-display font-bold text-white text-base flex items-center space-x-2">
                  <PlusCircle className="w-5 h-5 text-blue-400" />
                  <span>ဆွေးနွေးချက် သို့မဟုတ် မေးခွန်းအသစ်တစ်ခု ဖန်တီးရန်</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewPostForm(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  မလုပ်တော့ပါ (Cancel)
                </button>
              </div>

              {/* Automated Filter Warning Alert */}
              {filterWarningMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-2xl flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{filterWarningMsg}</span>
                </div>
              )}

              {/* Plagiarism Encouragement Notice */}
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-between text-xs text-purple-300 font-medium">
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>💡 မိမိကိုယ်ပိုင် Code နှင့် အကြောင်းအရာများကိုသာ တင်ပြပါ (Avoid Plagiarism - Credit original sources if quoting).</span>
                </span>
                <span className="text-[10px] font-mono bg-purple-500/20 px-2 py-0.5 rounded text-purple-200">
                  Originality Matters
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Title */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">ခေါင်းစဉ် (Title) <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="ဥပမာ - JavaScript Async/Await သုံးရာတွင် Error တက်နေလို့ပါခင်ဗျာ"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Post Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">ဆွေးနွေးချက် အမျိုးအစား</label>
                  <select
                    value={newPostType}
                    onChange={(e) => setNewPostType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {POST_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">ကဏ္ဍ (Category)</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DISCUSSION_CATEGORIES.filter(c => c !== "All Categories").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Programming Language */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">ပရိုဂရမ်မင်း ဘာသာစကား</label>
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PROGRAMMING_LANGUAGES.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">တဂ်များ (Tags - Comma Separated)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="ဥပမာ - react, state, hooks"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

              {/* Main Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">အသေးစိတ်မေးခွန်း/အကြောင်းအရာ <span className="text-rose-400">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="သိရှိလိုသော အကြောင်းအရာများ၊ Error တက်နေသော အပိုင်းများကို အသေးစိတ် ရှင်းလင်းရေးသားပါ။"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Optional Code Snippet */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Code className="w-3.5 h-3.5 text-purple-400" />
                  <span>စမ်းသပ်ကုဒ် သို့မဟုတ် Error ကုဒ်ထည့်သွင်းရန် (Optional Code Snippet)</span>
                </label>
                <textarea
                  rows={3}
                  value={newCodeSnippet}
                  onChange={(e) => setNewCodeSnippet(e.target.value)}
                  placeholder={`// ဤနေရာတွင် Code ထည့်သွင်းနိုင်ပါသည်\nfunction test() {\n  console.log("Hello Myanmar");\n}`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Optional Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>ပုံရိပ် အိုင်ကွန် သို့မဟုတ် Screenshot Link (Optional Image URL)</span>
                </label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/screenshot.png"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostForm(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center space-x-2"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>အမေးပိုစ့် တင်မည် (Publish Post)</span>
                </button>
              </div>
            </form>
          )}

          {/* CATEGORY & SEARCH FILTER BAR */}
          <div className="space-y-4">
            
            {/* Search Input */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80 bg-[#1E293B]/80 border border-slate-800 rounded-2xl p-2 flex items-center">
                <Search className="w-4.5 h-4.5 text-slate-400 ml-2.5" />
                <input
                  type="text"
                  placeholder="ခေါင်းစဉ်၊ တဂ် သို့မဟုတ် ကုဒ်ဖြင့် ရှာဖွေရန်..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 text-slate-200 text-xs placeholder-slate-500 focus:outline-none pl-2.5 focus:ring-0"
                />
              </div>

              {/* Language and Post Type Filter Dropdowns */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  value={selectedPostTypeFilter}
                  onChange={(e) => setSelectedPostTypeFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="All">All Types</option>
                  {POST_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select
                  value={selectedLanguageFilter}
                  onChange={(e) => setSelectedLanguageFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="All">All Languages</option>
                  {PROGRAMMING_LANGUAGES.filter(l => l !== "None").map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
              {DISCUSSION_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div 
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className={`bg-[#1E293B] border rounded-2xl p-6 hover:border-blue-500/50 cursor-pointer transition-all space-y-4 text-slate-200 flex flex-col md:flex-row md:items-start justify-between gap-4 relative overflow-hidden ${
                    post.isLocked ? 'border-amber-500/30' : 'border-slate-800'
                  }`}
                >
                  {/* Left content */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase">
                        {post.category}
                      </span>

                      {post.postType && (
                        <span className="text-[9px] bg-purple-500/15 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-bold">
                          {post.postType}
                        </span>
                      )}

                      {post.programmingLanguage && (
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold font-mono">
                          {post.programmingLanguage}
                        </span>
                      )}

                      {post.bestAnswerId && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-amber-400" />
                          <span>SOLVED</span>
                        </span>
                      )}

                      {post.isLocked && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                          <Lock className="w-3 h-3" />
                          <span>LOCKED</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-base md:text-lg text-white leading-snug hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {post.content}
                    </p>

                    {/* Tag list */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center space-x-1.5 pt-1">
                        {post.tags.map(t => (
                          <span key={t} className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono pt-1">
                      <span className="flex items-center space-x-1">
                        <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-semibold text-slate-300">{post.author}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{post.date}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Stats & Likes */}
                  <div className="flex items-center space-x-4 border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 pl-0 md:pl-6 text-xs text-slate-400 font-mono flex-shrink-0 justify-between md:justify-start">
                    <button 
                      onClick={(e) => handleLikePost(post.id, e)}
                      className="flex items-center space-x-1.5 hover:text-blue-400 px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 transition-all"
                    >
                      <ThumbsUp className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-white">{post.likes}</span>
                    </button>

                    <span className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-300">{(post.replies || []).length}</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#1E293B] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">ဆွေးနွေးချက်များ မတွေ့ရှိပါခင်ဗျာ</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  ရှာဖွေမှု စကားလုံး သို့မဟုတ် ကဏ္ဍစစ်ထုတ်မှုကို ပြောင်းလဲကြည့်ပါ သို့မဟုတ် မေးခွန်းအသစ်တစ်ခု စတင်မေးမြန်းပါ။
                </p>
              </div>
            )}

            {/* Incremental Pagination Load More */}
            {hasMorePosts && filteredPosts.length > 0 && (
              <div className="flex flex-col items-center justify-center pt-4 pb-2 space-y-2">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-3 bg-[#1E293B] hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 text-white rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center space-x-2 cursor-pointer group"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                      <span>ဆွေးနွေးချက်များ ရယူနေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span>ဆွေးနွေးချက်များ ထပ်မံဖတ်ရှုရန် (Load More Discussions)</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 font-mono">
                  လက်ရှိ ပြသထားသော ဆွေးနွေးချက်: {filteredPosts.length} ခု
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (

        /* POST DETAIL & REPLY VIEW */
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedPostId(null);
                setKiboSummary(null);
              }}
              className="inline-flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ကွန်မြူနတီ ဆွေးနွေးချက်များသို့ ပြန်သွားရန်</span>
            </button>

            {/* Moderator Quick Actions */}
            {isAdminMode && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleLockPost(activePost.id)}
                  className="px-3 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{activePost.isLocked ? "Unlock" : "Lock Post"}</span>
                </button>

                <button
                  onClick={() => handleDeletePost(activePost.id)}
                  className="px-3 py-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>

          {/* Original Post Card */}
          <div className="bg-[#1E293B] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-xl">
            
            {/* Header Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-bold uppercase">
                  {activePost.category}
                </span>

                {activePost.postType && (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full font-bold">
                    {activePost.postType}
                  </span>
                )}

                {activePost.programmingLanguage && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-mono font-bold">
                    {activePost.programmingLanguage}
                  </span>
                )}

                {activePost.bestAnswerId && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>SOLVED</span>
                  </span>
                )}
              </div>

              {/* Author & Date */}
              <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                <span className="flex items-center space-x-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-bold text-white">{activePost.author}</span>
                </span>
                <span>•</span>
                <span>{activePost.date}</span>
              </div>
            </div>

            {/* Post Title */}
            <h1 className="font-display font-black text-xl md:text-2xl text-white leading-snug">
              {activePost.title}
            </h1>

            {/* Post Content */}
            <p className="text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
              {activePost.content}
            </p>

            {/* Optional Code Snippet Block */}
            {activePost.codeSnippet && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono bg-slate-950 px-4 py-2 rounded-t-xl border border-slate-800">
                  <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                    <Code className="w-3.5 h-3.5" />
                    <span>{activePost.programmingLanguage || "Code Snippet"}</span>
                  </span>

                  <button
                    onClick={() => handleCopyCode(activePost.codeSnippet!, `post-${activePost.id}`)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCodeId === `post-${activePost.id}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b-xl overflow-x-auto text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre">
                  {activePost.codeSnippet}
                </pre>
              </div>
            )}

            {/* Optional Image */}
            {activePost.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-80">
                <img 
                  src={activePost.imageUrl} 
                  alt="Post Attachment" 
                  className="w-full object-contain max-h-80"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}

            {/* Footer Buttons & Report */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={(e) => handleLikePost(activePost.id, e)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 font-bold cursor-pointer"
                >
                  <ThumbsUp className="w-4 h-4 text-blue-400" />
                  <span>{activePost.likes} Likes</span>
                </button>

                <button 
                  onClick={() => handleKiboSummarize(activePost)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 font-bold cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Kibo AI အနှစ်ချုပ် ရယူမည်</span>
                </button>
              </div>

              {/* Report Post Button */}
              <button
                onClick={() => setReportingItem({ type: "post", id: activePost.id, title: activePost.title })}
                className="text-slate-500 hover:text-rose-400 flex items-center space-x-1 text-[11px] font-semibold cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>တိုင်ကြားမည် (Report)</span>
              </button>
            </div>

          </div>

          {/* Kibo AI Summary Card */}
          {isKiboAnalyzing && (
            <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 flex items-center space-x-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin shrink-0" />
              <p className="text-xs text-purple-200">Kibo AI မှ ဆွေးနွေးချက် အနှစ်ချုပ်အား ပြုစုနေပါသည်...</p>
            </div>
          )}

          {kiboSummary && (
            <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/40 rounded-3xl p-6 space-y-3 text-left animate-fade-in shadow-xl">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                <div className="flex items-center space-x-2">
                  <KiboMascot emotion="thinking" size="sm" />
                  <div>
                    <h3 className="text-xs font-bold text-purple-300 font-mono">Kibo AI Discussion Summary</h3>
                    <span className="text-[10px] text-slate-400">ဆွေးနွေးချက် အကျဉ်းချုပ်</span>
                  </div>
                </div>
                <button
                  onClick={() => setKiboSummary(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ပိတ်မည်
                </button>
              </div>

              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {kiboSummary}
              </div>
            </div>
          )}

          {/* ANSWERS & REPLIES SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>တုံ့ပြန်ဆွေးနွေးချက်များ ({sortedReplies.length})</span>
              </h2>

              {activePost.bestAnswerId && (
                <span className="text-[10px] text-amber-400 font-bold flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Best Answer Selected</span>
                </span>
              )}
            </div>

            {/* Replies List */}
            {sortedReplies.length > 0 ? (
              sortedReplies.map((rep) => {
                const isAuthorOfReply = auth.currentUser && rep.authorId === auth.currentUser.uid;
                const isEditingThis = editingReplyId === rep.id;

                return (
                  <div 
                    key={rep.id} 
                    className={`bg-slate-900/80 border rounded-3xl p-5 md:p-6 space-y-3 transition-all relative ${
                      rep.isBestAnswer 
                        ? 'border-emerald-500/60 bg-emerald-950/10 shadow-lg shadow-emerald-500/10' 
                        : rep.isHelpful 
                        ? 'border-blue-500/30' 
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Best Answer Badge Banner */}
                    {rep.isBestAnswer && (
                      <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-xl text-[11px] font-extrabold flex items-center space-x-2 w-fit">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>🌟 BEST ANSWER (အကောင်းဆုံး ဖြေကြားချက်)</span>
                      </div>
                    )}

                    {/* Author Header */}
                    <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800/60 pb-2">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-bold text-white">{rep.author}</span>
                        {rep.authorId === "ai-kibo" && (
                          <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md font-bold">
                            OFFICIAL AI TUTOR
                          </span>
                        )}
                      </div>

                      <span className="text-slate-500 text-[10px]">{rep.date}</span>
                    </div>

                    {/* Reply Content or Edit Mode */}
                    {isEditingThis ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          rows={3}
                          value={editReplyContent}
                          onChange={(e) => setEditReplyContent(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingReplyId(null)}
                            className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                          >
                            မလုပ်တော့ပါ
                          </button>
                          <button
                            onClick={() => handleSaveEditedReply(activePost.id, rep.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold"
                          >
                            သိမ်းမည်
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-blue-500/40">
                        {rep.content}
                      </p>
                    )}

                    {/* Actions bar for reply */}
                    <div className="flex items-center justify-between pt-2 text-xs">
                      
                      <div className="flex items-center space-x-3">
                        {/* Upvote Reply */}
                        <button
                          onClick={(e) => handleLikeReply(activePost.id, rep.id, e)}
                          className="flex items-center space-x-1.5 text-slate-400 hover:text-blue-400 font-mono text-[11px] cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
                          <span>{rep.likes || 0} Helpful</span>
                        </button>

                        {/* Mark Best Answer button (for post author or admin) */}
                        {auth.currentUser && (activePost.authorId === auth.currentUser.uid || isAdminMode) && (
                          <button
                            onClick={() => handleMarkBestAnswer(activePost.id, rep.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              rep.isBestAnswer 
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                            }`}
                          >
                            {rep.isBestAnswer ? "Best Answer မှတ်ထားသည်" : "Best Answer အဖြစ် သတ်မှတ်မည်"}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-[11px]">
                        {/* Edit / Delete own reply */}
                        {isAuthorOfReply && !isEditingThis && (
                          <>
                            <button
                              onClick={() => {
                                setEditingReplyId(rep.id);
                                setEditReplyContent(rep.content);
                              }}
                              className="text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteReply(activePost.id, rep.id)}
                              className="text-slate-500 hover:text-rose-400 flex items-center space-x-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}

                        {/* Report reply */}
                        <button
                          onClick={() => setReportingItem({ type: "reply", id: rep.id, title: rep.content.slice(0, 30) })}
                          className="text-slate-600 hover:text-rose-400 p-1 cursor-pointer"
                          title="Report Reply"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-2">
                <p className="text-xs text-slate-400">ဆွေးနွေးချက်များ မရှိသေးပါ ခင်ဗျာ။ ပထမဆုံး အဖြစ် ဝင်ရောက်ဆွေးနွေး အကြံပြုလိုက်ပါ။</p>
              </div>
            )}
          </div>

          {/* ADD REPLY FORM */}
          {!activePost.isLocked ? (
            <form onSubmit={(e) => handleAddReply(e, activePost.id)} className="bg-[#1E293B] border border-slate-800 rounded-3xl p-4 md:p-5 space-y-3 shadow-lg">
              <label className="text-xs font-bold text-slate-300 block">
                သင့်၏ ပြန်လည်ဆွေးနွေးချက်အား ရေးသားပါ (Add Reply)
              </label>

              <div className="flex gap-2">
                <textarea
                  rows={3}
                  value={newReplyContent}
                  onChange={(e) => setNewReplyContent(e.target.value)}
                  placeholder="ဤနေရာတွင် ဝင်ရောက်ဆွေးနွေး အကြံပြုချက် သို့မဟုတ် အဖြေများကို ရေးသားပါ..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-slate-500">
                  မေးခွန်းမေးမြန်းသူထံ အကြောင်းကြားစာ (Notification) ရောက်ရှိမည် ဖြစ်ပါသည်။
                </span>

                <button
                  type="submit"
                  disabled={!newReplyContent.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ပြန်လည်ဖြေကြားမည် (Reply)</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-4 text-center text-xs font-bold flex items-center justify-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>ဤ ဆွေးနွေးချက်အား မိုဒရေတာမှ ပိတ်ထားပါသည် (Discussion Locked)။</span>
            </div>
          )}

        </div>
      )}

      {/* REPORT MODAL */}
      {reportingItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-rose-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-left">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm border-b border-slate-800 pb-3">
              <AlertTriangle className="w-5 h-5" />
              <span>အကြောင်းအရာအား တိုင်ကြားရန် (Report Content)</span>
            </div>

            {reportSuccessMessage ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold text-center">
                {reportSuccessMessage}
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4">
                <p className="text-xs text-slate-300">
                  တိုင်ကြားမည့် အကြောင်းအရာ: <strong className="text-white">"{reportingItem.title}"</strong>
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">တိုင်ကြားရသည့် အကြောင်းအရင်း</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value as ReportReasonType)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                  >
                    {REPORT_REASONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>🔒 သင်၏ တိုင်ကြားမှုအား သီးသန့် လျှို့ဝှက်ထားရှိမည်ဖြစ်ပြီး အခြားကျောင်းသားများမှ မမြင်တွေ့နိုင်ပါ (Reporter Anonymity Protected)။</span>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingItem(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    မလုပ်တော့ပါ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    တိုင်ကြားမည် (Submit Report)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* COMMUNITY RULES MODAL */}
      <CommunityRulesModal 
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      {/* MODERATION DASHBOARD MODAL */}
      <ModerationDashboardModal
        isOpen={showModDashboardModal}
        onClose={() => setShowModDashboardModal(false)}
        posts={posts}
        onUpdatePosts={(updatedPosts) => {
          setPosts(updatedPosts);
          localStorage.setItem("clm_forum_posts", JSON.stringify(updatedPosts));
        }}
      />

    </div>
  );
}
