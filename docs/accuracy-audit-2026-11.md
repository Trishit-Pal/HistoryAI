# Accuracy audit, November 2026 (proposal, nothing changed yet)

Scope: all 35 exhibits in `src/seed/eras.ts`, `src/seed/era0.ts` and `data/museum-snapshot.json`. The seed and snapshot text match.

The bar being applied comes from `src/domain/confidence.ts` and `validator.ts`. To be `confirmed`, an exhibit needs `officialPrimary === true` and citations from at least 2 distinct hostnames (with `www.` stripped). Technical-layer canon exhibits also need every claim backed by a primary-kind source (paper, technical_report, dataset_paper, benchmark_paper, peer_reviewed_retrospective). For this audit, "primary" means the work itself (by DOI, the publisher, or an archive scan) or an official record from the organisation involved. Wikipedia, blogs, news and secondary histories do not count.

Method: I checked existing DOIs against Crossref (title, author and year match). I opened the official pages and archive items listed below on 2026-11-04. Where a page could not be opened, the notes say so.

## Summary

| Verdict | Count |
|---|---|
| CONFIRM | 23 |
| CONFIRM-WITH-FIX (add one verified primary URL) | 5 |
| WITHDRAW | 7 |

**WITHDRAW:** `evt_history_overview`, `evt_1974_first_winter`, `evt_1987_lisp_collapse`, `evt_2015_google_photos`, `evt_2017_transformer_citations`, `evt_2025_winter_debate`, `evt_2026_frontier_snapshot`.

**Eras that would have no exhibits after the withdrawals:**
- `era_5_second_winter`. Its only exhibit is `evt_1987_lisp_collapse`.
- `era_4_expert_systems` would also be empty if the fix for `evt_1985_expert_spend` is rejected (see concern 1).

**Era summaries in `src/domain/eras.ts` that would need editing:**
- era_3: drop "as promises met the limits of symbolic AI", which comes from the withdrawn first-winter exhibit.
- era_5: the whole summary goes, or the room is hidden.
- era_10: drop "and an open debate about a new winter".

**Data note:** none of the exhibits carries `officialPrimary` today except the 3 already confirmed and `evt_2023_cais`. `evt_2023_cais` already has `officialPrimary: true` but is still `reported`. Promoting an exhibit therefore means setting `officialPrimary: true` and `confidence: "confirmed"` in both the seed and the snapshot.

### Concerns

1. **evt_1985_expert_spend:**
   - Both current citations are on `osti.gov`. The only second hostname I could verify is `doi.org/10.2172/5692492`, which resolves to the *same* OSTI report. That meets the hostname rule on paper but is not independent corroboration. The site already accepts this pattern elsewhere: `ctx_1936_turing_computable` cites a DOI plus a university copy of the same paper. The owner should decide whether that counts.
   - Separately, the editorial note calls the source "the Argonne report". It is actually DOE/NE-0064, *Artificial Intelligence and Nuclear Power*, a June 1985 report by the U.S. DOE Assistant Secretary for Nuclear Energy's Technology Transfer AI Task Team. Argonne is only one of the labs it surveys. The $400 million sentence is on that report's summary page ("It has been estimated that AI related activities underway funded both by Government and by industry in 1985 total about $400 million").
   - The exhibit is titled "Expert systems…", but the figure covers all AI-related activity, not expert systems.
2. **Edition caveats:**
   - Perceptrons: the verified MIT Press DOI is the 2017 reissue, not the 1969 printing.
   - Cybernetics: the archive.org scan already cited is the 1961 MIT Press second edition (access-restricted lending copy), not 1948.
   - Both are the primary work, but in a later edition.
3. **Pages I could not open:**
   - `openai.com/index/chatgpt/` and `openai.com/index/gpt-5-6/` returned 403 to my fetcher.
   - The ImageNet 2012 results page refused connections. It shows up in search with SuperVision 0.15315 against 0.26172 for the next team, but I did not open it, so it is not proposed.
   - I did not re-open EUR-Lex, arXiv 1406.2661 or the Nature pages. Their DOIs or URLs are standard and Crossref-consistent where applicable.
