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
	project: string;
	taskNumber: number;
	
	title: string;
	descrition: string;

	startDate: string;
	dueDate: string;

	status: string;

	constructor() {
		this.project = "";
		this.taskNumber = 0;
		this.title = "";
		this.descrition = "";
		this.startDate = "";
		this.dueDate = "";
		this.status = "";
	}
}