# AI knowledge architecture and walkable gallery

Date: 2026-09-26

This document is the binding spec for the technical record of artificial intelligence and the gallery that reads it. The auto-update agent is a later spec. This document defines the write contract that agent must obey and does not build the agent.

## Purpose

A visitor walks a gallery of technical AI history from 1943 through 2022. Each pedestal is one exhibit from a Neo4j property graph. Rooms, pedestal order, and floor threads are computed from that graph. The gallery does not author exhibits.

The record has two wings. Canon exhibits are full dossiers. Provisional cards may be thin and are marked incomplete. The first seed loads 34 canon exhibits and leaves the provisional hall empty.

## Non-goals

- The auto-update agent is not implemented.
- There is no editor interface.
- Social, political, and economic effects are out of the record.
- The building does not depict a real laboratory or a fictional machine.
- Figures appear only as images from a cited primary source. The first seed includes no figures.
- Period and institution exhibits are not in the first seed. Test fixtures cover those kinds.

## Language and authority

The spine is English. One editor approves canon. A later agent may create or update provisional nodes and may mark one proposed. It cannot set canon and cannot edit a canon node.

## System of record

Neo4j is the system of record when `NEO4J_URI` is set. The repository holds constraints, the TypeScript validator, the seed, and the museum client. Room coordinates are not stored. They are computed from years, kinds, and evolution relationships.

Every test run executes the validator, the prose linter, the room layout, and the seed against an in-memory store that enforces the same write rules. The same seed is applied to Neo4j when `NEO4J_URI` is set. A machine without Neo4j still runs the full assertion suite against the in-memory store.

Draft and proposed nodes stay off public reads and out of the building.

## Graph

Four labels: Exhibit, Claim, Source, Audit.

### Exhibit

Fields: stable id, title, kind, start year, optional end year, public story, technical account, publication state, incomplete flag, prose flags, `updatedAt`, and `noPredecessorInScope` for an earliest exhibit that has no in-scope predecessor.

Kinds: `idea`, `system`, `institution`, `period`, `failure`, `turning_point`, `dataset`, `benchmark`.

A period requires an end year. A turning point requires a start year. People are attributes of a source, not nodes.

Publication states: `draft`, `provisional`, `proposed`, `canon`.

### Claim

Fields: statement, role, status, publication state.

Roles: `what_changed`, `capability`, `limit`, `failure`, `unknown`.

Statuses: `established`, `contested`, `retracted`, `unknown`.

Capability means what the work made possible. Limit means brittleness, cost, or a result that did not hold. Failure means a method or system that did not work. Unknown means an open technical problem.

### Source

Fields: title, year, authors, locator, kind.

Primary kinds: `paper`, `technical_report`, `dataset_paper`, `benchmark_paper`, `peer_reviewed_retrospective`.

Provisional-only kinds: `lab_release`, `model_card`, `benchmark_record`.

### Relationships

- `ABOUT`, from claim to exhibit
- `SUPPORTED_BY`, from claim to source
- `INFLUENCED_BY`, from the later exhibit to the earlier one
- `SUPERSEDED_BY`, from the older exhibit to the newer one
- `EVALUATED_ON`, from a system to a dataset or benchmark
- `COMPONENT_OF`, from a part to a whole
- `CONTRADICTS`, from a claim to a claim

Visible in the building: `INFLUENCED_BY`, `SUPERSEDED_BY`, `EVALUATED_ON`, and `COMPONENT_OF`, drawn as threads along the floor, including through doorways. `ABOUT`, `SUPPORTED_BY`, and `CONTRADICTS` appear in the pedestal panel.

Audit nodes record who, when, and what changed on canon and proposed writes. Provisional edits keep the latest text and `updatedAt`.

## Publication rules

A canon exhibit has both stories, `incomplete` false, all five claim roles, a primary source on every claim, and at least one evolution relationship. The earliest exhibits may set `noPredecessorInScope` instead of an evolution relationship. A failure claim may have status `unknown` when the sources do not establish a technical failure, and that claim still cites a primary source. A provisional-only source cannot be the only support for a canon claim.

