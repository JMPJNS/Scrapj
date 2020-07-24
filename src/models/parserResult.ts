import Parser from "../parser/parser"

export default interface ParserResult {
    Parser: Parser
    Finished: Date
    RawHTML: string
}