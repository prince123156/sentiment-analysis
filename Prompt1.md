### **Full-Stack Blog Website with CMS and Newsletter Integration**

#### **Context and Role**

Building a proper blog platform was something I kept pushing to the backburner for months. Every time I sat down to actually do it, I'd look at the available options and feel stuck between two bad choices — either use something like WordPress which does everything but feels like fighting the tool the whole time, or stitch together a static site generator with three separate services just to get basic CMS functionality working.

Neither felt right. So I just decided to build it myself.

The goal was pretty straightforward in my head: one system where writing, managing, publishing, and getting posts to subscribers all happened together without jumping between different dashboards. Sounds simple. Took longer than expected to actually get there.

#### **Objective**

What I actually wanted by the end of it was a platform that works properly for both sides — the person writing and the person reading.

For the writer that means an editor that doesn't get in the way, a dashboard where managing posts and comments doesn't feel like a chore, and a newsletter that just fires on its own when something goes live. For the reader it means posts that are easy to find, load fast, and look good to read through.

More specifically the platform needed to handle rich text editing with image support, draft and scheduled post management, categories and tags, a comment section with moderation, working search, subscriber management with double opt-in, and a basic analytics view showing which posts are actually getting read.

#### **Input Data Requirements**

There are a few distinct types of input the system has to deal with and each one has its own quirks.

Post content comes through the editor — title, body, featured image, excerpt, category, tags, and a status that's either draft, scheduled, or published. Scheduled posts were honestly the most annoying piece to get right. The datetime picker had to respect the author's local timezone and then store everything in UTC, which sounds obvious but caused real issues the first time I tested it across different machines.

Author accounts need a name, email, password, bio, and optional avatar. Roles matter here — admins can touch everything, regular author accounts can only manage their own posts. That distinction came up more than once during testing when I accidentally deleted something using the wrong session.

Subscriber signups are just an email address but double opt-in is non-negotiable. Single opt-in lists cause deliverability problems down the line and I didn't want to deal with that later.

Comments take a name, email, and message. Everything sits in a moderation queue before it appears publicly. That default was important — the first time I left comments open without moderation during testing, junk started appearing within hours.

#### **Data Processing Requirements**

There's more happening between input and output than the surface makes obvious.

Slugs generate automatically from the post title on save — lowercase, spaces become hyphens, and if a slug already exists a number gets appended. That last part tripped me up early on because duplicate slugs were silently overwriting each other before I caught it.

Featured images get resized on upload to a few standard dimensions instead of just storing the original. Serving full-size originals was noticeably slowing down post pages before I sorted that out.

The newsletter wiring was the most satisfying piece to get working. When a post flips to published, an internal event triggers a job that pulls the subscriber list, builds the email from the post title, excerpt, and a link, then queues sends in batches rather than all at once. I tried doing bulk sends initially and kept hitting rate limits from the email provider. Batching with a short delay between groups fixed it.

Comments land in a pending state and sit there until someone reviews them. The author gets a notification, checks it in the dashboard, and approves or rejects. Approved ones show on the post. Rejected ones stay in the database but stay hidden — useful to have a record without surfacing them publicly.

Search indexes titles, excerpts, and body text. Ranking by pure relevance alone felt off during testing because an older post with an exact title match would beat a recent post covering the same topic. Blending recency into the ranking made results feel more natural.

#### 

#### 

#### **Output Requirements**

**What readers see:**

A homepage with recent posts, featured posts, and category filters that actually work without full page reloads. Individual post pages with read time estimates, author info, share buttons, and the approved comment thread below. Category and tag archive pages. Search results with the matched terms highlighted. A subscribe form that sends a confirmation email before the address gets added to anything.

**What authors see in the dashboard:**

A post list filterable by status — drafts, scheduled, live, all of them. The rich text editor with image upload, formatting controls, and autosave that doesn't lose work if the browser closes unexpectedly. A media library so uploaded images aren't orphaned. The comment queue. Subscriber list with an export option. Basic analytics covering page views per post, top performing posts, where traffic is coming from, and how the subscriber count has changed over time.

**Emails that go out:**

A confirmation when someone subscribes. A moderation notification when a comment needs review. A newsletter to the full subscriber list when a post publishes — post title, excerpt, and a read more link. Nothing fancy, just clean and readable.

#### **Error Handling**

The failure cases that needed real thought rather than just letting things blow up quietly.

Image uploads failing was the first one. The editor had to stay open and usable with an inline error message rather than wiping the draft. Upload and save are separate operations for exactly this reason.

If the email service goes down at the moment a post publishes, the newsletter job can't just disappear. It queues, retries a few times, and if it ultimately fails the author sees a notification in the dashboard. Silent failures on something like a newsletter send are genuinely bad — people expect those emails.

Form validation catches the obvious things on the frontend but the API validates again before anything touches the database. Relying only on client-side validation burned me on an earlier project when someone bypassed it entirely through the network tab.

The comment and subscribe endpoints have rate limiting. Both are publicly accessible and both attracted bot traffic faster than I expected during early testing without it.

Every API response comes back as structured JSON — status, message, and either data or an error detail. Nothing returns a 200 with an error buried somewhere in the body. That pattern caused genuinely confusing debugging sessions before I standardized it.

#### **Performance and Scalability**

Things that became necessary once the platform had real content on it rather than just test data.

Post pages get cached after the first load. Cache invalidates when a post gets updated or a comment gets approved so readers aren't seeing stale content. Before adding this, high traffic posts were hitting the database on every single request which became obvious fast.

Images serve from a CDN after upload rather than directly from the application server. This made a bigger difference than I expected on posts with several inline images. Load times dropped noticeably.

Newsletter sends go out in batches of around 50 with a short delay between each group. Sending to a large list one at a time is too slow. Sending everything at once hits provider rate limits. Batching landed in the middle and worked consistently.

Database queries on post lists and search were slow once the content volume grew past a few hundred posts. Indexes on slug, publish date, status, and the full-text search columns fixed it. I should have added those from day one.

If the platform ever needed to handle significantly more traffic or a much larger subscriber list, the job queue and API layer would be the natural first things to separate out. Nothing about the current architecture prevents that — it just hasn't needed it yet.

#### **Tech Stack**

Frontend — Next.js, Tailwind CSS, Tiptap for rich text editing, React Query for data fetching

Backend — Next.js API routes

Database — PostgreSQL with Prisma

Email — Nodemailer over SMTP, with Resend as a fallback if deliverability becomes a problem

File storage — Cloudinary for uploads and CDN delivery

Auth — NextAuth with credential and OAuth support

Job queue — Bull with Redis for newsletter sends and scheduled publishing

Deployment — Vercel for the app, Railway or Supabase for the database, Upstash for Redis