A provisional card has a title, a kind, a short story, one source, and `incomplete` true. It does not need all five roles.

Adding `CONTRADICTS` does not change either claim’s status. Retraction keeps the claim, sets `retracted`, and writes an Audit node. Canon claims are not deleted. Ids do not change. A start year before 1943 is rejected. A write with a stale `updatedAt` fails with `conflict` and persists nothing.

The layered read is fixed. Standing at a pedestal shows the public story. The visitor opens the technical account and the five roles. Sources and neighbors are the third layer, and a neighbor can be walked to.

## Validator

Structural failures persist nothing and return a path, a rule, and a message. Rules: `invalid-shape`, `illegal-relation`, `source-rule`, `canon-incomplete`, `forbidden-transition`, `conflict`, `seed-aborted`.

The spine loads as one transaction. Any violation rolls the whole seed back.

If a canon node is somehow incomplete, the public read withholds it and the editor read marks it `canon-invalid`. A dead source locator does not hide the exhibit. The source is returned as `unresolved` when title, year, and kind are present.

An agent-role write that sets `canon` or edits a canon node is `forbidden-transition`.

## Prose flags

A deterministic lexicon linter scans the public story, the technical account, and every claim statement. It does not call a model and it does not block the save. Flags are stored on the node and included in the editor read, the public read, and the pedestal.

Check order: mask technical license patterns, then banned phrases, then unmasked ambiguous words. A banned phrase wins over a license.

Licensed patterns: policy gradient, exploration policy, inductive bias, bias-variance, statistical bias, selection bias, dataset bias, computational cost, training cost, inference cost, linear discriminant, discriminant analysis.

Banned phrases: job loss, job displacement, labor market, unemployment, regulation, legislation, AI Act, governance, military, weapon, warfare, stock price, market cap, racial bias, gender bias, consciousness, sentience, science fiction, philosophy of mind.

`policy gradient` and `inductive bias` produce no flag. `job displacement` and a sentence containing `regulation` produce `out-of-scope-prose`.

## Gallery

The client is a Next.js app. React Three Fiber draws the building. The Three.js WebGPU renderer is used when available, and WebGL2 otherwise. Room layout runs as a pure function. The scene query returns public exhibits and the four visible relationship types. The full dossier is fetched when a pedestal gains focus.

### Rooms

Start from decades of the start years present in the public graph. A decade with fewer than three exhibits joins the following decade. Repeat until the room has at least three exhibits or no later decade remains. Doorways connect rooms in year order. The provisional hall is the last doorway and is present even when empty.

On the 34-exhibit spine this rule yields six canon rooms and one empty hall:

| Room | Years | Exhibits |
| --- | --- | --- |
| Foundations | 1943–1959 | 4 |
| Search and rules | 1960–1979 | 3 |
| Connectionist revival | 1980–1989 | 6 |
| Statistical methods and ImageNet | 1990–2009 | 3 |
| Deep learning | 2010–2019 | 11 |
| Scale | 2020–2022 | 7 |
| Provisional hall | after 2022 | 0 |

The join is recomputed from the data. The ranges above are the result for this spine.

### Pedestals and threads

One pedestal per public exhibit, in the room that contains its start year. Inside a room, pedestals stand in a row ordered by start year, then by kind band: idea, system, failure, turning_point, dataset, benchmark, institution, period. An exhibit spanning years keeps a single pedestal at its start year. The end year is on the plaque.

Each visible relationship is a thread on the floor from one pedestal to the other, labeled with its type when followed. A thread may pass through doorways. An exhibit with no evolution relationship still has a pedestal. The layout does not invent a predecessor. The same graph always builds the same floor.

### Walk and time

The visitor starts in the earliest room at eye height and moves on the floor with collision against walls and pedestals. Click-to-move and keyboard movement both work. Pointer lock is off by default.

Approaching a pedestal lights it, shows its title, and opens an HTML panel with the public story. Choosing a thread walks the visitor along that thread to the other pedestal.

