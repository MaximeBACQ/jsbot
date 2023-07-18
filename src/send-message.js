require('dotenv').config();
const {Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

const roles =[
    {
        id: '1129565608342716616',
        label: "@✰ 𝐬𝐡𝐞/𝐡𝐞𝐫"
    },
    {
        id: '1129565878585925704',
        label:"@✰ 𝐡𝐞/𝐡𝐢𝐦",
    }
]

const rolesSDM =[
    {
        id: '1129752417190293504',
        label: "bleu"
    },
    {
        id: '1129752457728245861',
        label: "violet"
    }
]

client.on('ready', async (c) => {
    //console.log(c.user.tag + " is online ");
    try{
        //const channel = await client.channels.cache.get("1129456211788583096");
        const channel = await client.channels.cache.get("1129702580008800308");
        if(!channel) return;
        
        const row = new ActionRowBuilder();

        rolesSDM.forEach((role) => {
            row.components.push(
                new ButtonBuilder()
                .setCustomId(role.id)
                .setLabel(role.label)
                .setStyle(ButtonStyle.Primary)
            )
        })

        await channel.send({
            content: 'Claim ton rôle',
            components:[row],
        })

        process.exit();
    }catch(e){
        console.log(e)
    }
});


client.login(process.env.TOKEN);

