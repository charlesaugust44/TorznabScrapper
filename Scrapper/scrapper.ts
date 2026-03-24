import { TorznabSearchResponse } from "../Model/torznab.js";

export abstract class Scrapper {
    abstract url: string;
    abstract queryParam: string;
    abstract query(term: string): Promise<TorznabSearchResponse>;
}