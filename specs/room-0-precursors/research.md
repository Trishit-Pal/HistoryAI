# Room 0 research

Retrieved 2026-10-02. A claim is `confirmed` only when one opened source is an official primary and another opened source is on an independent domain. Anything else stays `reported`. URLs that did not open are listed under unverified. No image binaries were added.

`noPredecessorInScope` stays true. No evolution thread is stored.

## Fact table

| id | verified claim | source URL | what was opened | confidence |
| --- | --- | --- | --- | --- |
| `evt_history_overview` | Nils J. Nilsson's history treats Aristotle's syllogism as important for AI because of its form, Boole's 1854 *Laws of Thought* as showing that some logical reasoning can be done by manipulating equations, and Babbage's Difference and Analytical Engines as engineering clues in that same quest. It does not contain one sentence that bundles all three as "documented precursors." | https://ai.stanford.edu/~nilsson/QAI/qai.pdf | Opened the author-hosted PDF (chapter 2, including the pages numbered 27, 31–32, and 55). Each of those pages says the print version is Cambridge University Press and says not to cite this PDF version. | reported |
| `evt_history_overview` | The Stanford Encyclopedia history section says the field officially started in 1956 at Dartmouth. It does not say that Aristotelian logic, calculating machines, and Boole are precursors of AI. | https://plato.stanford.edu/entries/artificial-intelligence/ | Opened the entry HTML and read the history section. | reported |
| `ctx_1843_analytical_engine` | Luigi Federico Menabrea's *Sketch of the Analytical Engine invented by Charles Babbage* was published in London by Richard and John E. Taylor in 1843; Ada King, Countess of Lovelace, is the translator. The volume's own text says the memoir is from the *Bibliothèque Universelle de Genève*, no. 82, October 1842, and the notes are signed A. A. L. | https://www.gutenberg.org/ebooks/75107 | Opened the Project Gutenberg ebook page. It states those publication facts and "Public domain in the USA." The 1842 *Bibliothèque* line and the signature "A. A. L." were read in the OCR of Internet Archive item `india.history.resource.53369` (Scientific Memoirs, vol. III, 1843). That item's metadata has no rights field, so its scan is not proposed as a file to ship. | confirmed |
| `ctx_1843_analytical_engine` | Note G includes a diagram and table for computing the Bernoulli numbers. The plate caption in the notes reads "Diagram for the computation by the Engine of the Numbers of Bernoulli. See Note G." | https://en.wikisource.org/wiki/Scientific_Memoirs/3/Sketch_of_the_Analytical_Engine_invented_by_Charles_Babbage,_Esq./Notes_by_the_Translator | Opened the Wikisource notes page, including that caption and the operation table. The page says the work was published before 1 January 1931 and is in the public domain worldwide because the author died at least 100 years ago, and it is in category PD-old. The same "diagram and table" sentence for the Bernoulli numbers was read in the Archive OCR of the 1843 volume. | confirmed |
| `ctx_1854_boole_laws_of_thought` | The title page reads *An Investigation of the Laws of Thought, on which are founded the Mathematical Theories of Logic and Probabilities*, by George Boole, LL.D., London: Walton and Maberly, Cambridge: Macmillan and Co., 1854. | https://archive.org/details/aninvestigation00boolgoog | Opened the item metadata and the title-page JPEG at `page/n2_w800.jpg`. Metadata field `possible-copyright-status` is `NOT_IN_COPYRIGHT` and `copyright-region` is `US`. The Google notice in the same file says the book has entered the public domain and that this is stated for users in the United States. No second domain was opened. | reported |
| `ctx_1936_turing_computable` | A. M. Turing, "On Computable Numbers, with an Application to the Entscheidungsproblem," *Proceedings of the London Mathematical Society*, series 2, volume 42, pp. 230–265, print issue dated 1937. The correction is in series 2, volume 43, pp. 544–546, print issue dated 1938. | https://doi.org/10.1112/plms/s2-42.1.230 | Opened the Crossref work records for `10.1112/plms/s2-42.1.230` and `10.1112/plms/s2-43.6.544`. The DOI resolver's Location header for the main paper points at `doi.wiley.com`; that HTML returned 403. A received-in-1936 date was not on the Crossref record. | reported |
| `ctx_1938_shannon_switching` | Claude E. Shannon, "A Symbolic Analysis of Relay and Switching Circuits," *Transactions of the American Institute of Electrical Engineers*, vol. 57, issue 12, pp. 713–723, December 1938. | https://doi.org/10.1109/t-aiee.1938.5057767 | Opened the Crossref work record. The DOI resolver's Location header names `https://ieeexplore.ieee.org/document/5057767/`. That Xplore HTML was a bot challenge and was not read. A second Crossref record, `10.1109/ee.1938.6431064`, is the parallel *Electrical Engineering* printing of the same pages; the exhibit citation is the Transactions record. | reported |
| `evt_1943_mcculloch_pitts` | Warren S. McCulloch and Walter Pitts, "A logical calculus of the ideas immanent in nervous activity," *The Bulletin of Mathematical Biophysics*, vol. 5, pp. 115–133, December 1943. The publisher abstract says that, because nervous activity is all-or-none, neural events and their relations can be treated by propositional logic; that the behavior of every net can be described in those terms, with more complicated logical means when the net contains circles; and that for any logical expression satisfying certain conditions there is a net that behaves as that expression describes. | https://link.springer.com/article/10.1007/BF02478259 | Opened the Springer Nature article page, including the citation meta tags and the abstract. The full PDF is a subscription preview and was not opened. | confirmed |
| `evt_1943_mcculloch_pitts` | Nilsson describes the McCulloch–Pitts element as a 0-or-1 unit with excitatory and inhibitory inputs and a threshold, connected into nets, and he captions an illustration as adapted from Fig. 1 of the 1943 paper. | https://ai.stanford.edu/~nilsson/QAI/qai.pdf | Opened those pages of the author-hosted PDF (chapter 2, pages numbered 35 and 38 in the extract). | confirmed |
| `ctx_1948_wiener_cybernetics` | A 1948 edition is catalogued as Norbert Wiener, *Cybernetics; or, Control and communication in the animal and the machine*, The Technology Press, Cambridge, Mass., copyright date 1948. The same work record lists a different edition as a reissue of the 1961 second edition. | https://openlibrary.org/books/OL52346836M | Opened the Open Library edition JSON. Its source records are Columbia, Harvard, and University of Michigan MARC. The editions list for work `OL4307531W` was also opened; one 2019 MIT Press line is explicitly "Reissue of the 1961 Second Edition." | reported |
| `ctx_1948_wiener_cybernetics` | An Internet Archive record with the same subtitle is dated 1948 and gives the publisher as "the M.I.T. Press." Other 1948 records name John Wiley & Sons, New York. None of the opened records names Hermann. | https://archive.org/details/cyberneticsorcon0000norb | Opened Archive metadata JSON for `cyberneticsorcon0000norb`, `cybernetics00wien`, and `cyberneticsorcon0000unse`. No title page was opened. No rights field was present. | reported |
| `tech_1948_shannon_information` | C. E. Shannon, "A Mathematical Theory of Communication," *Bell System Technical Journal*, vol. 27, pp. 379–423 (July 1948, issue 3) and pp. 623–656 (October 1948, issue 4). | https://doi.org/10.1002/j.1538-7305.1948.tb01338.x | Opened both Crossref work records (`10.1002/j.1538-7305.1948.tb01338.x` and `10.1002/j.1538-7305.1948.tb00917.x`). DOI Location headers name IEEE Xplore documents `6773024` and `6773067`. Those HTML pages were bot challenges and were not read. Archive metadata for `bstj27-3-379` repeats the July 1948 part, pp. 379–423, and has no rights field. Part 2 was not seen on a second domain. Fig. 1 was not opened. | reported |

