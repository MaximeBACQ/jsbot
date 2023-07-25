require('dotenv').config();
const moment = require('moment');
const {Client, IntentsBitField, EmbedBuilder, ActivityType, ApplicationCommandOptionType, ApplicationCommand} = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildIntegrations,
    ],
});

const commands = [ // tableau qui contient chaque commande avec description
    {
        name : 'pfc',
        description:"envoie une requête pour faire un pierre-feuille-ciseaux avec quelqu'un",
        options:[{
            name:"adversaire",
            description:"pseudo de ton adversaire",
            type:ApplicationCommandOptionType.User,
            required: true,
        }]
    },
    {
        name : 'byechannel',
        description:"Donne le salon dans lequel on dira ciao",
        options:[
            {
                name: "channel",
                description :"channel dans lequel le bot dira au-revoir",
                type:ApplicationCommandOptionType.Channel,
                required:false,
            }
        ],
    },
    {
        name:"addition",
        description:"tout est dans le titre",
        options: [
            {
                name:"nombre1",
                description:"bah le premier nombre",
                type: ApplicationCommandOptionType.Number,
                choices: [
                    {
                        name: 'one',
                        value: 1,
                    },
                    {
                        name: 'two',
                        value: 2,
                    },
                    {
                        name: 'three',
                        value: 3,
                    },
                ],
                required: true,
            },
            {
                name:"nombre2",
                description:"bah le deuxième nombre",
                type: ApplicationCommandOptionType.Number,
                required: true,
            }
        ],
    }
];

let ciaoChannel = null;

client.on('ready',(c) => {

    console.log(c.user.tag + " is online ");
    client.user.setActivity({
        name: 'Modère les mauvaises fraises',
        type: ActivityType.Playing,
    });

    client.application.commands.set(commands);
});

client.on('messageCreate', (message) => {
    if(message.author.bot){
        return;
    }else{
        if(message.content === "salut" || message.content === "Salut"){
            message.reply("Salut");
        } 
    }
});

client.on('interactionCreate', async (interaction) => {
    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName === "pfc"){
        try{
            opponentId = interaction.options.get("adversaire").value;
            console.log(interaction.channelId); // id du salon depuis lequel on envoie la commande
            //console.log(client.channels.cache.get(interaction.channelId).name);
            let sendChannel = interaction.channelId;

            let sender = interaction.member.user.username

            const pfcDefy = new EmbedBuilder()
            .setColor(0x800080)
            .setTitle("Une fraise sauvage t'a défié au pierre feuille ciseaux")
            .setAuthor({
                name: 'Pink Bot',
                iconURL:'https://media.discordapp.net/attachments/1122936379626754138/1130582116061692034/86EA913E-B670-4019-B4C2-F07A2158DC57.png?width=468&height=468',
                url: 'https://linktr.ee/pink.strawberries'
            })
            .setDescription(sender.charAt(0).toUpperCase() + sender.slice(1) + (" t'a défié au pierre feuille ciseaux. Souhaites-tu accepter ce défi ?"))
            .setThumbnail('https://i1.sndcdn.com/artworks-cYInJFs7iFhj2ost-azODGQ-t500x500.jpg')
            .setTimestamp()
            .setFooter({text:'❀ 𝑷𝑰𝑵𝑲 ⭑ 𝒔𝒕𝒓𝒂𝒘𝒃𝒆𝒓𝒓𝒊𝒆𝒔 🍓 ❜'});

            const embedPfc = await client.channels.cache.get(sendChannel).send({content:`<@${opponentId}>`, embeds: [pfcDefy]});

            await embedPfc.react(`👍`);
            await embedPfc.react("👎");
        }catch(e){
            client.channels.cache.get(sendChannel).send("il y a eu une erreur, logs:" + e);
        }
    }
    if(interaction.commandName === "byechannel"){
        ciaoChannel = interaction.options.get("channel").value;
        interaction.reply("Je dirai au revoir dans le salon " + client.channels.cache.get(ciaoChannel).name + ".");

    }
    if(interaction.commandName === "addition"){
        const num1 = interaction.options.get("nombre1").value;
        const num2 = interaction.options.get("nombre2").value;
        interaction.reply(`${num1+num2}`);
    }
})

client.on("messageCreate", (message) =>{
    if(message.content === "embed"){
        const embed = new EmbedBuilder()
        .setTitle("Titre Embed")
        .setDescription("EmbedDescription")
        .setColor('Random')
        .addFields({
            name : "Field Title",
            value:"test",
            inline:true
        })
        .addFields({
            name : "Field Title 2",
            value:"test 2",
            inline:true
        });

        message.channel.send({ embeds: [embed] });
    }
})

client.on('interactionCreate', async (interaction) =>{
    try{
        if(!interaction.isButton()) return;

        await interaction.deferReply({
            ephemeral: true,
        });

        const role = interaction.guild.roles.cache.get(interaction.customId);
        if(!role){
            interaction.editReply({
                content: "Rôle indisponible"
            })
            return;
        }

        const hasRole = interaction.member.roles.cache.has(role.id);

        if(hasRole){
            await interaction.member.roles.remove(role);
            await interaction.editReply(`Le rôle ${role} a été retiré`);
            return;
        }
        

        await interaction.member.roles.add(role);
        await interaction.editReply(`Le rôle ${role} a été ajouté`);
    } catch(e){
        console.log(e);
    }
});

client.on('guildMemberRemove',(l) => {

    const leaverEmbed = new EmbedBuilder()
        .setColor(0x800080)
        .setTitle("Une fraise a été récoltée et quitte la serre")
        .setAuthor({
            name: 'Pink Bot',
            iconURL:'https://media.discordapp.net/attachments/1122936379626754138/1130582116061692034/86EA913E-B670-4019-B4C2-F07A2158DC57.png?width=468&height=468',
            url: 'https://linktr.ee/pink.strawberries'
        })
        .setDescription(l.user.username + (' ne fait plus partie du club 🫡'))
        .setThumbnail(l.user.displayAvatarURL())
        .addFields(
            { name: 'Avait rejoint le :', value:`${moment.utc(l.user.joinedAt).format('DD/MM/YY')}`}
        )
        .setImage('https://i.pinimg.com/564x/34/54/f2/3454f20167afe26b0fa59635ae801b76.jpg')
        .setTimestamp()
        .setFooter({text:'❀ 𝑷𝑰𝑵𝑲 ⭑ 𝒔𝒕𝒓𝒂𝒘𝒃𝒆𝒓𝒓𝒊𝒆𝒔 🍓 ❜'});

    ciaoChannel.send({embeds: [leaverEmbed]});
})

client.login(process.env.TOKEN);