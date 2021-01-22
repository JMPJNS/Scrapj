import {Router} from "express"
import {InvalidURLError} from "./errors"
import AnilistParser from "./parser/anilist"
import BoxNovelParser from "./parser/boxnovel"
import MalParser from "./parser/mal"

const ParserRoutes = Router()

// Anilist
ParserRoutes.get("/anilist/*", async (req, res) => {
	const parser = new AnilistParser()
	const split = req.url.split("/anilist/")


	if (split.length == 1) {
		res.statusCode = 400
		res.end("No url provided")
		return
	}
    
	const url = split[1]
      
	try {
		const t = await parser.parse(url)
		res.json(t)
	} catch (e) {
		if (e instanceof InvalidURLError) {
			res.statusCode = 400
			res.end("invalid anilist url\n\n" + e.message)
		} else {
			res.statusCode = 500
			res.end(e.message)
		}
	}
})

// MyAnimeList
ParserRoutes.get("/mal/*", async (req, res) => {
	const parser = new MalParser()
	const split = req.url.split("/mal/")


	if (split.length == 1) {
		res.statusCode = 400
		res.end("No url provided")
		return
	}
    
	const url = split[1]
      
	try {
		const t = await parser.parse(url)
		res.json(t)
	} catch (e) {
		if (e instanceof InvalidURLError) {
			res.statusCode = 400
			res.end("invalid mal url\n\n" + e.message)
		} else {
			res.statusCode = 500
			res.end(e.message)
		}
	}
})

ParserRoutes.get("/boxnovel/*", async (req, res) => {
	const parser = new BoxNovelParser()
	const split = req.url.split("/boxnovel/")


	if (split.length == 1) {
		res.statusCode = 400
		res.end("No url provided")
		return
	}

	const url = split[1]

	try {
		const t = await parser.parse(url)
		res.json(t)
	} catch (e) {
		if (e instanceof InvalidURLError) {
			res.statusCode = 400
			res.end("invalid boxnovel url\n\n" + e.message)
		} else {
			res.statusCode = 500
			res.end(e.message)
		}
	}
})

export default ParserRoutes