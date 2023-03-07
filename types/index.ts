export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo"
}

export type NavalSection = {
  title: string;
  length: number;
  tokens: number;
  subsections: NavalSubsection[];
};

export type NavalSubsection = {
  title: string;
  subtitle: string;
  html: string;
  content: string;
  length: number;
  tokens: number;
};

export type NavalJSON = {
  current_date: string;
  author: string;
  url: string;
  length: number;
  tokens: number;
  sections: NavalSection[];
};

export type NavalClip = {
  file: string;
  content: string;
  seconds: number;
};
