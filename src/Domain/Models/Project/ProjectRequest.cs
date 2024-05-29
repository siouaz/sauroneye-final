using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Models.Enums;

namespace OeuilDeSauron.Domain.Models.Project
{
    public class ProjectRequest
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public ProjectType Type { get; set; }

        [Required]
        public string HealthcheckUrl { get; set; }

        [Required]
        public string SiteUrl { get; set; }

        [Required]
        [EmailAddress]
        public string AssignedTo { get; set; }
        [Required]
        public bool IsActive { get; set; }
        public bool SendMailIfUnhealthy { get; set; }
        public bool SendSMSIfUnhealthy { get; set; }
        public bool SendTeamsNotificationIfUnhealthy { get; set; }
        [Required]
        public int DurationInMinute { get; set; }
        [Required]
        public int MaxResponseTimeInSecond { get; set; }
        public string HeadersSerialized { get; set; }
    }
}