### McCulloch–Pitts dossier, from the opened abstract only

- **what changed.** The publisher abstract treats all-or-none nervous activity as the reason neural events and their relations can be written in propositional logic.
- **capability.** Every such net can be described in that logic, and a logical expression that meets the paper's conditions has a net that behaves as the expression describes.
- **limit.** Circles need more complicated logical means. The existence result is only for expressions that satisfy certain conditions. The abstract also says that equivalent neurophysiological assumptions need not give the result in the same time. It does not say "no learning" or "synchronous discrete time." Those two limits are not to be seeded from this reading.
- **failure.** Not established. Status `unknown`.
- **unknown.** The opened abstract says applications of the calculus are discussed. It does not state an open problem. Do not invent one. The full paper was not opened.

Nilsson's description of the 0/1 threshold net is a secondary account of the same paper. It is not a quotation of a learning limit. The redraw is an original simple net, redrawn after the paper, not a copy of Fig. 1. Nilsson's own figure is captioned as adapted from that figure and must not be copied either.

## Asset table

| id | proposed file name | kind | license token | source URL | author | redrawnAfter | retrieval date |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `evt_history_overview` | `/museum/era-0/overview.svg` | redrawn | original | https://ai.stanford.edu/~nilsson/QAI/qai.pdf | original | https://ai.stanford.edu/~nilsson/QAI/qai.pdf | 2026-10-02 |
| `ctx_1843_analytical_engine` | `/museum/era-0/bernoulli-note-g.jpg` | scan | PD-old | https://commons.wikimedia.org/wiki/File:Diagram_for_the_computation_of_Bernoulli_numbers.jpg | Ada Lovelace |  | 2026-10-02 |
| `ctx_1854_boole_laws_of_thought` | `/museum/era-0/boole-page.jpg` | scan | PD-US-expired | https://archive.org/details/aninvestigation00boolgoog | George Boole |  | 2026-10-02 |
| `ctx_1936_turing_computable` | `/museum/era-0/turing.svg` | redrawn | original | https://doi.org/10.1112/plms/s2-42.1.230 | original | https://doi.org/10.1112/plms/s2-42.1.230 | 2026-10-02 |
| `ctx_1938_shannon_switching` | `/museum/era-0/shannon-1938.svg` | redrawn | original | https://doi.org/10.1109/t-aiee.1938.5057767 | original | https://doi.org/10.1109/t-aiee.1938.5057767 | 2026-10-02 |
| `evt_1943_mcculloch_pitts` | `/museum/era-0/mcculloch.svg` | redrawn | original | https://link.springer.com/article/10.1007/BF02478259 | original | https://link.springer.com/article/10.1007/BF02478259 | 2026-10-02 |
| `ctx_1948_wiener_cybernetics` | `/museum/era-0/wiener.svg` | redrawn | original | https://openlibrary.org/books/OL52346836M | original | https://openlibrary.org/books/OL52346836M | 2026-10-02 |
| `tech_1948_shannon_information` | `/museum/era-0/shannon-1948.svg` | redrawn | original | https://doi.org/10.1002/j.1538-7305.1948.tb01338.x | original | https://doi.org/10.1002/j.1538-7305.1948.tb01338.x | 2026-10-02 |

