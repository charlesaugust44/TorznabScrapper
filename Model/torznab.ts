import { create } from 'xmlbuilder2';


/**
 * Base class for all Torznab responses.
 * Provides a common serialization interface.
 */
export abstract class Torznab {
    /**
     * Serializes the response to an XML string.
     */
    abstract toXML(): string;
}

/**
 * Represents the `<caps>` response, used for capability discovery.
 */
export class TorznabCaps extends Torznab {
    serverVersion: string = "1.0";
    serverTitle: string = "cmd1";
    limitsMax: number = 100;
    limitsDefault: number = 50;

    // Searching capabilities
    searchAvailable: boolean = true;
    tvSearchAvailable: boolean = true;
    movieSearchAvailable: boolean = true;

    // Categories
    categories: { id: number; name: string }[] = [
        { id: 2000, name: "Movies" },
        { id: 5000, name: "TV" },
    ];

    toXML(): string {
        const root = create({ version: "1.0", encoding: "UTF-8" })
            .ele("caps", { "xmlns:torznab": "http://torznab.com/schemas/2015/feed" });

        root.ele("server", { version: this.serverVersion, title: this.serverTitle });

        root.ele("limits", { max: this.limitsMax, default: this.limitsDefault });

        const searching = root.ele("searching");
        searching.ele("search", { available: this.searchAvailable ? "yes" : "no" });
        searching.ele("tv-search", { available: this.tvSearchAvailable ? "yes" : "no" });
        searching.ele("movie-search", { available: this.movieSearchAvailable ? "yes" : "no" });

        const cats = root.ele("categories");
        for (const cat of this.categories) {
            cats.ele("category", { id: cat.id, name: cat.name });
        }

        return root.end({ prettyPrint: true });
    }
}

/**
 * Represents a torznab attribute inside an RSS item.
 */
export interface TorznabAttr {
    name: string;
    value: string;
}

/**
 * Represents an RSS item.
 */
export class RSSItem {
    title: string;
    guid: string;
    link: string;
    description: string;
    pubDate: Date;
    magnet: string;
    enclosureLength: number = 0;
    enclosureType: string = "application/x-bittorrent";
    size: number;
    torznabAttrs: TorznabAttr[] = [];

    constructor(title: string, guid: string, link: string, description: string, pubDate: Date, magnet: string, size: number, torznabAttrs: Object) {
        this.title = title;
        this.guid = guid;
        this.link = link;
        this.description = description;
        this.pubDate = pubDate;
        this.magnet = magnet;
        this.size = size;

        for (const [name, value] of Object.entries(torznabAttrs)) {
            this.torznabAttrs.push({ name, value });
        }        
    }

    toXML(builder: any) {
        builder.ele("title").dat(this.title);
        builder.ele("guid").txt(this.guid);
        builder.ele("comments").txt(this.link);
        builder.ele("description").dat(this.description);
        builder.ele("size").txt(this.size.toString());
        builder.ele("pubDate").txt(this.pubDate.toUTCString());
        builder.ele("enclosure", {
            url: this.magnet,
            length: this.enclosureLength,
            type: this.enclosureType,
        });

        for (const attr of this.torznabAttrs) {
            builder.ele("torznab:attr", { name: attr.name, value: attr.value });
        }
    }
}

/**
 * Represents the RSS feed channel.
 */
export class RSSChannel {
    title: string;
    items: RSSItem[] = [];

    constructor(title: string) {
        this.title = title;
    }

    addItem(item: RSSItem): void {
        this.items.push(item);
    }
}

/**
 * Represents the search response (RSS feed with torznab extensions).
 */
export class TorznabSearchResponse extends Torznab {
    channel: RSSChannel;

    constructor(channelTitle: string) {
        super();
        this.channel = new RSSChannel(channelTitle);
    }

    addItem(item: RSSItem): void {
        this.channel.addItem(item);
    }

    toXML(): string {
        const root = create({ version: "1.0", encoding: "UTF-8" })
            .ele("rss", { version: "2.0", "xmlns:torznab": "http://torznab.com/schemas/2015/feed"});

        const channel = root.ele("channel");
        channel.ele("title").txt(this.channel.title);

        for (const item of this.channel.items) {
            item.toXML(channel.ele("item"));            
        }

        return root.end({ prettyPrint: true });
    }
}