import {Router} from "express"
import AnilistParser from "./parser/anilist"

const ParserRoutes = Router()

// Anilist
ParserRoutes.get("/anilist", async (req, res) => {
    const parser = new AnilistParser()
    const url = req.header("anilist-url")
    
    if (!url) {
        res.statusCode = 400
        res.end("No url provided (anilist-url header)")
        return
    }
    try {
        const t = await parser.parse(url)
        res.json(t)
    } catch (e) {
        if (e instanceof TypeError) {
            res.statusCode = 400
            res.end("invalid anilist url\n\n" + e.message)
        } else {
            res.statusCode = 500
            res.end(e.message)
        }
    }
})

export default ParserRoutes