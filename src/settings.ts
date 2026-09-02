import { App, PluginSettingTab, Setting } from 'obsidian';
import JTMPlugin from './main';

export interface JTMSettings {
	mwTaskCalendarFile: string;
	projects: string[];
	taskStatuses: string[];
	useTaskFolder: boolean;
	taskFolderName: string;
}

export const DEFAULT_SETTINGS: JTMSettings = {
	mwTaskCalendarFile: 'task-calendar',
	projects: ['PRJDEV', 'TXI'],
	taskStatuses: ['Open', 'Analysis', 'In progress', 'Development', 'Resolved', 'Closed'],
	useTaskFolder: true,
	taskFolderName: 'Tasks'
};

export class JTMSetingsTab extends PluginSettingTab {
	plugin: JTMPlugin;
	taskFolderNameSetting?: Setting;

	constructor(app: App, plugin: JTMPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Task calendar file")
			.setDesc("File for writing new tasks into the calendar")
			.addText((text) =>
				text
					.setPlaceholder('Enter file name')
					.setValue(this.plugin.settings.mwTaskCalendarFile)
					.onChange(async (value) => {
						this.plugin.settings.mwTaskCalendarFile = value;
						await this.plugin.saveSettings();
					}),
			);
		
		new Setting(containerEl)
			.setName("Projects")
			.setDesc("List of projects to choose from for task creation")
			.addTextArea((textArea) => {
				textArea
					.setPlaceholder('Enter the list of projects')
					.setValue(this.plugin.settings.projects.join('\n'))
					.onChange(async (value) => {
						this.plugin.settings.projects = value.split('\n');
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Task statuses")
			.setDesc("List of available task statuses")
			.addTextArea((textArea) => {
				textArea
					.setPlaceholder('Enter the list of statuses')
					.setValue(this.plugin.settings.taskStatuses.join('\n'))
					.onChange(async (value) => {
						this.plugin.settings.taskStatuses = value.split('\n');
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Separate task folder")
			.setDesc("Use separate folder to store created task files")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.useTaskFolder)
					.onChange(async (value) => {
						this.plugin.settings.useTaskFolder = value;
						this.taskFolderNameSetting?.components[0]?.setDisabled(!value);
						await this.plugin.saveSettings();
					});
			});
		
		this.taskFolderNameSetting = new Setting(containerEl)
			.setName("Task folder name")
			.setDesc("Name of the folder to store tasks")
			.addText((text) => {
				text
					.setPlaceholder("Folder name")
					.setValue(this.plugin.settings.taskFolderName)
					.setDisabled(!this.plugin.settings.useTaskFolder)
					.onChange(async (value) => {
						this.plugin.settings.taskFolderName = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
