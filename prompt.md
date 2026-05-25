Real-Time Chat Application with Sentiment Analysis
I started this project because I wanted to build something more interactive than a normal chat app. While working on smaller Socket.IO projects earlier, I thought it would be interesting if messages could also carry some kind of emotion analysis instead of just plain text appearing on the screen.
So the basic idea became pretty simple: users chat normally, and in the background the system tries to understand whether messages are positive, neutral, or negative.
The project uses the MERN stack for the main application. For sentiment analysis, I used a separate Python service instead of putting everything inside the Node backend. At first I actually tried keeping all logic together, but it became messy very quickly, especially while testing NLP libraries.
Whenever someone sends a message, the backend sends that text to the Python API. After analysis, the response comes back with sentiment information, and then the message is shown inside the room with a small indicator beside it.
I tried not to over-engineer the whole thing because it’s easy to keep adding features endlessly in projects like this.

Real-Time Messaging
The chat part works using Socket.IO, so messages appear instantly for everyone connected in the same room.
Users can create rooms, join rooms, and communicate normally. I added typing indicators too because without them the chat felt oddly static during testing.
There’s also:
unread message counts,
online/offline user status,
active room highlighting,
and smooth room switching.
Originally I added too many transition animations, but after trying the UI for some time it started feeling distracting, so I reduced most of them.

Sentiment Analysis
This was honestly the part that took the most experimentation.
Every message gets checked before it’s displayed to others. The Python service analyzes the text and returns whether the sentiment is positive, neutral, or negative.
I kept the frontend indicators simple:
green for positive,
gray for neutral,
red for negative.
At one point I added detailed confidence scores beside every message, but it made the interface look cluttered and unnecessary. Removing those details actually made the UI cleaner.
The system can also detect highly negative conversations. If the negativity level crosses a limit, users in that room see a warning banner.
One thing I specifically wanted was proper fallback handling. If the Python service crashes or becomes unavailable, messages should still send normally. I didn’t want sentiment analysis becoming a reason for the chat system to stop working.

Frontend
The frontend is built with React and Tailwind CSS.
I mainly picked Tailwind because it helped speed up development. Writing separate CSS for every small component was slowing me down earlier.
Each message contains:
sender name,
timestamp,
avatar initials,
and sentiment status.
The sidebar shows rooms, unread counts, and active users.
Dark mode support was added mostly because almost every modern chat app includes it now, and personally I found it more comfortable during longer testing sessions.
The app is responsive enough to work properly on mobile devices too, although I spent more time optimizing the desktop layout.

Authentication
Authentication is handled using JWT tokens.
Users can register and log in normally. I added basic validations for:
email format,
password length,
and required fields.
Protected routes redirect users back to login if they are not authenticated.
I intentionally kept authentication simple because the project focus was more on real-time communication and sentiment analysis rather than building a very advanced auth system.

Dashboard
Later in development, I added a dashboard section because the project felt incomplete without some kind of analytics view.
The dashboard displays:
total messages,
sentiment distribution,
active users,
and message activity trends.
Charts refresh automatically after intervals so the data stays updated.
At first I kept adding more graphs, but eventually I realized too many statistics were making the page harder to understand.

Python Service
The sentiment service runs separately using FastAPI.
I tested VADER, TextBlob, and Transformers. Transformers worked well, but for this project they felt heavier than necessary since chat messages are usually short. VADER ended up giving decent results while staying lightweight.
The service also handles:
emojis,
random symbols,
empty messages,
and unsupported text input.
Separating this service from the main backend also made debugging easier because issues could be isolated faster.

Backend
The backend handles:
authentication,
Socket.IO communication,
room management,
database operations,
and communication with the Python service.
When a message is sent:
the backend receives it,
forwards it to the Python API,
stores the processed result,
and broadcasts it back to the room.
Socket.IO events are also used for typing indicators and toxic-content alerts.
During testing with multiple browser tabs open at once, I noticed unnecessary frontend re-renders becoming a problem, so I optimized a few components later.

Database
MongoDB is used for storing users, rooms, and messages.
Each message stores:
sender details,
room ID,
text content,
timestamps,
and sentiment information.
Indexes were added for room IDs and timestamps after analytics queries started slowing down once the database became larger.

Security and Error Handling
I added basic security features like:
password hashing,
JWT verification,
request rate limiting,
and input sanitization.
Socket connections are authenticated before users can access rooms.
I also spent some time handling service failures properly because real-time applications can become unstable quickly if one service suddenly stops responding.

Performance
Since the UI updates continuously in chat applications, optimization became important after adding multiple rooms and live users.
To improve performance:
some React components were memoized,
typing events were debounced,
and routes were lazy-loaded.
Redis support can also be added later if the application needs scaling across multiple backend instances.

Technologies Used
Frontend:
React
Tailwind CSS
Socket.IO Client
Axios
React Router
Backend:
Node.js
Express.js
MongoDB
Socket.IO
Python Service:
FastAPI
VADER Sentiment

Deployment
The frontend can be deployed on Vercel, while backend services can run on Railway or Render.
During development, Docker Compose helped a lot because manually starting multiple services every single time became annoying after a while.
