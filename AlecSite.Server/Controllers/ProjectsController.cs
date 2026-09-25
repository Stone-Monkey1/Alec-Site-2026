using AlecSite.Server.Data;
using AlecSite.Server.Projects;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlecSite.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<ProjectDto>> GetAll(CancellationToken cancellationToken)
    {
        var projects = await db
            .Projects.AsNoTracking()
            .OrderBy(p => p.SortOrder)
            .ToListAsync(cancellationToken);

        return projects.Select(ProjectDto.From).ToList();
    }
}
