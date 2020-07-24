import * as express from "express"
import ParserRoutes from "./parserRoutes";
const port = 3000
const app = express()

app.use("/parser", ParserRoutes)

app.listen(3000, () => {console.log("Listening on port "+port)})