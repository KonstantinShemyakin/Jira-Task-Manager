import {
	Editor,
	MarkdownView,
	MarkdownFileInfo,
	Modal,
	App,
	Notice,
	Plugin,
	Setting,
	DropdownComponent,
	TextComponent,
	BaseComponent,
	addIcon,
	FileManager,
	FileSystemAdapter,
	Vault,
	DateValue,
	TFile,
} from 'obsidian';
import JTMPlugin from './main';
import {
    TaskInfo
} from './main';
import { JTMSettings } from './settings';

export class CreateTaskModal extends Modal {
	plugin: JTMPlugin;
	task: TaskInfo;
	createFolder: boolean;

	constructor(plugin: JTMPlugin) {
		super(plugin.app);

		this.plugin = plugin;

		this.task = new TaskInfo();
		this.task.project = this.plugin.settings.projects[0] == undefined ? "PRJDEV" : this.plugin.settings.projects[0];
		this.task.status = this.plugin.settings.taskStatuses[0] == undefined ? "Open" : this.plugin.settings.taskStatuses[0];
		this.createFolder = false;

		this.setTitle("Create task");

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
					this.task.descrition = value;
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
	
	onOpen() {
		const { contentEl } = this;

		/*
		ToDo
		3. Maybe add colorcoding for statuses.
		4. Make so you can change task information in separate modal(project and number unchanged, everything else is)
		5. Make default task modal and two classes for creation, modification and deletion modal
		*/
	}

	onSubmit() {
		let vaultManager: Vault = this.app.vault;
		let taskName = this.task.project + "-" + this.task.taskNumber.toString();
		let fileContent: string = this.task.title;

		fileContent += "\nDescription: ";
		fileContent += this.task.descrition;
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

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class TaskInputComponent extends BaseComponent {
	projectSelect: HTMLSelectElement;
	numberInput: HTMLInputElement;

	constructor(container: HTMLElement, projects: string[]) {
		super();

		this.projectSelect = container.createEl("select");
		for (let project of projects) {
			let projectOption = this.projectSelect.createEl("option");
			projectOption.setAttribute("value", project);
			projectOption.innerText = project;
		}

		container.createSpan().innerText = " - ";

		this.numberInput = container.createEl("input");
		this.numberInput.setAttribute("type", "number");
	}

	setTaskInfo(info: TaskInfo): TaskInputComponent {
		this.projectSelect.addEventListener("change", (ev) => {
			if (ev.type != "change")
				return;

			info.project = this.projectSelect.value;
		});

		this.numberInput.addEventListener("change", (ev) => {
			if (ev.type != "change")
				return;

			info.taskNumber = Number.parseInt(this.numberInput.value);
		});

		return this;
	}
}

class DatesPickerComponent extends BaseComponent{
	startDateInput: HTMLInputElement;
	dueDateInput: HTMLInputElement;

	constructor(container: HTMLElement) {
		super();
		
		this.startDateInput = container.createEl("input");
		this.startDateInput.setAttribute("type", "date");

		container.createSpan().innerText = " - ";

		this.dueDateInput = container.createEl("input");
		this.dueDateInput.setAttribute("type", "date");
	}

	setTaskInfo(info: TaskInfo): DatesPickerComponent {
		this.startDateInput.addEventListener("change", (ev) => {
			if (ev.type != "change")
				return;

			info.startDate = this.startDateInput.value;
		});

		this.dueDateInput.addEventListener("change", (ev) => {
			if (ev.type != "change")
				return;

			info.dueDate = this.dueDateInput.value;
		});

		return this;
	}
}

export class ProjectColorModal extends Modal {
	settings: JTMSettings;
	colorElem: Setting;

	constructor(plugin: JTMPlugin) {
		super(plugin.app);
		this.settings = plugin.settings;

		this.setTitle("Project colors");

		this.colorElem = new Setting(this.containerEl)
			.setName("Color")
			.setDesc("Popo")
			.addColorPicker((color) => {
				color.onChange((newColor) => {
					this.colorElem.setDesc(newColor);
				});
			});
	}
}