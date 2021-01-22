import Parser from "./parser"
import IParserResult from "../models/parserResult"
import { InvalidURLError } from "../errors"

export default class MalParser extends Parser {
	public constructor() {
		super()
		this.Name = "MAL"
		this.Description = "Parse MyAnimeList Anime/Manga"
	}

	public async parse(url: string): Promise<IMalParserResult> {
		const res: IMalParserResult = <IMalParserResult>{}
		res.Parser = this

		const baseUrl = "https://myanimelist.net"

		if (!url.startsWith(baseUrl)) {
			throw new InvalidURLError("Not a MAL URL")
		}

		const req = await this._axios.get(url)        
		const $ = this._cheerio.load(req.data)

		if (url.includes("/anime/")) {

		}

		return res
	}
}

interface IMalParserResult extends IParserResult {
    Anime?: IMalAnime;
}

interface IMalEntry {
    Title: string;
    TitleEnglish: string;
    Synopsis: string;
    Score: number;
    Status: string;
}

interface IMalAnime extends IMalEntry{
    Studios: string[];
    EpisodeCount?: number;
}