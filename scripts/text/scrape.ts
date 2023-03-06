import { NavalJSON, NavalSection, NavalSubsection } from "@/types";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { encode } from "gpt-3-encoder";

const scrapePost = async () => {
  const html = await axios.get(`https://nav.al/rich`);
  const $ = cheerio.load(html.data);
  const content = $(".content");
  const children = content.children();

  let sections: NavalSection[] = [];

  children.each((i, el) => {
    const tag = $(el).prop("tagName");

    let sectionTitle = $(el).text();
    let subsections: NavalSubsection[] = [];

    if (tag === "H2") {
      let subsectionIndex = 0;
      let subsectionTitle = "";
      let subsectionHtml = "";
      let subsectionText = "";

      $(el)
        .nextUntil("H2")
        .each((i, el) => {
          if ($(el).prop("tagName") === "P") {
            const numChildren = $(el).children().length;

            if ($(el).text() === $(el).children().first().text() && numChildren === 1 && $(el).children().first().text().length > 0 && $(el).children().first().attr("class") === undefined) {
              subsectionTitle = $(el).children().first().text();
              console.log("subsectionTitle", subsectionTitle);

              subsections.push({
                title: sectionTitle,
                subtitle: subsectionTitle,
                html: "",
                content: "",
                length: 0,
                tokens: 0
              });

              subsectionIndex++;

              subsectionHtml = "";
              subsectionText = "";
            } else {
              if (subsections.length > 0) {
                subsectionHtml += `<p>${$(el).html()?.replace(/’/g, "'")}</p>`;
                subsectionText += $(el).text().replace(/’/g, "'");

                subsections[subsectionIndex - 1].html = subsectionHtml;
                subsections[subsectionIndex - 1].content = subsectionText;
                subsections[subsectionIndex - 1].length = subsectionText.length;
                subsections[subsectionIndex - 1].tokens = encode(subsectionText).length;
              }
            }
          }
        });

      sections.push({
        title: sectionTitle,
        length: subsections.reduce((acc, subsection) => acc + subsection.length, 0),
        tokens: subsections.reduce((acc, subsection) => acc + subsection.tokens, 0),
        subsections
      });
    }
  });

  return sections;
};

(async () => {
  const sections = await scrapePost();

  const json: NavalJSON = {
    current_date: "2023-03-06",
    author: "Naval Ravikant",
    url: "https://nav.al/rich",
    length: sections.reduce((acc, essay) => acc + essay.length, 0),
    tokens: sections.reduce((acc, essay) => acc + essay.tokens, 0),
    sections
  };

  console.log("sections", json.sections.length);
  console.log(
    "subsections",
    json.sections.reduce((acc, section) => acc + section.subsections.length, 0)
  );
  console.log("length", json.length);
  console.log("tokens", json.tokens);

  fs.writeFileSync("scripts/text/naval.json", JSON.stringify(json));
})();
