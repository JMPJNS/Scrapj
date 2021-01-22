import Parser from "./parser"
import IParserResult from "../models/parserResult"
import {InvalidURLError, NotImplementedError} from "../errors"

export default class AnilistParser extends Parser {
	public constructor() {
		super()
		this.Name = "Anilist"
		this.Description = "Parse Anilist Anime or Anilist Profiles"
	}
    
	public async parse(url: string): Promise<IAnilistParserResult> {
		const res: IAnilistParserResult = <IAnilistParserResult>{}
		res.Parser = this
        
		const baseUrl = "https://anilist.co"
        
		if (!url.startsWith(baseUrl)) {
			throw new InvalidURLError("Not an Anilist URL")
		}
        
		if (url.startsWith(baseUrl+"/user")) {
			res.AniType = "Profile"
			if (url.endsWith("animelist")) {
				res.AniType = "Animelist"
			} else if (url.endsWith("mangalist")) {
				res.AniType = "Mangalist"
			}
		} else if(url.startsWith(baseUrl+"/anime")) {
			res.AniType = "Anime"
		} else if (url.startsWith(baseUrl+"/manga")) {
			res.AniType = "Manga"
		} else {
			throw new InvalidURLError("Invalid Anilist URL")
		}
        
		const req = await this._axios.get(url)        
		// res.RawHTML = req.data
        
		const $ = this._cheerio.load(req.data)

		switch(res.AniType) {
		case "Anime":
			res.Anime = this.parseAnime($)
			break
		case "Manga":
			res.Manga = this.parseManga($)
			break
		case "Profile":
			res.Profile = this.parseProfile($)
			break
		case "Animelist":
			res.AnimeList = this.parseAnimeList($)
			break
		case "Mangalist":
			res.MangaList = this.parseMangaList($)
			break
		}
		res.Finished = new Date()
        
		return res
	}
    
	private parseAnime($: CheerioStatic): Anilist.Anime {
		const data = this.parseItemData($)
		const anime = <Anilist.Anime>{...data}

		$(".data-set").each((i, row) => {
			const name = row.children[0].children[0].data
			const child = row.children[2].children
			switch (name) {
			case "Airing":
				try {
					anime.EpisodeCount = parseInt(child[0].children[0].data.trim().split(" ")[1].split(":")[0])
				} catch (e) {}
				break
				// Episodes after Airing to overwrite the Episode Count if present
			case "Episodes":
				try {
					anime.EpisodeCount = parseInt(child[0].data)
				} catch (e) {}
				break
			case "Season":
				anime.Season = child[0].data.trim()
				break
			case "Studios":
				anime.Studios = []
				for (const studio of child) {
					anime.Studios.push(studio.children[0].children[0].data.trim())
				}
				break
			case "Producers":
				anime.Producers = []
				for (const producer of child) {
					anime.Producers.push(producer.children[0].children[0].data.trim())
				}
				break
			}
		})

		return anime
	}

	private parseManga($: CheerioStatic): Anilist.Manga {
		const data = this.parseItemData($)
		const manga = <Anilist.Manga>{...data}

		$(".data-set").each((i, row) => {
			const name = row.children[0].children[0].data
			const child = row.children[2].children
			switch (name) {
			}
		})

		return manga
	}
    
	private parseItemData($: CheerioStatic): Anilist.ItemData {
		const data = <Anilist.ItemData>{}

		data.Title = $("meta[property='og:title']").attr("content")
		data.Description = $("meta[property=\"og:description\"]").attr("content")
		data.ThumbnailURL = $("meta[property=\"og:image\"]").attr("content")

		$(".data-set").each((i, row) => {
			const name = row.children[0].children[0].data
			const child = row.children[2].children
			switch (name) {
			case "Format":
				data.Format = child[0].data.trim()
				break
			case "Status":
				data.Status = child[0].data.trim()
				break
			case "Mean Score":
				try {
					data.MeanScore = parseInt(child[0].data.split("%")[0].trim())
				} catch (e) {}
				break
			case "Avarage Score":
				try {
					data.AvarageScore = parseInt(child[0].data.split("%")[0].trim())
				} catch (e) {}
				break
			case "Popularity":
				try {
					data.Popularity = parseInt(child[0].data.trim())
				} catch (e) {}
				break
			case "Favorites":
				try {
					data.Favorites = parseInt(child[0].data.trim())
				} catch (e) {}
				break
			case "Source":
				data.Source = child[0].data.trim()
				break
			case "English":
				data.EnglishTitle = child[0].data.trim()
				break
			case "Romaji":
				data.RomajiTitle = child[0].data.trim()
				break
			case "Native":
				data.NativeTitle = child[0].data.trim()
				break
			case "Genres":
				data.Genres = []
				for (const genre of child) {
					data.Genres.push(genre.children[0].children[0].data.trim())
				}
				break
			}
		})
                
		return data
	}
    
	private parseProfile($: CheerioStatic): Anilist.Profile {
		const profile = <Anilist.Profile>{}
		throw new NotImplementedError("This Feature is not yet implemented")

		return profile
	}

	private parseAnimeList($: CheerioStatic): Anilist.AnimeList {
		const list = this.parseList($)
		const animeList = <Anilist.AnimeList>{...list}
		throw new NotImplementedError("This Feature is not yet implemented")

		return animeList
	}

	private parseMangaList($: CheerioStatic): Anilist.MangaList {
		const list = this.parseList($)
		const mangaList = <Anilist.MangaList>{...list}
		throw new NotImplementedError("This Feature is not yet implemented")

		return mangaList
	}
    
	private parseList($: CheerioStatic): Anilist.List {
		const list = <Anilist.List>{}
		throw new NotImplementedError("This Feature is not yet implemented")

		return list
	}
}

interface IAnilistParserResult extends IParserResult {
    AniType: "Anime" | "Profile" | "Manga" | "Animelist" | "Mangalist"
    Anime: Anilist.Anime
    Manga: Anilist.Manga
    Profile: Anilist.Profile
    AnimeList: Anilist.AnimeList
    MangaList: Anilist.MangaList
}

namespace Anilist {

    export interface Profile {

    }

    export interface ItemData {
        Title: string
        Description: string
        ThumbnailURL: string
        Format: string
        Status: string
        AvarageScore: number
        MeanScore: number
        Popularity: number
        Favorites: number
        Source: string
        Genres: string[]
        RomajiTitle: string
        NativeTitle: string
        Synonyms: string[]
        EnglishTitle: string
    }

    export interface Anime extends ItemData {
        Season: string
        EpisodeCount: number
        EpisodeLength: string
        Studios: string[]
        Producers: string[]
    }

    export type Manga = ItemData

    export interface List {

    }

    export type AnimeList = List

    export type MangaList = List
}