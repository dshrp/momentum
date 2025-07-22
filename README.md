# Momentum

**Automatically find and organize your friends' events they post on IG.**

Never miss another friend's event because of disappearing stories or hidden algorithm posts.

## 🚀 Live Demo

**[Try Momentum at momentum.thedscs.com](https://momentum.thedscs.com/)**

## 🎯 The Problem We're Solving

Your friends are constantly posting about events, but you're missing them because social media algorithms hide posts and stories disappear after 24 hours.

**Momentum automatically finds and organizes your friends' events** so you never have to worry about missing out on the good times again.

## ✨ How Momentum Works

### 📱 Monitor Instagram
We track your friends' Instagram accounts for event posts and stories, catching everything the algorithm might hide.

### 📋 Organize Everything  
All events are automatically organized in one clean dashboard, with calendar integration and sharing features.

### 🔮 Coming Soon
We'll add more event page support and send Wednesday roundups to your inbox of events.

## 🌟 What Makes Momentum Special

- **Automatic event detection** from Instagram stories and posts
- **Clean, organized dashboard** that cuts through social media noise
- **One-click calendar integration** for all events
- **Smart duplicate detection** and event deduplication
- **Shareable event lists** for friend groups
- **Mobile-friendly design** that works everywhere
- **Weekly digest emails** *(coming soon)*
- **Support for more event platforms** *(coming soon)*

## 🛠️ Built With

- **React** - Frontend framework
- **Modern UI/UX** - Clean, intuitive interface
- **Event Detection AI** - Smart pattern recognition
- **Calendar Integration** - Seamless event management
- **Vercel** - Deployment and hosting

## 🎨 Why I Built This

My name's Daniel. I'm an artist, musician, and organizer in Detroit and NYC. With so much information lately blasted my way, I was constantly missing my friends' events. They'd post about a show or party on Instagram, but I wouldn't see it until after it happened. The algorithm would hide their posts, or I'd miss their stories because I wasn't checking at the right time.

As someone in the creative community, I have friends who are DJs, artists, poets, and event organizers. They're always doing cool stuff, but keeping track of it all was impossible.

So I built Momentum to solve this problem for myself and my friends. Now, I know what's happening when, and I can show up for my friends—in a time where showing up matters more than ever.

## 🚀 Perfect For

- **Creative communities** - Artists, musicians, performers
- **Social groups** - Friend circles who organize events
- **Event enthusiasts** - People who love discovering new experiences
- **Busy professionals** - Those who want to stay connected but lack time to scroll

## 🤝 Contributing

Have ideas for improving event discovery? Found a bug? Feel free to open an issue or submit a pull request!

## 📬 Contact

Questions or feedback? Reach out!

---

**Created by [Daniel Sharp](https://thedscs.com) | [DSCS](https://dscs.substack.com)**

Momentum - Automated Event Discovery Platform
AI-powered social media monitoring tool that automatically discovers and tracks events from your friends' Instagram accounts. Never miss another underground show, art opening, or pop-up party.
🔗 Live Demo: v0-momentum-chrome-extension.vercel.app
🚀 Quick Start
bash# Clone the repository
git clone https://github.com/dshrp/momentum.git
cd momentum

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env.local

# Run development server
npm run dev
Open http://localhost:3000 in your browser.
📋 Prerequisites

Node.js 18+ and npm
OpenAI API key (for event detection)
Airtable account (for data storage)
Make.com account (for automation workflows)
Vercel account (for deployment)

⚙️ Environment Setup
Create a .env.local file in the root directory:
env# Airtable Configuration
AIRTABLE_TOKEN=your_personal_access_token_here
AIRTABLE_BASE_ID=your_base_id_here

# Optional: Rate limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
Getting Airtable Credentials

Personal Access Token:

Visit airtable.com/developers/web/api/introduction
Go to Account → Developer hub → Personal access tokens
Create token with data.records:read permission
Copy the token to your .env.local file


Base ID:

Go to your Momentum base in Airtable
URL looks like: https://airtable.com/appXXXXXXXXXXXXXX/...
The appXXXXXXXXXXXXXX is your Base ID



💰 Cost Breakdown

Make.com: Free (1,000 operations/month) or $9/month (10,000 operations)
OpenAI API: ~$5-20/month for 25 friends
Airtable: Free (1,200 records/base) or $10/month (unlimited)
Vercel: Free for personal projects
Total: $0-40/month depending on usage

🏗️ Project Structure
momentum/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── events/         # Airtable API integration
│   │   ├── components/         # React components
│   │   └── page.js            # Main dashboard
├── public/                    # Static assets
├── styles/                    # Global styles
└── docs/                      # Documentation
    └── README.md              # This file
🗄️ Airtable Setup
1. Create Base Structure
Create a new Airtable base called "Momentum" with these tables:
Events Table:

Event_ID: Autonumber (Primary field)
Title: Single line text
Friend_Name: Single line text
Event_Type: Single line text
Date: Date
Time: Single line text
Venue: Single line text
Location: Single line text
Description: Long text
Source: Single select (Instagram, RA)
Source_URL: URL
Status: Single select (Active, Hidden, Edited)
User_Modified: Checkbox
Week_Of: Date
User_ID: Number
Created_At: Created time

Sources Table:

Source_ID: Autonumber
User_ID: Number
Platform: Single select (Instagram, RA)
Username: Single line text
Friend_Name: Single line text
Status: Single select (Active, Paused, Error)
Created_At: Created time
Last_Check: Date & time

2. Add Sample Sources
Add your friends' Instagram accounts to the Sources table:

Platform: Instagram
Username: their_instagram_handle
Friend_Name: Display name
Status: Active
User_ID: 1

🤖 Make.com Automation Setup
1. Create Make.com Account

Sign up at make.com
Start with the free tier (1,000 operations/month)

2. Get OpenAI API Key

Visit platform.openai.com/api-keys
Create a new API key
Add billing information (pay-per-use pricing)
Cost Estimate: ~$0.001-0.01 per Instagram post analyzed

3. Build the Instagram Monitoring Scenario
Create a new scenario called "Momentum - Dynamic Instagram Monitor":
Step 1: Schedule Trigger

Module: Schedule
Interval: Every 12-24 hours
Advanced: Set specific time (e.g., 9:00 AM)

Step 2: Get Active Sources

Module: Airtable > Search records
Table: Sources
Formula: AND({Platform} = "Instagram", {Status} = "Active", {User_ID} = 1)

Step 3: Process Each Source

Module: Flow Control > Iterator
Array: Output from Airtable Sources

Step 4: Build RSS Feed URL

Module: RSS > Retrieve RSS feed items
URL: https://rss-bridge.org/bridge01/?action=display&bridge=Instagram&context=Username&u={{SOURCE.Username}}&format=Atom
Maximum items: 3

Step 5: Process Each Post

Module: Flow Control > Iterator
Array: Output from RSS module

Step 6: Check for Duplicates

Module: Airtable > Search records
Table: Events
Formula: {Source_URL} = "{{RSS_POST.URL}}"

Step 7: Filter New Events Only

Add Filter on connection line
Condition: Total number of bundles equals 0

Step 8: AI Event Detection

Module: OpenAI > Create a completion
Model: gpt-4
Temperature: 0
System prompt:

You are a JSON-only API. You analyze Instagram post captions for event announcements and return ONLY valid JSON.

Required JSON format:
{
  "is_event": true,
  "title": "Event name",
  "friend_name": "{{SOURCE.Friend_Name}}",
  "event_type": "DJ Gig",
  "date": "2025-07-09",
  "time": "7:00 PM",
  "venue": "Venue name",
  "location": "City, State",
  "description": "Brief description"
}

If NOT an event:
{
  "is_event": false,
  "title": "",
  "friend_name": "{{SOURCE.Friend_Name}}",
  "event_type": "",
  "date": "",
  "time": "",
  "venue": "",
  "location": "",
  "description": ""
}

User message:

Analyze this Instagram caption for events. Return only JSON.

Username: {{RSS_POST.author}}
Caption: {{RSS_POST.description}}
Post Date: {{RSS_POST.published}}
Step 9: Parse JSON Response

Module: Tools > Parse JSON
JSON string: {{OPENAI.choices[].message.content}}

Step 10: Filter Events Only

Add Filter on connection line
Condition: {{JSON_PARSER.is_event}} equals true

Step 11: Store in Airtable

Module: Airtable > Create a record
Table: Events
Map all fields from JSON Parser output
Additional fields:

Source: "Instagram"
Source_URL: {{RSS_POST.URL}}
User_ID: 1
Status: "Active"



Step 12: Update Last Check

Module: Airtable > Update a record
Table: Sources
Record ID: {{SOURCE_ITERATOR.id}}
Fields: Last_Check = {{now}}

4. Test and Activate

Test the scenario with one friend first
Check that events appear in Airtable
Verify no duplicates are created on subsequent runs
Activate the scenario for automatic execution

🚀 Frontend Deployment
Deploy to Vercel

Connect to Vercel:

bashnpm install -g vercel
vercel login
vercel

Set Environment Variables:

Go to Vercel Dashboard → Project → Settings → Environment Variables
Add your AIRTABLE_TOKEN and AIRTABLE_BASE_ID


Custom Domain (optional):

Add your domain in Vercel Dashboard → Domains
Update DNS records as instructed



🔧 Core Features
Automated Event Detection Pipeline

Social Media Monitoring: RSS Bridge converts Instagram feeds to structured data
AI Analysis: OpenAI analyzes post captions for event information
Duplicate Prevention: Smart filtering prevents duplicate events
Real-time Dashboard: Clean interface showing upcoming events

Event Detection Components

Pattern Recognition: Identifies dates, times, venues, event types
Context Understanding: Distinguishes events from regular posts
Friend Attribution: Tracks which friend is hosting each event
Source Linking: Direct links to original Instagram posts

🛡️ Rate Limiting & Costs
Make.com Limits

Free tier: 1,000 operations/month
Estimated usage: ~50-100 operations per run (depending on friends and posts)
Recommendation: Monitor usage and upgrade if needed

OpenAI Costs

GPT-4: ~$0.03 per 1K tokens
Estimated cost: $0.001-0.01 per Instagram post
Monthly estimate: $5-20 for 25 friends posting regularly

Instagram Rate Limits

RSS Bridge: May rate limit frequent requests
Recommendation: Space out checks to every 12-24 hours

🐛 Troubleshooting
Common Issues
Make.com Scenario Errors:

Check OpenAI API key is valid and has billing enabled
Verify Airtable connection and permissions
Ensure RSS Bridge URLs are working

Duplicate Events:

Verify duplicate detection filter is working
Check Airtable search formula syntax
Clear existing duplicates manually if needed

Missing Events:

Check if Instagram accounts are public
Verify RSS Bridge is returning data
Review OpenAI prompts for accuracy

Frontend API Errors:

Verify Airtable credentials in environment variables
Check API endpoint is returning data
Review browser console for specific errors

Debug Mode
Enable detailed logging in Make.com:

Click scenario settings
Enable "Log execution data"
Review execution logs for errors

📱 Usage

Add Friends: Add Instagram handles to Sources table in Airtable
Monitor Events: Dashboard automatically shows new events
Manage Events: Hide unwanted events or edit details
View Sources: Click "See Source" to visit original Instagram posts

🔄 Scaling
Adding More Friends

Simply add new rows to the Sources table
No Make.com scenario changes needed
System automatically starts monitoring new accounts

Multi-User Support

Update User_ID system in Airtable
Modify Make.com scenarios to filter by user
Add authentication to frontend

Additional Platforms

Extend Sources table with new platforms
Create new Make.com scenarios for other sources
Update frontend to handle multiple source types

🤝 Contributing

Fork the repository
Create a feature branch: git checkout -b feature/new-feature
Commit changes: git commit -m 'Add new feature'
Push to branch: git push origin feature/new-feature
Submit a pull request

Development Guidelines

Follow existing code style
Test Make.com scenarios thoroughly
Update documentation for new features
Ensure environment variables are documented

📄 License
MIT License - see LICENSE file for details.
🆘 Support

Issues: GitHub Issues
Questions: daniel@thedscs.com
Documentation: Project Wiki


Built with ❤️ for the underground scene | Never miss another event from your creative friends
