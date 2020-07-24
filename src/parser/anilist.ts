import Parser from "./parser"
import IParserResult from "../models/parserResult"

export default class AnilistParser extends Parser {
    public constructor() {
        super()
        this.Name = "Anilist"
        this.Description = "Parse Anilist Anime or Anilist Profiles"
    }
    
    public async parse(url: string): Promise<IAnilistParserResult> {
        const res: IAnilistParserResult = <IAnilistParserResult>{}
        res.Parser = this
        
        if (!url.startsWith("https://anilist.co")) {
            throw new TypeError("Not an Anilist URL")
        }
        
        if (url.startsWith("https://anilist.co/user")) {
            res.AniType = "Profile"
            if (url.endsWith("animelist")) {
                res.AniType = "Animelist"
            } else if (url.endsWith("mangalist")) {
                res.AniType = "Mangalist"
            }
        } else if(url.startsWith("https://anilist.co/anime")) {
            res.AniType = "Anime"
        } else if (url.startsWith("https://anilist.co/manga")) {
            res.AniType = "Manga"
        } else {
            throw new TypeError("Invalid Anilist URL")
        }
        
        const req = await this._axios.get(url)        
        res.RawHTML = req.data
        
        const $ = this._cheerio.load(res.RawHTML)

        switch(res.AniType) {
            case "Anime":
                res.Anime = this.parseAnime($)
                break;
            case "Manga":
                res.Manga = this.parseManga($)
                break;
            case "Profile":
                res.Profile = this.parseProfile($)
                break;
            case "Animelist":
                res.AnimeList = this.parseAnimeList($)
                break;
            case "Mangalist":
                res.MangaList = this.parseMangaList($)
                break;
        }
        res.Finished = new Date()
        
        return res
    }
    
    private parseAnime($: CheerioStatic): Anilist.Anime {
        const data = <Anilist.Anime>{}

        data.Title = $(`meta[property='og:title']`).attr("content")
        data.Description = $(`meta[property="og:description"]`).attr("content")
        data.ThumbnailURL = $(`meta[property="og:image"]`).attr("content")

        const dataSets = $(".data-set")

        try {
            let countString = dataSets[0].children[2].firstChild.data
            if (!countString) countString = dataSets[0].children[2].firstChild.firstChild.data.split(" ")[1].split(":")[0]
            
            data.EpisodeCount = parseInt(countString)
        } catch (e) {}
        
        data.Format = dataSets[1].children[2].firstChild.data.trim()
        data.EpisodeLength = dataSets[2].children[2].firstChild.data.trim()
        data.Status = dataSets[3].children[2].firstChild.data.trim()

        data.Season = dataSets[4].children[2].firstChild.data.trim()
        
        try {
            data.AvarageScore = parseInt(dataSets[5].children[2].firstChild.data.split("%")[0])
        } catch (e) {}
        try {
            data.MeanScore = parseInt(dataSets[6].children[2].firstChild.data.split("%")[0])
        } catch (e) {}
        try {
            data.Popularity = parseInt(dataSets[7].children[2].firstChild.data)
        } catch (e) {}
        try {
            data.Favorites = parseInt(dataSets[8].children[2].firstChild.data)
        } catch (e) {}

        //TODO Studios parser
        // data.Producers = []
        
        //TODO producers parser
        // data.Producers = []
        
        data.Source = dataSets[11].children[2].firstChild.data

        //TODO genres parser
        // data.Genres = []

        data.RomajiTitle = dataSets[13].children[2].firstChild.data.trim()
        data.EnglishTitle = dataSets[14].children[2].firstChild.data.trim()
        data.NativeTitle = dataSets[15].children[2].firstChild.data.trim()

        //TODO synonyms parser
        // data.Synonyms = []

        return data
    }

    private parseManga($: CheerioStatic): Anilist.Manga {
        const data = <Anilist.Manga>{}

        data.Title = $(`meta[property='og:title']`).attr("content")
        data.Description = $(`meta[property="og:description"]`).attr("content")
        data.ThumbnailURL = $(`meta[property="og:image"]`).attr("content")

        const dataSets = $(".data-set")

        data.Format = dataSets[0].children[2].firstChild.data.trim()
        data.Status = dataSets[1].children[2].firstChild.data.trim()

        try {
            data.AvarageScore = parseInt(dataSets[2].children[2].firstChild.data.split("%")[0])
        } catch (e) {}
        try {
            data.MeanScore = parseInt(dataSets[3].children[2].firstChild.data.split("%")[0])
        } catch (e) {}
        try {
            data.Popularity = parseInt(dataSets[4].children[2].firstChild.data)
        } catch (e) {}
        try {
            data.Favorites = parseInt(dataSets[5].children[2].firstChild.data)
        } catch (e) {}

        data.Source = dataSets[6].children[2].firstChild.data.trim()

        //TODO genres parser
        // data.Genres = []

        data.RomajiTitle = dataSets[8].children[2].firstChild.data.trim()
        data.NativeTitle = dataSets[9].children[2].firstChild.data.trim()

        //TODO synonyms parser
        // data.Synonyms = []

        return data
    }
    
    private parseProfile($: CheerioStatic): Anilist.Profile {
        const profile = <Anilist.Profile>{}

        return profile
    }

    private parseAnimeList($: CheerioStatic): Anilist.AnimeList {
        const list = this.parseList($)
        const animeList = <Anilist.AnimeList>{...list}

        return animeList
    }

    private parseMangaList($: CheerioStatic): Anilist.MangaList {
        const list = this.parseList($)
        const mangaList = <Anilist.MangaList>{...list}

        return mangaList
    }
    
    private parseList($: CheerioStatic): Anilist.List {
        const list = <Anilist.List>{}

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
    }

    export interface Anime extends ItemData {
        Season: string
        EpisodeCount: number
        EpisodeLength: string
        Studios: string[]
        Producers: string[]
        EnglishTitle: string
    }

    export interface Manga extends ItemData {
        
    }

    export interface List {

    }

    export interface AnimeList extends List {

    }

    export interface MangaList extends List {

    }
}