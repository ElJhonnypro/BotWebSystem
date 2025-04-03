const express = require('express');
const fs = require('fs').promises;
const app = express();
app.use(express.json());
const cors = require("cors");
const axios = require("axios");
require('dotenv').config();
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

const port = 4765;

// Custom middlewares
const ShowLog = (req, res, next) => {
  console.log(`[${req.connection.remoteAddress}] [${req.method}] URL: ${req.url}`);
  
  
  next();
}
app.use(ShowLog)

const readJsonFile = async (path) => {
    try {
        const data = await fs.readFile(path, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading file:', err);
        return null;
    }
}


const saveJsonFile = async (path, newData) => {
    try {
        await fs.writeFile(path, JSON.stringify(newData, null, 2)); 
        console.log('File saved successfully!');
    } catch (err) {
        console.error('Error saving file:', err);
    }
}

const applyPrefix = (req, res) => {
    const { prefix, guildid } = req.body;
    console.log(req.body)
    if (!prefix) {
        return res.status(400).json({ error: 'Prefix is required' });
    }

    readJsonFile("./config.json").then((config) => {
        config[guildid] = {
            prefix: prefix
        };
        saveJsonFile("./config.json", config).then(() => {
            res.status(200).json({ message: 'Prefix updated successfully' });
        });
    }).catch((err) => {
        res.status(500).json({ error: 'Error updating prefix' });
        console.log(err)
    });
};

const applyMessage = (req, res) => {
    const { message, guildid } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    readJsonFile("./config.json").then((config) => {
        config[guildid]["message"] = message;
        saveJsonFile("./config.json", config).then(() => {
            res.status(200).json({ message: 'Message updated successfully' });
        });
    }).catch((err) => {
        res.status(500).json({ error: 'Error updating message' });
    });
};

const getData = (req, res) => {
  readJsonFile("./config.json").then((config) => {
    if (!config[req.body.guildid]) {
        return res.status(404).json({ error: 'Guild not found' });
    }
    res.status(200)
    res.send({
      prefix: config[req.body.guildid].prefix,
      message: config[req.body.guildid].message,
    });
  });

}
const discordjoin = async (req, res) => {
    const code = req.query.code;
    
    // Check if the authorization code is present
    if (!code) {
        return res.status(400).send("Authorization code is required");
    }
    
    try {
        // Get the token using the authorization code
        const tokenRes = await axios.post(
            "https://discord.com/api/oauth2/token",
            new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID || "your id",  // Default to fallback value if not found
                client_secret: process.env.DISCORD_CLIENT_SECRET || "ur ass secret",  // Same for client secret
                grant_type: 'authorization_code',
                code,
                redirect_uri: 'http://localhost:4765/auth/verify',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        // Extract the access token from the response
        const { access_token } = tokenRes.data;
        
        // Now get the user information
        const userRes = await axios.get("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        // Log the user information (for debugging)
        console.log("User Info:", userRes.data);

        // Set the token in a secure, httpOnly cookie
        res.cookie("discord_token", access_token, {
            httpOnly: true,
            sameSite: 'Lax',  // Permite la cookie entre diferentes dominios
            secure: false,    // Asegúrate de que sea false en desarrollo (puedes ponerlo en true en producción)
        });
        
        // Redirect to your frontend application
        res.redirect('http://localhost:3000/');
        
    } catch (err) {
        console.error("Error fetching token:", err.response?.data || err.message);  // More detailed error logging
        return res.status(500).send("Error fetching token");
    }
};

const discordservers = async (req, res) => {
    try {
        console.log("guild")
        console.log(req.headers.cookie)
        const token = req.headers.cookie?.split("; ")
              .find(cookie => cookie.startsWith("discord_token="))
              ?.split("=")[1] || "No token found"

        if (!token) {
            return res.status(401).send("No token provided. Please log in again.");
        }
        
        try {
            const guildsres = await axios.get("https://discord.com/api/users/@me/guilds", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            res.status(200).json(guildsres.data); // Respond with the server data
            cache.set(token, guildsres.data);
        } catch (err) {
            console.error("Error fetching servers:", err.response?.data || err.message);
            return res.status(500).send("Error fetching servers");
        }
    } catch (err) {
        return res.status(401).send("Not authorized");
    }
};

const discordlogout = async (req, res) => {
    res.clearCookie("discord_token");
    res.redirect('http://localhost:3000/');
    res.status(200).send("Logged out successfully");
}

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://192.168.10.100:3000',
      'http://localhost:4765',
      'http://192.168.10.100:4765',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // required for cookies to work
  })
);

app.use("/settings/", async (req, res, next) => {
    const { guildid } = req.body;
    if (!guildid) {
        return res.status(400).json({ error: 'guildid is required' });
    }

    // Token verification
    const token = req.headers.cookie?.split("; ")
              .find(cookie => cookie.startsWith("discord_token="))
              ?.split("=")[1];

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        let userGuilds = cache.get(token);

        if (!userGuilds) {
            const userGuildsRes = await axios.get("https://discord.com/api/users/@me/guilds", {
                headers: { Authorization: `Bearer ${token}` },
            });

            userGuilds = userGuildsRes.data;
            cache.set(token, userGuilds); // Guarda en caché
        }

        const targetGuild = userGuilds.find(
            (guild) => guild.id === guildid && (parseInt(guild.permissions_new) & 0x20) !== 0
        );

        if (!targetGuild) {
            console.log("perms not available");
            return res.status(403).json({ error: "Forbidden: You do not have permission to modify this server" });
        }

        next();
    } catch (err) {
        console.error("Error fetching user guilds:", err.response?.data || err.message);
        return res.status(500).json({ error: "Error fetching user guilds" });
    }
});



app.put("/settings/applyPrefix", applyPrefix);
app.put("/settings/applyMessage", applyMessage);
app.post("/settings/getData", getData);
app.all("/auth/verify", discordjoin);
app.get("/auth/guilds", discordservers);
app.get("/auth/logout", discordlogout);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
