import fs from "fs";
import path from "path";
import { exec } from "child_process";

const LANGUAGE_COLORS = {
  JavaScript: "#F1E05A",
  "C#": "#126B00",
  Shell: "#89E051",
  HTML: "#E34C26",
  Lisp: "#3FB68B",
  Python: "#3572A5",
  Nunjucks: "#3D8137",
  TSQL: "#E38C00",
  "C++": "#F34B7D",
  Java: "#B07219",
  Astro: "#FF5A03",
  "Emacs Lisp": "#C065DB",
  Scheme: "#1E4AEC",
  Typescript: "#3178C6",
  Ruby: "#701516",
  CSS: "#563D7C",
  Liquid: "#67B8DE",
  Batchfile: "#C1F12E",
};

function amend(repo) {
  if (repo.owner.login === "indecisovampiro") repo.owner.login = "clients";
  if (repo.owner.login === "somosliana") repo.owner.login = "clients";
  if (repo.license && repo.license.name === "MIT License")
    repo.license.name = "MIT";

  // I fucked-up the original date deleting the repo
  if (repo.full_name === "sobrinojulian/cv")
    repo.created_at = "2020-03-11T00:00:00Z";
  if (repo.full_name === "sobrinojulian/sobrinojulian.com.ar")
    repo.created_at = "2018-03-06T00:00:00Z";
}

async function fetchRepos() {
  try {
    // Execute the command to fetch repositories using `gh api`
    exec("gh api /user/repos --paginate", (error, stdout, stderr) => {
      const data = JSON.parse(stdout);
      let repos = data.map((repo) => {
        amend(repo);
        return {
          name: repo.name,
          full_name: repo.full_name,
          private: repo.private,
          owner: repo.owner.login,
          html_url: repo.html_url,
          description: repo.description,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          pushed_at: repo.pushed_at,
          language: repo.language || "",
          license: repo.license ? repo.license.name : "",
          visibility: repo.visibility,
          archived: repo.archived,
          topics: repo.topics,
          homepage: repo.homepage,
          language_color: repo.language ? LANGUAGE_COLORS[repo.language] : "",
        };
      });

      // Filter
      repos = repos
        .filter((x) => !(x.owner === "BA7B7CFE" && x.private))
        .filter((x) => !(x.owner === "Sebaasmendez"))
        .filter((x) => !x.topics.includes("private"))
        .filter((x) => !x.name.startsWith("tbd"));

      // Group repositories by owner or by topics[0] if topics is not empty
      const groupedRepos = {};
      repos.forEach((repo) => {
        const groupKey = repo.topics.length > 0 ? repo.topics[0] : repo.owner;
        if (!groupedRepos[groupKey]) {
          groupedRepos[groupKey] = {
            columns: 2,
            repositories: [],
          };
        }
        groupedRepos[groupKey].repositories.push(repo);
      });

      // Sort repositories within each owner
      for (const groupKey in groupedRepos) {
        groupedRepos[groupKey].repositories.sort((a, b) => {
          if (a.archived !== b.archived) {
            return a.archived ? 1 : -1;
          }
          if (a.updated_at !== b.updated_at) {
            return new Date(b.updated_at) - new Date(a.updated_at);
          }
          return a.name.localeCompare(b.name);
        });
      }

      const directoryPath = path.join(
        path.dirname(new URL(import.meta.url).pathname),
        "..",
        "data"
      );
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }
      const filePath = path.join(directoryPath, "gh.json");

      fs.writeFileSync(filePath, JSON.stringify(groupedRepos, null, 2));
      console.log("Data has been written to gh.json");
    });
  } catch (error) {
    console.error("Error fetching repos:", error);
  }
}

fetchRepos();
