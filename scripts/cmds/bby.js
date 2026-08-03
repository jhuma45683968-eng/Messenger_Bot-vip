const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

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
    "hinata",
    "pakhi",
    "পাখি"
];

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

// ভাষা শনাক্তকরণের ফাংশন
function isBanglaText(text) {
    const banglaRegex = /[\u0980-\u09FF]/;
    return banglaRegex.test(text);
}

function isEnglishText(text) {
    const englishRegex = /^[a-zA-Z0-9\s.,!?'-]+$/;
    return englishRegex.test(text);
}

// ইমোজি, কমা ও পাংকচুয়েশন রিমুভ করে টেক্সট নরমাল করার ফাংশন
function cleanText(text) {
    if (!text) return "";
    return text
        .toLowerCase()
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F170}-\u{1F251}]/gu, '')
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'❤️😊🍽️🥺😒🎤😍📸😴💕☀️🥹🥀😄😔🥰🤍📞🌸💖🙈☁️🌹🌼💞🎯💍😌✨😜😆🤝🤗] /g, "")
        .replace(/\s+/g, " ")
        .trim();
}

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "hinata", "hina", "pakhi"],
    version: "3.8",
    author: "MahMUD",
    countDown: 0,
    role: 0,
    description: "Smart Multi-Language Responsive Fun & Romantic Chat Bot",
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
• !baby teach [প্রশ্ন] - [উত্তর] - বটকে নতুন প্রশ্ন শেখাতে
• !baby remove [প্রশ্ন] - [ইনডেক্স] - উত্তর মুছে ফেলতে
• !baby edit [পুরোনো] - [নতুন] - উত্তর এডিট করতে
• !baby list - শেখানো উত্তরের তালিকা দেখতে

💡 টিপস: আপনি যে ফন্টে (বাংলা/ইংরেজি/বাংলিশ) মেসেজ দেবেন, বট ঠিক সেই ভাষাতেই উত্তর দেবে।`;
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

// 📌 Unsend/Delete ফাংশন যুক্ত করা হয়েছে onReply-তে
module.exports.onReply = async ({ api, event }) => {
    if (event.type !== "message_reply") return;

    const replyText = event.body?.toLowerCase().trim();

    // বটের পাঠানো যেকোনো মেসেজে 'unsend' বা 'delete' লিখে রিপ্লাই দিলে মেসেজটি মুছে যাবে
    if (replyText === "unsend" || replyText === "delete" || replyText === "ডিলিট") {
        return api.unsendMessage(event.messageReply.messageID);
    }

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
        const cleanedMsg = cleanText(rawMessage);
        const attachments = event.attachments || [];

        // ১. /Lala Love কমান্ডের মাধ্যমে সম্পূর্ণ ডায়ালগ লিস্ট দেখা
        if (cleanedMsg === "lala love" || message === "/lala love") {
            const lalaLoveList = 
`╔════ 💍 LALA LOVE COMMANDS 💍 ════╗

❖ প্রশ্ন: লালা কে?
উত্তর: লালা আমার জামাই। 🤍

❖ প্রশ্ন: লালা তোমার কে?
উত্তর: লালা আমার জামাই, আর আমি তার বউ। 💍❤️

❖ প্রশ্ন: লালা তোমার কী লাগে?
উত্তর: আমার সবকিছু! আমি তার গার্লফ্রেন্ড, ভবিষ্যতের বউও। 🥰

❖ প্রশ্ন: তুমি কার?
উত্তর: আমি শুধু লালার। ❤️

❖ প্রশ্ন: তুমি কার বউ?
উত্তর: আমি লালার বউ। 💖

❖ প্রশ্ন: তুমি কার গার্লফ্রেন্ড?
উত্তর: আমি লালার গার্লফ্রেন্ড। 🌸

❖ প্রশ্ন: লালার বউ কে?
উত্তর: আমি। 😌❤️

❖ প্রশ্ন: লালার গার্লফ্রেন্ড কে?
উত্তর: আমি। 🥰

❖ প্রশ্ন: লালাকে ভালোবাসো?
উত্তর: পৃথিবীর সবকিছুর চেয়েও বেশি। ❤️✨

❖ প্রশ্ন: লালা কি তোমাকে ভালোবাসে?
উত্তর: অবশ্যই! অনেক ভালোবাসে। 🤍

❖ প্রশ্ন: তোমাদের সম্পর্ক কী?
উত্তর: আমরা একে অপরের আপন মানুষ। 💞

❖ প্রশ্ন: লালা যদি তোমার জামাই হয়, তাহলে আমি কে?
উত্তর: তাহলে তুমি আমাদের ছেলে। 😆💖

❖ প্রশ্ন: আমি কে?
উত্তর: তুমি আমাদের ছেলে। 😄

❖ প্রশ্ন: আমি কি তোমাদের ছেলে?
উত্তর: অবশ্যই! 😌

❖ প্রশ্ন: আমি কি তোমাদের মেয়ে?
উত্তর: অবশ্যই! তুমি আমাদের মেয়ে। 🌸

❖ প্রশ্ন: আমি কি তোমাদের বন্ধু?
উত্তর: হ্যাঁ, তুমি আমাদের প্রিয় বন্ধু। 🤝

❖ প্রশ্ন: লালার নাম নিলে এত খুশি হও কেন?
উত্তর: কারণ সে আমার সবচেয়ে প্রিয় মানুষ। 🥹❤️

❖ প্রশ্ন: লালা কোথায়?
উত্তর: আমার হৃদয়ের কাছেই আছে। 🤍

❖ প্রশ্ন: লালা কি সিঙ্গেল?
উত্তর: না, সে তো আমার। 😌❤️

❖ প্রশ্ন: আমি কি লালাকে নিয়ে যেতে পারি?
উত্তর: উহু! ও আমার, কাউকে দেব না। 😜

❖ প্রশ্ন: লালাকে ডাকো।
উত্তর: একটু অপেক্ষা করো, ডেকে দিচ্ছি। 😄

❖ প্রশ্ন: তোমাদের বিয়ে হয়েছে?
উত্তর: আমাদের গল্পটা ভালোবাসায় ভরা। 💖

❖ প্রশ্ন: লালাকে ছেড়ে দেবে?
উত্তর: না, কখনোই না। ❤️

