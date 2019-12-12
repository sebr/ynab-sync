// @ts-nocheck

const childProcess = require("child_process");
const path = require("path");

const getDeps = env => {
  const args = { encoding: "utf8" };
  return childProcess.execSync(`npm ls --${env}=true --parseable=true --long=false --silent || true`, args).split("\n");
};

module.exports.get = () => {
  const slsDir = path.resolve("./") + "/";

  const prodDeps = getDeps("prod");
  const devDeps = getDeps("dev");
  const devFiles = devDeps.filter(d => !prodDeps.includes(d)).map(d => d.replace(slsDir, "") + "/**");
  return [
    ...devFiles,
    "coverage/**" // Add additional exclusions here
  ];
};