A year cursor seals every room whose exhibits all start after the cursor. Exhibits inside a partly open room ghost when their own start year is later than the cursor.

### Reading and motion

The focused pedestal keeps full light. The rest of the room dims. A prose flag is a marker on the pedestal and a line in the panel. Claim status is a ring on the pedestal and a mark in the panel: established solid, contested dashed, retracted dim, unknown open.

`prefers-reduced-motion` fades between pedestals, skips doorway motion, and leaves the year cursor manual. The active room plus the two adjacent rooms are the loaded detail. Farther rooms stay as doorway shells until the visitor approaches. Keyboard can move, open each dossier layer, follow the focused thread, change rooms from an index, and scrub time. The HTML panel is the screen-reader path. On a narrow viewport the room index and the panel lead.

The shell is a neutral gallery: floor, walls, doorways, pedestals, light. Type and color of the panel may be distinctive. They do not depict a laboratory.

## Tests

- Each structural rule has one example that fails with that rule and leaves the store unchanged.
- `CONTRADICTS` between two established claims leaves both statuses established.
- A retraction keeps the claim, sets `retracted`, and writes an Audit node.
- A canon or provisional write containing a banned phrase persists and carries `out-of-scope-prose`.
- `policy gradient` and `inductive bias` produce no flag.
- Public reads hide draft, proposed, and canon-invalid nodes.
- A poisoned spine rolls back entirely.
- After the real seed loads, a canon-completeness query returns no violations.
- The spine builds the six canon rooms plus the empty hall.
- The same payload builds the same floor.
- A missing predecessor creates no thread.
- The year cursor seals later rooms.

## Spine

One exhibit per lineage. Each entry is a full canon dossier. The seed also loads the evolution relationships those dossiers require.

1. McCulloch–Pitts neuron, 1943, idea. McCulloch and Pitts, 1943. `noPredecessorInScope`.
2. Turing’s imitation game, 1950, idea. Turing, Mind, 1950.
3. Dartmouth workshop, 1956, turning point. Event year 1956. The proposal is 1955.
4. Perceptron, 1958, system. Rosenblatt, 1958.
5. Heuristic search, 1968, idea. Hart, Nilsson, and Raphael, 1968.
6. Limits of the single-layer perceptron, 1969, failure. Minsky and Papert, 1969.
7. Rule-based expert systems, 1976, system. Shortliffe, MYCIN, 1976.
8. Limits of hand-authored rule bases, 1983, failure. Clancey, Artificial Intelligence, 1983.
9. Hopfield network, 1982, system. Hopfield, PNAS, 1982.
10. Boltzmann machine, 1985, system. Ackley, Hinton, and Sejnowski, 1985.
11. Backpropagation, 1986, idea. Rumelhart, Hinton, and Williams, Nature, 1986. The account also cites Linnainmaa, 1970, and Werbos, 1974.
12. Bayesian networks, 1988, idea. Pearl, 1988.
13. Convolutional networks, 1989, system. LeCun et al., 1989. LeNet-5, 1998, is a later claim on the same exhibit.
14. Support vector machines, 1995, system. Cortes and Vapnik, 1995.
15. LSTM, 1997, system. Hochreiter and Schmidhuber, 1997.
16. ImageNet, 2009, dataset. Deng et al., CVPR, 2009.
17. ImageNet challenge, 2010, benchmark. Russakovsky et al., IJCV, 2015, for the challenge that began in 2010.
18. AlexNet, 2012, turning point. Krizhevsky, Sutskever, and Hinton, 2012.
19. Word2vec, 2013, system. Mikolov et al., 2013.
20. Neural attention, 2014, idea. Bahdanau, Cho, and Bengio, 2014.
21. Generative adversarial networks, 2014, system. Goodfellow et al., 2014.
22. Deep Q-networks, 2015, system. Mnih et al., Nature, 2015.
23. Residual networks, 2015, system. He et al., 2015.
24. AlphaGo and AlphaZero, 2016–2018, system. Silver et al., Nature, 2016, and Silver et al., Science, 2018.
25. Transformer, 2017, system. Vaswani et al., 2017.
26. BERT, 2018, system. Devlin et al., 2018.
27. Denoising diffusion models, 2020, system. Ho, Jain, and Abbeel, 2020. Sohl-Dickstein et al., 2015, is the predecessor in the account.
28. GPT-3, 2020, system. Brown et al., 2020. GPT and GPT-2 stay in the account as predecessors.
29. Neural scaling laws, 2020, idea. Kaplan et al., 2020.
30. Human preference learning, 2017, idea. Christiano et al., 2017.
31. AlphaFold, 2021, system. Jumper et al., Nature, 2021.
32. MMLU, 2021, benchmark. Hendrycks et al., 2021.
33. Chinchilla scaling, 2022, idea. Hoffmann et al., 2022.
34. InstructGPT, 2022, system. Ouyang et al., 2022.

