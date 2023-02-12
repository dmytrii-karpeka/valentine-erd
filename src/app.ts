import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import { checkInitialization } from './checkInitialization';
import { getMonamurID } from './getMonamurID';
import { insertText } from './insertTextIntoDB';

const dotenv = require("dotenv");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
})

import { insertInitialValues } from "./insertIntoDB";
import { insertMonamur } from './insertMonamur';
import { selectRecepient } from './selectRecepient';
const bot: Telegraf<Context<Update>> = new Telegraf(process.env.BOT_TOKEN as string);


bot.start(async (ctx) => {
// username?, phone?, usernameto?, phoneto?, text, chatidfrom?, chatidto
  const initialValues: (string|undefined)[] = [
    ctx.message.from.username,  // username
    ctx.chat.id.toString()];    // chatfromid
  const check: boolean = await checkInitialization(initialValues);
  if (check) {
    ctx.reply('Хей, ти вже зареєстрований в боті. Гайда надсилати валентинку через /valentine!')
  } else {
    await insertInitialValues(initialValues);
    ctx.reply(
`Привіт, ${ctx.from.first_name}!
За допомогою цього бота можна анонімно відправити валентинку на вказаний нікнейм 💌
Для того, щоб цим скористатись відправ команду /valentine`);
  }
});

bot.help((ctx) => {
  ctx.reply(
`/start — побачити початкову інструкцію
/help — побачити це повідомлення 😶
/valentine — відправити нову валентинку!`)
});
  
let monamourState = 0;
let joke1 = 0;
  
bot.command('valentine', (ctx) => {
  ctx.reply(
    `Обери свого або свою monamour😼 вказавши їх нікнейм у вигляді @nickname`);
  monamourState = 1;
});
  
bot.on('text', async (ctx) => {
  if (monamourState === 0) {
    joke1++;
  }
  if (joke1 === 5) {
    joke1 = 0;
    try {
      ctx.reply(`Мій творець наділив мене своєю любов'ю не для того, щоб ти зараз знущався з мого сервера 👺 Скоріше відправляй /valentine і моя оперативка піде відпочивати.`);
    } catch (e) {console.log(e)}
  }
  
  if (monamourState === 2) {
    try {
      const textForValentineJoke = ctx.message.text.toLowerCase();
      if (textForValentineJoke.includes("секс") || textForValentineJoke.includes("sex") || textForValentineJoke.includes("трах")) {
        await ctx.replyWithPhoto({source: __dirname + "/../nohorny.jpg"}, {caption: "Це тобі"});
        await ctx.reply("Але якщо так дуже кортить, то я зможу це написать на валентинці, звинувачення в харазменті будуть покладатись на тебе, а не на мене");
      }
    } catch (e) {
      console.log(e);
    }
      
    const textForValentine = ctx.message.text;
    const id = crypto.randomBytes(16).toString("hex");
    await insertText([ctx.message.from.username, textForValentine]);
    monamourState = 3;
  
    //receiving recepient from DB
    const recepient = await selectRecepient([ctx.message.from.username]);
    // uploading photo and transforming
  
    try {
      const url = await cloudinary.uploader.upload(`https://res.cloudinary.com/dnkvmylhg/image/upload/v1676215512/background_uhmnho.png`,
        { color: "#F93943", overlay: {
              font_family: "Georgia",
              font_size: 70,
              font_weight: "bold",
              text_align: "center",
              text: encodeURI(textForValentine)
          }, width: 900, crop: "fit", flags: "layer_apply", gravity: "south", y: 200,
          public_id: id})
      // sending photo to requesting user
      await bot.telegram.sendPhoto(recepient[0].chatidto, url.url.toString());
      // future feature: delete photo from cloudinary
      ctx.reply("Ти надіслав валентинку до @"+ recepient[0].usernameto + "!💞");
      monamourState = 0;
      } catch (e) {
        console.log(e);
        try {
          ctx.reply("Мій сервер чомусь захворів, вже покликав адміна, зачекай декілька хвилин і я тобі відпишу!");
          monamourState = 0;
        } catch (e) {console.log(e)}
        monamourState = 0;
        bot.telegram.sendMessage(process.env.ADMIN_CHAT as string, "💔Я впало! Памагі!!")
      }
    } 
  
    if (monamourState === 1) {
      try {
        await ctx.reply('Я нікому не признаюсь😋 окрім своєї бази даних');
        await ctx.reply('Дивлюсь чи він/вона зареєстровані у боті...')
      } catch (e) {console.log(e)};
      
      const monamurID = await getMonamurID([ctx.message.text.substring(1)]);
      if (monamurID.length === 0) {
        try {
          ctx.reply("Не знайшов таку роднулю в своїй базі😩 Кличу шкіряних мішків, щоб їм написали! А ти поки перевір, чи правильно вказаний нікнейм.");
        } catch (e) {console.log(e)};
        bot.telegram.sendMessage(process.env.ADMIN_CHAT as string, "Увага! Повітряна тривога 💘 Стрілу Купідона було випущено, вона летить в напрямі цієї людини, але вони не в боті 😔. Напиши в особисті — " + ctx.message.text);
        bot.telegram.sendMessage(process.env.KATE_CHAT as string, "Увага! Повітряна тривога 💘 Стрілу Купідона було випущено, вона летить в напрямі цієї людини, але вони не в боті 😔. Напиши в особисті — " + ctx.message.text);
      } else {
        if (monamurID[0].chatidfrom === ctx.message.from.id.toString()) {
          try {
            ctx.reply("Ну ти і нарцис звісно. Ладно, зроблю тобі валентинку, але це не те, задля чого мене створили 😒. Жартую, гарного святкування!");
          } catch (e) {console.log(e)}
          bot.telegram.sendMessage(process.env.KATE_CHAT as string, "Увага! Повітряна тривога 💘 Ця людинка хоче зробити валентинку собі: чи по приколу, чи то від самотності... Напиши їм гарну валентинку, щоб їм не було сумно!💝 — " + ctx.message.text);
        }
        monamourState = 2;
        insertMonamur([ctx.message.from.username, ctx.message.text.substring(1), monamurID[0].chatidfrom]);
        try {
          ctx.reply("Відправ текст, який хочеш бачити на валентинці. Якщо передумав відправляти цій людинці, можеш відправити мені /valentine і я зроблю вигляд, що цього не бачив 😈");
        } catch (e) {
          console.log(e);
        }
      } 
    }
  })




bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
