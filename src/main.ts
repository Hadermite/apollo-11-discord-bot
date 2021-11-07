import * as Discord from "discord.js"
import * as dotenv from "dotenv"
import fetch from "node-fetch"
import * as Avanza from "avanza"

dotenv.config()

const client = new Discord.Client()

client.on("ready", start)

client.login()

function start() {
	client.user?.setActivity({ name: "TO THE MOON 🚀", type: "COMPETING" })

	updatedPrices().catch(error => console.error(error))
	setInterval(() => updatedPrices().catch(error => console.error(error)), 10 * 60 * 1000)
}

async function updatedPrices() {
	const response = await fetch("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", {
		headers: { "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY },
	})
	const data = await response.json()
	const adaPrice = (await data["data"].find((x: any) => x.id === 2010)["quote"]["USD"]["price"]) as number

	const avanza = new Avanza()

	try {
		await avanza.authenticate({
			username: process.env.AVANZA_USERNAME,
			password: process.env.AVANZA_PASSWORD,
			totpSecret: process.env.AVANZA_TOTP_SECRET,
		})
	} catch (error) {
		console.error("Failed to authenticate", error)
		return
	}

	const omxs = await avanza.search("OMXSPI").then((data: any) => data.hits[0].topHits[0])
	const global = await avanza.search("W1DOW").then((data: any) => data.hits[0].topHits[0])

	const guild = await client.guilds.fetch("774389979316879370")
	const channels = guild.channels.valueOf()
	channels.get("840320129019150336")?.setName(`💰 ADA: $${Math.floor(adaPrice * 100) / 100} 🚀`)
	channels.get("840347260272508998")?.setName(`💰 OMXSPI: ${omxs.changePercent}% 🚀`)
	channels.get("840348176622944257")?.setName(`💰 W1DOW: ${global.changePercent}% 🚀`)

	console.log(`Updated prices ${new Date().toISOString()}`)
}