4. **Pass-through citations:**
   - The NAP ALPAC URL now 301-redirects to `https://www.nationalacademies.org/publications/9547`. I verified that it is *Language and Machines*. Updating it is optional; the hostname count is unaffected either way (nap.nationalacademies.org vs wikipedia.org).
   - `jmc.stanford.edu` fails TLS over https (certificate mismatch). Keep it as `http://`; that version serves the 1955 proposal PDF.

## Table

Domains = the distinct hostnames after `www.` is stripped (* = after the proposed fix).

| id | title | year / era | current | verdict | primary citation | domains | notes |
|---|---|---|---|---|---|---|---|
| evt_history_overview | Mechanical and logical precursors | 1854 / era_0 | reported | **WITHDRAW** | none (Nilsson's *Quest for AI* is a secondary history) | 1 (ai.stanford.edu) | A framing plaque about how a history book frames the field, not a documented event. Only one domain. |
| ctx_1843_analytical_engine | Sketch of the Analytical Engine | 1843 / era_0 | reported | **CONFIRM-WITH-FIX** | add archive.org scan of *Scientific Memoirs* vol. III (1843) | 2 → 3* (gutenberg.org, wikisource.org, archive.org) | Current citations are transcriptions. The verified scan contains "Art. XXIX.—Sketch of the Analytical Engine… By L. F. Menabrea" (p. 666 ff.), Note G and the Bernoulli-numbers table. |
| ctx_1854_boole_laws_of_thought | The Laws of Thought | 1854 / era_0 | reported | **CONFIRM** | archive.org/details/aninvestigation00boolgoog (scan of the 1854 book) | 2 (archive.org, wikisource.org) | The Wikisource page is also a page of a djvu scan of the 1854 printing. The story only transcribes the title page, which is supported. |
| ctx_1936_turing_computable | On Computable Numbers | 1936 / era_0 | reported | **CONFIRM** | doi.org/10.1112/plms/s2-42.1.230 (Proc. LMS; Crossref: Turing, s2-42, pp. 230–265) | 2 (doi.org, cs.virginia.edu) | Crossref dates the issue 1937. The existing note already covers this. |
| ctx_1938_shannon_switching | Relay and switching circuits | 1938 / era_0 | reported | **CONFIRM** | doi.org/10.1109/t-aiee.1938.5057767 (Crossref: Shannon, vol. 57, pp. 713–723, Dec 1938) | 2 (doi.org, cs.virginia.edu) | Volume and pages in the story match Crossref. |
| evt_1943_mcculloch_pitts | McCulloch–Pitts neuron | 1943 / era_0 | confirmed | **CONFIRM** (keep) | link.springer.com/article/10.1007/BF02478259 (Crossref: McCulloch, Pitts, Dec 1943) | 2 (link.springer.com, ai.stanford.edu) | Technical canon: all 5 claims rest on `src_1943_mcculloch_pitts` (paper). OK. |
| ctx_1948_wiener_cybernetics | Cybernetics | 1948 / era_0 | reported | **CONFIRM** (borderline) | archive.org/details/cyberneticsorcon00wien (scan of the book, **1961** MIT Press 2nd ed., lending-only) | 2 (openlibrary.org, archive.org) | The 1948 date rests on the Open Library catalogue record. See Text corrections. If the owner wants a 1948 scan specifically, there is none I could verify, so withdraw instead. |
| tech_1948_shannon_information | A Mathematical Theory of Communication | 1948 / era_0 | reported | **CONFIRM** | doi.org/10.1002/j.1538-7305.1948.tb01338.x (Crossref: Shannon, BSTJ 27, pp. 379–423, July 1948) | 2 (doi.org, archive.org) | Technical canon: claims rest on `src_1948_shannon_information` (paper). OK. |
| evt_1950_turing | Turing's imitation game | 1950 / era_1 | reported | **CONFIRM** | doi.org/10.1093/mind/LIX.236.433 (Crossref: Turing, Mind, Oct 1950) | 2 (doi.org, wikipedia.org) | Supported. |
| evt_1956_dartmouth | Dartmouth Summer Research Project on AI | 1956 / era_1 | confirmed | **CONFIRM** (keep, fix text) | jmc.stanford.edu/articles/dartmouth/dartmouth.pdf (the 31 Aug 1955 proposal) and the Dartmouth College official page | 3 (home.dartmouth.edu, wikipedia.org, jmc.stanford.edu) | "Eight-week" and "Newell and Simon presented the Logic Theorist" are not in either primary source. See Text corrections. |
| evt_1958_perceptron | Rosenblatt's Perceptron | 1958 / era_2 | reported | **CONFIRM** (fix text) | doi.org/10.1037/h0042519 (Crossref: Rosenblatt, 1958) | 2 (doi.org, wikipedia.org) | The 1958 paper is a probabilistic model, not hardware. |
| evt_1965_dendral | DENDRAL | 1965 / era_2 | reported | **CONFIRM** (fix text) | doi.org/10.1016/0004-3702(93)90068-M: Lindsay, Buchanan, Feigenbaum, Lederberg (1993), the builders' own peer-reviewed case study (validator kind `peer_reviewed_retrospective` is primary) | 2 (doi.org, softwarepreservation.computerhistory.org) | The Crossref title is "DENDRAL: A case study of the first expert system for scientific hypothesis formation", so state it that way. |
| evt_1966_eliza | ELIZA | 1966 / era_2 | reported | **CONFIRM** | dl.acm.org/doi/10.1145/365153.365168 (Crossref: Weizenbaum, CACM 1966) | 2 (dl.acm.org, wikipedia.org) | "Eliza effect" rests on Wikipedia; acceptable as a later label. |
| evt_1966_alpac | ALPAC report | 1966 / era_2 | reported | **CONFIRM** | nap.nationalacademies.org/catalog/9547 (the National Academies' own publication of the report) | 2 (nap.nationalacademies.org, wikipedia.org) | The URL 301s to nationalacademies.org/publications/9547 (verified). The funding cut rests on Wikipedia; soften the wording. |
| evt_1969_perceptrons | Limits of the single-layer perceptron | 1969 / era_2 | reported | **CONFIRM-WITH-FIX** | add doi.org/10.7551/mitpress/11301.001.0001 (MIT Press, Minsky & Papert, *Perceptrons*; Crossref date 2017-09-22) | 2 → 3* (openlibrary.org, wikipedia.org, doi.org) | The DOI resolves to direct.mit.edu/books/book/3132/…, whose page body returned 403. This is the 2017 reissue; label it so. "Chilled funding" is unsupported. |
| evt_1973_lighthill | Lighthill Report | 1973 / era_3 | reported | **CONFIRM** | aiai.ed.ac.uk/events/lighthill1973/lighthill.pdf (the report text; contains "In no part of the field have the discoveries made so far produced the major impact that was then promised") | 2 (aiai.ed.ac.uk, wikipedia.org) | The report is dated July 1972 and was published 1973. "Deep UK funding cuts" rests on Wikipedia. |
| evt_1974_first_winter | First AI winter | 1974 / era_3 | reported | **WITHDRAW** | none (Nilsson and Wikipedia are both secondary) | 2 | A retrospective period label, not a documented event. The exhibit's own fieldChange says so. |
| evt_1985_expert_spend | Expert systems commercial boom | 1985 / era_4 | reported | **CONFIRM-WITH-FIX** (see concern 1) | osti.gov/servlets/purl/5692492 = DOE/NE-0064, a June 1985 U.S. DOE report (official government record); $400M sentence verified in its text | 1 → 2* (osti.gov, doi.org via 10.2172/5692492) | Second hostname is a DOI for the same report. The $150M figure is a 1985 *Editorial Research Reports* note by M. Leepson (OSTI 5249661), which is secondary. |
| evt_1987_lisp_collapse | LISP-machine market collapse | 1987 / era_5 | reported | **WITHDRAW** | none (MIT OCW item is a student course paper; Wikipedia) | 2 | No Symbolics filing or annual report found online (EDGAR starts in the mid-1990s). The era empties. |
| evt_1997_deep_blue | Deep Blue defeats Kasparov | 1997 / era_6 | reported | **CONFIRM** (cut a clause) | ibm.com/history/deep-blue (official IBM record; verified: Kasparov won 1996 4–2, Deep Blue won 1997 3.5–2.5) | 2 (ibm.com, wikipedia.org) | "Closing a games chapter opened at Dartmouth" is unsupported. |
| evt_2011_watson | Watson wins Jeopardy! | 2011 / era_6 | reported | **CONFIRM** | ibm.com/history/watson-jeopardy (official IBM record; verified: defeated Rutter and Jennings, February 2011) | 2 (ibm.com, wikipedia.org) | The "statistical NLP and retrieval" characterisation is interpretive; it could name the players instead. |
| evt_2012_alexnet | AlexNet at ILSVRC | 2012 / era_7 | reported | **CONFIRM** (fix text) | proceedings.neurips.cc …c399862d…-Paper.pdf (the NeurIPS 2012 paper) | 2 (proceedings.neurips.cc, pinecone.io) | 26.2% was the *second-best 2012 entry*, not a prior record. Pinecone is a weak second; consider replacing it once image-net.org can be opened. |
| evt_2014_gan | Generative adversarial networks | 2014 / era_7 | reported | **CONFIRM** | arxiv.org/abs/1406.2661 (the paper) | 2 (arxiv.org, wikipedia.org) | Supported. |
| evt_2015_google_photos | Google Photos gorilla mislabel | 2015 / era_7 | reported | **WITHDRAW** | none. AIID report 648 is a 2017 TechSeen listicle; Gigazine is news | 2 | No official Google record. The well-known primaries are individuals' tweets. |
| evt_2016_tay | Tay | 2016 / era_7 | reported | **CONFIRM** (minor text) | blogs.microsoft.com/blog/2016/03/25/learning-tays-introduction/ (Microsoft's official post; verified) | 2 (blogs.microsoft.com, incidentdatabase.ai) | "16 hours" comes from AIID; Microsoft says "in the first 24 hours". |
| evt_2016_alphago | AlphaGo versus Lee Sedol | 2016 / era_7 | reported | **CONFIRM-WITH-FIX** | add deepmind.google/research/breakthroughs/alphago/ (official DeepMind record; verified: "4-1 victory in Seoul… March 2016", "In game two, it played Move 37") | 2 → 3* (nature.com, wikipedia.org, deepmind.google) | The Nature paper (Jan 2016) covers Fan Hui, not Lee Sedol, so today nothing primary supports the 4–1 claim. |
| evt_2017_transformer | Attention Is All You Need | 2017 / era_8 | confirmed | **CONFIRM** (keep, fix text) | arxiv.org/abs/1706.03762 (the paper; abstract and v7 first page verified) | 2 (arxiv.org, wikipedia.org) | Not all eight authors were at Google, and "3.5 days on eight GPUs" applies to EN–FR only. |
| evt_2017_transformer_citations | Transformer citation-count claim | 2017 / era_8 | reported (provisional) | **WITHDRAW** | n/a | 1 | A plaque that states no claim. One domain. Provisional. |
| evt_2020_alphafold | AlphaFold2 | 2020 / era_9 | reported | **CONFIRM** (grammar) | nature.com/articles/s41586-021-03819-2 (Crossref: Jumper et al., July 2021) | 2 (nature.com, wikipedia.org) | Supported. |
| evt_2022_chatgpt | ChatGPT research preview | 2022 / era_9 | reported | **CONFIRM** | openai.com/index/chatgpt/ (OpenAI's own 30 Nov 2022 announcement) | 2 (openai.com, wikipedia.org) | The page returned 403 to my fetcher, so I did not re-read it this pass. |
| evt_2023_cais | Statement on AI Risk | 2023 / era_10 | reported (`officialPrimary` already true) | **CONFIRM** (fix text) | safe.ai/work/press-release-ai-risk (CAIS official, 30 May 2023; verified) and arxiv.org/abs/2401.02843 (the survey paper) | 2 (safe.ai, arxiv.org) | The "38 percent" figure misreads the abstract. |
| evt_2024_eu_ai_act | EU AI Act | 2024 / era_10 | reported | **CONFIRM** | eur-lex.europa.eu/eli/reg/2024/1689/oj/eng (Official Journal text) | 2 (eur-lex.europa.eu, wikipedia.org) | Optional: "are reported for" → "set by Article 99". |
| evt_2024_nobel | 2024 Nobel Prizes in Physics and Chemistry | 2024 / era_10 | reported | **CONFIRM-WITH-FIX** | nobelprize.org summaries (official) plus a Royal Swedish Academy press release | 1 → 2* (nobelprize.org, kva.se) | Both current URLs share one hostname. Chemistry wording needs the share split. |
| evt_2025_winter_debate | 2025 winter-or-bubble debate | 2025 / era_10 | disputed | **WITHDRAW** | none (a blog and Wikipedia) | 2 | Disputed, and a debate rather than a documented event. |
| evt_2026_frontier_snapshot | September 2026 frontier model names | 2026 / era_10 | reported (provisional) | **WITHDRAW** | (lab pages exist: anthropic.com/claude-opus-5-5 verified, dated 22 Sep 2026; OpenAI page 403) | 2 | Withdrawn by nature rather than sourcing: it is perishable, provisional, and the note says it is "expected to be wrong within weeks". |

## Text corrections

These apply even where the exhibit stays or becomes confirmed.

- **evt_1956_dartmouth**:
  - "An eight-week workshop that coined the term artificial intelligence" → "A summer workshop at Dartmouth, proposed in August 1955 as a "2 month, 10 man study of artificial intelligence"; the proposal's title introduced the term." Neither primary gives eight weeks; the proposal says 2 months.
  - "Newell and Simon presented the Logic Theorist" rests only on Wikipedia. Cut it, or attribute it to that page.
  - The Dartmouth page body never says "coined"; only its HTML title does. The fieldChange sentence "Dartmouth College's account says the name… was coined" should cite the McCarthy proposal instead.
- **evt_1958_perceptron:** "an early hardware neural-network learning system" → "a probabilistic model of a learning network". The 1958 paper is theoretical, and the Mark I hardware came later. "amid press claims that went far beyond the demonstrated work" rests on Wikipedia only. Keep it if the owner accepts that, otherwise cut.
- **evt_1965_dendral:** "is generally cited as the first expert system" → "which its builders' 1993 case study calls the first expert system for scientific hypothesis formation". The fieldChange's "one of the first large programs" should match.
- **evt_1966_alpac:** "cutting U.S. government MT funding" → "after which U.S. government MT funding was sharply reduced". The second half rests on Wikipedia, not on the report.
- **evt_1969_perceptrons:**
  - "which chilled neural-network funding for years" is not in any cited source. Cut it, or write "and is often credited with…" with Wikipedia as the source.
  - Name the citation as the MIT Press 2017 reissue.
  - The fieldChange "The Wikipedia account…" should cite the book.
- **evt_1973_lighthill:** "triggering deep UK funding cuts" → "and was followed by deep UK funding cuts" (the source for this is Wikipedia). Optionally note the report is dated July 1972.
- **evt_1985_expert_spend:**
  - "A 1985 government report" → "A June 1985 U.S. Department of Energy task-team report (DOE/NE-0064)".
  - "A separate 1985 note" → "A 1985 Editorial Research Reports article".
  - Fix the editorial note's "Argonne report" (Argonne is one surveyed lab, not the author).
  - Consider retitling the exhibit away from "Expert systems", since the figure is for all AI-related activity.
- **evt_1997_deep_blue:** cut ", closing a games chapter opened at Dartmouth". IBM's page does not mention Dartmouth.
- **evt_2012_alexnet:** "cutting the top-5 error rate from 26.2 percent to 15.3 percent" → "with a top-5 error rate of 15.3 percent, against 26.2 percent for the second-best entry". The paper compares against the 2012 runner-up, not an earlier record.
- **evt_2016_tay:** "within 16 hours" is sourced only to AIID. Microsoft's post says "in the first 24 hours". Either attribute the 16 hours to the incident report or say "within a day". "Racist and extremist" is AIID wording; Microsoft says "wildly inappropriate and reprehensible words and images".
- **evt_2016_alphago:**
  - Rewrite the fieldChange's "the DeepMind page is the secondary account". The current citation is the Wikipedia *Google DeepMind* page. After the fix, the official DeepMind page is the primary record of the match.
  - "became a canonical case in debates…" is interpretive. The DeepMind page supports "a move that… upended centuries of traditional wisdom". Use that, or cut.
- **evt_2017_transformer:**
  - "Eight Google researchers" → "Eight researchers at Google Brain and Google Research (one listed at the University of Toronto, with work performed at Google)". Verified on the v7 first page: Gomez is listed at the University of Toronto, Polosukhin by gmail address, and the footnotes say "Work performed while at Google Brain/Research".
  - "…41.8 BLEU on English–French, trained in 3.5 days on eight GPUs" → "…41.8 BLEU on English–French after 3.5 days of training on eight GPUs". The abstract ties the 3.5 days to the EN–FR model.
- **evt_2020_alphafold:** "made highly accurate protein-structure prediction from amino-acid sequence" → "made highly accurate protein-structure prediction from amino-acid sequence possible". This is grammar only.
- **evt_2023_cais:**
  - "found 38 percent assigned at least a 10 percent probability…" → "found that between 38 and 51 percent of respondents gave at least a 10 percent chance to advanced AI leading to outcomes as bad as human extinction". This is the abstract's exact range; 38 is only the low end. Same fix in the fieldChange.
  - "signed by hundreds of researchers and lab leaders": the CAIS page gives no count, only notable signatories. Use "signed by AI researchers and the heads of major labs", or source a count.
  - "A 2023 survey": the paper is dated January 2024. Keep 2023 only if the fieldwork year is stated as such.
- **evt_2024_nobel:** "awarded to Demis Hassabis and John Jumper, with David Baker, for protein-structure work including AlphaFold" → "half to David Baker for computational protein design, and half jointly to Demis Hassabis and John Jumper for protein structure prediction". kva.se says Hassabis and Jumper developed AlphaFold2.
- **ctx_1948_wiener_cybernetics:** keep "A 1948 edition is catalogued as…" (supported by Open Library). Add that the scan cited is the 1961 second edition, so the plaque does not imply the scan is the 1948 printing.
- **evt_2024_eu_ai_act (optional):** "Maximum penalty figures… are reported for prohibited-practice breaches" → "The regulation sets fines of up to €35 million or 7 percent of worldwide annual turnover, whichever is higher, for breaches of the Article 5 prohibitions". The fieldChange already says this with EUR-Lex.

## URLs added (verified)

All opened on 2026-11-04.

| exhibit | URL | what was verified |
|---|---|---|
| ctx_1843_analytical_engine | https://archive.org/details/india.history.resource.53369 | Internet Archive item "Scientific Memoirs… Vol. III", 1843, Richard and John E. Taylor, London. The OCR full text contains "Art. XXIX.—Sketch of the Analytical Engine invented by Charles Babbage, Esq. By L. F. Menabrea of Turin" (p. 666 ff.), "See Note G", and the Bernoulli-numbers passages. Full text and PDF are downloadable. |
| evt_1969_perceptrons | https://doi.org/10.7551/mitpress/11301.001.0001 | Crossref: "Perceptrons", Minsky & Papert, The MIT Press, 2017-09-22. Resolves (302) to https://direct.mit.edu/books/book/3132/PerceptronsAn-Introduction-to-Computational, whose body returned 403 to my fetcher. This is the reissue, not the 1969 printing. |
| evt_1985_expert_spend | https://doi.org/10.2172/5692492 | Crossref: report "Artificial intelligence and nuclear power. Report by the Technology Transfer Artificial Intelligence Task Team", June 1985, OSTI. Resolves to the same OSTI PDF already cited. That PDF's text contains the $400 million sentence. Same document; see concern 1. |
| evt_2016_alphago | https://deepmind.google/research/breakthroughs/alphago/ | Google DeepMind official page: "AlphaGo's 4-1 victory in Seoul, South Korea, in March 2016…"; "In game two, it played Move 37…". |
| evt_2024_nobel | https://www.kva.se/en/news/nobelpriset-i-fysik-2024/ | Royal Swedish Academy of Sciences press release (Swedish text), 8 Oct 2024: Hopfield and Hinton, "för grundläggande upptäckter och uppfinningar som möjliggör maskininlärning med artificiella neuronnätverk". |
| evt_2024_nobel | https://www.kva.se/en/news/nobelpriset-i-kemi-2024/ | Royal Swedish Academy of Sciences press release (Swedish text), 9 Oct 2024: half to David Baker (computational protein design), half jointly to Hassabis and Jumper (protein structure prediction). Mentions AlphaFold2. |

**Optional replacement, not verified:** https://www.nationalacademies.org/publications/9547 is the redirect target of the current ALPAC URL. It is verified as *Language and Machines*, but it is a replacement rather than an addition and the hostname count is unchanged.

**Not proposed:**
- https://image-net.org/challenges/LSVRC/2012/results.html (connection refused).
- Any 1948 scan of *Cybernetics* (none verified).
- Any Symbolics primary record (none found).
- Any Google statement on the Photos incident (none found).
