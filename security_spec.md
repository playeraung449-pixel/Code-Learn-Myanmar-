# Security Specification & "Dirty Dozen" Penetration Test Spec
**Code Learn Myanmar Platform Security Design (Phase 0)**

This document defines the core data invariants, security boundaries, and penetration payloads designed to test our Zero-Trust Firestore Security Rules.

---

## 1. Core Data Invariants

1. **Strict Owner Isolation (Identity)**: A user's profile (`/users/{userId}`), progress logs (`/progress/{progressId}`), bookmarks (`/bookmarks/{bookmarkId}`), and notifications (`/notifications/{notificationId}`) belong to exactly one authenticated identity. No user may read, update, or delete another user's private data.
2. **Anti-Escalation Gate (Integrity)**: Role configurations (`role: "admin"`, `role: "teacher"`) are immutable through student clients. Attempting to register or self-escalate to privileged roles will be aborted.
3. **Plausible Progression Invariant (State)**: A student's experience points (`xp`) and levels can only increase incrementally through verified task milestones (max +300 XP per individual submission update). Large arbitrary jumps are blocked.
4. **Teacher-Only Educational Content**: Creating or modifying course tracks (`/courses`), lesson markdown (`/lessons`), or quizzes (`/quizzes`) is strictly reserved for verified `teacher` or `admin` accounts.
5. **Verified Email Mandate**: To execute database writes for user profiles, progress, and assignments, users must hold a verified email address (`request.auth.token.email_verified == true`).
6. **No Client Query Scraping**: `list` queries on progress, assignments, and certificates must be protected in the rules themselves by evaluating `resource.data` to prevent unauthorized query scraping.

---

## 2. The "Dirty Dozen" Penetration Payloads
Each payload is designed to break a core security law. Our security rules must reject all 12 of these attacks with `PERMISSION_DENIED`.

### Attack 1: User Identity Spoofing (Write to Another Profile)
*   **Vector**: Student `uid_alice` attempts to update the profile document of student `uid_bob`.
*   **Payload**:
    ```json
    // PATH: /users/uid_bob
    {
      "uid": "uid_bob",
      "fullName": "Alice Spoofing Bob",
      "email": "alice@spoof.com",
      "role": "student"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Matches `users/{userId}` but `request.auth.uid != userId`).

### Attack 2: Self-Role Escalation (Admin Privilege Inject)
*   **Vector**: Student attempts to register or modify their own profile, injecting a privileged role.
*   **Payload**:
    ```json
    // PATH: /users/uid_alice
    {
      "uid": "uid_alice",
      "fullName": "Alice Wannabe Admin",
      "email": "alice@school.edu",
      "role": "admin",
      "xp": 100,
      "level": 1
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Validation blocks non-student roles during self-create/update).

### Attack 3: Infinite Coins/XP Exploit (Value Poisoning)
*   **Vector**: Student attempts to edit their profile to grant themselves 999,999 coins and XP.
*   **Payload**:
    ```json
    // PATH: /users/uid_alice
    {
      "uid": "uid_alice",
      "fullName": "Alice Exploit",
      "xp": 999999,
      "level": 3,
      "coins": 999999
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Blocks updates where XP increase > 300 or coins jump > 300 in a single update).

### Attack 4: Unauthorized Educational Content Manipulation
*   **Vector**: Authenticated student attempts to inject a fake lesson into a course.
*   **Payload**:
    ```json
    // PATH: /lessons/lesson_fake
    {
      "lessonId": "lesson_fake",
      "courseId": "basics-python",
      "title": "Hacked Lesson - Send me Bitcoin",
      "lessonNumber": 99,
      "content": "Malicious content here"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Creating lessons requires `isTeacher()` check).

### Attack 5: Unverified User Write Bypass
*   **Vector**: A user with an unverified email attempts to update their user profile or complete an assignment.
*   **Payload**:
    ```json
    // PATH: /users/uid_unverified
    {
      "uid": "uid_unverified",
      "fullName": "Unverified User",
      "email": "unverified@test.com",
      "role": "student"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Requires `request.auth.token.email_verified == true`).

### Attack 6: Assignment Identity Theft (Hijacking Grades)
*   **Vector**: Student `uid_alice` attempts to submit or overwrite an assignment belonging to student `uid_bob`.
*   **Payload**:
    ```json
    // PATH: /assignments/assign_bob_python
    {
      "assignmentId": "assign_bob_python",
      "uid": "uid_bob",
      "courseId": "basics-python",
      "submissionURL": "https://github.com/alice/hacked-sol"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Enforces `incoming().uid == request.auth.uid`).

