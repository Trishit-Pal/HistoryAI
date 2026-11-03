import { toFractionalYear } from "./build";
import { type ExhibitRef, type LandmarkExhibit, exhibitLink } from "./landmarks";
import { xOfYear } from "./projection";

export interface GovernanceMarker {
  id: string;
  /** The day the act, treaty or framework took effect or was adopted, as the issuer dates it. */
  date: string;
  title: string;
  /** A short name for the label in the 3D scene. */
  short: string;
  issuer: string;
  /** What the date refers to, in words, so "2024-08-01" is not mistaken for the signing date. */
  dateMeans: string;
  /** The issuing body's own page. Only a title, a date and this link are shown; no text is copied. */
  url: string;
  /** The museum exhibit that covers it, when there is one. */
  exhibitId?: string;
}

/** The sites a marker may link to: each issuing body's own. A test enforces it. */
export const OFFICIAL_HOSTS: readonly string[] = [
  "legalinstruments.oecd.org",
  "nist.gov",
  "gov.uk",
  "eur-lex.europa.eu",
  "docs.un.org",
  "rm.coe.int",
];

/**
 * Each date and link was checked against the issuer's own pages or its official announcement on
 * 2026-11-03. Add a marker only after doing the same.
 */
export const GOVERNANCE: readonly GovernanceMarker[] = [
  {
    id: "oecd-ai-principles",
    short: "OECD AI Principles",
    date: "2019-05-22",
    title: "OECD Recommendation on Artificial Intelligence (the OECD AI Principles)",
    issuer: "OECD Council",
    dateMeans: "Adopted",
    url: "https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0449",
  },
  {
    id: "nist-ai-rmf",
    short: "NIST AI RMF",
    date: "2023-01-26",
    title: "AI Risk Management Framework 1.0 (NIST AI 100-1)",
    issuer: "US National Institute of Standards and Technology",
    dateMeans: "Released",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
  },
  {
    id: "bletchley-declaration",
    short: "Bletchley Declaration",
    date: "2023-11-01",
    title: "The Bletchley Declaration by countries attending the AI Safety Summit",
    issuer: "AI Safety Summit, United Kingdom (1 to 2 November 2023)",
    dateMeans: "Summit opened",
    url: "https://www.gov.uk/government/publications/ai-safety-summit-2023-the-bletchley-declaration/the-bletchley-declaration-by-countries-attending-the-ai-safety-summit-1-2-november-2023",
  },
  {
    id: "un-resolution-78-265",
    short: "UN resolution 78/265",
    date: "2024-03-21",
    title: "Seizing the opportunities of safe, secure and trustworthy artificial intelligence systems for sustainable development (A/RES/78/265)",
    issuer: "United Nations General Assembly",
    dateMeans: "Adopted",
    url: "https://docs.un.org/en/A/RES/78/265",
  },
  {
    id: "eu-ai-act",
    short: "EU AI Act",
    date: "2024-08-01",
    title: "Regulation (EU) 2024/1689, the Artificial Intelligence Act",
    issuer: "European Parliament and Council of the European Union",
    dateMeans: "Entered into force; published in the Official Journal on 12 July 2024",
    url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng",
    exhibitId: "evt_2024_eu_ai_act",
  },
  {
    id: "coe-framework-convention",
    short: "Council of Europe treaty",
    date: "2024-09-05",
    title: "Council of Europe Framework Convention on Artificial Intelligence and Human Rights, Democracy and the Rule of Law (CETS 225)",
    issuer: "Council of Europe",
    dateMeans: "Opened for signature",
    url: "https://rm.coe.int/1680afae3c",
  },
];

/** Where a marker sits along the year axis. */
export function governanceX(marker: GovernanceMarker): number {
  return xOfYear(toFractionalYear(marker.date) ?? Number(marker.date.slice(0, 4)));
}

export interface GovernanceView extends GovernanceMarker {
  exhibit?: LandmarkExhibit;
}

/** The markers, each joined to its museum exhibit when it has one. */
export function governanceViews(exhibits: readonly ExhibitRef[]): GovernanceView[] {
  const byId = new Map(exhibits.map((exhibit) => [exhibit.id, exhibit]));
  return GOVERNANCE.map((marker) => {
    const exhibit = marker.exhibitId ? exhibitLink(byId.get(marker.exhibitId)) : undefined;
    return exhibit ? { ...marker, exhibit } : { ...marker };
  });
}
