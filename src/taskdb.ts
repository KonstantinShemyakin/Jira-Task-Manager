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

    static modifyTask(plugin: JTMPlugin, task: TaskInfo) {
        if (task.file == undefined)
            return;

        var vaultManager = plugin.app.vault;
        vaultManager.read(task.file).then(
            (value: string) => {
                if (task.file == undefined)
                    return;

                var content = value.split("---").last();
                var fileBody = task.toFileProps() + (content != undefined ? content : "");
                vaultManager.modify(task.file, fileBody);
        }); // + modify in calendar
    }

    static createTask(plugin: JTMPlugin, task: TaskInfo, createFolder?: boolean) {
        if (task.file != undefined)
            return;

        var taskName = task.getFullTaskName();

        var vaultManager = plugin.app.vault;
        var filePath = taskName + ".md";
        if (plugin.settings.useTaskFolder) {
            if (vaultManager.getFolderByPath("./" + plugin.settings.taskFolderName) == null)
                vaultManager.createFolder(plugin.settings.taskFolderName);
        }
        if (createFolder) {
            if (plugin.settings.useTaskFolder) {
                vaultManager.createFolder(plugin.settings.taskFolderName + "/" + taskName);
                filePath = plugin.settings.taskFolderName + "/" + taskName + "/" + filePath;
            } else {
                vaultManager.createFolder(taskName);
                filePath = taskName + "/" + filePath;
            }
        } else if (plugin.settings.useTaskFolder)
            filePath = plugin.settings.taskFolderName + "/" + filePath;

        vaultManager.create(filePath, task.toFileProps());
        // + create in calendar
    }

    static deleteTask(plugin: JTMPlugin, task: TaskInfo) {
        if (task.file == undefined)
            return;

        var vaultManager = plugin.app.vault;
        vaultManager.delete(task.file);

        // + delete from calendar
    }
}

export class TaskCalendar {
    static getCalendarFileName(plugin: JTMPlugin) {
        var taskCalendarFileName = plugin.settings.mwTaskCalendarFile;
        return (taskCalendarFileName.endsWith(".mw") 
                    ? taskCalendarFileName
                    : taskCalendarFileName + ".mw");
        
    }

    static getCalendarFile(plugin: JTMPlugin, filePath: string) : Promise<TFile> {
        var vaulManager = plugin.app.vault;
        var calendarFile = vaulManager.getFileByPath(filePath);

        return calendarFile == null
                    ? vaulManager.create(filePath, "")
                    : new Promise<TFile>((resolve, reject) => {
                            if (calendarFile == null) {
                                reject();
                                return;
                            }

                            resolve(calendarFile);
                        });
    }

    static findTaskLine(calendarBody: string, task: TaskInfo) : number {
        var taskName = task.getFullTaskName();
        var calendarLines = calendarBody.split("\n");
        for (var i = 0; i < calendarLines.length; i++) {
            if (calendarLines[i]?.contains(taskName))
                return i;
        }

        return -1;
    }

    static modifyTask(plugin: JTMPlugin, task: TaskInfo) {
        var vaulManager = plugin.app.vault;
        
        this.getCalendarFile(plugin, this.getCalendarFileName(plugin)).then(
            (fileValue) => {
                vaulManager.read(fileValue).then(
                    (bodyValue) => {
                        var taskLine = this.findTaskLine(bodyValue, task);
                        
                        if (taskLine == -1) {
                            this.createTask(plugin, task);
                            return;
                        }

                        var calendarLines = bodyValue.split("\n");
                        calendarLines[taskLine] = task.toCalendarRecord();
                        vaulManager.modify(fileValue, calendarLines.join("\n"));
                    });
            });
    }

    static createTask(plugin: JTMPlugin, task: TaskInfo) {
        var vaulManager = plugin.app.vault;
        
        this.getCalendarFile(plugin, this.getCalendarFileName(plugin)).then();
    }

    static deleteTask(plugin: JTMPlugin, task: TaskInfo) {
        var vaulManager = plugin.app.vault;
        
        this.getCalendarFile(plugin, this.getCalendarFileName(plugin)).then(
            (fileValue) => {
                vaulManager.read(fileValue).then(
                    (bodyValue) => {
                        var taskLine = this.findTaskLine(bodyValue, task);
                        
                        if (taskLine == -1)
                            return;

                        var calendarLines = bodyValue.split("\n");
                        var toDelete = calendarLines[taskLine];
                        if (toDelete != undefined)
                            calendarLines.remove(toDelete);
                        vaulManager.modify(fileValue, calendarLines.join("\n"));
                    });
            });
    }

    static createSection(name: string) {
        
    }

    static deleteSection(name: string) {

    }

    static getSectionedCalendar(plugin: JTMPlugin) : Promise<Map<string, string>> {
        var vaulManager = plugin.app.vault;

        return this.getCalendarFile(plugin, this.getCalendarFileName(plugin))
            .then(fileValue => vaulManager.read(fileValue))
            .then(bodyValue => {
                var sectionMap = new Map<string, string>();

                for (var line of bodyValue.split("\n")) {

                }

                return sectionMap;
            });
    }

    static writeSectionsToCalendar() {

    }
}