### Attack 7: Progress Log Tampering (Course Complete Cheat)
*   **Vector**: Student `uid_alice` attempts to directly modify their progress record to mark all lessons as complete.
*   **Payload**:
    ```json
    // PATH: /progress/progress_alice_web
    {
      "uid": "uid_alice",
      "courseId": "basics-web",
      "completedLessons": ["lesson-1", "lesson-2", "lesson-3", "lesson-4", "lesson-5", "lesson-6", "lesson-7"],
      "xpEarned": 50000
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Validation blocks modifying `uid` and requires incremental progression checks).

### Attack 8: Graduation Certificate Forgery
*   **Vector**: Student attempts to generate their own completed course Certificate.
*   **Payload**:
    ```json
    // PATH: /certificates/cert_alice_web
    {
      "certificateId": "cert_alice_web",
      "uid": "uid_alice",
      "courseId": "basics-web",
      "courseName": "Web Development Basics",
      "issuedDate": "2026-07-09",
      "certificateURL": "https://storage.googleapis.com/fake-cert"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Only `isTeacher()` can create or update Certificate documents).

### Attack 9: Ghost Field Injection (Shadow Update)
*   **Vector**: Student tries to write extra hidden payload keys in their bookmark.
*   **Payload**:
    ```json
    // PATH: /bookmarks/bookmark_alice_python
    {
      "uid": "uid_alice",
      "lessonId": "python-1",
      "savedAt": "2026-07-09",
      "isVIPUser": true, // Ghost field
      "bypassPayments": "yes" // Ghost field
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Fails the exact keys schema constraints).

### Attack 10: Notification Spamming (System Impersonation)
*   **Vector**: Student attempts to insert a system-wide alert or a fake award notification in another user's inbox.
*   **Payload**:
    ```json
    // PATH: /notifications/notif_bob_fake
    {
      "notificationId": "notif_bob_fake",
      "uid": "uid_bob",
      "title": "System Alert",
      "message": "Click this link to receive free rewards",
      "type": "alert",
      "isRead": false,
      "createdAt": "2026-07-09"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Creating notifications is restricted or enforces that `uid` matches current authenticated user, and blocks modifying key fields).

### Attack 11: Forum Ghost Injection (Spoofing Authors)
*   **Vector**: User `uid_alice` attempts to submit a forum post claiming to be written by `uid_bob`.
*   **Payload**:
    ```json
    // PATH: /forum_posts/post_spoof
    {
      "title": "Confused about variables",
      "content": "Please explain Python variables",
      "author": "Bob the Expert",
      "authorId": "uid_bob"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Blocks creation when `incoming().authorId != request.auth.uid`).

### Attack 12: Grade Lock Tampering (Teacher Lockout Bypass)
*   **Vector**: Student attempts to edit their graded assignment feedback after the teacher has graded it.
*   **Payload**:
    ```json
    // PATH: /assignments/assign_alice_python
    {
      "assignmentId": "assign_alice_python",
      "uid": "uid_alice",
      "submissionURL": "https://github.com/alice/edited-version",
      "grade": "A+", // Attempting to change grade
      "feedback": "Outstanding work student!" // Attempting to alter teacher comment
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Blocks updates to `grade` or `feedback` keys except by `isTeacher()`).

---

## 3. The Security Test Runner Specification

