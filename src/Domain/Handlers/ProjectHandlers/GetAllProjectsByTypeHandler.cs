using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using OeuilDeSauron.Data;
using OeuilDeSauron.Domain.Models.Project;
using OeuilDeSauron.Domain.Queries.ProjectQueries;
using OeuilDeSauron.Models;

namespace OeuilDeSauron.Domain.Handlers.ProjectHandlers
{
    public class GetAllProjectsByTypeHandler : IRequestHandler<GetAllProjectsByTypeQuery, List<ProjectResponse>>
    {
        private readonly MonitoringContext _context;
        private readonly IMapper _mapper;

        public GetAllProjectsByTypeHandler(MonitoringContext context,IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<List<ProjectResponse>> Handle(GetAllProjectsByTypeQuery request, CancellationToken cancellationToken)
        {
            var projects = _context.Projects.Where(p=>p.Type==request.ProjectType).ToList();
            var projectsResponse = _mapper.Map<List<Project>,List<ProjectResponse>>(projects);
            return projectsResponse;
        }
    }
}
