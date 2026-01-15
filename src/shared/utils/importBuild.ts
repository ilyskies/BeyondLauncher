import { open, message } from "@tauri-apps/plugin-dialog";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import {
  validateBuildPath,
  parseVersionInfo,
  getBuildSize,
  formatBytes,
  getChapterAndSeason,
} from "./buildUtils";
import { Build, useBuildStore } from "@/features/library/stores/builds";

const SUPPORTED_VERSIONS = ["10.40"];

export interface ImportResult {
  path: string;
  version: string;
  title: string;
  size: string;
  season: string;
  supported: boolean;
  netcl: string;
  shippingPath: string;
  image: string;
}

export const importBuild = async (): Promise<ImportResult | null> => {
  try {
    const buildStore = useBuildStore.getState();

    const selectedPath = await open({
      multiple: false,
      directory: true,
      title: "Select Fortnite Installation Folder",
    });

    if (
      !selectedPath ||
      typeof selectedPath !== "string" ||
      selectedPath.trim() === ""
    ) {
      return null;
    }

    let validationResult;
    try {
      validationResult = await validateBuildPath(selectedPath);
    } catch (error) {
      await message(`Cannot access folder: ${error}`, {
        title: "Access Error",
      });
      return null;
    }

    const { isValid, shippingPath, splashPath } = validationResult;

    if (!isValid) {
      await message("Invalid Fortnite installation folder", {
        title: "Invalid Folder",
      });
      return null;
    }

    const existingBuild = buildStore.builds.find(
      (b) => b.path === selectedPath
    );
    if (existingBuild) {
      await message("This build is already imported", {
        title: "Duplicate Build",
      });
      return null;
    }

    let patternHexCheck: string[];
    try {
      patternHexCheck = (await invoke("locate_version", {
        filePath: shippingPath,
      })) as string[];
    } catch (error) {
      await message(`Failed to analyze executable: ${error}`, {
        title: "Analysis Failed",
      });
      return null;
    }

    if (!patternHexCheck || !Array.isArray(patternHexCheck)) {
      await message("Invalid version data in executable", {
        title: "Corrupted File",
      });
      return null;
    }

    const { version, netcl } = parseVersionInfo(patternHexCheck);

    if (version === "NOT FOUND" || netcl === "NOT FOUND") {
      await message("Could not detect Fortnite version", {
        title: "Version Not Found",
      });
      return null;
    }

    const supported = SUPPORTED_VERSIONS.includes(version);

    let buildSize = 0;
    try {
      buildSize = await getBuildSize(selectedPath);
    } catch (error) {
      console.warn("Could not calculate build size:", error);
    }

    const formattedSize = formatBytes(buildSize);
    const { chapter, season } = getChapterAndSeason(version);

    const result: ImportResult = {
      path: selectedPath,
      version,
      title: `Chapter ${chapter} Season ${season}`,
      season: `Season ${season}`,
      size: formattedSize,
      supported,
      netcl,
      shippingPath,
      image: convertFileSrc(splashPath),
    };

    return result;
  } catch (error) {
    console.error("Import build error:", error);
    await message(`Import failed: ${error}`, { title: "Import Error" });
    return null;
  }
};

export const addBuildToLibrary = async (
  importResult: ImportResult
): Promise<boolean> => {
  try {
    const buildStore = useBuildStore.getState();

    const newBuild: Build = {
      id: `${importResult.version}-${Date.now()}`,
      title: importResult.title,
      version: importResult.version,
      season: importResult.season,
      path: importResult.path,
      size: importResult.size,
      supported: importResult.supported,
      netcl: importResult.netcl,
      image: importResult.image,
      dateAdded: new Date().toISOString(),
    };

    buildStore.addBuild(newBuild);
    return true;
  } catch (error) {
    console.error("Failed to add build:", error);
    return false;
  }
};
