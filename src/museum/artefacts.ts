// Objects on the plinths. "data" is built from published coordinates; "replica" is drawn in
// code after the reference named in referenceUrl. Every hotspot quotes the exhibit's own
// citations or the reference page (artefacts.test.ts holds that rule). No position is invented:
// where a source gives no coordinate (e.g. Move 37's point), nothing is placed.

export type ArtefactKind = "data" | "replica";

export type ArtefactKey =
  | "analyticalEngine"
  | "relay"
  | "markIPerceptron"
  | "deepBlue"
  | "goBoard"
  | "gtx580Pair"
  | "protein6y4f";

export type Hotspot = { id: string; label: string; text: string; sourceUrl: string };

export type Artefact = {
  kind: ArtefactKind;
  component: ArtefactKey;
  // What the object is: "Replica of <subject>" or the data line.
  subject: string;
  referenceTitle: string;
  author: string;
  licence: string;
  referenceUrl: string;
  // Display scale, and the drawn footprint [width, depth] before scaling (sizes the slab).
  scale: number;
  footprint: [number, number];
  hotspots: Hotspot[];
};

const GUTENBERG_SKETCH = "https://www.gutenberg.org/ebooks/75107";
const ENGINE_PHOTO = "https://commons.wikimedia.org/wiki/File:Babbages_Analytical_Engine,_1834-1871._(9660574685).jpg";
const RELAY_DRAWING = "https://commons.wikimedia.org/wiki/File:Relay_principle_horizontal.jpg";
const WIKI_PERCEPTRON = "https://en.wikipedia.org/wiki/Perceptron";
const WIKI_DEEP_BLUE = "https://en.wikipedia.org/wiki/Deep_Blue_(chess_computer)";
const ALEXNET_PAPER =
  "https://proceedings.neurips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf";
const ALPHAFOLD_PAPER = "https://www.nature.com/articles/s41586-021-03819-2";
const PDB_ENTRY = "https://www.rcsb.org/structure/6Y4F";

