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
    "hinata",
];

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "hinata", "hina"],
    version: "1.7",
    author: "MahMUD",
    countDown: 0,
    role: 0,
    description: "better then all sim simi & most fastest",
    category: "chat",
    guide: {
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR \nall OR\nedit [YourMessage] - [NeWMessage]\nNote: The most updated and fastest all-in-one Simi Chat"
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
            const helpMenu = `👑 ═══════ ❪ LALA BOT MENU ❫ ═══════ 👑
✨ Welcome to the VIP Command Directory! ✨
───────────────────────────

📌 🛠️ MAIN COMMANDS (মূল কমান্ডসমূহ)
• !baby help ➔ ভিআইপি হেল্প মেনু দেখা।
• !baby teach [প্রশ্ন] - [উত্তর] ➔ বটকে নতুন প্রশ্ন শেখানো।
• !baby remove [প্রশ্ন] - [ইনডেক্স] ➔ উত্তর মুছে ফেলা।
• !baby edit [পুরোনো] - [নতুন] ➔ উত্তর এডিট করা।
• !baby list / list all ➔ শেখানো উত্তরের তালিকা বা লিডারবোর্ড।

───────────────────────────
📌 💕 ROMANTIC & RESPONSES (তিন ভাষার সাপোর্ট)

1. I Love You / ভালোবাসি / Bhalobashi:
   • Bangla: 🙈 হুট করে এত ভালোবাসা কোত্থেকে আসলো?
   • Banglish: Hut kore eto bhalobasha koththoke ashlo?
   • English: Suddenly so much love coming from where?

2. Miss You / মিস করি / Miss korchi:
   • Bangla: 🥺 মনে যখন এতই পড়ে, সামনে এসে দাঁড়াচ্ছ না কেন?
   • Banglish: Mone jokhon etoi pore, shamne eshe darachho na keno?
   • English: If you miss me so much, why not stand in front of me?

3. Ki korcho / কী করো / What are you doing:
   • Bangla: 🙈 তোমার একটা মেসেজের অপেক্ষায় বসে ছিলাম!
   • Banglish: Tomar ekta messager opekkhae bose thaklam!
   • English: I was waiting for your message!

4. Rag korcho / রাগ করছো / Are you angry:
   • Bangla: 🌹 একটু আদুরে কণ্ঠে ডাকলেই তো গলে যাবো!
   • Banglish: Ektu adure konthe daklei to gole jabo!
   • English: Call me softly and I will melt!

5. Khaiso / খাইসো / Have you eaten:
   • Bangla: 🥺 তুমি ছাড়া কি কিছু মুখে রোচে? তুমি খাইসো?
   • Banglish: Tumi chara ki kichu mukhe roche? Tumi khaiso?
   • English: Does anything taste good without you? Did you eat?

6. Bad Words / গালিগালাজ / Abuse:
   • Bangla: 🥱 তোমার পারিবারিক শিক্ষার একটা সুন্দর ধারণা পেয়ে গেলাম!
   • Banglish: Tomar paribarik shikkhar ekta sundor dharona peye gelam!
   • English: Got a clear idea about your family manner!

───────────────────────────
👑 Designed & Managed by: LALA ADMIN`;
            return api.sendMessage(helpMenu, event.threadID, event.messageID);
        }

        if (args[0] === "teach") {
            const mahmudStr = msg.replace("teach ", "");
            const [trigger, ...responsesArr] = mahmudStr.split(" - ");
            const responses = responsesArr.join(" - ");
            if (!trigger || !responses) return api.sendMessage("❌ | teach [question] - [response1, response2,...]", event.threadID, event.messageID);
            const response = await axios.post(`${await baseApiUrl()}/api/jan/teach`, { trigger, responses, userID: uid });
            const userName = (await usersData.getName(uid)) || "Unknown User";
            return api.sendMessage(`✅ Replies added: "${responses}" to "${trigger}"\n• 𝐓𝐞𝐚𝐜𝐡𝐞𝐫: ${userName}\n• 𝐓𝐨𝐭𝐚𝐥: ${response.data.count || 0}`, event.threadID, event.messageID);
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
            message += `${i + 1}. ${name}: ${count}\n`; } return api.sendMessage(message, event.threadID, event.messageID);  }
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

        if (args[0] === "msg") {
            const searchTrigger = args.slice(1).join(" ");
            if (!searchTrigger) return api.sendMessage("Please provide a message to search.", event.threadID, event.messageID);
            try {
            const response = await axios.get(`${await baseApiUrl()}/api/jan/msg`, { params: { userMessage: `msg ${searchTrigger}` } });
            return api.sendMessage(response.data.message || "No message found.", event.threadID, event.messageID);
            } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "error";
            return api.sendMessage(errorMessage, event.threadID, event.messageID);
            }
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
        api.sendMessage(`Error${err.response?.data || err.message}`, event.threadID, event.messageID);
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
        const message = event.body?.toLowerCase() || "";
        const attachments = event.attachments || [];

        if (event.type !== "message_reply" && mahmud.some(word => message.startsWith(word))) {
            api.setMessageReaction("🪽", event.messageID, () => { }, true);
            api.sendTypingIndicator(event.threadID, true);
            
            const messageParts = message.trim().split(/\s+/);

            // কাস্টম ৩-স্টেপ রিপ্লাই ডেটাবেজ (Bangla, Banglish, English)
            const customResponses = [
                {
                    keywords: ["love", "ভালোবাসি", "bhalobashi"],
                    responses: [
                        "🙈 হুট করে এত ভালোবাসা কোত্থেকে আসলো? নাকি কিছু চাও?",
                        "Hut kore eto bhalobasha koththoke ashlo? Naki kichu chao?",
                        "Suddenly so much love coming from where? Or do you want something?"
                    ]
                },
                {
                    keywords: ["miss", "মিস", "miss korchi"],
                    responses: [
                        "🥺 মনে যখন এতই পড়ে, সামনে এসে দাঁড়াচ্ছ না কেন?",
                        "Mone jokhon etoi pore, shamne eshe darachho na keno?",
                        "If you miss me so much, why don't you come and stand in front of me?"
                    ]
                },
                {
                    keywords: ["korcho", "করো", "doing"],
                    responses: [
                        "🙈 তোমার একটা মেসেজের অপেক্ষায় বসে ছিলাম!",
                        "Tomar ekta messager opekkhae bose thaklam!",
                        "I was sitting and waiting for your message!"
                    ]
                },
                {
                    keywords: ["rag", "রাগ", "angry"],
                    responses: [
                        "🌹 একটু আদুরে কণ্ঠে ডাকলেই তো গলে যাবো!",
                        "Ektu adure konthe daklei to gole jabo!",
                        "Call me with a sweet voice and I will melt!"
                    ]
                },
                {
                    keywords: ["khaiso", "খাইসো", "eaten", "eat"],
                    responses: [
                        "🥺 তুমি ছাড়া কি কিছু মুখে রোচে? আগে বলো তুমি খেয়েছ কি না!",
                        "Tumi chara ki kichu mukhe roche? Age bolo tumi khaiso kina!",
                        "Does anything taste good without you? Tell me if you have eaten first!"
                    ]
                },
                {
                    keywords: ["bokachoda", "khankir", "gali", "খারাপ"],
                    responses: [
                        "🥱 তোমার পারিবারিক শিক্ষার একটা সুন্দর ধারণা পেয়ে গেলাম!",
                        "Tomar paribarik shikkhar ekta sundor dharona peye gelam!",
                        "Got a very nice idea about your family manner!"
                    ]
                }
            ];

            let matchedReply = null;
            for (const item of customResponses) {
                if (item.keywords.some(kw => message.includes(kw))) {
                    matchedReply = item.responses[Math.floor(Math.random() * item.responses.length)];
                    break;
                }
            }

            const randomMessage = matchedReply ? [matchedReply] : [
                "👋 Hello, bolo ki khobor? / Hello, বলো কী খবর?",
                "✨ Alhumdulillah bhalo, tumi kemon aso? / আলহামদুলিল্লাহ ভালো, তুমি কেমন আছো?",
                "🎮 Boro boro kotha na bole cholo adda di! / বড় বড় কথা না বলে চলো আড্ডা দিই!"
            ];

            const hinataMessage = randomMessage[Math.floor(Math.random() * randomMessage.length)];

            if (messageParts.length === 1 && attachments.length === 0) {
               api.sendMessage(hinataMessage, event.threadID, (err, info) => {
                    if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                           commandName: this.config.name,
                           type: "reply",
                           messageID: info.messageID,
                           author: event.senderID,
                           text: hinataMessage
                        });
                    }
                }, event.messageID);
            } else {
                let userText = message;
                for (const prefix of mahmud) {
                    if (message.startsWith(prefix)) {
                        userText = message.substring(prefix.length).trim();
                        break;
                    }
                }

                const getBotResponse = async (text, attachments) => {
                    try {
                        const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { text, style: 3, attachments });
                        return res.data.message;
                    } catch {
                        return "error baby🥹";
                    }
                };

                const botResponse = matchedReply || await getBotResponse(userText, attachments);
                api.sendMessage(botResponse, event.threadID, (err, info) => {
                    if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                           commandName: this.config.name,
                           type: "reply",
                           messageID: info.messageID,
                           author: event.senderID,
                           text: botResponse
                        });
                    }
                }, event.messageID);
            }
        }
    } catch (err) {
        console.error(err);
    }
};
