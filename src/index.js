require('dotenv').config();
const fs = require('fs');
const moment = require('moment');
const {Client,GuildChannelManager, IntentsBitField, EmbedBuilder, ButtonStyle, ActivityType, ApplicationCommandOptionType, ApplicationCommand, ApplicationCommandType, ButtonBuilder, ActionRowBuilder, Guild} = require('discord.js');
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
        IntentsBitField.Flags.AutoModerationExecution,
        IntentsBitField.Flags.AutoModerationConfiguration,
        IntentsBitField.Flags.DirectMessageReactions,
        IntentsBitField.Flags.DirectMessageTyping,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.GuildEmojisAndStickers,
        IntentsBitField.Flags.GuildIntegrations,
        IntentsBitField.Flags.GuildInvites,
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
        name : 'battleship',
        description:"démarre une partie de bataille navale",
        options:[{
            name:"adversaire",
            description:"pseudo de ton adversaire",
            type:ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name:"category",
            description:"catégorie dans laquelle le salon de combat sera crée",
            type:ApplicationCommandOptionType.Channel,
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
        let sender = interaction.member.user
        opponentId = interaction.options.get("adversaire").value;
        if(opponentId === sender.id){
            interaction.reply(" Lance pas des games contre toi-même mongolo ");
            return;
        }
        if(client.users.cache.get(opponentId).bot){
            interaction.reply(" Lance pas des games contre un bot espèce deeeee de golmon là ");
        }
        try{
            let accept = false;
            // TODO : create an acceptGame(sender,opponent) function to avoid this code duplication
            //----------------------------------------------------------//
            // éléments pour accepter ou non le pfc // 
            const answer = [
                {name:'accepter', emoji:'👍', style:ButtonStyle.Success},
                {name:'refuser', emoji:'👎', style:ButtonStyle.Danger}
            ]

            const choiceButtons = answer.map((answer)=>{
                return new ButtonBuilder()
                .setCustomId(answer.name)
                .setLabel(answer.name)
                .setStyle(answer.style)
                .setEmoji(answer.emoji)
            })

            const choiceRow = new ActionRowBuilder()
            .addComponents(choiceButtons);
            //----------------------------------------------------------//

            //----------------------------------------------------------//
            // éléments de jeu du pfc //

            const choices =[
                {name: 'pierre', emoji: '🪨', beats: 'ciseaux'},
                {name: 'feuille', emoji: '📄', beats: 'pierre'},
                {name: 'ciseaux', emoji: '✂️', beats: 'feuille'},
            ]; // chaque choix de jeu

            const buttons = choices.map((choice)=>{
                return new ButtonBuilder()              // retourne un nouveau tableau avec les boutons mappés depuis le tableau choice
                .setCustomId(choice.name)
                .setLabel(choice.name)
                .setStyle(ButtonStyle.Primary)
                .setEmoji(choice.emoji)                                    
            })

            const row = new ActionRowBuilder()
			.addComponents(buttons);
            //----------------------------------------------------------//

            let choiceName;            
            //console.log(client.channels.cache.get(interaction.channelId).name);
            let sendChannel = interaction.channelId;
            let reactions = false;

            const pfcDefy = new EmbedBuilder()
            .setColor(0x800080)
            .setTitle("Une fraise sauvage t'a défié au pierre feuille ciseaux")
            .setAuthor({
                name: 'Pink Bot',
                iconURL:'https://media.discordapp.net/attachments/1122936379626754138/1130582116061692034/86EA913E-B670-4019-B4C2-F07A2158DC57.png?width=468&height=468',
                url: 'https://linktr.ee/pink.strawberries'
            })
            .setDescription(sender.username.charAt(0).toUpperCase() + sender.username.slice(1) + (" t'a défié au pierre feuille ciseaux. Souhaites-tu accepter ce défi ?"))
            .setThumbnail('https://cdn.discordapp.com/attachments/904863149369491527/1141866328936943746/strawb.jpg')
            .setTimestamp()
            .setFooter({text:'❀ 𝑷𝑰𝑵𝑲 ⭑ 𝒔𝒕𝒓𝒂𝒘𝒃𝒆𝒓𝒓𝒊𝒆𝒔 🍓 ❜'});

            // await interaction.reply({
            //     content:"Ta demande de pierre feuille ciseaux a été envoyée.",
            //     ephemeral:true,
            // })

            //const embedPfc = await client.channels.cache.get(sendChannel).send({
            const embedPfc = await interaction.reply({
                content:`<@${opponentId}>, tu as 30 secondes pour répondre à la requête de pierre feuille ciseaux`, embeds: [pfcDefy], components:[choiceRow]
            });

            const responseChoice = await embedPfc.awaitMessageComponent({ 
                filter: (user)=>user.user.id === opponentId,
                time: 30000,
            })
            .catch(async (error) => {
                pfcDefy
                .setTitle("Partie de pierre feuille ciseaux annulée")
                .setDescription(`Ton adversaire n'a pas répondu à ta demande dans le temps imparti, jeu annulé.`);
                await embedPfc.edit({content:"Bah bravo je te félicite pas ", embeds:[pfcDefy], components:[]});
            });

            if(!responseChoice) return;

            const answerName = answer.find(
                (answer)=>answer.name === responseChoice.customId
            );
            
            if(answerName.name === 'accepter'){

                accept = true;
                await pfcDefy
                .setTitle("Partie de pierre feuille ciseaux en cours")
                .setDescription(`C'est au tour de ` + client.users.cache.get(opponentId).username);

                await responseChoice.reply({
                    content:`Tu viens d'accepter le pierre feuille ciseaux`,
                    ephemeral:true,
                })
                embedPfc.edit({content:`<@${opponentId}>`, embeds:[pfcDefy], components:[row]});
            }

            if(answerName.name === 'refuser'){
                pfcDefy
                .setTitle("Jeu annulé")
                .setDescription("Le pierre feuille ciseaux a été refusé.");

                await embedPfc.edit({
                    content:"",
                    embeds:[pfcDefy],
                    components:[]
                });

                await responseChoice.reply({
                    content:`Tu viens de refuser le pierre feuille ciseaux`,
                    ephemeral:true,
                })
            }

            if(!accept)return;

            const opponentChoice = await embedPfc.awaitMessageComponent({ 
                filter: (user)=>user.user.id === opponentId,
                time: 15000,
            })
            .catch(async (error) => {
                pfcDefy.setTitle("Partie de pierre feuille ciseaux annulée")
                pfcDefy.setDescription(`Ton adversaire n'a pas répondu à ta demande dans le temps imparti, jeu annulé.`);
                await embedPfc.edit({embeds:[pfcDefy], components:[]});
            });

            if(!opponentChoice) return;

            await opponentChoice.update({});

            const opponentChoiceName = choices.find(
                (choices)=>choices.name === opponentChoice.customId
            );

            pfcDefy.setDescription(`C'est maintenant au tour de ${sender.username}`);
            await embedPfc.edit({content:`${sender}`, embeds:[pfcDefy]});

            const senderChoice = await embedPfc.awaitMessageComponent({ 
                filter: (user)=>user.user.id === sender.id,
                time: 15000,
            })
            .catch(async (error) => {
                pfcDefy.setTitle("Partie de pierre feuille ciseaux annulée")
                pfcDefy.setDescription(`Ton adversaire n'a pas répondu à ta demande dans le temps imparti, jeu annulé.`);
                await embedPfc.edit({embeds:[pfcDefy], components:[]});
            });

            if(!senderChoice)return;

            await senderChoice.update({});

            const senderChoiceName = choices.find(
                (choices)=>choices.name === senderChoice.customId
            );

            if(senderChoiceName.name === opponentChoiceName.beats){
                if(interaction.member.roles.cache.has('1129565608342716616')){
                    pfcDefy.setDescription(`${sender.username} a perdu la partie ! Elle avait choisi :` + senderChoiceName.emoji + `, ${client.users.cache.get(opponentId).username} avait choisi :` + opponentChoiceName.emoji);
                }else if(interaction.member.roles.cache.has('1129565878585925704')){
                    pfcDefy.setDescription(`${sender.username} a perdu la partie ! Il avait choisi :` + senderChoiceName.emoji + `, ${client.users.cache.get(opponentId).username} avait choisi :` + opponentChoiceName.emoji);
                }else{
                    pfcDefy.setDescription(`${sender.username} a perdu la partie ! Son choix était :` + opponentChoiceName.emoji + `, ${client.users.cache.get(opponentId).username} avait choisi :` + opponentChoiceName.emoji);
                }
            }
            if(senderChoiceName.beats === opponentChoiceName.name){
                if(interaction.member.roles.cache.has('1129565608342716616')){
                    pfcDefy.setDescription(`${sender.username} a gagné la partie ! Elle avait choisi :` + senderChoiceName.emoji + `, ${client.users.cache.get(opponentId).username} avait choisi :` + opponentChoiceName.emoji);
                }else if(interaction.member.roles.cache.has('1129565878585925704')){
                    pfcDefy.setDescription(`${sender.username} a gagné la partie ! Il avait choisi :` + senderChoiceName.emoji + `, ${client.users.cache.get(opponentId).username} avait choisi :` + opponentChoiceName.emoji);
                }else{
                    pfcDefy.setDescription(`${sender.username} a gagné la partie ! caca avait choisi` + senderChoiceName.emoji + `, ${client.users.cache.get(opponentId).username} avait choisi :` + opponentChoiceName.emoji);
                }
            } 
            if(senderChoiceName.name === opponentChoiceName.name){
                pfcDefy.setDescription('Match nul ! Les deux joueurs avaient choisi : ' + senderChoiceName.emoji);
            }
            
            pfcDefy.setTitle("La partie est terminée");
            await embedPfc.edit({content:"",embeds:[pfcDefy],components:[]});

        }catch(e){
            console.log("il y a eu une erreur, logs:" + e);
        }
    }
    if(interaction.commandName === "battleship"){
        let sender = interaction.member.user
        opponentId = interaction.options.get("adversaire").value;
        // if(opponentId === sender.id){
        //     interaction.reply(" Lance pas des games contre toi-même mongolo ");
        //     return;
        // }
        if(client.users.cache.get(opponentId).bot){
            interaction.reply(" Lance pas des games contre un bot espèce deeeee de golmon là ");
        }
        try{
            let accept = false;
            //----------------------------------------------------------//
            // éléments pour accepter ou non le battleship // 
            const answer = [
                {name:'accepter', emoji:'👍', style:ButtonStyle.Success},
                {name:'refuser', emoji:'👎', style:ButtonStyle.Danger}
            ]

            const choiceButtons = answer.map((answer)=>{
                return new ButtonBuilder()
                .setCustomId(answer.name)
                .setLabel(answer.name)
                .setStyle(answer.style)
                .setEmoji(answer.emoji)
            })

            const choiceRow = new ActionRowBuilder()
            .addComponents(choiceButtons);
            //----------------------------------------------------------//

            const defyEmbed = new EmbedBuilder()
            .setColor(0x800080)
            .setTitle("Une fraise sauvage t'a défié à la bataille navale")
            .setAuthor({
                name: 'Pink Bot',
                iconURL:'https://media.discordapp.net/attachments/1122936379626754138/1130582116061692034/86EA913E-B670-4019-B4C2-F07A2158DC57.png?width=468&height=468',
                url: 'https://linktr.ee/pink.strawberries'
            })
            .setDescription(sender.username.charAt(0).toUpperCase() + sender.username.slice(1) + (" t'a défié à la bataille navale. Souhaites-tu accepter ce défi ?"))
            .setThumbnail('https://i.pinimg.com/564x/4a/f9/79/4af9792bd7292621eb31dd20bebc7b94.jpg')
            .setTimestamp()
            .setFooter({text:'❀ 𝑷𝑰𝑵𝑲 ⭑ 𝒔𝒕𝒓𝒂𝒘𝒃𝒆𝒓𝒓𝒊𝒆𝒔 🍓 ❜'});

            let botAnswer = await interaction.reply({
                content:`<@${opponentId}>, tu as 30 secondes pour répondre à cet affront.`, embeds:[defyEmbed], components:[choiceRow]
            })

            const responseChoice = await botAnswer.awaitMessageComponent({ 
                filter: (user)=>user.user.id === opponentId,
                time: 30000,
            })
            .catch(async (error) => {
                defyEmbed
                .setTitle("Partie de bataille navale annulée")
                .setDescription(`Ton adversaire n'a pas répondu à ta demande dans le temps imparti, jeu annulé.`);
                await botAnswer.edit({content:"Bah bravo je te félicite pas ", embeds:[defyEmbed], components:[]});
            });

            if(!responseChoice) return;

            const answerName = answer.find(
                (answer)=>answer.name === responseChoice.customId
            );
            
            if(answerName.name === 'accepter'){

                accept = true;
                await defyEmbed
                .setTitle("Un nouveau salon a été crée pour votre partie")
                .setDescription("Plus aucune action à faire ici pour le moment.");

                await responseChoice.reply({
                    content:`Tu viens d'accepter la bataille navale`,
                    ephemeral:true,
                })
                botAnswer.edit({content:``, embeds:[defyEmbed], components:[]});

            }

            if(answerName.name === 'refuser'){
                defyEmbed
                .setTitle("Jeu annulé")
                .setDescription("La bataille navale a été annulée.");

                await botAnswer.edit({
                    content:"",
                    embeds:[defyEmbed],
                    components:[]
                });

                await responseChoice.reply({
                    content:`Tu viens de refuser la bataille navale`,
                    ephemeral:true,
                })

            }

            if(!accept)return;

            const battleChan = await interaction.guild.channels.create({name: `${sender.username} vs ${client.users.cache.get(opponentId).username}`, reason:'Bataille navale'});

            await battleChan.setParent(interaction.options.get("category").value);

            const placingMessage = battleChan.send({
                content:`Vous allez maintenant placer vos bateaux, veuillez appuyer sur le bouton`, components:[new ButtonBuilder()
                    .setCustomId('placer')
                    .setLabel('placer')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🫡')
                ]
            })

            const placingButton = await placingMessage.awaitMessageComponent({ 
                filter: (user)=>user.user.id === opponentId || sender.id,
                time: 30000,
            })
            .catch(async (error) => {
                defyEmbed
                .setTitle("Partie de bataille navale annulée")
                .setDescription(`Ton adversaire n'a pas répondu à ta demande dans le temps imparti, jeu annulé.`);
                await botAnswer.edit({content:"Bah bravo je te félicite pas ", embeds:[defyEmbed], components:[]});
            });
            
            
        }catch(e){
            console.log("Erreur avec la création de la bataille navale: " + e);
            interaction.editReply("Impossible de lancer une partie de bataille navale.");
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

// client.on('interactionCreate', async (interaction) =>{
//     try{
//         if(!interaction.isButton()) return;

//         await interaction.deferReply({
//             ephemeral: true,
//         });

//         const role = interaction.guild.roles.cache.get(interaction.customId);
//         if(!role){
//             interaction.editReply({
//                 content: "Rôle indisponible"
//             })
//             return;
//         }

//         const hasRole = interaction.member.roles.cache.has(role.id);

//         if(hasRole){
//             await interaction.member.roles.remove(role);
//             await interaction.editReply(`Le rôle ${role} a été retiré`);
//             return;
//         }
        

//         await interaction.member.roles.add(role);
//         await interaction.editReply(`Le rôle ${role} a été ajouté`);
//     } catch(e){
//         console.log(e);
//     }
// });

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