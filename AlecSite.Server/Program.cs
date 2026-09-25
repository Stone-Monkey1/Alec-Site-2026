using AlecSite.Server.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();

builder.Services.AddDbContext<AppDbContext>(options =>
    options
        .UseSqlite(builder.Configuration.GetConnectionString("Default"))
        .UseSeeding((context, _) => ProjectSeed.Seed(context))
        .UseAsyncSeeding(
            (context, _, cancellationToken) => ProjectSeed.SeedAsync(context, cancellationToken)
        )
);

builder.Services.AddHealthChecks().AddDbContextCheck<AppDbContext>();

var app = builder.Build();

// Apply pending migrations (and run the seed) on startup. Fine for a single
// instance with SQLite; revisit if the site ever runs on multiple instances.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.UseExceptionHandler();
app.UseStatusCodePages();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/api/health");

// Unknown /api routes are real 404s (ProblemDetails via UseStatusCodePages),
// not the SPA's index.html from the fallback below.
app.Map("/api/{**path}", () => Results.NotFound());

app.MapFallbackToFile("/index.html");

app.Run();
