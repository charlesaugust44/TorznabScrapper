
# Torznab Scraper

A lightweight **Torznab-compatible indexer proxy** written in **Node.js + TypeScript**.
It scrapes torrent listings from supported websites and exposes them through a **Torznab API**, allowing integration with tools such as Radarr, Sonarr, and other Torznab clients.

The project acts as a bridge between **HTML-only torrent sites** and applications that expect a **Torznab RSS/API interface**.

---

# Features

* Torznab **capabilities endpoint (`/caps`)**
* Torznab **search API (`/query`)**
* Modular scraper architecture
* Multiple scrapers selectable through **API keys**
* Concurrent scraping of detail pages
* Automatic retry on request timeouts
* RSS feed generation with **Torznab attributes**
* Magnet link extraction
* Size parsing and normalization

---

# Architecture

```
Controller
 └── torznabController.ts
        │
        ├── Discovery endpoint (/caps)
        └── Query endpoint (/query)
                │
                └── selects scraper based on API key

Model
 └── torznab.ts
        │
        ├── TorznabCaps
        ├── TorznabSearchResponse
        ├── RSSChannel
        └── RSSItem

Scrapers
 ├── scrapper.ts (base interface)
 └── comando.ts (example implementation)
```

Each torrent site is implemented as its **own scraper module**.

---

# Installation

Clone the repository:

```bash
git clone https://github.com/yourname/torznab-scraper.git
cd torznab-scraper
```

Install dependencies:

```bash
npm install
```

Run the server:

```bash
npm start
```

---

# API

## Capabilities

```
GET /torznab/api?t=caps
```

Returns Torznab capability information used by indexer clients.

---

## Search

```
GET /torznab/api
```

### Parameters

| Parameter | Description                                   |
| --------- | --------------------------------------------- |
| `apikey`  | Selects which scraper will handle the request |
| `q`       | Search term                                   |
| `imdbid`  | Optional IMDb ID                              |

Example:

```
/torznab/api?apikey=comando&q=matrix
```

The `apikey` acts as a **scraper selector**.

---

# Scraper Selection

The server supports **multiple scrapers**, each identified by an **API key**.

The key is passed in the request and used by the controller to determine which scraper should process the query.

Example logic inside the controller:

```ts
switch (req.query.apikey) {
    case 'comando':
        const response = await new ComandoScrapper().query(term);
        res.type('application/xml').send(response.toXML());
        break;
}
```

This makes it possible to expose **multiple torrent sources through a single Torznab endpoint**.

---

# Adding a New Scraper

1. Create a new scraper in the `Scrapper` directory.

Example:

```ts
export class MyScraper implements Scrapper {
    url = "https://example.com";
    queryParam = "search";

    async query(term: string): Promise<TorznabSearchResponse> {
        ...
    }
}
```

2. Register the scraper inside the controller:

```ts
switch (req.query.apikey) {

    case 'mysite':
        const response = await new MyScraper().query(term);
        res.type('application/xml').send(response.toXML());
        break;

}
```

3. Use the new scraper by calling the API with its key:

```
/torznab/api?apikey=mysite&q=movie
```

---

# Technologies

* Node.js
* TypeScript
* Express
* Axios
* Cheerio
* xmlbuilder2
