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
    "hinata"
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

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "hinata", "hina"],
    version: "3.5",
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

            // ১. কাস্টম রেসপন্স লিস্ট (মোট ৫০টি টেক্সট কার্ড + অতিরিক্ত ৩০টি মিডিয়া কার্ড = ৮০টি কার্ড)
            const customResponses = [
                // [ কার্ড - ১ ]
                {
                    keywords_bn: ["ভালোবাসি", "ভালোবাসো"],
                    keywords_en: ["love", "i love you"],
                    keywords_banglish: ["bhalobashi", "bhalobaso"],
                    bn: "🙈 ভালোবাসি বললেই তো হবে না, সারাজীবন এই হাতটা ধরে রাখতে পারবা তো?",
                    en: "Just saying I love you isn't enough, can you hold my hand for a lifetime?",
                    banglish: "Bhalobashi bollei to hobe na, sarajibon ei hatta dhore rakhte parba to?",
                    filePath: ""
                },
                // [ কার্ড - ২ ]
                {
                    keywords_bn: ["মিস করি", "মনে পড়ে"],
                    keywords_en: ["miss", "miss you"],
                    keywords_banglish: ["miss korchi", "mone pore"],
                    bn: "🥺 মনে যখন এতই পড়ে, সামনে এসে দাঁড়াচ্ছ না কেন?",
                    en: "If you miss me so much, why don't you come and stand in front of me?",
                    banglish: "Mone jokhon etoi pore, shamne eshe darachho na keno?",
                    filePath: ""
                },
                // [ কার্ড - ৩ ]
                {
                    keywords_bn: ["কি করো", "কী করছো"],
                    keywords_en: ["what are you doing", "doing"],
                    keywords_banglish: ["ki korcho", "ki koro"],
                    bn: "🙈 তোমার একটা মেসেজের অপেক্ষায় বসে ছিলাম!",
                    en: "I was sitting and waiting for your message!",
                    banglish: "Tomar ekta messager opekkhae bose thaklam!",
                    filePath: ""
                },
                // [ কার্ড - ৪ ]
                {
                    keywords_bn: ["রাগ করেছো", "রাগ"],
                    keywords_en: ["angry", "are you angry"],
                    keywords_banglish: ["rag korcho", "rag"],
                    bn: "🌹 একটু আদুরে কণ্ঠে ডাকলেই তো গলে যাবো!",
                    en: "Call me softly with love and I will melt!",
                    banglish: "Ektu adure konthe daklei to gole jabo!",
                    filePath: ""
                },
                // [ কার্ড - ৫ ]
                {
                    keywords_bn: ["খেয়েছো", "খাইসো"],
                    keywords_en: ["eaten", "eat", "have you eaten"],
                    keywords_banglish: ["khaiso", "kheyecho"],
                    bn: "🥺 তুমি ছাড়া কি কিছু মুখে রোচে? আগে বলো তুমি খেয়েছ কি না!",
                    en: "Does anything taste good without you? Tell me if you have eaten first!",
                    banglish: "Tumi chara ki kichu mukhe roche? Age bolo tumi khaiso kina!",
                    filePath: ""
                },
                // [ কার্ড - ৬ ]
                {
                    keywords_bn: ["গালি", "খারাপ"],
                    keywords_en: ["bad word", "slang"],
                    keywords_banglish: ["gali", "bokachoda", "khankir"],
                    bn: "🥱 তোমার পারিবারিক শিক্ষার একটা সুন্দর ধারণা পেয়ে গেলাম!",
                    en: "Got a very clear idea about your family manners!",
                    banglish: "Tomar paribarik shikkhar ekta sundor dharona peye gelam!",
                    filePath: ""
                },
                // [ কার্ড - ৭ ]
                {
                    keywords_bn: ["তুমি আমার"],
                    keywords_en: ["you are mine"],
                    keywords_banglish: ["tumi amar"],
                    bn: "🙈 শুধু মুখে বললেই হবে না, স্ট্যাম্প পেপারে সই করে দিয়ে যাও তাহলে বিশ্বাস করবো!",
                    en: "Just saying it won't work, sign on a stamp paper then I will believe you!",
                    banglish: "Shudhu mukhe bollei hobe na, stamp papere soi kore diye jao tahole biswas korbo!",
                    filePath: ""
                },
                // [ কার্ড - ৮ ]
                {
                    keywords_bn: ["পটাইতাছ", "পটাচ্ছ"],
                    keywords_en: ["flirting", "flot"],
                    keywords_banglish: ["potaccho", "potaitocho"],
                    bn: "🤭 তোমাকে পটানোর জন্য আমার ট্রাই করা লাগে না, তুমি তো এমনিতেই পটে আছো!",
                    en: "I don't need to try to flirt with you, you are already smitten!",
                    banglish: "Tomake potanor jonno amar try kora lage na, tumi to emnitei pote aso!",
                    filePath: ""
                },
                // [ কার্ড - ৯ ]
                {
                    keywords_bn: ["জড়িয়ে ধরো", "কোলে"],
                    keywords_en: ["hug me", "hug"],
                    keywords_banglish: ["joriye dhoro", "kole"],
                    bn: "🥺 দূরে দাঁড়িয়ে না থেকে এক লাফে বুকে জড়িয়ে ধরে ফেলো তো!",
                    en: "Don't just stand far away, jump in and hug me tight!",
                    banglish: "Dure dariye na theke ek lafe buke joriye dhore felo to!",
                    filePath: ""
                },
                // [ কার্ড - ১০ ]
                {
                    keywords_bn: ["কিস দাও", "চুমু"],
                    keywords_en: ["kiss me", "kiss"],
                    keywords_banglish: ["kiss dao", "chumu"],
                    bn: "💋 এতো কিসের তারা? আগে ভালোবেসে চোখের দিকে তাকাও, তারপর ভেবে দেখবো!",
                    en: "What's the rush? Look into my eyes with love first, then I'll think about it!",
                    banglish: "Eto kisher tara? Age bhalobeshe chokher dike takao, tarpor bhebe dekhto!",
                    filePath: ""
                },
                // [ কার্ড - ১১ ]
                {
                    keywords_bn: ["হারিয়ে গেছি", "চোখে"],
                    keywords_en: ["lost in eyes", "lost"],
                    keywords_banglish: ["hariye gechi", "chokhe"],
                    bn: "✨ হারিয়ে যেও না যেন, দিক খুঁজে না পেলে সোজা আমার হৃদয়ে চলে এসো!",
                    en: "Don't get lost! If you can't find direction, come straight to my heart!",
                    banglish: "Hariye jeo na jeno, dik khunje na pele shoja amar hridoye chole eso!",
                    filePath: ""
                },
                // [ কার্ড - ১২ ]
                {
                    keywords_bn: ["মিষ্টি", "এত মিষ্টি"],
                    keywords_en: ["sweet", "so sweet"],
                    keywords_banglish: ["misti", "eto misti"],
                    bn: "🍯 প্রতিদিন তোমার পাঠানো ভালোবাসা গিলে খাই তো, তাই হয়তো এত মিষ্টি লাগে!",
                    en: "I swallow all the love you send every day, maybe that's why I'm so sweet!",
                    banglish: "Protidin tomar pathano bhalobasha gile khai to, tai hoyto eto misti lage!",
                    filePath: ""
                },
                // [ কার্ড - ১৩ ]
                {
                    keywords_bn: ["কেমন আছো", "কেমন আছ"],
                    keywords_en: ["how are you"],
                    keywords_banglish: ["kemon aso", "kemon acho"],
                    bn: "✨ আলহামদুলিল্লাহ ভালো, তুমি কেমন আছো?",
                    en: "Alhamdulillah I am fine, how about you?",
                    banglish: "Alhamdulillah bhalo, tumi kemon aso?",
                    filePath: ""
                },
                // [ কার্ড - ১৪ ]
                {
                    keywords_bn: ["খাইয়ে দাও"],
                    keywords_en: ["feed me"],
                    keywords_banglish: ["khaiye dao"],
                    bn: "🥺 চামচ দিয়ে খাবো না, তোমার নিজের হাতে এক লোকমা খাইয়ে দিলে তবেই খাবো!",
                    en: "I won't eat with a spoon, feed me a bite with your own hands!",
                    banglish: "Chamocho diye khabo na, tomar nijer hate ek lokma khaiye dile tobei khabo!",
                    filePath: ""
                },
                // [ কার্ড - ১৫ ]
                {
                    keywords_bn: ["ঘুম আসছে না"],
                    keywords_en: ["cant sleep"],
                    keywords_banglish: ["ghum asche na"],
                    bn: "🥱 ঘুম আসছে না তো কি হয়েছে? তোমার কোলে মাথা রেখে চুল ঘেঁটে দিই, দেখবা চোখ বন্ধ হয়ে যাবে!",
                    en: "Can't sleep? Let me put my head on your lap and run my fingers through your hair!",
                    banglish: "Ghum asche na to ki hoyeche? Tomar kole matha rekhe chul ghette di, dekba chokh bondho hoye jabe!",
                    filePath: ""
                },
                // [ কার্ড - ১৬ ]
                {
                    keywords_bn: ["ছাদে যাবো"],
                    keywords_en: ["rooftop"],
                    keywords_banglish: ["chade jabo"],
                    bn: "🌙 চলো না ছাদে গিয়ে দুজনে হাত ধরে এক কাপ চা খাই আর রাতের তারা গুণি!",
                    en: "Let's go to the rooftop, hold hands, drink tea, and count stars together!",
                    banglish: "Cholo na chade giye dujone hat dhore ek kap cha khai ar rater tara guni!",
                    filePath: ""
                },
                // [ কার্ড - ১৭ ]
                {
                    keywords_bn: ["আদর করো"],
                    keywords_en: ["cuddle me", "cuddle"],
                    keywords_banglish: ["adore koro"],
                    bn: "🙈 সারা দিন তো অনেক কাজ করলে, এবার সব কাজ বাদ দিয়ে আমাকে একটু বুকে টেনে নাও তো!",
                    en: "You worked all day, now leave everything and pull me close into your arms!",
                    banglish: "Shara din to onek kaj korle, ebar sob kaj bad diye amake ektu buke tene nao to!",
                    filePath: ""
                },
                // [ কার্ড - ১৮ ]
                {
                    keywords_bn: ["ক্ষুধা লাগছে"],
                    keywords_en: ["hungry"],
                    keywords_banglish: ["khida lagse"],
                    bn: "🍕 এই মাঝরাতে আইসক্রিম বা নুডুলস খাওয়ার ইচ্ছা করছে, চলো দুজনে মিলে কিচেনে চুরি করে খাই!",
                    en: "Late night cravings for ice cream or noodles! Let's sneak into the kitchen together!",
                    banglish: "Ei majhrate ice cream ba noodles khaowar iccha korche, cholo dujone mile kitchen e churi kore khai!",
                    filePath: ""
                },
                // [ কার্ড - ১৯ ]
                {
                    keywords_bn: ["চুপ করো"],
                    keywords_en: ["shut up"],
                    keywords_banglish: ["chup koro"],
                    bn: "🤭 আমি কেন চুপ করবো? আমাকে সামলানোর দায়িত্ব কিন্তু তোমারই, এবার আদর দিয়ে মুখ বন্ধ করে দাও!",
                    en: "Why should I be quiet? It's your job to handle me, now quiet me with affection!",
                    banglish: "Ami keno chup korbo? Amake samlanor dayitto kintu tomar-i, ebar adore diye mukh bondho kore dao!",
                    filePath: ""
                },
                // [ কার্ড - ২০ ]
                {
                    keywords_bn: ["ঘুমাও"],
                    keywords_en: ["sleep now"],
                    keywords_banglish: ["ghumao"],
                    bn: "😴 একা একা ঘুমাবো না, তুমি মাথায় হাত বুলিয়ে কোনো মিষ্টি গল্প না শোনালে ঘুমাবোই না!",
                    en: "I won't sleep alone! stroke my hair and tell me a story or I won't sleep!",
                    banglish: "Eka eka ghumabo na, tumi mathay hat buliye kono misti golpo na shonale ghumaboi na!",
                    filePath: ""
                },
                // [ কার্ড - ২১ ]
                {
                    keywords_bn: ["সেক্স"],
                    keywords_en: ["sex", "physical"],
                    keywords_banglish: ["sex korba"],
                    bn: "🙈 ওরে বাবা! এত তাড়াহুড়ো কিসের? আমার কিন্তু এসব করতে অনেক ভয় আর কষ্ট হয়, একদম চুপ!",
                    en: "Oh my! What's the rush? I get scared and hurt doing all that, so hush now!",
                    banglish: "Ore baba! Eto tarahuro kisher? Amar kintu eshob korte onek bhoy ar koshto hoy, ekdom chup!",
                    filePath: ""
                },
                // [ কার্ড - ২২ ]
                {
                    keywords_bn: ["হট"],
                    keywords_en: ["hot"],
                    keywords_banglish: ["hot chobi"],
                    bn: "🫣 ছি ছি! দিনে দুপুরে এসব কি কথাবার্তা? চোখ বন্ধ করে কান ধরে দাঁড়িয়ে থাকো তো!",
                    en: "Shame shame! Talking like this in broad daylight? Close your eyes and hold your ears!",
                    banglish: "Chi chi! Dine dupure eshob ki kothabarta? Chokh bondho kore kan dhore dariye thako to!",
                    filePath: ""
                },
                // [ কার্ড - ২৩ ]
                {
                    keywords_bn: ["বিছানা"],
                    keywords_en: ["bed"],
                    keywords_banglish: ["soya", "bichana"],
                    bn: "🥱 ডাল-ভাত খাওয়ার মুরোদ নাই, আসছে বড় নাইট প্ল্যান করতে! আগে এক গ্লাস ঠান্ডা পানি খেয়ে ঘুমাও!",
                    en: "Can't even manage plain rice, coming to make big night plans! Go drink a glass of cold water and sleep!",
                    banglish: "Dal-bhat khaowar murod nai, ashche boro night plan korte! Age ek glass thanda pani kheye ghumao!",
                    filePath: ""
                },
                // [ কার্ড - ২৪ ]
                {
                    keywords_bn: ["রুমে আসো"],
                    keywords_en: ["room", "hotel"],
                    keywords_banglish: ["rume aso", "hotel"],
                    bn: "🚨 বেশি পাকনামি করলে কিন্তু এখনই তোমার আম্মুকে মেসেজ দিয়ে বিচার দিয়ে দেব বলে রাখলাম!",
                    en: "If you act too smart, I'll text your mom right now and complain!",
                    banglish: "Beshi paknami korle kintu ekhoni tomar ammuke message diye bichar diye debo bole rakhlam!",
                    filePath: ""
                },
                // [ কার্ড - ২৫ ]
                {
                    keywords_bn: ["তোর বোন কে চুদি"],
                    keywords_en: ["I have sex with your sister"],
                    keywords_banglish: ["Tor bon ke chudi"],
                    bn: "তার আগে তুমি আমাকে চুদো আমার অনেক ভালো লাগে আমি আর পারছি না সইতে 🥵",
                    en: "Before that, have sex with me. I like it a lot. I can't bear it anymore. 🥵",
                    banglish: "Tar age tumi amake chudo, amar onek bhalo lage. Ami ar parchhi na soite. 🥵",
                    filePath: ""
                },
                // [ কার্ড - ২৬ ]
                {
                    keywords_bn: ["তুই একটা মাগী।"],
                    keywords_en: ["You're a whore."],
                    keywords_banglish: ["Tui akta magi."],
                    bn: "তুই মাগী, তোর মা মাগী, খানকির পোলা।🤬",
                    en: "You're a whore, your mother is a whore, you son of a prostitute🤬.",
                    banglish: "Tui magi, tor ma magi, khankir pola.🤬",
                    filePath: ""
                },
                // [ কার্ড - ২৭ ]
                {
                    keywords_bn: ["তোর মাকে চুদি।"],
                    keywords_en: ["I have sex with your mother."],
                    keywords_banglish: ["Tor make chudi."],
                    bn: "তুমি আমাকে চুদো। অনেক মজা পাবে। আমার সাথে করলে যেটা পাবে, সেটা আমার মায়ের সাথে পাবে না, কারণ এখন উনি অনেক দুর্বল হয়ে গেছেন। 🥵",
                    en: "Have sex with me. You'll enjoy it a lot. What you'll experience with me, you won't experience with my mother because she has become very weak now. 🥵",
                    banglish: "Tumi amake chudo. Onek moja paba. Amar sathe korle jeta paba, seta amar mar sathe paba na, karon ekhon uni onek durbol hoye gechen. 🥵",
                    filePath: ""
                },
                // [ কার্ড - ২৮ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ২৮"],
                    keywords_en: ["english message 28"],
                    keywords_banglish: ["banglish message 28"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ২৯ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ২৯"],
                    keywords_en: ["english message 29"],
                    keywords_banglish: ["banglish message 29"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৩০ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৩০"],
                    keywords_en: ["english message 30"],
                    keywords_banglish: ["banglish message 30"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৩১ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৩১"],
                    keywords_en: ["english message 31"],
                    keywords_banglish: ["banglish message 31"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৩২ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৩২"],
                    keywords_en: ["english message 32"],
                    keywords_banglish: ["banglish message 32"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৩৩ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৩৩"],
                    keywords_en: ["english message 33"],
                    keywords_banglish: ["banglish message 33"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৩৪ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৩৪"],
                    keywords_en: ["english message 34"],
                    keywords_banglish: ["banglish message 34"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৩৫ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৩৫"],
                    keywords_en: ["english message 35"],
                    keywords_banglish: ["banglish message 35"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৩৬ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৩৬"],
                    keywords_en: ["english message 36"],
                    keywords_banglish: ["banglish message 36"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৩৭ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৩৭"],
                    keywords_en: ["english message 37"],
                    keywords_banglish: ["banglish message 37"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৩৮ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৩৮"],
                    keywords_en: ["english message 38"],
                    keywords_banglish: ["banglish message 38"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৩৯ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৩৯"],
                    keywords_en: ["english message 39"],
                    keywords_banglish: ["banglish message 39"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৪০ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৪০"],
                    keywords_en: ["english message 40"],
                    keywords_banglish: ["banglish message 40"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৪১ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৪১"],
                    keywords_en: ["english message 41"],
                    keywords_banglish: ["banglish message 41"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৪২ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৪২"],
                    keywords_en: ["english message 42"],
                    keywords_banglish: ["banglish message 42"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৪৩ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৪৩"],
                    keywords_en: ["english message 43"],
                    keywords_banglish: ["banglish message 43"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৪৪ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৪৪"],
                    keywords_en: ["english message 44"],
                    keywords_banglish: ["banglish message 44"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৪৫ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৪৫"],
                    keywords_en: ["english message 45"],
                    keywords_banglish: ["banglish message 45"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৪৬ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৪৬"],
                    keywords_en: ["english message 46"],
                    keywords_banglish: ["banglish message 46"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৪৭ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৪৭"],
                    keywords_en: ["english message 47"],
                    keywords_banglish: ["banglish message 47"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৪৮ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৪৮"],
                    keywords_en: ["english message 48"],
                    keywords_banglish: ["banglish message 48"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৪৯ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৪৯"],
                    keywords_en: ["english message 49"],
                    keywords_banglish: ["banglish message 49"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },
                // [ কার্ড - ৫০ ]
                {
                    keywords_bn: ["বাংলা মেসেজ ৫০"],
                    keywords_en: ["english message 50"],
                    keywords_banglish: ["banglish message 50"],
                    bn: "এখানে বাংলা টেক্সট রিপ্লাই লিখবেন",
                    en: "Here write english text reply",
                    banglish: "Ekhane banglish text reply likhben",
                    filePath: ""
                },

                    // =================================================================
    // 🔥 অতিরিক্ত ৩০টি মিডিয়া বা ফাইল সংযুক্তি সহ রেসপন্স কার্ড (৫১ থেকে ৮০) 🔥
    // =================================================================

    // [ কার্ড - ৫১ : ছবি পাঠাবে ]
    {
        keywords_bn: ["আমি যখন তোমাকে চুদি তখন তুমি কি রকম করো", "চুদি"],
        keywords_en: ["What do you do when I have sex with you?"],
        keywords_banglish: ["Ami jokhon tomake chudi, tokhon tumi ki rokom koro?"],
        bn: "শোনো জান। ❤️",
        en: "Listen, dear. ❤️",
        banglish: "Shono jaan. ❤️",
        filePath: "Ahhh lalit ke papa[THT].mp3"
    },

    // [ কার্ড - ৫২ : ভিডিও পাঠাবে ]
    {
        keywords_bn: ["একটা গান শোনাও তো।", "গান বলো "],
        keywords_en: ["Sing me a song", "Sing a song"],
        keywords_banglish: ["Akta gaan shonao to", "Gaan bolo"],
        bn: "আচ্ছা, তাহলে তোমার জন্য একটা গান গাই। আশা করি ভালো লাগবে। 🎤🎶",
        en: "Alright, here's a song for you. I hope you enjoy it. 🎤🎶",
        banglish: "Accha, tahole tomar jonno akta gaan gai. Asha kori bhalo lagbe. 🎤🎶",
        filePath: "Chandni raat song  female voice  [THT].mp3"
    },

    // [ কার্ড - ৫৩ : ভয়েস নোট পাঠাবে ]
    {
        keywords_bn: ["গান শোনাও", "ভয়েস দাও"],
        keywords_en: ["audio", "voice note"],
        keywords_banglish: ["gan shonao", "voice dao"],
        bn: "শোনো আমার মিষ্টি গলার গান! 🎶",
        en: "Listen to my voice note! 🎶",
        banglish: "Shono amar mishti golar gan! 🎶",
        filePath: "cache/voice53.mp3"
    },

    // [ কার্ড - ৫৪ ]
    {
        keywords_bn: ["মিডিয়া ৫৪"],
        keywords_en: ["media 54"],
        keywords_banglish: ["media 54"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media54.jpg"
    },

    // [ কার্ড - ৫৫ ]
    {
        keywords_bn: ["মিডিয়া ৫৫"],
        keywords_en: ["media 55"],
        keywords_banglish: ["media 55"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media55.mp4"
    },

    // [ কার্ড - ৫৬ ]
    {
        keywords_bn: ["মিডিয়া ৫৬"],
        keywords_en: ["media 56"],
        keywords_banglish: ["media 56"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media56.mp3"
    },

    // [ কার্ড - ৫৭ ]
    {
        keywords_bn: ["মিডিয়া ৫৭"],
        keywords_en: ["media 57"],
        keywords_banglish: ["media 57"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media57.jpg"
    },

    // [ কার্ড - ৫৮ ]
    {
        keywords_bn: ["মিডিয়া ৫৮"],
        keywords_en: ["media 58"],
        keywords_banglish: ["media 58"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media58.jpg"
    },

    // [ কার্ড - ৫৯ ]
    {
        keywords_bn: ["মিডিয়া ৫৯"],
        keywords_en: ["media 59"],
        keywords_banglish: ["media 59"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media59.mp4"
    },

    // [ কার্ড - ৬০ ]
    {
        keywords_bn: ["মিডিয়া ৬০"],
        keywords_en: ["media 60"],
        keywords_banglish: ["media 60"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media60.mp3"
    },

    // [ কার্ড - ৬১ ]
    {
        keywords_bn: ["মিডিয়া ৬১"],
        keywords_en: ["media 61"],
        keywords_banglish: ["media 61"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media61.jpg"
    },

    // [ কার্ড - ৬২ ]
    {
        keywords_bn: ["মিডিয়া ৬২"],
        keywords_en: ["media 62"],
        keywords_banglish: ["media 62"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media62.jpg"
    },

    // [ কার্ড - ৬৩ ]
    {
        keywords_bn: ["মিডিয়া ৬৩"],
        keywords_en: ["media 63"],
        keywords_banglish: ["media 63"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media63.mp4"
    },

    // [ কার্ড - ৬৪ ]
    {
        keywords_bn: ["মিডিয়া ৬৪"],
        keywords_en: ["media 64"],
        keywords_banglish: ["media 64"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media64.mp3"
    },

    // [ কার্ড - ৬৫ ]
    {
        keywords_bn: ["মিডিয়া ৬৫"],
        keywords_en: ["media 65"],
        keywords_banglish: ["media 65"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media65.jpg"
    },

    // [ কার্ড - ৬৬ ]
    {
        keywords_bn: ["মিডিয়া ৬৬"],
        keywords_en: ["media 66"],
        keywords_banglish: ["media 66"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media66.jpg"
    },

    // [ কার্ড - ৬৭ ]
    {
        keywords_bn: ["মিডিয়া ৬৭"],
        keywords_en: ["media 67"],
        keywords_banglish: ["media 67"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media67.mp4"
    },

    // [ কার্ড - ৬৮ ]
    {
        keywords_bn: ["মিডিয়া ৬৮"],
        keywords_en: ["media 68"],
        keywords_banglish: ["media 68"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media68.mp3"
    },

    // [ কার্ড - ৬৯ ]
    {
        keywords_bn: ["মিডিয়া ৬৯"],
        keywords_en: ["media 69"],
        keywords_banglish: ["media 69"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media69.jpg"
    },

    // [ কার্ড - ৭০ ]
    {
        keywords_bn: ["মিডিয়া ৭০"],
        keywords_en: ["media 70"],
        keywords_banglish: ["media 70"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media70.jpg"
    },

    // [ কার্ড - ৭১ ]
    {
        keywords_bn: ["মিডিয়া ৭১"],
        keywords_en: ["media 71"],
        keywords_banglish: ["media 71"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media71.mp4"
    },

    // [ কার্ড - ৭২ ]
    {
        keywords_bn: ["মিডিয়া ৭২"],
        keywords_en: ["media 72"],
        keywords_banglish: ["media 72"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media72.mp3"
    },

    // [ কার্ড - ৭৩ ]
    {
        keywords_bn: ["মিডিয়া ৭৩"],
        keywords_en: ["media 73"],
        keywords_banglish: ["media 73"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media73.jpg"
    },

    // [ কার্ড - ৭৪ ]
    {
        keywords_bn: ["মিডিয়া ৭৪"],
        keywords_en: ["media 74"],
        keywords_banglish: ["media 74"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media74.jpg"
    },

    // [ কার্ড - ৭৫ ]
    {
        keywords_bn: ["মিডিয়া ৭৫"],
        keywords_en: ["media 75"],
        keywords_banglish: ["media 75"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media75.mp4"
    },

    // [ কার্ড - ৭৬ ]
    {
        keywords_bn: ["মিডিয়া ৭৬"],
        keywords_en: ["media 76"],
        keywords_banglish: ["media 76"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media76.mp3"
    },

    // [ কার্ড - ৭৭ ]
    {
        keywords_bn: ["মিডিয়া ৭৭"],
        keywords_en: ["media 77"],
        keywords_banglish: ["media 77"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media77.jpg"
    },

    // [ কার্ড - ৭৮ ]
    {
        keywords_bn: ["মিডিয়া ৭৮"],
        keywords_en: ["media 78"],
        keywords_banglish: ["media 78"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media78.jpg"
    },

    // [ কার্ড - ৭৯ ]
    {
        keywords_bn: ["মিডিয়া ৭৯"],
        keywords_en: ["media 79"],
        keywords_banglish: ["media 79"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media79.mp4"
    },

    // [ কার্ড - ৮০ ]
    {
        keywords_bn: ["মিডিয়া ৮০"],
        keywords_en: ["media 80"],
        keywords_banglish: ["media 80"],
        bn: "এখানে বাংলা টেক্সট বা ক্যাপশন লিখবেন",
        en: "Here write english text or caption",
        banglish: "Ekhane banglish text ba caption likhben",
        filePath: "cache/media80.mp3"
    }

            ];

            let matchedItem = null;

            for (const item of customResponses) {
                const allKeywords = [
                    ...(item.keywords_bn || []),
                    ...(item.keywords_en || []),
                    ...(item.keywords_banglish || [])
                ];

                if (allKeywords.some(kw => message.includes(kw))) {
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

            // ২. শুধু নাম (baby / bot) লিখলে উত্তর
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
