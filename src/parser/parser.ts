import ParserResult from "../models/parserResult"
import * as cheerio from "cheerio"
import * as axios from "axios"

export default abstract class Parser {
	public Name: string
	public Description: string
	protected _cheerio!: CheerioAPI
	protected _axios!: axios.AxiosStatic
	
	protected constructor() {
		this._cheerio = cheerio
		this._axios = axios.default
	}

	public abstract parse(url: string): Promise<ParserResult>
}