export const ARTEFACTS: Record<string, Artefact> = {
  ctx_1843_analytical_engine: {
    kind: "replica",
    component: "analyticalEngine",
    subject: "the Analytical Engine mill trial piece",
    referenceTitle: "Babbage's Analytical Engine, 1834-1871",
    author: "Science Museum London (Commons upload by Mrjohncummings)",
    licence: "CC BY-SA 2.0",
    referenceUrl: ENGINE_PHOTO,
    scale: 1.2,
    footprint: [0.7, 0.48],
    hotspots: [
      { id: "column", label: "Column of discs", text: "“A pile or vertical column consisting of an indefinite number of circular discs.”", sourceUrl: GUTENBERG_SKETCH },
      { id: "mill", label: "Mill", text: "“The mill is that portion of the machine which works.”", sourceUrl: GUTENBERG_SKETCH },
      { id: "printer", label: "Printing mechanism", text: "The photographed piece is “a portion of the mill with a printing mechanism.”", sourceUrl: ENGINE_PHOTO },
    ],
  },
  ctx_1938_shannon_switching: {
    kind: "replica",
    component: "relay",
    subject: "a generic electromechanical relay",
    referenceTitle: "Relay principle",
    author: "Bisgaard, language-neutral version by Teslaton",
    licence: "CC BY-SA 3.0",
    referenceUrl: RELAY_DRAWING,
    scale: 2,
    footprint: [0.44, 0.18],
    hotspots: [
      { id: "coil", label: "Coil", text: "Part 1 in the reference drawing: the coil.", sourceUrl: RELAY_DRAWING },
      { id: "armature", label: "Armature", text: "Part 2 in the reference drawing: the armature.", sourceUrl: RELAY_DRAWING },
      { id: "contact", label: "Moving contact", text: "Part 3 in the reference drawing: the moving contact.", sourceUrl: RELAY_DRAWING },
    ],
  },
  evt_1958_perceptron: {
    kind: "replica",
    component: "markIPerceptron",
    subject: "the Mark I Perceptron (assembled 1959, shown publicly 1960), built after the 1958 paper",
    referenceTitle: "Mark I Perceptron operators' manual, Figure 2 (15 February 1960)",
    author: "John C. Hay and Albert E. Murray",
    licence: "public domain",
    referenceUrl: "https://commons.wikimedia.org/wiki/File:Mark_I_Perceptron,_Figure_2_of_operator%27s_manual.png",
    scale: 1,
    footprint: [1.0, 0.42],
    hotspots: [
      { id: "built", label: "Built", text: "It was assembled “between June 1959 and December 14, 1959”; its “first public demonstration took place on 23 June 1960.”", sourceUrl: WIKI_PERCEPTRON },
      { id: "retina", label: "Photocells", text: "“An array of 400 photocells arranged in a 20x20 grid.”", sourceUrl: WIKI_PERCEPTRON },
      { id: "plugboard", label: "Plugboard", text: "The S-units are connected to the A-units randomly “via a plugboard”.", sourceUrl: WIKI_PERCEPTRON },
      { id: "association", label: "Association units", text: "“A hidden layer of 512 perceptrons, named ‘association units’.”", sourceUrl: WIKI_PERCEPTRON },
      { id: "response", label: "Response units", text: "“An output layer of eight perceptrons, named ‘response units’.”", sourceUrl: WIKI_PERCEPTRON },
    ],
  },
  evt_1997_deep_blue: {
    kind: "replica",
    component: "deepBlue",
    subject: "the two cabinets of Deep Blue",
    referenceTitle: "a Computer History Museum photo of a similar IBM RS/6000 SP",
    author: "James the photographer",
    licence: "CC BY 2.0",
    referenceUrl: "https://commons.wikimedia.org/wiki/File:Deep_Blue.jpg",
    scale: 1.4,
    footprint: [0.58, 0.3],
    hotspots: [
      { id: "cabinets", label: "Two cabinets", text: "The system was “all housed in two cabinets”.", sourceUrl: WIKI_DEEP_BLUE },
      { id: "chips", label: "Chess chips (inside)", text: "It had “480 custom” VLSI “chess chips”.", sourceUrl: WIKI_DEEP_BLUE },
      { id: "speed", label: "Search speed", text: "“Deep Blue was able to evaluate 200 million chess positions per second.”", sourceUrl: "https://www.ibm.com/history/deep-blue" },
    ],
  },
  evt_2016_alphago: {
    kind: "replica",
    component: "goBoard",
    subject: "a 19 × 19 Go board",
    referenceTitle: "Goban 19x19 vide",
    author: "Idoric",
    licence: "CC BY-SA 3.0",
    referenceUrl: "https://commons.wikimedia.org/wiki/File:Goban_19x19_vide.png",
    scale: 1.2,
    footprint: [0.62, 0.64],
    hotspots: [
      { id: "grid", label: "19 × 19 board", text: "In the 2016 Nature paper (on the Fan Hui match): AlphaGo beat a professional “on a full, 19 x 19 board”.", sourceUrl: "https://www.nature.com/articles/nature16961" },
    ],
  },
  evt_2012_alexnet: {
    kind: "replica",
    component: "gtx580Pair",
    subject: "two NVIDIA GTX 580 boards, cooler removed as in the reference",
    referenceTitle: "Nvidia GTX580 - Wakueumbau 0028",
    author: "Fritzchens Fritz",
    licence: "CC0",
    referenceUrl: "https://commons.wikimedia.org/wiki/File:Nvidia_GTX580_-_Wakueumbau_0028_(15990892764).jpg",
    scale: 1.2,
    footprint: [0.92, 0.2],
    hotspots: [
      { id: "boards", label: "Two GPUs", text: "Training “took five to six days on two NVIDIA GTX 580 3GB GPUs.”", sourceUrl: ALEXNET_PAPER },
      { id: "memory", label: "Memory", text: "“A single GTX 580 GPU has only 3GB of memory.”", sourceUrl: ALEXNET_PAPER },
      { id: "die", label: "Split network", text: "“We spread the net across two GPUs.”", sourceUrl: ALEXNET_PAPER },
    ],
  },
  evt_2020_alphafold: {
    kind: "data",
    component: "protein6y4f",
    subject:
      "Structure: RCSB PDB 6Y4F (CC0), the experimental X-ray structure of CASP14 target T1049, not AlphaFold's prediction. C-alpha trace of chain A",
    referenceTitle: "RCSB PDB 6Y4F",
    author: "wwPDB / RCSB PDB",
    licence: "CC0",
    referenceUrl: PDB_ENTRY,
    scale: 1,
    footprint: [0.5, 0.5],
    hotspots: [
      {
        id: "chain",
        label: "CASP14 target T1049",
        text: "Nature's Figure 1b compares the prediction of “CASP14 target T1049 (PDB 6Y4F)” with the experimental structure.",
        sourceUrl: ALPHAFOLD_PAPER,
      },
      {
        id: "strands",
        label: "Experimental structure",
        text: "An X-ray structure of the Zn-dependent receptor-binding domain of the MrpH adhesin, at 1.75 Å.",
        sourceUrl: PDB_ENTRY,
      },
    ],
  },
};

export function artefactFor(exhibitId: string): Artefact | undefined {
  return Object.hasOwn(ARTEFACTS, exhibitId) ? ARTEFACTS[exhibitId] : undefined;
}

// "Replica of X, modelled from <title> by <author>, <licence>" — the linked part is the title.
export function creditParts(artefact: Artefact): { before: string; title: string; after: string } {
  if (artefact.kind === "data") return { before: `${artefact.subject}. Entry: `, title: artefact.referenceTitle, after: "." };
  return {
    before: `Replica of ${artefact.subject}, modelled from `,
    title: artefact.referenceTitle,
    after: ` by ${artefact.author}, ${artefact.licence}.`,
  };
}
