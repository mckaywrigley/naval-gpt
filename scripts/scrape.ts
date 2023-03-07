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
      let subsectionIndex = -1;
      let subsectionTitle = "";
      let subsectionHtml = "";
      let subsectionText = "";

      $(el)
        .nextUntil("H2")
        .each((i, el) => {
          if ($(el).prop("tagName") === "P") {
            const numChildren = $(el).children().length;

            let hasStrong = false;

            const checkChildren = (children: any) => {
              children.each((i: any, el: any) => {
                if ($(el).prop("tagName") === "STRONG" || $(el).prop("tagName") === "B") {
                  hasStrong = true;
                } else {
                  if ($(el).children().length > 0) {
                    checkChildren($(el).children());
                  }
                }
              });
            };

            checkChildren($(el).children());

            if (hasStrong && !$(el).text().startsWith("Naval:") && !$(el).text().startsWith("Nivi:")) {
              subsectionTitle = $(el).children().first().text();

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
              if (subsectionIndex > -1) {
                subsectionHtml += `<p>${$(el).html()?.replace(/’/g, "'")}</p>`;
                subsectionText += $(el).text().replace(/’/g, "'");

                subsections[subsectionIndex].html = subsectionHtml;
                subsections[subsectionIndex].content = subsectionText;
                subsections[subsectionIndex].length = subsectionText.length;
                subsections[subsectionIndex].tokens = encode(subsectionText).length;
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

  const sectionCount = json.sections.length;
  const subsectionCount = json.sections.reduce((acc, section) => acc + section.subsections.length, 0);

  console.log(`Sections: ${sectionCount}, Subsections: ${subsectionCount}`);

  fs.writeFileSync("scripts/naval.json", JSON.stringify(json));
})();
