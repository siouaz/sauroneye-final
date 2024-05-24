import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Product } from 'src/app/demo/api/product';
import { ProductService } from 'src/app/demo/service/product.service';
import { Project } from 'src/app/models/project';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-list-projects',
    templateUrl: './list-projects.component.html',
    providers: [MessageService]
})
export class ListProjectsComponent {


    projectDialog: boolean = false;

    deleteProductDialog: boolean = false;
    deleteProjectDialog: boolean = false;

    deleteProductsDialog: boolean = false;
    deleteProjectsDialog: boolean = false;

    loading: boolean = false;

    project: Project = {
        id: '',
        name: '',
        healthcheckUrl: '',
        siteUrl: '',
        assignedTo: '',
        isActive: false,
        sendMailifUnhealthy: false,
        durationInMinute: 0,
        maxResponseTimeInSecond: 0,
        headersSerialized: '',
        headers: []
    };


    projects: Project[] = [];



    selectedProducts: Product[] = [];
    selectedtProjects: Project[] = [];


    submitted: boolean = false;

    cols: any[] = [];

    statuses: any[] = [];

    rowsPerPageOptions = [5, 10, 20];


    constructor(private messageService: MessageService, private api: ApiService, private router: Router) { }

    ngOnInit() {
        this.getAllProject();
    }


    getProjectDetails(id: string) {
        this.router.navigateByUrl('/pages/project-details/' + id);
    }
    openNew() {
        this.project = new Project;
        this.submitted = false;
        this.projectDialog = true;
    }

    deleteSelectedProducts() {
        this.deleteProductsDialog = true;
    }

    editProduct(project: Project) {

        this.project = { ...project };
        this.projectDialog = true;
    }

    deleteProduct(project: Project) {
        this.deleteProductDialog = true;
        this.project = { ...project };
    }

    confirmDeleteSelected() {
        this.deleteProjectsDialog = false;
        this.projects = this.projects.filter(val => !this.selectedtProjects.includes(val));
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Projects Deleted', life: 3000 });
        this.selectedtProjects = [];
    }

    confirmDelete() {
        this.deleteProductDialog = false;
        this.projects = this.projects.filter(val => val.id !== this.project.id);
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
        this.project = {
            id: '',
            name: '',
            healthcheckUrl: '',
            siteUrl: '',
            assignedTo: '',
            isActive: false,
            sendMailifUnhealthy: false,
            durationInMinute: 0,
            maxResponseTimeInSecond: 0,
            headersSerialized: '',
            headers: []
        };
    }

    hideDialog() {
        this.projectDialog = false;
        this.submitted = false;
    }

    saveProject() {
        this.submitted = true;

        if (this.project.name?.trim()) {
            if (this.project.id) {
                // @ts-ignore
                this.project.id = this.project.id;
                this.project.name = this.project.name;

                this.projects[this.findIndexById(this.project.id)] = this.project;
                this.api.updateProject(this.project).subscribe(res => {
                    this.projectDialog = false;
                }, error => {
                    alert(error.message);
                });
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Project Updated', life: 3000 });
            } else {




                this.api.addProject(this.project).subscribe(res => {
                    this.projectDialog = false;
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Project Created', life: 3000 });
                }, error => {
                    alert(error.message);
                })

            }

            this.projects = [...this.projects];
            this.projectDialog = false;
            this.project = {
                id: '',
                name: '',
                healthcheckUrl: '',
                siteUrl: '',
                assignedTo: '',
                isActive: false,
                sendMailifUnhealthy: false,
                durationInMinute: 0,
                maxResponseTimeInSecond: 0,
                headersSerialized: '',
                headers: []
            };
        }
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.projects.length; i++) {
            if (this.projects[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    createId(): string {
        let id = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }


    addProject(project: Project) {
        this.api.addProject(project);
    }


    getAllProject() {
        this.api.getAllProjects().subscribe(res => {

            this.projects = res;
            console.log(this.projects);
        });

    }
}
