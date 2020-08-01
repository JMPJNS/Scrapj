import IParserResult from "../models/parserResult"
import Parser from "./parser"
import {InvalidURLError, NotImplementedError} from "../errors"

export default class BoxNovelParser extends Parser {
	public constructor() {
		super()
		this.Name = "BoxNovel"
		this.Description = "Parse BoxNovel Novels"
	}

	public async parse(url: string): Promise<IBoxNovelParserResult> {
		const res = <IBoxNovelParserResult>{}
		res.Parser = this
		
		const baseUrl = "https://boxnovel.com"
		let split = url.split(baseUrl)[1]
		
		if (!url.startsWith(baseUrl)) {
			throw new InvalidURLError("Not a BoxNovel URL")
		}
		
		if (url.startsWith(baseUrl+"/novel")) {
			const last = split.slice(-1)
			if (last == "/") {
				split = split.substring(0, split.length - 1);
			}
			
			const count = (split.match(/\//g) || []).length
			if (count == 2) {
				res.BoxType = "novel-overview"
			} else if (count == 3) {
				res.BoxType = "novel-page"
			} else {
				throw new InvalidURLError("This might not be an error, url contains too few or too many /")
			}
		} else {
			throw new NotImplementedError("This Feature is not yet implemented")
		}

		const req = await this._axios.get(url)
		// res.RawHTML = req.data

		const $ = this._cheerio.load(req.data)

		switch(res.BoxType) {
			case "novel-overview":
				res.Overview = this.parseOverview($)
				break;
		}
		
		return res
	}
	
	parseOverview($: CheerioStatic): NovelOverview {
		const overview = <NovelOverview>{}
		overview.ChapterList = []

		// Get Chapter List
		$(".wp-manga-chapter").each((i, row) => {
			const chapter = <ChapterOverview>{}
			
			chapter.Url = row.children[1]?.attribs?.href
			chapter.Name = row.children[1]?.children[0]?.data?.trim()
			chapter.ReleaseDateString = row.children[3]?.children[1]?.children[0]?.data?.trim()

			overview.ChapterList.push(chapter)
		})
		overview.ChapterList = overview.ChapterList.reverse()
		overview.ChapterCount = overview.ChapterList.length
		
		
		// Get Novel Description
		let desc = ""
		const descElems = $("#editdescription")[0]?.children.filter(x => x.type == "tag") || []
		for (const el of descElems) {
			const text = el.children[0]?.data?.trim()
			if (text == undefined) continue
			desc = desc + text + "\n"
		}
		overview.Description = desc.trim()
		
		overview.ImageUrl = $(".summary_image")[0]?.children[1]?.children[1]?.attribs["src"]
		overview.Rating = $(".vote-details")[0]?.children[0]?.data?.trim()
		overview.Genres = $(".genres-content")[0]?.children?.filter(x => x.type == "tag").map(x => x?.children[0]?.data)
		overview.Authors = $(".author-content")[0]?.children?.filter(x => x.type == "tag").map(x => x?.children[0]?.data)
		
		// $(".post-title")[0].children[1].children.filter(x => x.type == "text" && x.data.trim() != "")
		overview.Title = $(".post-title")[0]?.children[1]?.children.filter(x => x?.type == "text" && x?.data?.trim() != "")[0]?.data?.trim()
		
		const contentElems = $(".post-content_item")
		overview.Status = contentElems.toArray()?.find(x => x?.children[1]?.children[1]?.children[0]?.data?.trim() == "Status")?.children[3]?.children[0]?.data?.trim()
		overview.Release = contentElems.toArray()?.find(x => x?.children[1]?.children[1]?.children[0]?.data?.trim() == "Release")?.children[3]?.children[1]?.children[0]?.data?.trim()
		
		return overview
	}
	
}

interface IBoxNovelParserResult extends IParserResult {
	BoxType: "novel-overview" | "novel-page" | "manga-genre" | "manga-tag"
	Overview: NovelOverview
}

interface NovelOverview {
	Title: string
	ImageUrl: string
	Description: string
	Rating: string
	Alternative: string[]
	Authors: string[]
	Genres: string[]
	Type: string
	Release: string
	Status: string
	ChapterList: ChapterOverview[]
	ChapterCount: number
}

interface ChapterOverview {
	Url: string
	Name: string
	ReleaseDateString: string
	ReleaseDate: Date
}