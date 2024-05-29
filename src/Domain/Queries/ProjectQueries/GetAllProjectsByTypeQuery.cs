using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Models.Enums;
using OeuilDeSauron.Domain.Models.Project;
using OeuilDeSauron.Models;

namespace OeuilDeSauron.Domain.Queries.ProjectQueries
{
    public class GetAllProjectsByTypeQuery : IRequest<List<ProjectResponse>>
    {
        public ProjectType ProjectType { get; }

        public GetAllProjectsByTypeQuery(ProjectType projectType)
        {
            ProjectType = projectType;
        }
    }
}
