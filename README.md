# SQL Explainer: Database Administration, Lessons 4–6

An interactive, animated study site for the PUP *Database Administration* handout:

- **Lesson 4:** Basic SQL on Single Tables
- **Lesson 5:** Restricting and Sorting Data
- **Lesson 6:** SQL Functions

It has 16 sections, 22 scroll-driven query visualisations and 88 quiz questions. The lesson text is copied verbatim from the handout.

**Live site:** https://4regab.github.io/sql/

## Layout

| Path | Contents |
|---|---|
| `docs/` | The published static site (GitHub Pages serves this folder) |
| `docs/js/viz.js` | Visualisation engines (tables, number line, LIKE matcher, Venn, string tiles, timeline, ...) |
| `docs/js/quiz.js` | Quiz questions |
| `build/content.py` | Lesson content mapped onto components |
| `build/vizdefs.py` | Data and step states for every visualisation |

## Rebuild

```bash
pip install pillow
python3 build/content.py   # regenerates docs/index.html
```
