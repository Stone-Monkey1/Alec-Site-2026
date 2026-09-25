namespace AlecSite.Server.Projects;

public enum ProjectStatus
{
    Ongoing,
    Completed,
}

public class Project
{
    public int Id { get; set; }

    // Stable, human-readable key. ProjectSeed upserts by this, so titles
    // can be reworded without creating a duplicate row.
    public required string Slug { get; set; }

    public required string Title { get; set; }
    public required string Technology { get; set; }
    public ProjectStatus Status { get; set; }

    // Plain text. Links live in Links rather than inline markup, so the
    // front end never has to render HTML that came out of the database.
    public required string Description { get; set; }

    public List<ProjectLink> Links { get; set; } = [];
    public int SortOrder { get; set; }
}

public class ProjectLink
{
    public required string Label { get; set; }
    public required string Url { get; set; }
}
