class Slash {
    constructor(client) {
        this.axios = require("axios");
        this.client = client;
    }

    command(options) {
        let url = `https://discord.com/api/v8/applications/${this.client.user.id}/commands`;

        if (!options.data)
            throw new Error("[ERROR]: Data for command wasn't provided");
        if (options.guildOnly === true && !options.guildID)
            throw new Error(
                "[ERROR] Command was guild only, but no guild ID provided"
            );
        if (options.guildOnly === true)
            url = `https://discord.com/api/v8/applications/${this.client.user.id}/guilds/${options.guildID}/commands`;
        if (!options.data.name)
            throw new Error("[ERROR] Command name wasn't provided");
        if (!options.data.content)
            throw new Error("[ERROR] No content was provided")
        if (!options.data.embeds) options.data.embeds = [] 
            
        let cmd = {
            name: options.data.name,
            description: options.data.description || "No description provided",
            options: options.data.options || [],
        };

        let config = {
            method: "POST",
            headers: {
                Authorization: `Bot ${this.client.token}`,
                "Content-Type": "application/json",
            },
            data: JSON.stringify(cmd),
            url,
        };

        this.axios(config)
            .then((response) => {
                console.log(`[SUCCESS] Command created`);
            })
            .catch((err) => {
                console.log(`[ERROR] Request failed\n${err}`);
            });

        this.client.on("raw", async (event) => {
            let flag = 0;
            if (options.ephemeral === true) flag = 1 << 6
            if (event.t === "INTERACTION_CREATE") {
                let commandName = event.d.data.name;
                if (commandName === options.data.name)
                    return await this.client.api
                        .interactions(event.d.id)
                        [event.d.token].callback.post({
                            data: {
                                type: options.data.type || 4,
                                data: {
                                    content: options.data.content,
                                    embeds: options.data.embeds,
                                    flags: flag
                                },
                            },
                        });
            }
        });

        return this;
    }
    getCommands(options = {}) {
        return new Promise((resolve, reject) => {
            let url = `https://discord.com/api/v8/applications/${this.client.user.id}/commands`
            if (options.guildID) url = `https://discord.com/api/v8/applications/${this.client.user.id}/guilds/${options.guildID}/commands`
            this.axios
                .get(
                    url,
                    {
                        headers: {
                            Authorization: "Bot " + this.client.token,
                        },
                    }
                )
                .then((res) => resolve(res.data))
                .catch((e) => reject(e));
        });
    }
    deleteCommand(options) {
        if (!options.id)
            throw new Error("[ERROR]: No Command ID was provided!");
        var url = `https://discord.com/api/v8/applications/${
            this.client.user.id
        }/${
            options.guildID ? "guilds/" + options.guildID + "/" : ""
        }commands/${options.id}`;
        console.log(url);
        this.axios({
            method: "delete",
            url,
            headers: {
                Authorization: "Bot " + this.client.token,
            },
        }).catch((err) => {
            console.log(`[ERROR] Request failed\n${err}`);
        });
        return this;
    }
}

module.exports = Slash;
