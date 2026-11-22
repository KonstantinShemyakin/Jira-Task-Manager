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
import {
	DEFAULT_SETTINGS,
	JTMSettings,
	JTMSetingsTab,
} from './settings';
import {
	CreateTaskModal
} from './modal';
// Remember to rename these classes and interfaces!

export default class JTMPlugin extends Plugin {
	settings!: JTMSettings;

	async onload() {
		await this.loadSettings();
		
		this.addRibbonIcon('calendar-range', 'Create task', (_evt: MouseEvent) => {
			new CreateTaskModal(this).open();			
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new JTMSetingsTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<JTMSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

export class TaskInfo {
	file?: TFile;
	
	project: string;
	taskNumber: number;
	
	title: string;
	description: string;

	startDate: string;
	dueDate: string;

	status: string;

	constructor() {
		this.project = "";
		this.taskNumber = -1;
		this.title = "";
		this.description = "";
		this.startDate = "";
		this.dueDate = "";
		this.status = "";
		this.file = undefined;
	}

	static parseFromFile(file: TFile) : TaskInfo {
        var parsedInfo = new TaskInfo();
		parsedInfo.file = file;
		var nameComponents = file.name.split("-");
		parsedInfo.project = nameComponents[0] != undefined ? nameComponents[0] : parsedInfo.project;
		var numberComponent = nameComponents[1] != undefined ? nameComponents[1].split(".")[0] : undefined;
		parsedInfo.taskNumber = numberComponent != undefined ? Number.parseInt(numberComponent) : parsedInfo.taskNumber;
        file.vault.read(file).then((value) => {
            var fileProps = value.split("---")[1];
			if (fileProps == undefined)
				return;
			for (var prop of fileProps.split("\n")) {
				var propComponents = prop.split(": ");
				switch(propComponents[0]?.trim()) {
					case "title":
						parsedInfo.title = propComponents[1] != undefined ? propComponents[1].trim() : parsedInfo.title; 
						break;
					case "description":
						parsedInfo.description = propComponents[1] != undefined ? propComponents[1].trim() : parsedInfo.description;
						break;
					case "start date":
						parsedInfo.startDate = propComponents[1] != undefined ? propComponents[1].trim() : parsedInfo.startDate;
						break;
					case "due date":
						parsedInfo.dueDate = propComponents[1] != undefined ? propComponents[1].trim() : parsedInfo.dueDate;
						break;
					case "status":
						parsedInfo.status = propComponents[1] != undefined ? propComponents[1].trim() : parsedInfo.status;
						break;
				}
			}
        });
		return parsedInfo;
    }

	toFileProps() : string {
		var props = "";
		props += this.title.length != 0 ? "title: " + this.title + "\n" : "";
		props += this.description.length != 0 ? "description: " + this.description + "\n" : "";
		props += this.startDate.length != 0 ? "start date: " + this.startDate + "\n" : "";
		props += this.dueDate.length != 0 ? "due date: " + this.dueDate + "\n" : "";
		props += this.status.length != 0 ? "status: " + this.status + "\n" : "";
		return props;
	}

	toCalendarRecord() : string {
		var taskName = this.getFullTaskName();
		return this.startDate + "/" + this.dueDate 
					+ ": [" + taskName + "](https://helpdesk.compassluxe.com/browse/" + taskName + ") " 
					+ this.title;
	}

	getFullTaskName() : string {
		return this.project + "-" + this.taskNumber.toString();
	}
}