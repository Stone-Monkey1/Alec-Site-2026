namespace AlecSite.Server.Projects;

public record ProjectLinkDto(string Label, string Url);

public record ProjectDto(
    string Slug,
    string Title,
    string Technology,
    string Status,
    string Description,
    IReadOnlyList<ProjectLinkDto> Links
)
{
    public static ProjectDto From(Project project) =>
        new(
            project.Slug,
            project.Title,
            project.Technology,
            project.Status.ToString(),
            project.Description,
            project.Links.Select(link => new ProjectLinkDto(link.Label, link.Url)).ToList()
        );
}
