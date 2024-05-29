using System;

using FluentValidation.AspNetCore;
using Hangfire;
using Hangfire.Console;
using Hangfire.Console.Extensions;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Serilog;
using Microsoft.EntityFrameworkCore;
using OeuilDeSauron;
using OeuilDeSauron.Data.Identity;
using OeuilDeSauron.Domain.Extensions;
using OeuilDeSauron.Domain.Interfaces;
using OeuilDeSauron.Filters;
using OeuilDeSauron.Hosting;
using OeuilDeSauron.Infrastructure;
using OeuilDeSauron.Services;
using OeuilDeSauron.Telemetry;
using OeuilDeSauron.Data;
using System.Threading.Tasks;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.ApplicationInsights.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
var assembly = typeof(Program).Assembly;

// Logging
builder.Host.UseSerilog((context, configuration) =>
    configuration.Enrich.WithMachineName()
        .ReadFrom.Configuration(context.Configuration));

// Application Insights
builder.Services.AddApplicationInsightsTelemetry();
builder.Services.AddApplicationInsightsTelemetryProcessor<ExcludeRequestTelemetryProcessor>();

// Mini Profiler
builder.Services.AddMiniProfiler(options =>
{
    options.RouteBasePath = "/profiler";
    options.ResultsAuthorize = request => request.HttpContext.User.Identity is not null && request.HttpContext.User.Identity.IsAuthenticated && request.HttpContext.User.IsAdmin();
    options.ResultsListAuthorize = request => request.HttpContext.User.Identity is not null && request.HttpContext.User.Identity.IsAuthenticated && request.HttpContext.User.IsAdmin();
})
    .AddEntityFramework();

if (builder.Environment.IsDevelopment())
{
    // Developer Page
    builder.Services.AddDatabaseDeveloperPageExceptionFilter();
}

// Health Checks
//builder.Services.AddHealthChecks()
//    .AddDbContextCheck<MonitoringContext>(dbConnectionString)
//    .AddSqlServer(dbConnectionString, name: "Azure SQL Database - OeuilDeSauron",
//        tags: new[] { "Azure", "SQL" })
//    .AddSqlServer(dbConnectionString, name: "Azure SQL Database - Jobs",
//        tags: new[] { "Azure", "SQL", "Hangfire" })
//    .AddAzureBlobStorage(dbConnectionString, "documents", name: "Azure Storage",
//        tags: new[] { "Azure", "Storage" })
//    .AddHangfire(options => options.MaximumJobsFailed = 1, "Hangfire", tags: new[] { "Hangfire" });

// Identity
builder.Services.AddIdentity<User, Role>(options =>
{
    options.User.RequireUniqueEmail = true;
    options.User.AllowedUserNameCharacters = null;
})
    .AddEntityFrameworkStores<MonitoringContext>()
    .AddDefaultTokenProviders();

builder.Services.Configure<IdentityOptions>(options =>
{
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(60);
    options.Lockout.MaxFailedAccessAttempts = 3;
    options.User.RequireUniqueEmail = builder.Environment.IsProduction();
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
});

// Token duration
builder.Services.Configure<DataProtectionTokenProviderOptions>(options =>
    options.TokenLifespan = TimeSpan.FromHours(1));

// Application Cookie
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "Authentication";
    options.ExpireTimeSpan = TimeSpan.FromDays(10);
});

//if (!builder.Environment.IsDevelopment())
//{
//    // Data Protection
//    builder.Services.AddDataProtection()
//        .PersistKeysToAzureBlobStorage(builder.Configuration.GetConnectionString("Storage"),
//            builder.Configuration.GetValue<string>("DataProtection:Container"),
//            builder.Configuration.GetValue<string>("DataProtection:Blob"))
//        .SetApplicationName("HanaKiosk");
//}

// Cache
builder.Services.AddDistributedMemoryCache();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("UserPolicy", policy =>
        policy.RequireAuthenticatedUser());
});
// Authentication
builder.Services.AddAuthentication(builder.Configuration);

builder.Services.ConfigureApplicationCookie(options =>
    options.Events.OnRedirectToAccessDenied =
        options.Events.OnRedirectToLogin = c =>
        {
            c.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.FromResult<object>(null);
        });

// Authorization
builder.Services.AddAuthorization();

// Antiforgery
builder.Services.AddAntiforgery(options => options.HeaderName = "X-XSRF-TOKEN");

// Hangfire
builder.Services.AddHangfire(config => config
    .UseConsole()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("ConnectionString")))
    .AddHangfireConsoleExtensions();
builder.Services.AddHangfireServer(options => options.WorkerCount = 1);

// MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(OeuilDeSauron.DomainServiceCollectionExtensions).Assembly));

// Localization
builder.Services.AddLocalization();

// Hosted Services
builder.Services.AddHostedService<HangfireService>();

// Domains
builder.Services.AddDomain(builder.Configuration, builder.Environment);

// Current User Service
builder.Services.AddSingleton<ICurrentUserService, CurrentUserService>();
builder.Services.AddHttpContextAccessor();

// Mail
builder.Services.AddMailing(builder.Environment);

// Fluent Validation
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddSwaggerGen();

// Mvc
builder.Services.AddMvc()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
        options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
        options.SerializerSettings.Converters.Add(new StringEnumConverter());
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // Exception Handling
    app.UseDeveloperExceptionPage();
    app.UseMigrationsEndPoint();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Strict Transport Security
    app.UseHsts();
}


//
 app.UseHttpsRedirection();
// Static Files
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = context =>
        context.Context.Response.Headers.Append("Cache-Control", "public,max-age=31536000")
});
app.MapFallbackToFile("index.html");
// GDPR
app.UseCookiePolicy(new CookiePolicyOptions
{
    Secure = CookieSecurePolicy.Always,
    HttpOnly = HttpOnlyPolicy.Always,
    MinimumSameSitePolicy = SameSiteMode.Unspecified
});

// Routing
app.UseRouting();

// Authentication
app.UseAuthentication();
app.UseAuthorization();

// Localization
app.UseRequestLocalization(options =>
{
    //options.SupportedCultures = Resources.SupportedCultures;
    //options.SupportedUICultures = Resources.SupportedCultures;
    options.SetDefaultCulture("fr-FR");
});

// Response Caching
app.UseResponseCaching();

// Mini Profiler
// app.UseMiniProfiler();

// Mvc
//app.MapHealthChecks("/health",
//        new HealthCheckOptions { Predicate = _ => true, ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse });

//app.MapHealthChecks("health",new HealthCheckOptions()
//{
//    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
//});

app.MapControllerRoute("default", "{controller}/{action=Index}");

app.MapHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = app.Environment.IsProduction()
            ? new[] { new HangfireAuthorizationFilter() }
            : Array.Empty<IDashboardAuthorizationFilter>(),
    IsReadOnlyFunc = context =>
        app.Environment.IsProduction() && context.GetHttpContext().User.IsInRole("Administrator")
});
app.MapFallbackToController("Index", "App");

app.Run();