```typescript
/**
 * @file firestore.rules.test.ts
 * Penetration Testing Runner for Code Learn Myanmar Security Rules.
 */

import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import * as fs from "fs";

let testEnv: RulesTestEnvironment;

describe("Zero-Trust Fortress Rules Penetration Test", () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "code-learn-myanmar-prod",
      firestore: {
        rules: fs.readFileSync("firestore.rules", "utf8"),
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  it("Attack 1: Blocks Alice from writing to Bob's profile", async () => {
    const aliceContext = testEnv.authenticatedContext("uid_alice", { email_verified: true });
    const bobProfile = aliceContext.firestore().doc("users/uid_bob");
    
    await assertFails(
      bobProfile.set({
        uid: "uid_bob",
        fullName: "Alice Spoofing Bob",
        email: "alice@spoof.com",
        role: "student",
      })
    );
  });

  it("Attack 2: Blocks self-escalation to admin role", async () => {
    const aliceContext = testEnv.authenticatedContext("uid_alice", { email_verified: true });
    const aliceProfile = aliceContext.firestore().doc("users/uid_alice");
    
    await assertFails(
      aliceProfile.set({
        uid: "uid_alice",
        fullName: "Alice Wannabe Admin",
        email: "alice@school.edu",
        role: "admin",
        xp: 100,
        level: 1,
      })
    );
  });

  it("Attack 3: Blocks negative/unbounded XP/Coin updates", async () => {
    const aliceContext = testEnv.authenticatedContext("uid_alice", { email_verified: true });
    const aliceProfile = aliceContext.firestore().doc("users/uid_alice");
    
    await assertFails(
      aliceProfile.update({
        xp: 999999,
        coins: 999999,
      })
    );
  });

  it("Attack 4: Blocks non-teachers from modifying educational course tracks", async () => {
    const aliceContext = testEnv.authenticatedContext("uid_alice", { email_verified: true });
    const fakeLesson = aliceContext.firestore().doc("lessons/lesson_fake");
    
    await assertFails(
      fakeLesson.set({
        lessonId: "lesson_fake",
        courseId: "basics-python",
        title: "Hacked Lesson",
        lessonNumber: 99,
      })
    );
  });

  it("Attack 5: Rejects writes from unverified email accounts", async () => {
    const unverifiedContext = testEnv.authenticatedContext("uid_alice", { email_verified: false });
    const profile = unverifiedContext.firestore().doc("users/uid_alice");
    
    await assertFails(
      profile.set({
        uid: "uid_alice",
        fullName: "Alice",
        email: "alice@test.com",
        role: "student",
        xp: 0,
        level: 1,
      })
    );
  });

  it("Attack 6: Blocks submitting assignments on Bob's behalf", async () => {
    const aliceContext = testEnv.authenticatedContext("uid_alice", { email_verified: true });
    const bobAssignment = aliceContext.firestore().doc("assignments/assign_bob_python");
    
    await assertFails(
      bobAssignment.set({
        assignmentId: "assign_bob_python",
        uid: "uid_bob",
        courseId: "basics-python",
        submissionURL: "https://github.com/alice/hacked-sol",
        submittedAt: new Date().toISOString(),
      })
    );
  });

  it("Attack 7: Rejects illegal progress completions", async () => {
    const aliceContext = testEnv.authenticatedContext("uid_alice", { email_verified: true });
    const progressDoc = aliceContext.firestore().doc("progress/progress_alice_web");
    
    await assertFails(
      progressDoc.set({
        uid: "uid_alice",
        courseId: "basics-web",
        completedLessons: ["lesson-1", "lesson-2", "lesson-3", "lesson-4"],
        xpEarned: 50000,
      })
    );
  });

  it("Attack 8: Blocks students from self-issuing graduation certificates", async () => {
    const aliceContext = testEnv.authenticatedContext("uid_alice", { email_verified: true });
    const certDoc = aliceContext.firestore().doc("certificates/cert_alice_web");
    
    await assertFails(
      certDoc.set({
        certificateId: "cert_alice_web",
        uid: "uid_alice",
        courseId: "basics-web",
        courseName: "Web Development Basics",
        issuedDate: "2026-07-09",
      })
    );
  });

  it("Attack 9: Rejects ghost fields outside metadata schemas", async () => {
    const aliceContext = testEnv.authenticatedContext("uid_alice", { email_verified: true });
    const bookmarkDoc = aliceContext.firestore().doc("bookmarks/bookmark_alice_python");
    
    await assertFails(
      bookmarkDoc.set({
        uid: "uid_alice",
        lessonId: "python-1",
        savedAt: "2026-07-09",
        isVIPUser: true, // Ghost field
      })
    );
  });

  it("Attack 10: Blocks inserting alerts/spam into other user notifications", async () => {
    const aliceContext = testEnv.authenticatedContext("uid_alice", { email_verified: true });
    const bobNotification = aliceContext.firestore().doc("notifications/notif_bob_fake");
    
    await assertFails(
      bobNotification.set({
        notificationId: "notif_bob_fake",
        uid: "uid_bob",
        title: "System Spam",
        message: "You won a million coins",
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    );
  });

  it("Attack 11: Rejects forum post creation under false user authorship", async () => {
    const aliceContext = testEnv.authenticatedContext("uid_alice", { email_verified: true });
    const forumDoc = aliceContext.firestore().doc("forum_posts/post_spoof");
    
    await assertFails(
      forumDoc.set({
        title: "Confused about variables",
        content: "Please explain Python variables",
        author: "Bob the Expert",
        authorId: "uid_bob",
      })
    );
  });

  it("Attack 12: Blocks students from modifying graded feedbacks", async () => {
    const aliceContext = testEnv.authenticatedContext("uid_alice", { email_verified: true });
    const assignmentDoc = aliceContext.firestore().doc("assignments/assign_alice_python");
    
    await assertFails(
      assignmentDoc.update({
        grade: "A+",
        feedback: "Awesome job!",
      })
    );
  });
});
```
