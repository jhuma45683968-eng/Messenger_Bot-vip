const axios = require("axios");

const mahmud = [
    "baby",
    "bby",
    "babu",
    "bbu",
    "jan",
    "bot",
    "জান",
    "জানু",
    "বেবি",
    "wifey",
    "hina",
    "hinata"
];

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

// বাংলা অক্ষর চেক করার ফাংশন
function isBanglaText(text) {
    const banglaRegex = /[\u0980-\u09FF]/;
    return banglaRegex.test(text);
}

// ইংরেজি অক্ষর চেক করার ফাংশন
function isEnglishText(text) {
    const englishRegex = /^[a-zA-Z0-9\s.,!?'-]+$/;
    return englishRegex.test(text);
}

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "hinata", "hina"],
    version: "2.0",
    author: "MahMUD",
    countDown: 0,
    role: 0,
    description: "Smart multi-language responsive chat bot",
    category: "chat",
    guide: {
        en: "{pn} [anyMessage]"
    }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    
    const msg = args.join(" ").toLowerCase();
    const uid = event.senderID;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "I love you", "type !baby help"];
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
        }

        if (args[0] === "help") {
            const helpMenu = 
`✨ LALA BOT HELP MENU ✨

📌 মূল কমান্ডসমূহ:
• !baby help - সাহায্য মেনু দেখতে
• !baby teach [প্রশ্ন] - [উত্তর] - বটকে শেখাতে
• !baby remove [প্রশ্ন] - [ইনডেক্স] - উত্তর মুছতে
• !baby edit [পুরোনো] - [নতুন] - উত্তর এডিট করতে
• !baby list - শেখানো উত্তরের তালিকা

💖 বট যে বিষয়গুলোর উত্তর দিতে পারে:
১. I love you / ভালোবাসি
২. Miss you / মিস করি
৩. Ki korcho / কি করো
৪. Rag korcho / রাগ করছো
৫. Khaiso / খাইসো
৬. Bad words / গালিগালাজ
৭. Tumi amar / তুমি আমার
৮. Potaccho / পটাইতাছ
৯. Hug me / জড়িয়ে ধরো
১০. Kiss me / কিস দাও
১১. Lost in eyes / হারিয়ে গেছি
১২. Sweet / এত মিষ্টি কেন
১৩. Kemon aso / কেমন আছো

💡 টিপস: আপনি যে ভাষায় (বাংলা/ইংরেজি/বাংলিশ) মেসেজ দেবেন, বট ঠিক সেই ভাষাতেই উত্তর দেবে।`;
            return api.sendMessage(helpMenu, event.threadID, event.messageID);
        }

        if (args[0] === "teach") {
            const mahmudStr = msg.replace("teach ", "");
            const [trigger, ...responsesArr] = mahmudStr.split(" - ");
            const responses = responsesArr.join(" - ");
            if (!trigger || !responses) return api.sendMessage("❌ | teach [question] - [response1, response2,...]", event.threadID, event.messageID);
            const response = await axios.post(`${await baseApiUrl()}/api/jan/teach`, { trigger, responses, userID: uid });
            const userName = (await usersData.getName(uid)) || "Unknown User";
            return api.sendMessage(`✅ Replies added: "${responses}" to "${trigger}"\n• Teacher: ${userName}\n• Total: ${response.data.count || 0}`, event.threadID, event.messageID);
        }

        if (args[0] === "remove") {
            const mahmudStr = msg.replace("remove ", "");
            const [trigger, index] = mahmudStr.split(" - ");
            if (!trigger || !index || isNaN(index)) return api.sendMessage("❌ | remove [question] - [index]", event.threadID, event.messageID);
            const response = await axios.delete(`${await baseApiUrl()}/api/jan/remove`, { data: { trigger, index: parseInt(index, 10) }, });
            return api.sendMessage(response.data.message, event.threadID, event.messageID);
        }

        if (args[0] === "list") {
            const endpoint = args[1] === "all" ? "/list/all" : "/list";
            const response = await axios.get(`${await baseApiUrl()}/api/jan${endpoint}`);
            if (args[1] === "all") {
                let message = "👑 List of Baby teachers:\n\n";
                const data = Object.entries(response.data.data).sort((a, b) => b[1] - a[1]).slice(0, 100);
                for (let i = 0; i < data.length; i++) {
                    const [userID, count] = data[i];
                    const name = (await usersData.getName(userID)) || "Unknown";
                    message += `${i + 1}. ${name}: ${count}\n`; 
                } 
                return api.sendMessage(message, event.threadID, event.messageID);  
            }
            return api.sendMessage(response.data.message, event.threadID, event.messageID);
        }

        if (args[0] === "edit") {
            const mahmudStr = msg.replace("edit ", "");
            const [oldTrigger, ...newArr] = mahmudStr.split(" - ");
            const newResponse = newArr.join(" - ");
            if (!oldTrigger || !newResponse) return api.sendMessage("❌ | Format: edit [question] - [newResponse]", event.threadID, event.messageID);
            await axios.put(`${await baseApiUrl()}/api/jan/edit`, { oldTrigger, newResponse });
            return api.sendMessage(`✅ Edited "${oldTrigger}" to "${newResponse}"`, event.threadID, event.messageID);
        }

        const getBotResponse = async (text, attachments) => {
            try {
                const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { text, style: 3, attachments });
                return res.data.message;
            } catch {
                return "error baby🥹";
            }
        };

        const botResponse = await getBotResponse(msg, event.attachments || []);
        api.sendMessage(botResponse, event.threadID, (err, info) => {
            if (!err) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: uid,
                    text: botResponse
                });
            }
        }, event.messageID);

    } catch (err) {
        console.error(err);
        api.sendMessage(`Error: ${err.response?.data || err.message}`, event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({ api, event }) => {
    if (event.type !== "message_reply") return;
    try {
        const getBotResponse = async (text, attachments) => {
            try {
                const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { text, style: 3, attachments });
                return res.data.message;
            } catch {
                return "error baby🥹";
            }
        };
        const replyMessage = await getBotResponse(event.body?.toLowerCase() || "meow", event.attachments || []);
        api.sendMessage(replyMessage, event.threadID, (err, info) => {
            if (!err) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    text: replyMessage
                });
            }
        }, event.messageID);
    } catch (err) {
        console.error(err);
    }
};

