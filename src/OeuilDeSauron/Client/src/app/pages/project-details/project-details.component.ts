import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Project, header } from 'src/app/models/project';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html'
})
export class ProjectDetailsComponent implements OnInit {


  idProject: string;
  data: Observable<Project>;
  project: any;
  headers : header[]=[]; 
  header : header ;
  constructor(private route: ActivatedRoute, private api: ApiService

  ) {

  }
  ngOnInit() {
    this.idProject = this.route.snapshot.paramMap.get('id');
    console.log(this.idProject);
    this.getProjectById();

  }


  getProjectById() {
    this.api.getProjectById(this.idProject).subscribe(res => {
      this.project = res;
      if (res.headers != null ){
        // res.headers.map((data : any ) => {
        //   return {
        //     xRapidAPIHost : data.xRapidAPIHost, 
        //     xRapidAPIKey : data.xRapidAPIKey
        //   }
        // })
        this.headers = res.headers; 
      }
      console.log(this.project);
      console.log (this.headers);
    })
  }


}
