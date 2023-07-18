const{ REST, Routes, ApplicationCommandOptionType} = require('discord.js');
require('dotenv').config();


const commands = [ // tableau qui contient chaque commande avec description json style
    {
        name : 'commande1',
        description:"fais un embed",
    },
    {
        name : 'commande2',
        description:"fais un truc j'ai pas encore décidé",
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

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.SDM_ID
            ),
            {body: commands}
        );

        console.log("C bon c fait yahoo")
    }catch (e){
        console.log("y a eu un ptit souci mon con :" + e);
    }
})();


