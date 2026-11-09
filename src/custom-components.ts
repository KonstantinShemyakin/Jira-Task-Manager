import { BaseComponent } from "obsidian";
import { TaskInfo } from "./main";

export class TaskInputComponent extends BaseComponent {
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

export class DatesPickerComponent extends BaseComponent{
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