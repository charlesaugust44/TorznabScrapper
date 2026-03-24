import { Request, Response } from "express";
import { TorznabCaps } from "../Model/torznab.js";
import { ComandoScrapper } from "../Scrapper/comando.js";

export class TorznabController {
    static discovery(req: Request, res: Response) {
        const caps = new TorznabCaps();
        caps.serverTitle = "Local Indexer";
        caps.limitsMax = 50;
        
        console.log(`Discovery request: ${req.url}`);

        res.set("Content-Type", "application/xml");
        return res.send(caps.toXML());
    }

    static async query(req: Request, res: Response) {
        let term = req.query.imdbid ?? req.query.q ?? "";

        term = term.toString();

        switch (req.query.apikey) {
            case 'comando':
                const response = await new ComandoScrapper().query(term);
                res.type('application/xml').send(response.toXML());
                break;
            default:
                res.status(404).send("No api recognized");
        }
    }
}