Left for a later seed: ADALINE, SHRDLU, TD-Gammon, AdaBoost, random forests, dropout, GLUE, CLIP, retrieval-augmented generation, chain-of-thought prompting, LoRA, and mixture-of-experts. Releases after InstructGPT are not canon exhibits in this seed.

## Required evolution links

These links are the minimum the seed must load so the floor has real threads. Claims may add further links when a primary source supports them.

- Perceptron `INFLUENCED_BY` McCulloch–Pitts.
- Imitation game `INFLUENCED_BY` McCulloch–Pitts.
- Dartmouth `INFLUENCED_BY` imitation game.
- Perceptron limits `INFLUENCED_BY` Perceptron.
- Heuristic search `INFLUENCED_BY` Dartmouth.
- Expert systems `INFLUENCED_BY` heuristic search.
- Rule-base limits `INFLUENCED_BY` expert systems.
- Hopfield `INFLUENCED_BY` McCulloch–Pitts.
- Boltzmann machine `INFLUENCED_BY` Hopfield.
- Backpropagation `INFLUENCED_BY` Perceptron.
- Convolutional networks `INFLUENCED_BY` backpropagation.
- Bayesian networks `INFLUENCED_BY` expert systems.
- LSTM `INFLUENCED_BY` backpropagation.
- Support vector machines `INFLUENCED_BY` Perceptron limits.
- ImageNet challenge `COMPONENT_OF` ImageNet.
- AlexNet `INFLUENCED_BY` convolutional networks.
- AlexNet `EVALUATED_ON` ImageNet challenge.
- Word2vec `INFLUENCED_BY` backpropagation.
- Neural attention `INFLUENCED_BY` LSTM.
- Residual networks `INFLUENCED_BY` AlexNet.
- Deep Q-networks `INFLUENCED_BY` backpropagation.
- Generative adversarial networks `INFLUENCED_BY` backpropagation.
- AlphaGo `INFLUENCED_BY` deep Q-networks.
- Transformer `INFLUENCED_BY` neural attention.
- BERT `INFLUENCED_BY` Transformer.
- Human preference learning `INFLUENCED_BY` deep Q-networks.
- GPT-3 `INFLUENCED_BY` Transformer.
- Neural scaling laws `INFLUENCED_BY` GPT-3.
- AlphaFold `INFLUENCED_BY` Transformer.
- MMLU `EVALUATED_ON` is not used. GPT-3 `EVALUATED_ON` MMLU.
- Chinchilla scaling `SUPERSEDED_BY` is reversed: neural scaling laws `SUPERSEDED_BY` Chinchilla scaling.
- InstructGPT `INFLUENCED_BY` GPT-3.
- InstructGPT `INFLUENCED_BY` human preference learning.

ImageNet sets `noPredecessorInScope`. The challenge is `COMPONENT_OF` ImageNet, which satisfies the evolution-relationship rule for the challenge.

Denoising diffusion models set `noPredecessorInScope`. The account cites Sohl-Dickstein et al., 2015, which is not a spine node. The seed does not draw an influence thread from diffusion to generative adversarial networks.
