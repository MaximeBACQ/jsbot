require('dotenv').config();
const fs = require('fs');
const moment = require('moment');
const {Client, IntentsBitField, EmbedBuilder, ActivityType, ApplicationCommandOptionType, ApplicationCommand, ApplicationCommandType} = require('discord.js');
const { userInfo } = require('os');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildIntegrations,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.MessageContent,
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
                required:true,
            }
        ],
    },
    {
        name : 'joinrole',
        description:"spécifie un rôle à donner aux membres quand ils rejoignent le serveur",
        options:[{
            name:"role",
            description:"rôle à donner",
            type:ApplicationCommandOptionType.Role,
            required: true,
        }]
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

let ciaoChannel;

let currentGuild;

let rolesToGive = [];

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
        currentGuild = message.guild.id;
    }
});

client.on('interactionCreate', async (interaction) => {
    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName === "pfc"){
        opponentId = interaction.options.get("adversaire").value;
        if(opponentId === interaction.member.user.id){
            interaction.reply(" Lance pas des games contre toi-même idiot ");
            return;
        }
        try{
            let opponentChoice;
            let senderChoice;
            
            //console.log(client.channels.cache.get(interaction.channelId).name);
            let sendChannel = interaction.channelId;
            let sender = interaction.member.user.username
            let reactions = false;

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

            await interaction.reply({
                content:"Ta demande de pierre feuille ciseaux a été envoyée.",
                ephemeral:true,
            })

            const embedPfc =await client.channels.cache.get(sendChannel).send({
                content:`<@${opponentId}>, tu as 5 minutes pour répondre à la requête de pierre feuille ciseaux`, embeds: [pfcDefy]
            });

            await Promise.all([
                embedPfc.react('👍'),
                embedPfc.react('👎'),
            ])
                .catch(error => console.error("Un emoji n'est pas passé", error));
                
            const collectorFilter = (reaction, user) => {
                return ['👍', '👎'].includes(reaction.emoji.name) && user.id === opponentId;
            };

            await embedPfc.awaitReactions({ filter: collectorFilter, max: 1, time: 30000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === '👍') {
                    //embedPfc.reply('Pierre feuille ciseau accepté');
                    reactions = true;

                    pfcDefy.setTitle("Jeu en cours, choix du joueur défié")
                    .setDescription(`<@${opponentId}>, choisis ce que tu veux jouer`);
                    
                    embedPfc.edit({embeds:[pfcDefy]});
                }else{
                    embedPfc.reply('Pierre feuille ciseau refusé, jeu annulé.');
                }
            })
            .catch(collected => {
                embedPfc.reply(`Ton adversaire n'a pas répondu à ta demande dans le temps imparti, jeu annulé.`);
            });

            if(!reactions) return;
            reactions = false;

            await embedPfc.reactions.removeAll();
            await Promise.all([
                embedPfc.react('🪨'),
                embedPfc.react('📄'),
                embedPfc.react('✂️'),
            ])
            
            const collectorFilter2 = (reaction, user) => {
                return ['🪨', '📄','✂️'].includes(reaction.emoji.name) && user.id === opponentId;
            };

            await embedPfc.awaitReactions({ filter: collectorFilter2, max: 1, time: 15000, errors: ['time'] })
            .then(collected => {
                opponentChoice = collected.first();
                reactions = true;

                pfcDefy.setTitle("Jeu en cours, choix du joueur défiant")
                .setDescription(`<@${interaction.member.user.id}>, choisis ce que tu veux jouer`);

                embedPfc.edit({embeds:[pfcDefy]});
            })
            .catch(collected => {
                embedPfc.reply(`<@${opponentId}> n'a pas fait de choix dans les temps impartis, le gagnant est ${sender}`);
            });

            if(!reactions) return;
            reactions = false;

            await embedPfc.reactions.removeAll();
            await Promise.all([
                embedPfc.react('🪨'),
                embedPfc.react('📄'),
                embedPfc.react('✂️'),
            ])
            
            const collectorFilter3 = (reaction, user) => {
                return ['🪨', '📄','✂️'].includes(reaction.emoji.name) && user.id === interaction.member.user.id;
            };

            await embedPfc.awaitReactions({ filter: collectorFilter3, max: 1, time: 15000, errors: ['time'] })
            .then(collected => {
                senderChoice = collected.first();
                reactions = true;

                pfcDefy.setTitle("Jeu terminé.");
                console.log(senderChoice + opponentChoice);
                if(senderChoice =='🪨' && opponentChoice =='📄' ||senderChoice == '📄' && opponentChoice == '✂️'||senderChoice == '✂️' && opponentChoice == '🪨'){
                    pfcDefy.setDescription(`<@${opponentId}> opponent a gagné.`);
                }else if(senderChoice == '🪨' && opponentChoice == '✂️' ||senderChoice =='📄' && opponentChoice =='🪨'||senderChoice == '✂️' && opponentChoice == '📄'){
                    pfcDefy.setDescription(`<@${interaction.member.user.id}> sender a gagné.`);
                }else{
                    pfcDefy.setDescription(`Match nul.`);
                }

                embedPfc.edit({embeds:[pfcDefy]});
            })
            .catch(collected => {
                embedPfc.reply(`<@${opponentId}> n'a pas fait de choix dans les temps impartis, le gagnant est ${sender}`);
            });

            await embedPfc.reactions.removeAll();
        }catch(e){
            console.log("il y a eu une erreur, logs:" + e);
        }
    }
    if(interaction.commandName === "byechannel"){

        const jsonDatas = JSON.parse(fs.readFileSync('leaveChannels.json'));
        //const map = new Map(Object.entries(jsonDatas));
        if(jsonDatas.maps[interaction.guild.id]==null){
            //interaction.deferReply();
            ciaoChannel = interaction.options.get("channel").value;

            let map1 = new Map();
            map1.set(interaction.guild.id,ciaoChannel);

            var obj = Object.fromEntries(map1);
            var jsonString = JSON.stringify(obj);
    
            const data = fs.readFileSync('leaveChannels.json'); // lis la data dans le json 
            const jsonData = JSON.parse(data); // parse le json et le transforme en objet js 
    
            jsonData.maps[interaction.guild.id] = ciaoChannel;
            fs.writeFileSync('leaveChannels.json', JSON.stringify(jsonData));

            interaction.reply("Je dirai au revoir dans le salon " + client.channels.cache.get(ciaoChannel).name + ".");
        }else{
            console.log(jsonDatas.maps[interaction.guild.id]);
            interaction.reply("Un salon de ce serveur est déjà défini comme salon de au-revoir.");
        }
    }
    if(interaction.commandName === "joinrole"){
        rolesToGive.push(interaction.options.get("role").id);
        console.log(interaction.options.get("role").role.name);
        console.log(rolesToGive);
        interaction.reply("Le rôle " + interaction.options.get("role").value + " sera donné à chaque nouvel arrivant.");
    }
    if(interaction.commandName === "addition"){
        const num1 = interaction.options.get("nombre1").value;
        const num2 = interaction.options.get("nombre2").value;
        interaction.reply(`${num1+num2}`);
    }
});

// client.on("guildMemberAdd", (event)=>{
//     console.log(event);
// })

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

client.on('guildMemberAdd', async (added) => {
     try{

        //const roleOne = "1129560890614751314";
        //const roleTwo = "1129560970784686210";
        const roleThree = "1129561059750068327";
        const roleFour = "1129561146790256650";
        const roleFive = "1129565391853723689";
        const roleSix = "1129567121299492964";

        if(!roleThree || !roleFour || !roleFive || !roleSix){
            console.log("role inexistant");
        }
        
        // await added.roles.add(roleOne);
        // await added.roles.add(roleTwo);
        await added.roles.add(roleThree);
        await added.roles.add(roleFour);
        await added.roles.add(roleFive);
        await added.roles.add(roleSix);
    } catch(e){
        console.log(e);
    }
});

client.on('guildMemberRemove',(l) => {

    const jsonDataLeave = JSON.parse(fs.readFileSync('leaveChannels.json'));

    if(jsonDataLeave.maps[currentGuild] == null) return;

    const leaverEmbed = new EmbedBuilder()
        .setColor(0xF31641)
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

    client.channels.cache.get(jsonDataLeave.maps[currentGuild]).send({embeds: [leaverEmbed]});
});

client.login(process.env.TOKEN);