import { TFile } from "obsidian";
import JTMPlugin, { TaskInfo } from "./main";

// Make it that with numbers the title will be loaded

export class TaskDataBase {
    static getTaskFilesForProject(plugin: JTMPlugin, project: string): Set<TFile> {
        var vaultManager = plugin.app.vault;

        var taskFiles = new Set<TFile>();
        for (let file of vaultManager.getMarkdownFiles()) {
            if (file.name.startsWith(project)) {
                    taskFiles.add(file);
            }
        }

        return taskFiles;
    }
}