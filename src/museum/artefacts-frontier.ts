import type { Artefact } from "./artefacts";

// The 2018–2026 replicas (docs/research-2018-2026.md, artefact candidates). Owner's rule for the
// rack: it stands for the kind of hardware used for frontier training. No source opened names
// Astra's hardware, so neither the credit nor a hotspot ties the rack to Astra or counts racks.
const CHINCHILLA_PAPER = "https://arxiv.org/abs/2203.15556";
const TPU_PHOTO = "https://commons.wikimedia.org/wiki/File:Tensor_Processing_Unit_3.0.jpg";
const RACK_PHOTO = "https://commons.wikimedia.org/wiki/File:Nvidia_DGX_GB200.jpg";
const NVL72_PAGE = "https://www.nvidia.com/en-us/data-center/gb200-nvl72/";

export const FRONTIER_ARTEFACTS: Record<string, Artefact> = {
  evt_2022_chinchilla: {
    kind: "replica",
    component: "tpuV3Board",
    subject: "a Google TPU v3 board",
    referenceTitle: "Tensor Processing Unit 3.0",
    author: "Zinskauf",
    licence: "CC BY-SA 4.0",
    referenceUrl: TPU_PHOTO,
    scale: 1.3,
    footprint: [0.42, 0.28],
    hotspots: [
      { id: "device", label: "TPU v3 board", text: "The photographer's description: “a TPU 3.0 device.”", sourceUrl: TPU_PHOTO },
      { id: "chips", label: "TPUv3/TPUv4", text: "In the Chinchilla paper: “All models in this analysis have been trained on TPUv3/TPUv4.”", sourceUrl: CHINCHILLA_PAPER },
    ],
  },
  evt_2026_gpt6_astra: {
    kind: "replica",
    component: "gb200Rack",
    subject: "an NVIDIA GB200 NVL72 rack, the kind of hardware used for frontier training",
    referenceTitle: "Nvidia DGX GB200",
    author: "Pokiiri",
    licence: "CC BY-SA 4.0",
    referenceUrl: RACK_PHOTO,
    partsUrl: NVL72_PAGE,
    scale: 1.1,
    footprint: [0.24, 0.43],
    hotspots: [
      { id: "compute", label: "Compute trays", text: "NVIDIA: the rack “connects 36 Grace CPUs and 72 Blackwell GPUs in a rack-scale, liquid-cooled design.”", sourceUrl: NVL72_PAGE },
      { id: "nvlink", label: "NVLink switch trays", text: "NVIDIA: the “NVLink Switch System provides 130 terabytes per second (TB/s) of low-latency GPU communications.”", sourceUrl: NVL72_PAGE },
      { id: "domain", label: "One NVLink domain", text: "NVIDIA: “a 72-GPU NVIDIA NVLink™ domain that acts as a single, massive GPU.”", sourceUrl: NVL72_PAGE },
    ],
  },
};
