# ThermalSentinel — presentation cheat sheet

## 60-second version (if you only get one minute)
> NASA FIRMS tells you *where* the ground is hot, thousands of times a day over India. It does not tell you *what* is hot — a refinery flare, a steel plant, a coal-mine fire, a farmer's stubble burn and a forest fire all look like the same dot.
> ThermalSentinel fuses FIRMS with OpenStreetMap infrastructure and land cover, clusters detections into thermal sources and follows them over 90 days, and classifies every detection into six classes with an explainable hybrid model. Most importantly, it learns each source's normal heat and raises an alert only when a known site burns far above its baseline — that is how you separate a refinery operating normally from a refinery on fire.
> It runs today: 22,000 detections classified in seven seconds, 114 persistent sources registered, 138 incident candidates flagged out of 22,000 — a 99 % reduction in what a control room has to look at. All open data, zero licence cost, GeoJSON out to any GIS.

## Numbers to remember
| Number | Meaning |
|---|---|
| 6 | classes: industrial fire / process heat, gas flare, mining & coal-seam fire, agricultural burn, wildfire, other |
| 375 m | VIIRS pixel size |
| 90 days | analysis window for persistence |
| 750 m | DBSCAN clustering radius |
| ≥ 8 active days & ≥ 14-day span | definition of a persistent source |
| FRP ≥ 2.5× mean and z ≥ 3 | anomaly / incident-candidate rule |
| 22,179 → 4,419 → 114 | detections → thermal sources → persistent sources |
| 138 (0.6 %) | incident candidates flagged |
| 99.9 % / 98.4 % | hybrid accuracy / rules-only, on labelled archive, group-aware split |
| 34 | features the ML model sees |

## Demo script (3 minutes)
1. Open http://localhost:5173 — point at KPIs, timeline (green burst = April–May wheat-residue season).
2. Click **Jamnagar Refinery Complex** in Top sources → orange dashed footprint, 86 active days, 59 % night, timeline with the April spike (⚠ 6 anomalies).
3. Filters → tick **⚠ FRP anomalies only** → the map collapses to the handful of incident candidates.
4. Un-tick, zoom to Punjab, click a green dot → "land cover: cropland · residue-burning season · low FRP · short-lived".
5. Zoom to Barmer (Rajasthan), click a yellow dot → gas flare: 80 %+ night, steady FRP.
6. Show **Export → Persistent sources .geojson** and mention http://127.0.0.1:8000/docs.
Deep links you can paste: `http://localhost:5173/?lat=22.352&lng=70.049&z=12`

## Likely questions & answers
**Why not a CNN on satellite images?** FIRMS gives a point + FRP, not an image; the discriminating information is *temporal* (persistence) and *contextual* (what's on the ground), which a tabular model handles well and explainably. Imagery is the verification step (Sentinel-2 SWIR deep links). A Sentinel-2 chip classifier per persistent source is on the roadmap.

**Isn't 99.9 % suspicious?** Yes — the archive is physically-simulated over real sites and is clean; we say so on the slide. The value shown is that the pipeline is measurable and the model learns sensible features (land cover, night fraction, distance to industry, persistence). Real-world accuracy will be lower; that is exactly what the next-round validation is for.

**What about clouds?** Clouds hide single passes, not sources. Persistence is computed over 90 days and 4+ passes/day from three VIIRS satellites, so a missed day does not change a source's status; anomalies require a persistent baseline first.

**OSM is incomplete in India.** Three mitigations: (1) persistence itself flags an "unregistered" source even with no OSM facility (we found Raigarh / Siltara sponge-iron clusters that way in the demo); (2) a curated facility list is merged with OSM; (3) Sentinel-2 chip verification.

**False alarms?** Thresholds are relative to each source's own baseline, every label carries reasons, and an analyst can override — corrections feed retraining.

**Scale to all India, multi-year?** Overpass is queried only around hotspot cells with disk caching; storage/API are PostGIS-ready; a tile server is the roadmap item.

**How is this different from FIRMS / Global Forest Watch?** They show anomalies; we classify them, keep a registry of persistent sources with history, and alert on baseline-relative anomalies with OSM context — see the comparison slide.

**Live data?** One free NASA MAP_KEY in `backend/.env` switches the same pipeline to live VIIRS NRT. (If you obtain the key before the presentation, run the pipeline on "Gujarat industrial coast, 30 days" and show real data.)

## Before you present
- Slide 1: fill team name, members, institute.
- Start backend and frontend in two terminals (see README) at least 5 minutes before; open the browser tab in advance.
- If the demo cannot run, slide 5 is the fallback walkthrough.
