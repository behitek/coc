# ClashRank AI ⚔️

**ClashRank AI** is a modern, data-driven dashboard designed for Clash of Clans leaders and co-leaders. It leverages the **Behitek API wrapper** for real-time game data and **Google Gemini AI** to provide strategic insights, member analysis, and advanced ranking metrics.

## 🚀 Key Features

### 1. 📊 Commander Dashboard
- **Overview Stats:** Real-time view of Clan Points, Versus Points, War Streak, and Win Rate.
- **Action Hub:** Quick links to open the clan in-game or join the clan's Zalo chat.
- **Top Donors Chart:** Visual bar chart highlighting the top 5 donors, with distinct Gold/Silver/Bronze indicators for the top 3.
- **Interactive War Log:** Expandable history of the last 10 wars showing destruction percentages, stars earned, and result details.

### 2. 🏆 Advanced Member Ranking
- **Smart Sorting:** Sort members by Rank, Role, Trophies, Donations, Attack Wins, or War Stars.
- **"Deep Scan" Technology:** A specialized feature that fetches detailed profiles for every member to reveal hidden stats (Attack Wins, War Stars).
- **Dynamic Activity Score:**
  - **Basic Score:** `Donations + (Received / 2) + (Trophies / 5)`
  - **Enhanced Score (Post-Scan):** `(Attack Wins × 25) + Donations + (War Stars × 5)`
- **Smart Tags:** Automatically assigns badges based on behavior:
  - 💀 **Leech:** High received / Low donated ratio.
  - ❤️ **Gifter:** Massive donations.
  - ⚡ **Grinder:** High attack wins this season.
  - 🛡️ **Vet/Legend:** High career War Stars.

### 3. ⚔️ Live War Tracker
- **Real-Time Status:** Shows preparation or battle timers (counts down to battle start or war end).
- **Lineup Comparison:** Side-by-side view of your clan vs. the opponent.
- **Performance Cards:** Detailed cards for every member showing Stars won, Destruction %, and Defenses.
- **Detailed Attack Info:** See exactly which map position was attacked, the star count, and destruction percentage.

### 4. 👤 Rich Player Profiles
- **Full Army Overview:** View all Troops, Spells, Heroes, Pets, and Siege Machines with game-accurate icons.
- **Hero Equipment:** See active equipment on heroes and full equipment inventory.
- **Visual Indicators:** Town Hall level avatars, max-level highlights (gold background), and detailed stat breakdown.

### 5. 🤖 Gemini AI Advisor
- **Clan Analysis:** Sends clan data to Google Gemini to generate a text report identifying MVPs, members at risk (leechers), and strategic advice.
- **Context-Aware:** Analyzes war logs and donation ratios to give tailored advice.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **AI:** Google GenAI SDK (`@google/genai`)
- **API:** Behitek Clash of Clans Wrapper

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js installed.
- A Google Gemini API Key (Get one at [aistudio.google.com](https://aistudio.google.com)).

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/yourusername/clashrank-ai.git

# Navigate to directory
cd clashrank-ai

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory to store your API key.

```env
# .env
API_KEY=your_google_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm start
# or
npm run dev
```

---

## 📖 Usage Guide

### Changing the Clan
By default, the app tracks the clan tag `#2G9YRCRV2`. To change this:
1. Open `App.tsx`.
2. Modify the `DEFAULT_CLAN_TAG` constant:
   ```typescript
   const DEFAULT_CLAN_TAG = '#YOUR_CLAN_TAG';
   ```

### Using Deep Scan
1. Navigate to the **Rankings** page.
2. Click the **"Run Deep Scan"** button.
3. Wait for the progress bar to complete (it fetches data in batches to be polite to the API).
4. Once finished, new columns (**Wins**, **War ★**) will appear, and the **Activity Score** will update to the enhanced formula.

### Understanding Smart Tags
- **Grinder (Sword):** > 100 Attack Wins this season.
- **Active (Zap):** > 40 Attack Wins this season.
- **Gifter (Heart):** > 2000 Donations.
- **Leech (Skull):** Donation ratio < 1:5 AND received > 500 troops.
- **Legend (Star):** > 1500 Career War Stars.

---

## 📂 Project Structure

```
/
├── index.html              # Entry point (Tailwind CDN included)
├── index.tsx               # React Root
├── App.tsx                 # Main Router & Layout
├── types.ts                # TypeScript Interfaces (Clan, Member, War)
├── metadata.json           # App metadata
├── services/
│   ├── cocService.ts       # API calls to Behitek
│   └── geminiService.ts    # AI Prompt engineering & calls
└── components/
    ├── Dashboard.tsx       # Charts & Overview
    ├── MembersRank.tsx     # Ranking Logic & Deep Scan
    ├── CurrentWar.tsx      # War Timer & Lineups
    ├── GeminiAdvisor.tsx   # AI UI Component
    ├── PlayerModal.tsx     # Detailed Player View
    └── LoadingSpinner.tsx  # Shared UI utility
```

---

## ⚠️ API Note
This application uses the **Behitek** wrapper for Clash of Clans (`https://coc-apis.behitek.com/`). This wrapper allows access to CoC data without needing complex IP whitelisting required by the official Supercell API, making it ideal for frontend-only applications.

---

## 🤝 Contributing
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.