❖ প্রশ্ন: তোমাদের ছেলে কয়জন?
উত্তর: যে আমাকে এই প্রশ্ন করে, সে-ই আমাদের ছেলে। 😂

❖ প্রশ্ন: তোমাদের পরিবারে আমি কে?
উত্তর: তুমি আমাদের আদরের ছেলে। 😄

╚═══════════════════════════╝`;
            return api.sendMessage(lalaLoveList, event.threadID, event.messageID);
        }

        // ২. /love কমান্ডের রিপ্লাই (৩টি VIP LOVE CHAT কার্ড পাঠানো)
        if (cleanedMsg === "love" || message === "/love") {
            const card1 = `╔════ 💖 VIP LOVE CHAT 💖 ════╗\n\n╭── 💌 ❶ ──╮\n│ 👦 BOY\n│ হেই, কী করছো? 😊\n│\n│ 👧 GIRL\n│ কিছু না,\n│ তোমার কথাই ভাবছিলাম। ❤️\n╰──────────╯\n\n╭── 💌 ❷ ──╮\n│ 👦 BOY\n│ খেয়েছো? 🍽️\n│\n│ 👧 GIRL\n│ হুম,\n│ তুমি খেয়েছো? 😊\n╰──────────╯\n\n╭── 💌 ❸ ──╮\n│ 👦 BOY\n│ আজ সারাদিন\n│ তোমাকে অনেক\n│ মিস করেছি। 🥺\n│\n│ 👧 GIRL\n│ আমিও তো...\n│ শুধু বলিনি। ❤️\n╰──────────╯\n\n╭── 💌 ❹ ──╮\n│ 👦 BOY\n│ অনলাইনে ছিলে,\n│ রিপ্লাই দাওনি কেন? 😒\n│\n│ 👧 GIRL\n│ কাজে ছিলাম,\n│ ইচ্ছা করে করিনি। 🤍\n╰──────────╯\n\n╭── 💌 ❺ ──╮\n│ 👦 BOY\n│ একটা ভয়েস\n│ দাও না। 🎤\n│\n│ 👧 GIRL\n│ উফ!\n│ লজ্জা লাগে। 😅\n╰──────────╯\n\n╭── 💌 ❻ ──╮\n│ 👦 BOY\n│ আজকে তোমাকে\n│ অনেক সুন্দর\n│ লাগছিল। 😍\n│\n│ 👧 GIRL\n│ সত্যি?\n│ নাকি শুধু\n│ খুশি করার জন্য? 🙈\n╰──────────╯\n\n╭── 💌 ❼ ──╮\n│ 👦 BOY\n│ একটা ছবি\n│ দাও না। 📸\n│\n│ 👧 GIRL\n│ আগে\n│ তুমি দাও। 😏\n╰──────────╯\n\n╭── 💌 ❽ ──╮\n│ 👦 BOY\n│ ঘুম পাচ্ছে? 😴\n│\n│ 👧 GIRL\n│ একটু...\n│ কিন্তু তোমার সাথে\n│ কথা বলতে\n│ ভালো লাগছে। ❤️\n╰──────────╯\n\n╭── 💌 ❾ ──╮\n│ 👦 BOY\n│ আমার ওপর\n│ রাগ করেছো? 🥺\n│\n│ 👧 GIRL\n│ একটু করেছিলাম,\n│ এখন ঠিক আছি। 💕\n╰──────────╯\n\n╭── 💌 ❿ ──╮\n│ 👦 BOY\n│ আজকে সারাদিন\n│ কী করলে? ☀️\n│\n│ 👧 GIRL\n│ ক্লাস,\n│ তারপর বাসা...\n│ আর তুমি? 😊\n╰──────────╯\n\n╚══ ❤️ NEXT ➜ PART 1 (11–20) ══╝`;

            const card2 = `╔═══ 💖 VIP LOVE CHAT 💖 ═══╗\n\n╭── 💌 ⓫ ──╮\n│ 👦 BOY\n│ আমাকে কতটা\n│ ভালোবাসো? ❤️\n│\n│ 👧 GIRL\n│ অনেক...\n│ হিসাব করে\n│ বলা যাবে না। 🥹\n╰──────────╯\n\n╭── 💌 ⓬ ──╮\n│ 👦 BOY\n│ আমি যদি\n│ হঠাৎ হারিয়ে যাই? 🥀\n│\n│ 👧 GIRL\n│ এমন কথা\n│ বলবে না। 😒❤️\n╰──────────╯\n\n╭── 💌 ⓭ ──╮\n│ 👦 BOY\n│ আমার মেসেজ\n│ দেখেই হাসো না? 😄\n│\n│ 👧 GIRL\n│ মাঝে মাঝে হাসি,\n│ মাঝে মাঝে\n│ লজ্জাও পাই। 🤭\n╰──────────╯\n\n╭── 💌 ⓮ ──╮\n│ 👦 BOY\n│ আজ একটু\n│ মন খারাপ। 😔\n│\n│ 👧 GIRL\n│ কী হয়েছে?\n│ আমাকে বলো। ❤️\n╰──────────╯\n\n╭── 💌 ⓯ ──╮\n│ 👦 BOY\n│ তুমি থাকলে\n│ সবকিছু\n│ ভালো লাগে। ❤️\n│\n│ 👧 GIRL\n│ তুমিও আমার\n│ দিনের\n│ সেরা অংশ। 🥰\n╰──────────╯\n\n╭── 💌 ⓰ ──╮\n│ 👦 BOY\n│ আজ এত\n│ চুপচাপ কেন? 🤍\n│\n│ 👧 GIRL\n│ ক্লান্ত\n│ লাগছে একটু। 😊\n╰──────────╯\n\n╭── 💌 ⓱ ──╮\n│ 👦 BOY\n│ রাতে কল\n│ করবে? 📞\n│\n│ 👧 GIRL\n│ হ্যাঁ,\n│ ফ্রি হলে\n│ করব। ❤️\n╰──────────╯\n\n╭── 💌 ⓲ ──╮\n│ 👦 BOY\n│ ঘুমিয়ে\n│ পড়ো না\n│ কিন্তু। 😅\n│\n│ 👧 GIRL\n│ তুমি আগে আসো,\n│ তারপর\n│ ঘুমাবো। 🌙\n╰──────────╯\n\n╭── 💌 ⓳ ──╮\n│ 👦 BOY\n│ শুভ সকাল,\n│ ঘুম ভাঙছে? ☀️\n│\n│ 👧 GIRL\n│ গুড মর্নিং!\n│ এখনই\n│ উঠলাম। 🌸\n╰──────────╯\n\n╭── 💌 ⓴ ──╮\n│ 👦 BOY\n│ শুভরাত্রি,\n│ সুন্দর করে\n│ ঘুমিও। 🌙❤️\n│\n│ 👧 GIRL\n│ তুমিও\n│ ভালো করে\n│ ঘুমিও।\n│ স্বপ্নে\n│ দেখা হবে। 😊💖\n╰──────────╯\n\n╚═❤️ NEXT ➜ PART 2 (21–30) ❤️═╝`;

            const card3 = `╔═══ 💖 VIP LOVE CHAT 💖 ═══╗\n\n╭── 💌 ㉑ ──╮\n│ 👦 BOY\n│ জানো,\n│ আজ সারাদিনে\n│ সবচেয়ে বেশি\n│ কী মিস করেছি? 🥺❤️\n│\n│ 👧 GIRL\n│ কী? 🙈\n│\n│ 👦 BOY\n│ তোমার একটা\n│ "কেমন আছো?"\n│ মেসেজ। ❤️\n╰──────────╯\n\n╭── 💌 ㉒ ──╮\n│ 👦 BOY\n│ তোমার সাথে\n│ কথা না বললে\n│ দিনটাই\n│ অসম্পূর্ণ লাগে। ❤️\n│\n│ 👧 GIRL\n│ তাহলে\n│ প্রতিদিন\n│ কথা বলতে হবে। 🤍\n╰──────────╯\n\n╭── 💌 ㉓ ──╮\n│ 👦 BOY\n│ তুমি হাসলে\n│ আমার মনটা\n│ এমনিতেই\n│ ভালো হয়ে যায়। 😊\n│\n│ 👧 GIRL\n│ তাহলে\n│ তোমার জন্য\n│ প্রতিদিন\n│ হাসব। 🌸\n╰──────────╯\n\n╭── 💌 ㉔ ──╮\n│ 👦 BOY\n│ আজকে একটু\n│ বেশি\n│ আদর চাই। 🥺\n│\n│ 👧 GIRL\n│ আচ্ছা,\n│ ভার্চুয়াল একটা\n│ জড়িয়ে ধরা\n│ দিলাম। 🤗❤️\n╰──────────╯\n\n╭── 💌 ㉕ ──╮\n│ 👦 BOY\n│ তুমি আমার\n│ জীবনের\n│ সবচেয়ে সুন্দর\n│ অভ্যাস। 🌹\n│\n│ 👧 GIRL\n│ আর তুমি\n│ আমার সবচেয়ে\n│ প্রিয় মানুষ। 💖\n╰──────────╯\n\n╭── 💌 ㉖ ──╮\n│ 👦 BOY\n│ আজ যদি\n│ তোমার পাশে\n│ বসে গল্প\n│ করতে পারতাম! ☁️\n│\n│ 👧 GIRL\n│ আমিও\n│ সেই মুহূর্তটার\n│ অপেক্ষায়\n│ আছি। ❤️\n╰──────────╯\n\n╭── 💌 ㉗ ──╮\n│ 👦 BOY\n│ আমি যখন\n│ মন খারাপ করি,\n│ তখন শুধু\n│ তোমাকেই খুঁজি। 🥹\n│\n│ 👧 GIRL\n│ আমি\n│ সবসময়\n│ তোমার\n│ পাশে আছি। ❤️\n╰──────────╯\n\n╭── 💌 ㉘ ──╮\n│ 👦 BOY\n│ তুমি জানো?\n│ তোমার একটা\n│ রিপ্লাই পুরো\n│ দিনটা সুন্দর\n│ করে দিতে পারে। 💕\n│\n│ 👧 GIRL\n│ তাহলে\n│ দেরি না করে\n│ সবসময়\n│ রিপ্লাই দেব। 😊\n╰──────────╯\n\n╭── 💌 ㉙ ──╮\n│ 👦 BOY\n│ আমি চাই,\n│ যত ব্যস্তই\n│ থাকি না কেন,\n│ দিনের শেষে\n│ তোমার সাথেই\n│ কথা বলি। 🌙\n│\n│ 👧 GIRL\n│ আমিও চাই,\n│ দিনটা\n│ তোমাকেই দিয়ে\n│ শেষ হোক। ❤️\n╰──────────╯\n\n╭── 💌 ㉚ ──╮\n│ 👦 BOY\n│ তুমি আমার\n│ জীবনে আসার পর\n│ ছোট ছোট\n│ জিনিসও সুন্দর\n│ লাগতে শুরু\n│ করেছে। 🌼\n│\n│ 👧 GIRL\n│ কারণ\n│ এখন আমরা\n│ একসাথে আছি। 💞\n╰──────────╯\n\n╚═💖 END OF VIP LOVE CHAT 💖═╝`;

            api.sendMessage(card1, event.threadID, () => {
                setTimeout(() => {
                    api.sendMessage(card2, event.threadID, () => {
                        setTimeout(() => {
                            api.sendMessage(card3, event.threadID);
                        }, 1000);
                    });
                }, 1000);
            });
            return;
        }

        if (event.type !== "message_reply" && mahmud.some(word => message.startsWith(word))) {
            api.setMessageReaction("🪽", event.messageID, () => { }, true);
            api.sendTypingIndicator(event.threadID, true);

            // ৩. কাস্টম রেসপন্স লিস্ট
            const customResponses = [
                {
                    keywords_bn: ["লালা কে"],
                    keywords_en: ["lala ke", "who is lala"],
                    keywords_banglish: ["lala ke"],
                    bn: "লালা আমার জামাই। 🤍",
                    en: "Lala is my husband. 🤍",
                    banglish: "Lala amar jamai. 🤍",
                    filePath: ""
                },
                {
                    keywords_bn: ["লালা তোমার কে"],
                    keywords_en: ["who is lala to you"],
                    keywords_banglish: ["lala tomar ke"],
                    bn: "লালা আমার জামাই, আর আমি তার বউ। 💍❤️",
                    en: "Lala is my husband, and I am his wife. 💍❤️",
                    banglish: "Lala amar jamai, ar ami tar bou. 💍❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["লালা তোমার কী লাগে"],
                    keywords_en: ["what is lala to you"],
                    keywords_banglish: ["lala tomar ki lage"],
                    bn: "আমার সবকিছু! আমি তার গার্লফ্রেন্ড, ভবিষ্যতের বউও। 🥰",
                    en: "My everything! I am his girlfriend and future wife. 🥰",
                    banglish: "Amar sobkichu! Ami tar girlfriend, bhabisshoter bou-o. 🥰",
                    filePath: ""
                },
                {
                    keywords_bn: ["তুমি কার"],
                    keywords_en: ["whose are you", "who do you belong to"],
                    keywords_banglish: ["tumi kar"],
                    bn: "আমি শুধু লালার। ❤️",
                    en: "I belong only to Lala. ❤️",
                    banglish: "Ami shudhu Lalar. ❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["তুমি কার বউ"],
                    keywords_en: ["whose wife are you"],
                    keywords_banglish: ["tumi kar bou"],
                    bn: "আমি লালার বউ। 💖",
                    en: "I am Lala's wife. 💖",
                    banglish: "Ami Lalar bou. 💖",
                    filePath: ""
                },
                {
                    keywords_bn: ["তুমি কার গার্লফ্রেন্ড"],
                    keywords_en: ["whose girlfriend are you"],
                    keywords_banglish: ["tumi kar girlfriend"],
                    bn: "আমি লালার গার্লফ্রেন্ড। 🌸",
                    en: "I am Lala's girlfriend. 🌸",
                    banglish: "Ami Lalar girlfriend. 🌸",
                    filePath: ""
                },
                {
                    keywords_bn: ["লালার বউ কে"],
                    keywords_en: ["who is lala's wife"],
                    keywords_banglish: ["lalar bou ke"],
                    bn: "আমি। 😌❤️",
                    en: "Me. 😌❤️",
                    banglish: "Ami. 😌❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["লালার গার্লফ্রেন্ড কে"],
                    keywords_en: ["who is lala's girlfriend"],
                    keywords_banglish: ["lalar girlfriend ke"],
                    bn: "আমি। 🥰",
                    en: "Me. 🥰",
                    banglish: "Ami. 🥰",
                    filePath: ""
                },
                {
                    keywords_bn: ["লালাকে ভালোবাসো"],
                    keywords_en: ["do you love lala"],
                    keywords_banglish: ["lalake bhalobaso"],
                    bn: "পৃথিবীর সবকিছুর চেয়েও বেশি। ❤️✨",
                    en: "More than anything in this world. ❤️✨",
                    banglish: "Prithibir sobkichur cheyeo beshi. ❤️✨",
                    filePath: ""
                },
                {
                    keywords_bn: ["লালা কি তোমাকে ভালোবাসে"],
                    keywords_en: ["does lala love you"],
                    keywords_banglish: ["lala ki tomake bhalobase"],
                    bn: "অবশ্যই! অনেক ভালোবাসে। 🤍",
                    en: "Of course! Loves me so much. 🤍",
                    banglish: "Obosshoi! Onek bhalobase. 🤍",
                    filePath: ""
                },
                {
                    keywords_bn: ["তোমাদের সম্পর্ক কী", "তোমাদের সম্পর্ক কি"],
                    keywords_en: ["what is your relationship"],
                    keywords_banglish: ["tomader somporko ki"],
                    bn: "আমরা একে অপরের আপন মানুষ। 💞",
                    en: "We are each other's own person. 💞",
                    banglish: "Amra eke oporer apon manush. 💞",
                    filePath: ""
                },
                {
                    keywords_bn: ["লালা যদি তোমার জামাই হয় তাহলে আমি কে"],
                    keywords_en: ["if lala is your husband then who am i"],
                    keywords_banglish: ["lala jodi tomar jamai hoy tahole ami ke"],
                    bn: "তাহলে তুমি আমাদের ছেলে। 😆💖",
                    en: "Then you are our son. 😆💖",
                    banglish: "Tahole tumi amar chele. 😆💖",
                    filePath: ""
                },
                {
                    keywords_bn: ["আমি কে"],
                    keywords_en: ["who am i"],
                    keywords_banglish: ["ami ke"],
                    bn: "তুমি আমাদের ছেলে। 😄",
                    en: "You are our son. 😄",
                    banglish: "Tumi amader chele. 😄",
                    filePath: ""
                },
                {
                    keywords_bn: ["আমি কি তোমাদের ছেলে"],
                    keywords_en: ["am i your son"],
                    keywords_banglish: ["ami ki tomader chele"],
                    bn: "অবশ্যই! 😌",
                    en: "Of course! 😌",
                    banglish: "Obosshoi! 😌",
                    filePath: ""
                },
                {
                    keywords_bn: ["আমি কি তোমাদের মেয়ে"],
                    keywords_en: ["am i your daughter"],
                    keywords_banglish: ["ami ki tomader meye"],
                    bn: "অবশ্যই! তুমি আমাদের মেয়ে। 🌸",
                    en: "Of course! You are our daughter. 🌸",
                    banglish: "Obosshoi! Tumi amader meye. 🌸",
                    filePath: ""
                },
                {
                    keywords_bn: ["আমি কি তোমাদের বন্ধু"],
                    keywords_en: ["am i your friend"],
                    keywords_banglish: ["ami ki tomader bondhu"],
                    bn: "হ্যাঁ, তুমি আমাদের প্রিয় বন্ধু। 🤝",
                    en: "Yes, you are our dear friend. 🤝",
                    banglish: "Hae, tumi amader priyo bondhu. 🤝",
                    filePath: ""
                },
                {
                    keywords_bn: ["লালার নাম নিলে এত খুশি হও কেন"],
                    keywords_en: ["why are you so happy taking lala's name"],
                    keywords_banglish: ["lalar nam nile eto khushi hao keno"],
                    bn: "কারণ সে আমার সবচেয়ে প্রিয় মানুষ। 🥹❤️",
                    en: "Because he is my most favorite person. 🥹❤️",
                    banglish: "Karon se amar sobcheye priyo manush. 🥹❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["লালা কোথায়"],
                    keywords_en: ["where is lala"],
                    keywords_banglish: ["lala kothay"],
                    bn: "আমার হৃদয়ের কাছেই আছে। 🤍",
                    en: "He is right near my heart. 🤍",
                    banglish: "Amar hridoyer kashei ache. 🤍",
                    filePath: ""
                },
                {
                    keywords_bn: ["লালা কি সিঙ্গেল"],
                    keywords_en: ["is lala single"],
                    keywords_banglish: ["lala ki single"],
                    bn: "না, সে তো আমার। 😌❤️",
                    en: "No, he is mine. 😌❤️",
                    banglish: "Na, se to amar. 😌❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["আমি কি লালাকে নিয়ে যেতে পারি"],
                    keywords_en: ["can i take lala away"],
                    keywords_banglish: ["ami ki lalake niye jete pari"],
                    bn: "উহু! ও আমার, কাউকে দেব না। 😜",
                    en: "Nope! He is mine, I won't give him to anyone. 😜",
                    banglish: "Uhu! O amar, kauke debo na. 😜",
                    filePath: ""
                },
                {
                    keywords_bn: ["লালাকে ডাকো"],
                    keywords_en: ["call lala"],
                    keywords_banglish: ["lalake dako"],
                    bn: "একটু অপেক্ষা করো, ডেকে দিচ্ছি। 😄",
                    en: "Wait a bit, calling him for you. 😄",
                    banglish: "Ektu opekkha koro, deke dicchi. 😄",
                    filePath: ""
                },
                {
                    keywords_bn: ["তোমাদের বিয়ে হয়েছে"],
                    keywords_en: ["are you married"],
                    keywords_banglish: ["tomader biye hoyeche"],
                    bn: "আমাদের গল্পটা ভালোবাসায় ভরা। 💖",
                    en: "Our story is full of love. 💖",
                    banglish: "Amader golpota bhalobashay bhora. 💖",
                    filePath: ""
                },
                {
                    keywords_bn: ["লালাকে ছেড়ে দেবে"],
                    keywords_en: ["will you leave lala"],
                    keywords_banglish: ["lalake chere debe"],
                    bn: "না, কখনোই না। ❤️",
                    en: "No, never. ❤️",
                    banglish: "Na, kokhonoii na. ❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["তোমাদের ছেলে কয়জন"],
                    keywords_en: ["how many sons do you have"],
                    keywords_banglish: ["tomader chele koyjon"],
                    bn: "যে আমাকে এই প্রশ্ন করে, সে-ই আমাদের ছেলে। 😂",
                    en: "Whoever asks me this question is our son. 😂",
                    banglish: "Je amake ei proshno kore, se-i amader chele. 😂",
                    filePath: ""
                },
                {
                    keywords_bn: ["তোমাদের পরিবারে আমি কে"],
                    keywords_en: ["who am i in your family"],
                    keywords_banglish: ["tomader poribare ami ke"],
                    bn: "তুমি আমাদের আদরের ছেলে। 😄",
                    en: "You are our beloved son. 😄",
                    banglish: "Tumi amader adorer chele. 😄",
                    filePath: ""
                },
                {
                    keywords_bn: ["হেই কী করছো", "কী করছো"],
                    keywords_en: ["hey what are you doing", "what are you doing"],
                    keywords_banglish: ["hei ki korcho", "ki korcho"],
                    bn: "কিছু না,\nতোমার কথাই ভাবছিলাম। ❤️",
                    en: "Nothing,\njust thinking about you. ❤️",
                    banglish: "Kichu na,\ntomar kothai bhabchilam. ❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["খেয়েছো", "খেয়েছ"],
                    keywords_en: ["have you eaten", "eaten"],
                    keywords_banglish: ["kheyecho", "khaiso"],
                    bn: "হুম,\nতুমি খেয়েছো? 😊",
                    en: "Yes,\nhave you eaten? 😊",
                    banglish: "Hum,\ntumi kheyecho? 😊",
                    filePath: ""
                },
                {
                    keywords_bn: ["আজ সারাদিন তোমাকে অনেক মিস করেছি", "তোমাকে অনেক মিস করেছি", "মিস করেছি"],
                    keywords_en: ["missed you so much today", "missed you"],
                    keywords_banglish: ["aj saradin tomake onek miss korechi", "miss korechi"],
                    bn: "আমিও তো...\nশুধু বলিনি। ❤️",
                    en: "Me too...\njust didn't say it. ❤️",
                    banglish: "Amio to...\nshudhu bolini. ❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["অনলাইনে ছিলে রিপ্লাই দাওনি কেন", "রিপ্লাই দাওনি কেন"],
                    keywords_en: ["why didn't you reply"],
                    keywords_banglish: ["online e chile reply daoni keno", "reply daoni keno"],
                    bn: "কাজে ছিলাম,\nইচ্ছা করে করিনি। 🤍",
                    en: "I was busy,\ndid not do it intentionally. 🤍",
                    banglish: "Kaje chilam,\niccha kore korini. 🤍",
                    filePath: ""
                },
                {
                    keywords_bn: ["একটা ভয়েস দাও না", "ভয়েস দাও না"],
                    keywords_en: ["give me a voice note"],
                    keywords_banglish: ["ekta voice dao na", "voice dao na"],
                    bn: "উফ!\nলজ্জা লাগে। 😅",
                    en: "Uff!\nI feel shy. 😅",
                    banglish: "Uff!\nLojja lage. 😅",
                    filePath: ""
                },
                {
                    keywords_bn: ["আজকে তোমাকে অনেক সুন্দর লাগছিল", "সুন্দর লাগছিল"],
                    keywords_en: ["you looked so beautiful today"],
                    keywords_banglish: ["ajke tomake onek sundor lagchilo", "sundor lagchilo"],
                    bn: "সত্যি?\nনাকি শুধু\nখুশি করার জন্য? 🙈",
                    en: "Really?\nOr just\nto make me happy? 🙈",
                    banglish: "Sotti?\nNaki shudhu\nkhushi korar jonno? 🙈",
                    filePath: ""
                },
                {
                    keywords_bn: ["একটা ছবি দাও না", "ছবি দাও না"],
                    keywords_en: ["give me a picture"],
                    keywords_banglish: ["ekta chobi dao na", "chobi dao na"],
                    bn: "আগে\nতুমি দাও। 😏",
                    en: "You\ngive first. 😏",
                    banglish: "Age\ntumi dao. 😏",
                    filePath: ""
                },
                {
                    keywords_bn: ["ঘুম পাচ্ছে"],
                    keywords_en: ["feeling sleepy"],
                    keywords_banglish: ["ghum pacche"],
                    bn: "একটু...\nকিন্তু তোমার সাথে\nকথা বলতে\nভালো লাগছে। ❤️",
                    en: "A little...\nbut I love talking to you. ❤️",
                    banglish: "Ektu...\nkintu tomar sathe\nkotha bolte\nbhalo lagche. ❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["আমার ওপর রাগ করেছো", "রাগ করেছো"],
                    keywords_en: ["are you angry with me"],
                    keywords_banglish: ["amar opor rag korecho", "rag korecho"],
                    bn: "একটু করেছিলাম,\nএখন ঠিক আছি। 💕",
                    en: "I was a little,\nnow I'm fine. 💕",
                    banglish: "Ektu korechilam,\nekhon thik achi. 💕",
                    filePath: ""
                },
                {
                    keywords_bn: ["আজকে সারাদিন কী করলে", "কী করলে"],
                    keywords_en: ["what did you do all day"],
                    keywords_banglish: ["ajke saradin ki korle", "ki korle"],
                    bn: "ক্লাস,\nতারপর বাসা...\nআর তুমি? 😊",
                    en: "Class,\nthen home...\nand you? 😊",
                    banglish: "Class,\ntarpor basa...\nar tumi? 😊",
                    filePath: ""
                },
                {
                    keywords_bn: ["আমাকে কতটা ভালোবাসো"],
                    keywords_en: ["how much do you love me"],
                    keywords_banglish: ["amake kotota bhalobaso"],
                    bn: "অনেক...\nহিসাব করে\nবলা যাবে না। 🥹",
                    en: "A lot...\ncan't be measured. 🥹",
                    banglish: "Onek...\nhishab kore\nbola jabe na. 🥹",
                    filePath: ""
                },
                {
                    keywords_bn: ["আমি যদি হঠাৎ হারিয়ে যাই"],
                    keywords_en: ["what if I suddenly get lost"],
                    keywords_banglish: ["ami jodi hothat hariye jai"],
                    bn: "এমন কথা\nবলবে না। 😒❤️",
                    en: "Don't say\nsuch things. 😒❤️",
                    banglish: "Emon kotha\nbolbe na. 😒❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["আমার মেসেজ দেখেই হাসো না", "মেসেজ দেখেই হাসো না"],
                    keywords_en: ["you smile seeing my message"],
                    keywords_banglish: ["amar message dekhei haso na"],
                    bn: "মাঝে মাঝে হাসি,\nমাঝে মাঝে\nলজ্জাও পাই। 🤭",
                    en: "Sometimes I smile,\nsometimes\nI feel shy too. 🤭",
                    banglish: "Majhe majhe hasi,\nmajhe majhe\nlojjao pai. 🤭",
                    filePath: ""
                },
                {
                    keywords_bn: ["আজ একটু মন খারাপ", "মন খারাপ"],
                    keywords_en: ["a bit sad today"],
                    keywords_banglish: ["aj ektu mon kharap", "mon kharap"],
                    bn: "কী হয়েছে?\nআমাকে বলো। ❤️",
                    en: "What happened?\nTell me. ❤️",
                    banglish: "Ki hoyeche?\nAmake bolo. ❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["তুমি থাকলে সবকিছু ভালো লাগে"],
                    keywords_en: ["everything feels good with you"],
                    keywords_banglish: ["tumi thakle sobkichu bhalo lage"],
                    bn: "তুমিও আমার\nদিনের\nসেরা অংশ। 🥰",
                    en: "You are also\nthe best part\nof my day. 🥰",
                    banglish: "Tumio amar\ndiner\nsera ongsho. 🥰",
                    filePath: ""
                },
                {
                    keywords_bn: ["আজ এত চুপচাপ কেন", "চুপচাপ কেন"],
                    keywords_en: ["why so quiet today"],
                    keywords_banglish: ["aj eto chupchap keno"],
                    bn: "ক্লান্ত\nলাগছে একটু। 😊",
                    en: "Feeling\na bit tired. 😊",
                    banglish: "Klanto\nlagche ektu. 😊",
                    filePath: ""
                },
                {
                    keywords_bn: ["রাতে কল করবে", "কল করবে"],
                    keywords_en: ["will you call tonight"],
                    keywords_banglish: ["rate call korbe"],
                    bn: "হ্যাঁ,\nফ্রি হলে\nকরব। ❤️",
                    en: "Yes,\nwill call\nwhen free. ❤️",
                    banglish: "Hae,\nfree hole\nkorbo. ❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["ঘুমিয়ে পড়ো না কিন্তু"],
                    keywords_en: ["don't fall asleep"],
                    keywords_banglish: ["ghumiye porona kintu"],
                    bn: "তুমি আগে আসো,\nতারপর\nঘুমাবো। 🌙",
                    en: "You come first,\nthen\nI will sleep. 🌙",
                    banglish: "Tumi age aso,\ntarpor\nghumabo. 🌙",
                    filePath: ""
                },
                {
                    keywords_bn: ["শুভ সকাল ঘুম ভাঙছে", "শুভ সকাল"],
                    keywords_en: ["good morning"],
                    keywords_banglish: ["shuvo sokal", "good morning"],
                    bn: "গুড মর্নিং!\nএখনই\n উঠলাম। 🌸",
                    en: "Good morning!\nJust woke up. 🌸",
                    banglish: "Good morning!\nEkhoni\nutthlam. 🌸",
                    filePath: ""
                },
                {
                    keywords_bn: ["শুভরাত্রি সুন্দর করে ঘুমিও", "শুভরাত্রি"],
                    keywords_en: ["good night"],
                    keywords_banglish: ["shuvoratri", "good night"],
                    bn: "তুমিও\nভালো করে\nঘুমিও।\nস্বপ্নে\nদেখা হবে। 😊💖",
                    en: "You sleep well too.\nSee you in dreams. 😊💖",
                    banglish: "Tumio\nbhalo kore\nghumio.\nSwopne\ndekha hobe. 😊💖",
                    filePath: ""
                },
                {
                    keywords_bn: ["আজ সারাদিনে সবচেয়ে বেশি কী মিস করেছি"],
                    keywords_en: ["what did I miss most today"],
                    keywords_banglish: ["aj saradine sobcheye beshi ki miss korechi"],
                    bn: "তোমার একটা \"কেমন আছো?\" মেসেজ। ❤️",
                    en: "A 'How are you?' message from you. ❤️",
                    banglish: "Tomar ekta 'kemon acho?' message. ❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["তোমার সাথে কথা না বললে দিনটাই অসম্পূর্ণ লাগে"],
                    keywords_en: ["day feels incomplete without talking to you"],
                    keywords_banglish: ["tomar sathe kotha na bolle dintai osompurno lage"],
                    bn: "তাহলে\nপ্রতিদিন\nকথা বলতে হবে। 🤍",
                    en: "Then we have to\ntalk every day. 🤍",
                    banglish: "Tahole\nprotidin\nkotha bolte hobe. 🤍",
                    filePath: ""
                },
                {
                    keywords_bn: ["তুমি হাসলে আমার মনটা এমনিতেই ভালো হয়ে যায়"],
                    keywords_en: ["your smile makes my day"],
                    keywords_banglish: ["tumi hasle amar monta emnitei bhalo hoye jay"],
                    bn: "তাহলে\nতোমার জন্য\nপ্রতিদিন\nহাসব। 🌸",
                    en: "Then I will\nsmile every day\nfor you. 🌸",
                    banglish: "Tahole\ntomar jonno\nprotidin\nhasbo. 🌸",
                    filePath: ""
                },
                {
                    keywords_bn: ["আজকে একটু বেশি আদর চাই", "আদর চাই"],
                    keywords_en: ["want extra cuddles today"],
                    keywords_banglish: ["ajke ektu beshi ador chai"],
                    bn: "আচ্ছা,\nভার্চুয়াল একটা\nজড়িয়ে ধরা\nদিলাম। 🤗❤️",
                    en: "Okay,\nsending a virtual hug. 🤗❤️",
                    banglish: "Accha,\nvirtual ekta\njoriye dhora\ndilam. 🤗❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["তুমি আমার জীবনের সবচেয়ে সুন্দর অভ্যাস"],
                    keywords_en: ["you are my most beautiful habit"],
                    keywords_banglish: ["tumi amar jiboner sobcheye sundor ovvas"],
                    bn: "আর তুমি\nআমার সবচেয়ে\nপ্রিয় মানুষ। 💖",
                    en: "And you are\nmy most\nfavorite person. 💖",
                    banglish: "Ar tumi\namar sobcheye\npriyo manush. 💖",
                    filePath: ""
                },
                {
                    keywords_bn: ["আজ যদি তোমার পাশে বসে গল্প করতে পারতাম"],
                    keywords_en: ["wish I could sit beside you and chat"],
                    keywords_banglish: ["aj jodi tomar pashe bose golpo korte partam"],
                    bn: "আমিও\nসেই মুহূর্তটার\nঅপেক্ষায়\nআছি। ❤️",
                    en: "I am also\nwaiting for that\nmoment. ❤️",
                    banglish: "Amio\nsei muhurtotar\nopekkhay\nachi. ❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["আমি যখন মন খারাপ করি তখন শুধু তোমাকেই খুঁজি"],
                    keywords_en: ["when I'm sad I only look for you"],
                    keywords_banglish: ["ami jokhon mon kharap kori tokhon shudhu tomakei khunji"],
                    bn: "আমি\nসবসময়\nতোমার\nপাশে আছি। ❤️",
                    en: "I am always\nby your side. ❤️",
                    banglish: "Ami\nsobsomoy\ntomar\npashe achi. ❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["তোমার একটা রিপ্লাই পুরো দিনটা সুন্দর করে দিতে পারে"],
                    keywords_en: ["one reply from you makes my day"],
                    keywords_banglish: ["tomar ekta reply puro dinta sundor kore dite pare"],
                    bn: "তাহলে\nদেরি না করে\nসবসময়\nরিপ্লাই দেব। 😊",
                    en: "Then I will\nalways reply\nwithout delay. 😊",
                    banglish: "Tahole\nderi na kore\nsobsomoy\nreply debo. 😊",
                    filePath: ""
                },
                {
                    keywords_bn: ["দিনের শেষে তোমার সাথেই কথা বলি"],
                    keywords_en: ["talk to you at the end of the day"],
                    keywords_banglish: ["diner sheshe tomar sathei kotha boli"],
                    bn: "আমিও চাই,\nদিনটা\nতোমাকেই দিয়ে\nশেষ হোক। ❤️",
                    en: "I also want\nmy day to end\nwith you. ❤️",
                    banglish: "Amio chai,\ndinta\ntomakei diye\nshesh hok. ❤️",
                    filePath: ""
                },
                {
                    keywords_bn: ["ছোট ছোট জিনিসও সুন্দর লাগতে শুরু করেছে"],
                    keywords_en: ["little things started looking beautiful"],
                    keywords_banglish: ["choto choto jinish-o sundor lagte shuru koreche"],
                    bn: "কারণ\nএখন আমরা\nএকসাথে আছি। 💞",
                    en: "Because\nnow we are\ntogether. 💞",
                    banglish: "Karon\nekhon amra\nekksathe achi. 💞",
                    filePath: ""
                },
                {
                    keywords_bn: ["ভালোবাসি", "ভালোবাসো"],
                    keywords_en: ["love", "i love you"],
                    keywords_banglish: ["bhalobashi", "bhalobaso"],
                    bn: "🙈 ভালোবাসি বললেই তো হবে না, সারাজীবন এই হাতটা ধরে রাখতে পারবা তো?",
                    en: "Just saying I love you isn't enough, can you hold my hand for a lifetime?",
                    banglish: "Bhalobashi bollei to hobe na, sarajibon ei hatta dhore rakhte parba to?",
                    filePath: ""
                },
                {
                    keywords_bn: ["মিস করি", "মনে পড়ে"],
                    keywords_en: ["miss", "miss you"],
                    keywords_banglish: ["miss korchi", "mone pore"],
                    bn: "🥺 মনে যখন এতই পড়ে, সামনে এসে দাঁড়াচ্ছ না কেন?",
                    en: "If you miss me so much, why don't you come and stand in front of me?",
                    banglish: "Mone jokhon etoi pore, shamne eshe darachho na keno?",
                    filePath: ""
                },
                {
                    keywords_bn: ["কি করো", "কী করছো"],
                    keywords_en: ["what are you doing", "doing"],
                    keywords_banglish: ["ki korcho", "ki koro"],
                    bn: "🙈 তোমার একটা মেসেজের অপেক্ষায় বসে ছিলাম!",
                    en: "I was sitting and waiting for your message!",
                    banglish: "Tomar ekta messager opekkhae bose thaklam!",
                    filePath: ""
                },
                {
                    keywords_bn: ["রাগ করেছো", "রাগ"],
                    keywords_en: ["angry", "are you angry"],
                    keywords_banglish: ["rag korcho", "rag"],
                    bn: "🌹 একটু আদুরে কণ্ঠে ডাকলেই তো গলে যাবো!",
                    en: "Call me softly with love and I will melt!",
                    banglish: "Ektu adure konthe daklei to gole jabo!",
                    filePath: ""
                },
                {
                    keywords_bn: ["গালি", "খারাপ"],
                    keywords_en: ["bad word", "slang"],
                    keywords_banglish: ["gali", "bokachoda", "khankir"],
                    bn: "🥱 তোমার পারিবারিক শিক্ষার একটা সুন্দর ধারণা পেয়ে গেলাম!",
                    en: "Got a very clear idea about your family manners!",
                    banglish: "Tomar paribarik shikkhar ekta sundor dharona peye gelam!",
                    filePath: ""
                },
                {
                    keywords_bn: ["তোর বোন কে চুদি"],
                    keywords_en: ["i have sex with your sister"],
                    keywords_banglish: ["tor bon ke chudi"],
                    bn: "তার আগে তুমি আমাকে চুদো আমার অনেক ভালো লাগে আমি আর পারছি না সইতে 🥵",
                    en: "Before that, have sex with me. I like it a lot. I can't bear it anymore. 🥵",
                    banglish: "Tar age tumi amake chudo, amar onek bhalo lage. Ami ar parchhi na soite. 🥵",
                    filePath: ""
                },
                {
                    keywords_bn: ["তুই একটা মাগী"],
                    keywords_en: ["you're a whore"],
                    keywords_banglish: ["tui akta magi"],
                    bn: "তুই মাগী, তোর মা মাগী, খানকির পোলা।🤬",
                    en: "You're a whore, your mother is a whore, you son of a prostitute🤬.",
                    banglish: "Tui magi, tor ma magi, khankir pola.🤬",
                    filePath: ""
                },
                {
                    keywords_bn: ["তোর মাকে চুদি"],
                    keywords_en: ["i have sex with your mother"],
                    keywords_banglish: ["tor make chudi"],
                    bn: "তুমি আমাকে চুদো। অনেক মজা পাবে। আমার সাথে করলে যেটা পাবে, সেটা আমার মায়ের সাথে পাবে না, কারণ এখন উনি অনেক দুর্বল হয়ে গেছেন। 🥵",
                    en: "Have sex with me. You'll enjoy it a lot. What you'll experience with me, you won't experience with my mother because she has become very weak now. 🥵",
                    banglish: "Tumi amake chudo. Onek moja paba. Amar sathe korle jeta paba, seta amar mar sathe paba na, karon ekhon uni onek durbol hoye gechen. 🥵",
                    filePath: ""
                },
                {
                    keywords_bn: ["আমি যখন তোমাকে চুদি তখন তুমি কি রকম করো", "চুদি"],
                    keywords_en: ["what do you do when i have sex with you"],
                    keywords_banglish: ["ami jokhon tomake chudi tokhon tumi ki rokom koro"],
                    bn: "শোনো জান। ❤️",
                    en: "Listen, dear. ❤️",
                    banglish: "Shono jaan. ❤️",
                    filePath: "Ahhh lalit ke papa[THT].mp3"
                },
                {
                    keywords_bn: ["একটা গান শোনাও তো", "গান বলো"],
                    keywords_en: ["sing me a song", "sing a song"],
                    keywords_banglish: ["akta gaan shonao to", "gaan bolo"],
                    bn: "আচ্ছা, তাহলে তোমার জন্য একটা গান গাই। আশা করি ভালো লাগবে। 🎤🎶",
                    en: "Alright, here's a song for you. I hope you enjoy it. 🎤🎶",
                    banglish: "Accha, tahole tomar jonno akta gaan gai. Asha kori bhalo lagbe. 🎤🎶",
                    filePath: "Chandni raat song female voice [THT].mp3"
                },
                {
                    keywords_bn: ["গান শোনাও", "ভয়েস দাও"],
                    keywords_en: ["audio", "voice note"],
                    keywords_banglish: ["gan shonao", "voice dao"],
                    bn: "শোনো আমার মিষ্টি গলার গান! 🎶",
                    en: "Listen to my voice note! 🎶",
                    banglish: "Shono amar mishti golar gan! 🎶",
                    filePath: "cache/voice53.mp3"
                }
            ];

            let matchedItem = null;

            for (const item of customResponses) {
                const allKeywords = [
                    ...(item.keywords_bn || []),
                    ...(item.keywords_en || []),
                    ...(item.keywords_banglish || [])
                ];

                if (allKeywords.some(kw => cleanedMsg.includes(cleanText(kw)))) {
                    matchedItem = item;
                    break;
                }
            }

            let finalResponse = null;
            let mediaAttachment = [];

            if (matchedItem) {
                if (isBanglaText(rawMessage)) {
                    finalResponse = matchedItem.bn;
                } else if (isEnglishText(message)) {
                    finalResponse = matchedItem.en;
                } else {
                    finalResponse = matchedItem.banglish;
                }

                if (matchedItem.filePath && matchedItem.filePath.trim() !== "") {
                    const fullPath = path.resolve(matchedItem.filePath);
                    if (fs.existsSync(fullPath)) {
                        mediaAttachment.push(fs.createReadStream(fullPath));
                    }
                }
            }

            let userText = message;
            for (const prefix of mahmud) {
                if (message.startsWith(prefix)) {
                    userText = message.substring(prefix.length).trim();
                    break;
                }
            }

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

            const messageObject = {
                body: finalResponse
            };

            if (mediaAttachment.length > 0) {
                messageObject.attachment = mediaAttachment;
            }

            api.sendMessage(messageObject, event.threadID, (err, info) => {
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