License phrases as the host stated them:

- Bernoulli file page: "Creative Commons Public Domain Mark 1.0" (`https://creativecommons.org/publicdomain/mark/1.0/`); "public domain in the United States"; "free of known restrictions under copyright law, including all related and neighboring rights." The page source includes the template name `PD-old-100`, and the categories include "Author died more than 100 years ago public domain images." The token used is `PD-old`. The file page dates the drawing 1842 and describes it as the Analytical Engine Bernoulli diagram from Menabrea's sketch with Lovelace's notes. Direct file: `https://upload.wikimedia.org/wikipedia/commons/c/cf/Diagram_for_the_computation_of_Bernoulli_numbers.jpg`.
- Boole item: `possible-copyright-status: NOT_IN_COPYRIGHT`, `copyright-region: US`. The token used is `PD-US-expired`. Title-page leaf: `https://archive.org/download/aninvestigation00boolgoog/page/n2_w800.jpg`.
- Gutenberg, for the 1843 text rather than the scan: "Public domain in the USA."

The plaque SVG is an original composition for the narrowed clue sentence. It is not a copy of a plate in Nilsson. The Cambridge page printed in the PDF, `https://www.cambridge.org/us/0521122937`, was not opened.

## Unverified or blocked

- `https://www.cambridge.org/us/0521122937` — Cloudflare challenge. Not opened.
- `https://www.open.edu/openlearn/digital-computing/machines-minds-and-computers/content-section-2.2` — Cloudflare challenge. Not opened. Do not cite it.
- Wiley HTML for the Turing DOI — 403. Not opened.
- IEEE Xplore HTML for documents `5057767`, `6773024`, and `6773067` — bot challenge. Not opened. The DOI Location headers were read.
- Springer PDF `10.1007/BF02478259` — subscription wall. Abstract only.
- Hermann et Cie on the 1948 *Cybernetics* title page — not on any catalog record opened. Do not print Hermann.
- Internet Archive `india.history.resource.53369` — volume identified, OCR read, no rights field. Do not ship that scan.
- Internet Archive `bstj27-3-379` — bibliographic metadata read, no rights field. A 1948 journal scan is not treated as a file to ship. Fig. 1 was not opened.
- `https://www.loc.gov/item/49002391/` — opened, and it is a different book (*Techniques in plant layout*, 1949). Do not use it for Wiener.
- Kazimierz Trzęsicki, "Idea of Artificial Intelligence," *Studia Humana* 9, no. 3 (2020), https://doi.org/10.2478/sh-2020-0027 — opened the CC-BY PDF. It discusses Aristotle's syllogistic, names Boole's 1847 *Mathematical Analysis of Logic* rather than the 1854 book, and describes Leibniz's calculating machine. It does not state the bundled precursor claim, and it does not mention Babbage. It is not a confirming source for the plaque.

