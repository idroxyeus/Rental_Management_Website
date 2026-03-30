import { ESLint } from "eslint";
import fs from "fs";

(async function main() {
  try {
    const eslint = new ESLint();
    const results = await eslint.lintFiles(["src/**/*.jsx", "src/**/*.js"]);
    const formatter = await eslint.loadFormatter("stylish");
    const resultText = formatter.format(results);
    fs.writeFileSync("lint_results.txt", resultText);
    console.log("Linting complete");
  } catch (error) {
    console.error("Error linting:", error);
  }
})();
