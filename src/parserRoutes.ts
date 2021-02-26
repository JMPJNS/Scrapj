import {Router} from "express"
import {InvalidURLError} from "./errors"
import AnilistParser from "./parser/anilist"
import BoxNovelParser from "./parser/boxnovel"
import GenshInParser from "./parser/gensh.in"
import MalParser from "./parser/mal"
import Parser from "./parser/parser"

const ParserRoutes = Router()

// Anilist
ParserRoutes.get("/anilist/*", async (req, res) => {
	const parser = new AnilistParser()
	await runParser(parser, "anilist", req, res)
})

// MyAnimeList
ParserRoutes.get("/mal/*", async (req, res) => {
	const parser = new MalParser()
	await runParser(parser, "mal", req, res)
})

ParserRoutes.get("/boxnovel/*", async (req, res) => {
	const parser = new BoxNovelParser()
	await runParser(parser, "boxnovel", req, res)
})

ParserRoutes.get("/gensh.in/*", async (req, res) => {
	const parser = new GenshInParser()
	await runParser(parser, "gensh.in", req, res)
})

async function runParser(parser: Parser, name: string, req, res) {
	const split = req.url.split(`/${name}/`)


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
			res.end(`invalid ${name} url\n\n` + e.message)
		} else {
			res.statusCode = 500
			res.end(e.message)
		}
	}
}

export default ParserRoutes