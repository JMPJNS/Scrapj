import * as express from "express"
import ParserRoutes from "./parserRoutes"
const port = process.env.PORT ?? 80
const app = express()

app.use("/parser", ParserRoutes)

app.listen(port, () => {console.log("Listening on port "+port)})