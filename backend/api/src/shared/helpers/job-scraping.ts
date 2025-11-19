import puppeteer from "puppeteer";
const cssTitleAga: string = "#detail-kopfbereich-titel";
const cssDescriptionAga: string = "#detail-beschreibung-beschreibung";

const cssTitleStepStone: string = '[data-at="header-job-title"]';
const cssDescriptionStepStone: string =
  '[data-at="section-text-description-content"] ul li';

// @ts-ignore
// delay in milliseconds
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* scrawl "agentur für arbeit" and "stepstone" webseite
 * @param url: string
 * @output list [title, desc]
 * */
async function scrapAfaSsWebsite(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      //"--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
  const page = await browser.newPage();

  try {
    let title;
    let desc;
    const delay_time = 50;

    let timer = 0;
    if (url.includes("https://www.arbeitsagentur.de/jobsuche")) {
      await page.goto(url, { waitUntil: "networkidle0" });
      try {
        const descriptionElement = await page.$(cssDescriptionAga);
        if (descriptionElement) {
          // await page.waitForSelector('#detail-beschreibung-beschreibung', {timeout: 2000});
          title = await page.$eval(cssTitleAga, (el) => el.textContent?.trim());

          // HTML-Inhalt erhalten und <br> durch \n ersetzen, dann den restlichen HTML-Inhalt entfernen
          desc = await page.evaluate((el) => {
            // Hol den innerHTML und ersetze die <br> Tags durch \n
            const html = el.innerHTML;

            // Ersetze <br> durch \n und mache den Rest textuell
            const textWithLineBreaks = html.replace(/<br\s*\/?>/gi, "\n");

            // Entferne &nbsp;
            const cleanedText = textWithLineBreaks.replace(/&nbsp;/g, " ");

            // Alle HTML-Tags entfernen
            const textOnly = cleanedText.replace(/<\/?[^>]+(>|$)/g, "");

            return textOnly.trim(); // führende und nachfolgende Leerzeichen entfernen
          }, descriptionElement);
        } else {
          throw new Error("Timout!");
        }
      } catch (error) {
        console.log(
          "Stellenanzeige der Arbeitsagentur nicht gefunden!:",
          error
        );
      }
    } else if (url.includes("https://www.stepstone.de")) {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      try {
        while ((await page.$(cssDescriptionStepStone)) === null && timer < 60) {
          await delay(delay_time);
          timer++;
        }

        if (timer < 30) {
          title = await page.$eval(cssTitleStepStone, (el) =>
            el.textContent?.trim()
          );

          const descArray = await page.$$eval(
            cssDescriptionStepStone,
            (liElements) => {
              return liElements.map((li) => li.textContent?.trim() || "");
            }
          );

          const profilArray = await page.$$eval(
            cssDescriptionStepStone,
            (liElements) => {
              return liElements.map((li) => li.textContent?.trim() || "");
            }
          );
          const combinedArray = descArray.concat(profilArray);
          desc = combinedArray.join("\n");
        } else {
          throw new Error("Timout!");
        }
      } catch (error) {
        console.log("Stellenanzeige von Stepstone nicht gefunden!:", error);
      }
    } else {
      throw new Error("Website nicht unterstützt!");
    }
    console.log(
      "Wait ca. " + timer * delay_time + " milliseconds for the http request"
    );
    return [title, desc];
  } catch (error) {
    console.error("Error crawling website:", error);
    return ["", ""];
  } finally {
    await browser.close();
  }
}

export { scrapAfaSsWebsite };
