import { RSSItem, TorznabSearchResponse } from "../Model/torznab.js";
import { Scrapper } from "./scrapper.js";
import axios, { AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";
import crypto from "crypto";

export class ComandoScrapper implements Scrapper {
    url = "https://cmd1.site";
    queryParam = "s";

    async query(term: string): Promise<TorznabSearchResponse> {
        const response = new TorznabSearchResponse("cmd1");

        const $ = await this.#fetchSearch(term);
        const anchors = $(".center-widget .post-title a").toArray();

        await Promise.allSettled( 
            anchors.map((el: any) => this.#fetchDetails($(el).attr("href"), response))
        );

        return response;
    }

    #getSearchUrl(term: string): string {
        const url = `${this.url}?${this.queryParam}=${term}`;
        console.log(`Searching: ${url}`);
        return url;
    }

    async #fetchSearch(term: string): Promise<any> {
        //TODO: handle errors properly
        const searchResponse = await axios.get(this.#getSearchUrl(term), this.#getConfig());

        return cheerio.load(searchResponse.data);        
    }

    async #fetchDetails(url: string|undefined, res: TorznabSearchResponse) {
        if (url === undefined) {
            return;
        }

        //TODO: handle errors properly
        const detailsResponse = await axios.get(url, this.#getConfig());

        const $ = cheerio.load(detailsResponse.data);

        const hash = crypto.createHash('sha256')
        hash.update(url);

        const getImdbId = (url: string|undefined) => url?.match(/tt\d{7,8}/)?.[0] ?? '';

        const pageTitle = $(".center-widget .post-title a").first().text().trim()
        const id = hash.digest('hex');
        const imdbid = getImdbId($(".post-content a").first().attr("href"));

        $(".center-widget .post-content a").each((index, el) => {
            const magnet = $(el).attr("href");

            if (magnet === undefined) return;
            if (!magnet.startsWith("magnet:")) return;

            const title = new URL(magnet).searchParams.get("dn") ?? pageTitle;

            res.addItem(new RSSItem(
                title,
                id + index,
                url,
                'description',
                new Date(),
                magnet,
                imdbid
            ));
        });
    }

    #getConfig(): AxiosRequestConfig {
        return {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            timeout: 10000
        }
    }
}