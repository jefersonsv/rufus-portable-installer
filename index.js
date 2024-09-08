import download from "download";
import fs from "fs-extra";
import os from "os";
import path from "path";
import format from "string-template";
import { getGlobalPath, moveFiles, saveFile } from "./library.js";

async function start() {
  const app = "rufus";
  const tempPath = path.join(os.tmpdir(), app);
  const file = "rufus-4.5p.exe";
  const tempFilename = path.join(tempPath, file);

  if (!fs.existsSync(tempFilename)) {
    const url =
      "https://github.com/pbatard/rufus/releases/download/v4.5/rufus-4.5p.exe";
    console.log("Downloading: " + url);

    await download(url, tempPath, {
      filename: file,
    });
  } else {
    console.log("Using existent: " + tempFilename);
  }

  // Move all files from the temp unzipped directory to the destination directory
  console.log("Moving files to package manager path");
  const globalPath = getGlobalPath();
  const appGlobalPath = path.join(globalPath, app);

  moveFiles(tempPath, appGlobalPath);

  // creating run files
  console.log("Creating runner files");
  const exe = file;
  const cmd = format(cmdTemplate, {
    subfolder: app,
    exe,
  }).trim();

  const cmdFilename = path.join(globalPath, `${app}.cmd`);
  saveFile(cmdFilename, cmd);

  const ps1 = format(ps1Template, {
    subfolder: app,
    exe,
  }).trim();

  const ps1Filename = path.join(globalPath, `${app}.ps1`);
  saveFile(ps1Filename, ps1);
}

const cmdTemplate = `
@echo off
pushd "%~dp0"
cd /d "%~dp0{subfolder}"
start "" "{exe}"
popd
`;

const ps1Template = `
$initialLocation = Get-Location

Set-Location -Path "$PSScriptRoot\\{subfolder}"

Start-Process -FilePath "{exe}" -Wait

Set-Location -Path $initialLocation
`;

start().catch((err) => console.error(err));
