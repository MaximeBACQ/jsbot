require('dotenv').config();
const moment = require('moment');
const {Client, IntentsBitField, EmbedBuilder, ActivityType} = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildPresences,
    ],
});



client.on('ready',(c) => {
    console.log(c.user.tag + " is online ");
    client.user.setActivity({
        name: 'Modère les mauvaises fraises',
        type: ActivityType.Playing,
    });
});

client.on('messageCreate', (message) => {
    if(message.author.bot){
        return;
    }else{
        if(message.content === "salut" || message.content === "Salut"){
            message.reply("Salut");
        } 
    }
})

client.on('interactionCreate', (interaction) => {
    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName === "commande1"){
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

        interaction.reply({ embeds: [embed] });
    }
    if(interaction.commandName === "commande2"){
        interaction.reply("oui celle la aussi ne fait rien bien vu");
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
    let channelLeave = client.channels.cache.get('1129454745757683722')

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
        .setFooter({text:'❀ 𝑷𝑰𝑵𝑲 ⭑ 𝒔𝒕𝒓𝒂𝒘𝒃𝒆𝒓𝒓𝒊𝒆𝒔 🍓 ❜', iconURL:'https://i.pinimg.com/564x/a3/e1/e7/a3e1e775bedae1116f560f7d96b87ca3.jpg'});

    channelLeave.send({embeds: [leaverEmbed]});
})

client.login(process.env.TOKEN);