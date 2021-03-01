/* eslint-disable indent */
import IParserResult from "../models/parserResult"
import Parser from "./parser"
import { InvalidURLError, NotImplementedError } from "../errors"

export default class GenshInParser extends Parser {
	public constructor() {
		super()
		this.Name = "Gensh.in"
		this.Description = "Parse Gensh.in Content"
	}

	async parse(url: string): Promise<IGenshInParserResult> {
		const res = <IGenshInParserResult>{}
		res.Parser = this
		const baseUrl = "https://www.gensh.in/"
		const split = url.split(baseUrl)[1]

		if (!url.includes(baseUrl)) {
			throw new InvalidURLError("Not a Gensh.in url")
		}

		const req = await this._axios.get(url)
		// res.RawHTML = req.data

		const $ = this._cheerio.load(req.data)

		if (url.includes("/characters/")) {
			res.character = this.parseCharacter($)
		} else {
			throw new NotImplementedError("")
		}

		return res
	}

	parseCharacter($: CheerioStatic): IChacracter {
		const res = <IChacracter>{}

		res.name = $(".nameblock").children()[0]?.children[0]?.data?.trim()

		$(".character-detail").children().each((i, row) => {
			for (const col of row.children) {
				const card = col.children[0]
				const header = $(card).children(".card-header")?.text()
				const body = card?.children[1]

				if (header == "Character") {
					for (const node of body?.children[0]?.children) {
						switch (node.children[0]?.children[0]?.data?.trim()) {
							case "Star Rank:":
								res.starRank = parseInt(node.children[1]?.data?.match(/\d+/)[0]) || undefined
								break
							case "Alternative Names:":
								res.alternativeNames = node.children[1]?.data?.trim()
								break
							case "Title:":
								res.title = node.children[1]?.data?.trim()
								break
							case "Organization / Circle:":
								res.organization = node.children[1]?.data?.trim()
								break
							case "Origin:":
								res.origin = node.children[1]?.data?.trim()
								break
							case "Constellation:":
								res.constellationName = node.children[1]?.data?.trim()
								break
							case "Vision / Element:":
								res.vision = $(node.children?.[1])?.text()?.trim()
								break
							case "Weapon:":
								res.weapon = node.children[1]?.data?.trim()
								break
						}
					}
				}

				if (header == "Information") {
					res.voiceActor = { japanese: undefined, chinese: undefined, english: undefined }
					for (const node of body?.children[0]?.children) {
						switch (node.children[0]?.children[0]?.data?.trim()) {
							case "Gender:":
								res.gender = node.children[1]?.data?.trim()
								break
							case "Birthday:":
								res.birthday = node.children[1]?.data?.trim()
								break
							case "Bodytype:":
								res.bodytype = node.children[1]?.data?.trim()
								break
							case "Height:":
								res.height = parseInt(node.children[1]?.data?.match(/\d+/)?.[0]) || undefined
								break
							case "Voice Actor Japanese:":
								res.voiceActor.japanese = node.children[1]?.data?.trim()
								break
							case "Voice Actor Chinese:":
								res.voiceActor.chinese = node.children[1]?.data?.trim()
								break
							case "Voice Actor English:":
								res.voiceActor.english = node.children[1]?.data?.trim()
								break
						}
					}
				}

				if (header == "Description") {
					res.description = $(body)?.text()
				}

				if (header == "InGame Description") {
					res.inGameDescription = $(body)?.text()
				}
			}
		})

		res.talents = []
		$("#skills").children().each((i, row) => {
			const talent = <ITalent>{}
			talent.name = $(row.children?.[1])?.children("h4")?.text()
			talent.description = $(row.children?.[1])?.children("p")?.text()?.replace(/\./g, ".\n")
			if (talent.name != "" && talent.description != "") {
				res.talents.push(talent)
			}
		})

		res.constellations = []
		$("#constellation").children().each((i, row) => {
			const constellation = <IConstellation>{}
			constellation.name = $(row.children?.[1])?.children("h4")?.text()

			const [l, ...desc] = $(row.children?.[1])?.children("p").toArray()

			constellation.level = parseInt(l?.children[0]?.children?.[0]?.data?.match(/\d+/)[0]) || undefined

			let description = ""
			for (const node of desc) {
				description += $(node).text()
			}
			constellation.description = description || undefined

			if (constellation.name != "") {
				res.constellations.push(constellation)
			}
		})

		res.ascensions = []
		$("#ascension").children().each((i, row) => {
			const asc = <IAscension>{}
			const levels = row.children[0]
			const cost = row.children[1]
			const mats = row.children[2]

			asc.level = parseInt(levels?.children[0]?.data?.match(/\d+/)[0]) || undefined
			asc.characterLevel = parseInt(levels?.children[2]?.data?.match(/\d+/)[0]) || undefined
			asc.cost = parseInt(cost?.children[0]?.data?.match(/\d+/)[0]) || undefined

			asc.materials = []
			$(mats?.children[0]).children("li").each((j, e) => {
				const mat = <IAscensionMaterial>{}
				mat.count = parseInt(e.children[0]?.data?.match(/\d+/)[0]) || undefined
				mat.name = e.children[1]?.children[0]?.data?.trim()

				if (mat.name != undefined && mat.count != undefined) {
					asc.materials.push(mat)
				}
			})

			if (asc.level != undefined) {
				res.ascensions.push(asc)
			}
		})

		return res
	}
}

interface IGenshInParserResult extends IParserResult {
	character?: IChacracter
}

interface IChacracter {
	name: string
	starRank: number
	alternativeNames: string
	title: string
	organization: string
	origin: string
	constellationName: string
	vision: string
	weapon: string

	gender: string
	birthday: string
	bodytype: string
	height: number
	voiceActor: {
		japanese: string
		english: string
		chinese: string
	}

	description: string
	inGameDescription: string

	talents: ITalent[]
	constellations: IConstellation[]
	ascensions: IAscension[]
}

interface ITalent {
	name: string
	description: string
}

interface IConstellation {
	name: string
	level: number
	description: string
}

interface IAscension {
	level: number
	characterLevel: number
	cost: number
	materials: IAscensionMaterial[]
}
interface IAscensionMaterial { 
	count: number, 
	name: string 
}