module.exports.onChat = async ({ api, event }) => {
    try {
        const rawMessage = event.body || "";
        const message = rawMessage.toLowerCase();
        const attachments = event.attachments || [];

        if (event.type !== "message_reply" && mahmud.some(word => message.startsWith(word))) {
            api.setMessageReaction("🪽", event.messageID, () => { }, true);
            api.sendTypingIndicator(event.threadID, true);

            // ১. হেল্প চেক
            if (message.includes("help")) {
                const helpMenu = 
`✨ LALA BOT HELP MENU ✨

📌 মূল কমান্ডসমূহ:
• !baby help - সাহায্য মেনু দেখতে
• !baby teach [প্রশ্ন] - [উত্তর] - বটকে শেখাতে
• !baby remove [প্রশ্ন] - [ইনডেক্স] - উত্তর মুছতে
• !baby edit [পুরোনো] - [নতুন] - উত্তর এডিট করতে
• !baby list - শেখানো উত্তরের তালিকা

💖 বট যে বিষয়গুলোর উত্তর দিতে পারে:
১. I love you / ভালোবাসি
২. Miss you / মিস করি
৩. Ki korcho / কি করো
৪. Rag korcho / রাগ করছো
৫. Khaiso / খাইসো
৬. Bad words / গালিগালাজ
৭. Tumi amar / তুমি আমার
৮. Potaccho / পটাইতাছ
৯. Hug me / জড়িয়ে ধরো
১০. Kiss me / কিস দাও
১১. Lost in eyes / হারিয়ে গেছি
১২. Sweet / এত মিষ্টি কেন
১৩. Kemon aso / কেমন আছো

💡 টিপস: আপনি যে ভাষায় (বাংলা/ইংরেজি/বাংলিশ) মেসেজ দেবেন, বট ঠিক সেই ভাষাতেই উত্তর দেবে।`;
                return api.sendMessage(helpMenu, event.threadID, event.messageID);
            }

            // ২. ১৩টি রোমান্টিক রেসপন্স (ভাষা অনুযায়ী ফিল্টার করা)
            const customResponses = [
                {
                    keywords: ["love", "ভালোবাসি", "bhalobashi"],
                    bn: "🙈 ভালোবাসি বললেই তো হবে না, সারাজীবন এই হাতটা ধরে রাখতে পারবা তো?",
                    en: "Just saying I love you isn't enough, can you hold my hand for a lifetime?",
                    banglish: "Bhalobashi bollei to hobe na, sarajibon ei hatta dhore rakhte parba to?"
                },
                {
                    keywords: ["miss", "মিস", "miss korchi"],
                    bn: "🥺 মনে যখন এতই পড়ে, সামনে এসে দাঁড়াচ্ছ না কেন?",
                    en: "If you miss me so much, why don't you come and stand in front of me?",
                    banglish: "Mone jokhon etoi pore, shamne eshe darachho na keno?"
                },
                {
                    keywords: ["korcho", "করো", "doing"],
                    bn: "🙈 তোমার একটা মেসেজের অপেক্ষায় বসে ছিলাম!",
                    en: "I was sitting and waiting for your message!",
                    banglish: "Tomar ekta messager opekkhae bose thaklam!"
                },
                {
                    keywords: ["rag", "রাগ", "angry"],
                    bn: "🌹 একটু আদুরে কণ্ঠে ডাকলেই তো গলে যাবো!",
                    en: "Call me softly with love and I will melt!",
                    banglish: "Ektu adure konthe daklei to gole jabo!"
                },
                {
                    keywords: ["khaiso", "খাইসো", "eaten", "eat"],
                    bn: "🥺 তুমি ছাড়া কি কিছু মুখে রোচে? আগে বলো তুমি খেয়েছ কি না!",
                    en: "Does anything taste good without you? Tell me if you have eaten first!",
                    banglish: "Tumi chara ki kichu mukhe roche? Age bolo tumi khaiso kina!"
                },
                {
                    keywords: ["bokachoda", "khankir", "gali", "খারাপ"],
                    bn: "🥱 তোমার পারিবারিক শিক্ষার একটা সুন্দর ধারণা পেয়ে গেলাম!",
                    en: "Got a very clear idea about your family manners!",
                    banglish: "Tomar paribarik shikkhar ekta sundor dharona peye gelam!"
                },
                {
                    keywords: ["tumi amar", "তুমি আমার", "you are mine"],
                    bn: "🙈 শুধু মুখে বললেই হবে না, স্ট্যাম্প পেপারে সই করে দিয়ে যাও তাহলে বিশ্বাস করবো!",
                    en: "Just saying it won't work, sign on a stamp paper then I will believe you!",
                    banglish: "Shudhu mukhe bollei hobe na, stamp papere soi kore diye jao tahole biswas korbo!"
                },
                {
                    keywords: ["potaccho", "পটাইতাছ", "flirting"],
                    bn: "🤭 তোমাকে পটানোর জন্য আমার ট্রাই করা লাগে না, তুমি তো এমনিতেই পটে আছো!",
                    en: "I don't need to try to flirt with you, you are already smitten!",
                    banglish: "Tomake potanor jonno amar try kora lage na, tumi to emnitei pote aso!"
                },
                {
                    keywords: ["hug", "জড়িয়ে", "kole"],
                    bn: "🥺 দূরে দাঁড়িয়ে না থেকে এক লাফে বুকে জড়িয়ে ধরে ফেলো তো!",
                    en: "Don't just stand far away, jump in and hug me tight!",
                    banglish: "Dure dariye na theke ek lafe buke joriye dhore felo to!"
                },
                {
                    keywords: ["kiss", "কিস", "chumu"],
                    bn: "💋 এতো কিসের তারা? আগে ভালোবেসে চোখের দিকে তাকাও, তারপর ভেবে দেখবো!",
                    en: "What's the rush? Look into my eyes with love first, then I'll think about it!",
                    banglish: "Eto kisher tara? Age bhalobeshe chokher dike takao, tarpor bhebe dekhto!"
                },
                {
                    keywords: ["lost", "হারিয়ে", "eyes"],
                    bn: "✨ হারিয়ে যেও না যেন, দিক খুঁজে না পেলে সোজা আমার হৃদয়ে চলে এসো!",
                    en: "Don't get lost! If you can't find direction, come straight to my heart!",
                    banglish: "Hariye jeo na jeno, dik khunje na pele shoja amar hridoye chole eso!"
                },
                {
                    keywords: ["sweet", "মিষ্টি", "misti"],
                    bn: "🍯 প্রতিদিন তোমার পাঠানো ভালোবাসা গিলে খাই তো, তাই হয়তো এত মিষ্টি লাগে!",
                    en: "I swallow all the love you send every day, maybe that's why I'm so sweet!",
                    banglish: "Protidin tomar pathano bhalobasha gile khai to, tai hoyto eto misti lage!"
                },
                {
                    keywords: ["kemon", "কেমন", "how are you"],
                    bn: "✨ আলহামদুলিল্লাহ ভালো, তুমি কেমন আছো?",
                    en: "Alhamdulillah I am fine, how about you?",
                    banglish: "Alhamdulillah bhalo, tumi kemon aso?"
                }
            ];

            let matchedReply = null;

            for (const item of customResponses) {
                if (item.keywords.some(kw => message.includes(kw))) {
                    if (isBanglaText(rawMessage)) {
                        matchedReply = item.bn;
                    } else if (isEnglishText(message)) {
                        matchedReply = item.en;
                    } else {
                        matchedReply = item.banglish;
                    }
                    break;
                }
            }

            // ৩. শুধু ট্রিগার নাম (যেমন: baby, bot) লিখলে উত্তর
            let userText = message;
            for (const prefix of mahmud) {
                if (message.startsWith(prefix)) {
                    userText = message.substring(prefix.length).trim();
                    break;
                }
            }

            let finalResponse = matchedReply;

            if (!finalResponse) {
                if (!userText) {
                    if (isBanglaText(rawMessage)) {
                        finalResponse = "বলো, আমি শুনছি! 🌸";
                    } else {
                        finalResponse = "Bolo, ami shunshi! 🌸";
                    }
                } else {
                    try {
                        const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { text: userText, style: 3, attachments });
                        finalResponse = res.data.message;
                    } catch {
                        finalResponse = "error baby🥹";
                    }
                }
            }

            api.sendMessage(finalResponse, event.threadID, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: this.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID,
                        text: finalResponse
                    });
                }
            }, event.messageID);
        }
    } catch (err) {
        console.error(err);
    }
};