No exhibit is blocked from seeding if the public story stays inside the sentences above. Pause these three pieces of the build:

- Do not mark the entrance plaque `confirmed`.
- Do not seed "no learning," "synchronous discrete time," or an invented open problem on `evt_1943_mcculloch_pitts`.
- Do not draw `shannon-1948.svg` from memory. Fig. 1 was not opened. The existing SVG should be checked against the IEEE figure before it is treated as a redraw of that diagram.

## Shipped files

The Bernoulli diagram in `public/museum/era-0/bernoulli-note-g.jpg` was downloaded from the Commons file named above and reduced so the long side is 1024 pixels. The Boole file in the repo is the title page from Internet Archive item `investigationofl00boolrich` (leaf `page/n4_w800.jpg`), visually checked, then reduced to a 1024-pixel long side. It is not the Google scan `aninvestigation00boolgoog`. Both books are the 1854 edition. `engine.svg` is unused.

The Shannon 1948 SVG follows the five part names in the Archive text extract of the paper. It is not a copy of the printed figure, which was not opened.

The same text extract, `bstj27-3-379_text.pdf`, was read. It names Nyquist and Hartley, says the paper includes noise in the channel and the statistical structure of the message, sets semantic aspects aside, uses a logarithmic measure, defines a bit as one binary choice, says N two-state devices store N bits, names the five parts plus a noise source, and says the discrete noiseless case comes before the continuous and mixed cases in the second half. Claims in the seed stay inside those sentences. The printed figure was still not opened.

## Threads

No sourced thread.

The Springer page's reference list for McCulloch and Pitts names Carnap, *The Logical Syntax of Language* (1938); Hilbert and Ackermann, *Grundzüge der Theoretischen Logik* (1927); and Russell and Whitehead, *Principia Mathematica* (1925). It does not name Turing, Boole, Shannon, or Wiener. Shannon's 1948 reference list was not opened, and OpenAlex returned no extracted references for that DOI. A sentence in which one paper in this set cites another was not found.
