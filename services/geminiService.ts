import { GoogleGenAI } from "@google/genai";
import { ClanDetails, CurrentWar, WarLogEntry } from "../types";

const getAI = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API_KEY is missing. AI features will not work.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const analyzeClan = async (clan: ClanDetails, warLog: WarLogEntry[]) => {
    const ai = getAI();
    if (!ai) return "AI Configuration Error: Missing API Key.";

    // Prepare a summarized dataset to avoid token limits if strictly limited, 
    // though 2.5 flash handles large context well.
    const summary = {
        name: clan.name,
        level: clan.clanLevel,
        members: clan.members,
        points: clan.clanPoints,
        warWinStreak: clan.warWinStreak,
        memberStats: clan.memberList.map(m => ({
            name: m.name,
            role: m.role,
            donations: m.donations,
            received: m.donationsReceived,
            ratio: m.donationsReceived > 0 ? (m.donations / m.donationsReceived).toFixed(2) : m.donations,
            trophies: m.trophies
        })),
        recentWarPerformance: warLog.slice(0, 5).map(w => ({
            result: w.result,
            myStars: w.clan.stars,
            oppStars: w.opponent.stars,
            dest: w.clan.destructionPercentage
        }))
    };

    const prompt = `
    Act as a professional Clash of Clans Esports Coach and Clan Manager.
    Analyze the following clan data JSON.
    
    Provide a report in Markdown format covering:
    1. **Clan Health**: Is the donation ratio healthy? Are they winning wars?
    2. **Top Performers (MVPs)**: Identify 3 members based on donations and trophy count who deserve recognition.
    3. **Members at Risk**: Identify members with low donations (leechers) or low activity compared to the rest.
    4. **Strategic Advice**: One specific tip to improve the clan based on the war log.

    Data:
    ${JSON.stringify(summary)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Failed to generate AI analysis. Please check your API key or try again later.";
    }
};

export const analyzeWarStrategy = async (currentWar: CurrentWar) => {
    const ai = getAI();
    if (!ai) return "AI Configuration Error: Missing API Key.";

    if (currentWar.state === 'notInWar') return "Clan is not currently in a war.";

    // Summarize opponent map
    const opponentMap = currentWar.opponent.name ? {
        name: currentWar.opponent.name,
        level: currentWar.opponent.clanLevel,
        members: currentWar.opponent.badgeUrls ? "Details available" : "No details", // API might limit opponent member details depending on privacy
        stats: {
            stars: currentWar.opponent.stars,
            destruction: currentWar.opponent.destructionPercentage
        }
    } : "Opponent details unavailable";

    const prompt = `
    We are in a Clash of Clans war against "${currentWar.opponent.name}" (Level ${currentWar.opponent.clanLevel}).
    Our clan: "${currentWar.clan.name}" (Level ${currentWar.clan.clanLevel}).
    
    Current Status:
    Us: ${currentWar.clan.stars} stars, ${currentWar.clan.destructionPercentage}% destruction.
    Them: ${currentWar.opponent.stars} stars, ${currentWar.opponent.destructionPercentage}% destruction.
    
    Provide a generic motivational speech and 3 general strategic tips for a clan war at this level difference.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Failed to generate strategy.";
    }
};
