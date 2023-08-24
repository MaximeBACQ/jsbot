const{ REST, Routes, ApplicationCommandOptionType, SlashCommandBuilder} = require('discord.js');
require('dotenv').config();


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

const rest = new REST({version:"10"}).setToken(process.env.TOKEN);

(async () => {
    try{
        console.log("Les slash commands s'enregistrent yahoo");

        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });


        console.log("C bon c fait yahoo")
    }catch (e){
        console.log("y a eu un ptit souci mon con :" + e);
    }
})();


