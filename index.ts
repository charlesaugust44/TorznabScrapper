import express, {Application, Request, Response} from "express";
import { TorznabController } from "./Controller/torznabController.js";

const app: Application = express();
const PORT: number = 9118;

app.get("/torznab/api", (req: Request, res: Response) => {
    if (req.query.t === "caps") {
        return TorznabController.discovery(req, res);
    }

    return TorznabController.query(req, res);
});

app.use((req: Request, res: Response) => {
    res.status(404).json({ 
        error: "Not Found", 
        message: `Cannot ${req.method} ${req.url}` 
    });
});

app.listen(PORT, () => {
    console.log("local torznab indexer running on port", PORT)
});