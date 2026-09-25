using AlecSite.Server.Projects;
using Microsoft.EntityFrameworkCore;

namespace AlecSite.Server.Data;

// Until there's an admin screen, this list is the source of truth for
// project content: every startup upserts it by Slug, so editing text here
// and restarting updates the database. Rows that aren't in this list are
// left alone, so projects added later some other way won't be deleted.
public static class ProjectSeed
{
    private static IReadOnlyList<Project> Projects() =>
        [
            new()
            {
                Slug = "gov-contract-tracker",
                Title = "Government Contract Tracker & Stock Purchases",
                Technology = "Python",
                Status = ProjectStatus.Completed,
                Description =
                    "This project pulled daily government contracts via one of the USAspending.gov APIs. It would look through every contract and save the information of contracts awarded that exceeded $5,000,000. It then checked to see whether the company awarded the contract was publicly traded. It then purchased stock based off of a scoring algorithm. The hypothesis was big contract awards would affect the price of the stock in the following days. I then mounted the program on my personal server. I ran it for a few months. I was not able to find a correlation to support my hypothesis.",
                Links = [new() { Label = "USAspending.gov", Url = "https://www.usaspending.gov/" }],
            },
            new()
            {
                Slug = "sokal-qa",
                Title = "Sokal QA Application",
                Technology = "Node/Express + Vue",
                Status = ProjectStatus.Completed,
                Description =
                    "Desktop tool that crawls dealership sites and runs modular checks (navigation/title validation, alt-tag checks, responsive image checks, quick-links tests, keyword search, CSS unused/overwritten audit). Supports dynamic test selection, per-URL result sets, and auto-updates; packaged and distributed with electron-builder.",
            },
            new()
            {
                Slug = "dotnet-maui-apps",
                Title = ".NET Maui Applications",
                Technology = "C#",
                Status = ProjectStatus.Completed,
                Description =
                    "Built two cross-platform .NET MAUI apps to develop C#/.NET fundamentals: a weapon-damage calculator with frontend selectors driving conditional backend logic across multiple damage types (physical, magic, fire), and a memory-matching game with grid-based flip/match state management and a completion timer. Paired these with focused exercises on constructors, object/reference semantics, and inheritance/polymorphism patterns.",
            },
            new()
            {
                Slug = "journey",
                Title = "Journey",
                Technology = "Unity/C#",
                Status = ProjectStatus.Ongoing,
                Description =
                    "Building a grid-based tactical game in Unity/C#. Core coordinate and grid systems are in place; currently implementing character movement and A* pathfinding. Applying OOP and SOLID principles to keep the architecture extensible as the project grows.",
            },
            new()
            {
                Slug = "dating-app-clone",
                Title = "Dating Application Clone",
                Technology = "Angular/.NET",
                Status = ProjectStatus.Completed,
                Description =
                    "Followed a course on building a full stack application. Users can register and log in, with password rules and a date-of-birth picker. Private messaging with inbox, outbox and unread views, live chat through SignalR and read receipts. Admin panel for editing user roles and approving photos. Member detail pages with a photo gallery. You can edit your own profile and upload photos, set a main photo or delete one.",
            },
        ];

    public static async Task SeedAsync(DbContext context, CancellationToken cancellationToken)
    {
        var existing = await context
            .Set<Project>()
            .ToDictionaryAsync(p => p.Slug, cancellationToken);
        Upsert(context, existing);
        await context.SaveChangesAsync(cancellationToken);
    }

    public static void Seed(DbContext context)
    {
        var existing = context.Set<Project>().ToDictionary(p => p.Slug);
        Upsert(context, existing);
        context.SaveChanges();
    }

    private static void Upsert(DbContext context, Dictionary<string, Project> existing)
    {
        var sortOrder = 0;
        foreach (var seed in Projects())
        {
            seed.SortOrder = sortOrder++;
            if (!existing.TryGetValue(seed.Slug, out var project))
            {
                context.Add(seed);
                continue;
            }

            project.Title = seed.Title;
            project.Technology = seed.Technology;
            project.Status = seed.Status;
            project.Description = seed.Description;
            project.Links = seed.Links;
            project.SortOrder = seed.SortOrder;
        }
    }
}
