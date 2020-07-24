import {Router} from "express"

const ParserRoutes = Router()

ParserRoutes.get("/anilist", (req, res) => {
    res.send("test")
})

export default ParserRoutes