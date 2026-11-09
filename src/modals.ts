import { BaseComponent, Modal, Notice, Setting, TFile, Vault } from "obsidian";
import JTMPlugin, { TaskInfo } from "./main";
import { DatesPickerComponent, TaskInputComponent } from "./custom-components";

export class TaskModal extends Modal {
    plugin: JTMPlugin;
    task: TaskInfo;
    createFolder: boolean;

    constructor(plugin: JTMPlugin, task?: TaskInfo) {
        super(plugin.app);

        this.plugin = plugin;
        if (task != null)
            this.task = task;
        else
            this.task = new TaskInfo();
        this.createFolder = false; // In case of modification set as the current state of the task(in out folder)

        new Setting(this.contentEl)
            .setName("Task")
            .addComponent((container) => {
                return new TaskInputComponent(container, this.plugin.settings.projects)
                                .setTaskInfo(this.task);
            });
                
        new Setting(this.contentEl)
            .setName("Title")
            .addText((input) => {
                input.onChange((value) => {
                    this.task.title = value;
                });
            });
        
        new Setting(this.contentEl)
            .setName("Status")
            .addDropdown((dropdown) => {
                for (let taskStatus of this.plugin.settings.taskStatuses)
                    dropdown.addOption(taskStatus, taskStatus);
                dropdown.onChange((value) => {
                    this.task.status = value;
                });
            });
        
        new Setting(this.contentEl)
            .setName("Start-Due")
            .addComponent((container) => {
                return new DatesPickerComponent(container)
                                .setTaskInfo(this.task);
            });
        
        new Setting(this.contentEl)
            .setName("Description")
            .addTextArea((txtArea) => {
                txtArea.onChange((value) => {
                    this.task.description = value;
                });
            });
        
        new Setting(this.contentEl)
            .setName("Create separate folder")
            .addToggle((toggle) => {
                toggle.onChange((value) => {
                    this.createFolder = value;
                });
            });
        
        new Setting(this.contentEl)
            .addButton((btn) => {
                btn
                    .setButtonText("Create")
                    .setCta()
                    .onClick(() => {
                        this.onSubmit();
                        this.close();
                    });
            });
    }

    onSubmit() {
        let vaultManager: Vault = this.app.vault;
        let taskName = this.task.project + "-" + this.task.taskNumber.toString();
        let fileContent: string = this.task.title;

        fileContent += "\nDescription: ";
        fileContent += this.task.description;
        fileContent += "\nStart date: ";
        fileContent += this.task.startDate;
        fileContent += "\nDue date: ";
        fileContent += this.task.dueDate;
        fileContent += "\nStatus: ";
        fileContent += this.task.status;

        let filePath: string = taskName + ".md";
        if (this.plugin.settings.useTaskFolder) {
            if (vaultManager.getFolderByPath("./" + this.plugin.settings.taskFolderName) == null)
                vaultManager.createFolder(this.plugin.settings.taskFolderName);
        }
        if (this.createFolder) {
            if (this.plugin.settings.useTaskFolder) {
                vaultManager.createFolder(this.plugin.settings.taskFolderName + "/" + taskName);
                filePath = this.plugin.settings.taskFolderName + "/" + taskName + "/" + filePath;
            } else {
                vaultManager.createFolder(taskName);
                filePath = taskName + "/" + filePath;
            }
        } else if (this.plugin.settings.useTaskFolder)
            filePath = this.plugin.settings.taskFolderName + "/" + filePath;
        vaultManager.create(filePath, fileContent);

        let taskCalendarFileName = this.plugin.settings.mwTaskCalendarFile;
        taskCalendarFileName = taskCalendarFileName.endsWith(".mw") 
                            ? taskCalendarFileName
                            : taskCalendarFileName + ".mw"
    
        let appendTask = (file: TFile) => {
            vaultManager.append(file, this.task.startDate + "/" + this.task.dueDate + 
                                        ": [" + taskName + 
                                        "](https://helpdesk.compassluxe.com/browse/" + taskName + ")" + "\n");
        };
        let taskCalendarFile = vaultManager.getFileByPath(taskCalendarFileName);
        if (taskCalendarFile == null)
            vaultManager.create(taskCalendarFileName, "").then(appendTask);
        else
            appendTask(taskCalendarFile);
    }
}

// Think about making main class
//export class TaskManager {

//}