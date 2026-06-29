using Kendo.Mvc;
using Microsoft.AspNetCore.Mvc;
using NeoBoard.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews()
    .AddNewtonsoftJson(options => {
        options.SerializerSettings.ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver();
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });

builder.Services.AddHttpClient();
builder.Services.AddSignalR();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is not configured.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services.AddKendo();

// Configure Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ipAddress, _ => new FixedWindowRateLimiterOptions
        {
            AutoReplenishment = true,
            PermitLimit = 100,
            Window = TimeSpan.FromMinutes(1)
        });
    });

    options.AddPolicy("AuthLimit", httpContext =>
    {
        var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ipAddress, _ => new FixedWindowRateLimiterOptions
        {
            AutoReplenishment = true,
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(1)
        });
    });
});

// Initialize Firebase Admin SDK
try
{
    var credentialPath = builder.Configuration["Firebase:CredentialFilePath"];
    if (!string.IsNullOrEmpty(credentialPath) && System.IO.File.Exists(credentialPath))
    {
        if (FirebaseAdmin.FirebaseApp.DefaultInstance == null)
        {
            FirebaseAdmin.FirebaseApp.Create(new FirebaseAdmin.AppOptions
            {
                Credential = Google.Apis.Auth.OAuth2.GoogleCredential.FromFile(credentialPath)
            });
            Console.WriteLine("[Firebase Admin] Initialized successfully.");
        }
    }
    else
    {
        Console.WriteLine($"[Firebase Admin] Credential file not found at: {credentialPath}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"[Firebase Admin Init Error] {ex.Message}");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            try
            {
                var uri = new Uri(origin);
                var host = uri.Host;
                
                // Cho phép localhost và 127.0.0.1
                if (host == "localhost" || host == "127.0.0.1")
                    return true;
                    
                // Cho phép tất cả các domain và subdomain của vercel.app
                if (host.EndsWith(".vercel.app"))
                    return true;

                // Cho phép các domain cấu hình động
                var envOrigins = builder.Configuration["Cors:AllowedOrigins"] ?? Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS");
                if (!string.IsNullOrEmpty(envOrigins))
                {
                    var origins = envOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries);
                    foreach (var o in origins)
                    {
                        var trimmed = o.Trim();
                        if (!string.IsNullOrEmpty(trimmed))
                        {
                            try
                            {
                                if (new Uri(trimmed).Host == host)
                                    return true;
                            }
                            catch {}
                        }
                    }
                }
            }
            catch {}
            return false;
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// Register Infrastructure services
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Log connection string (with masked password) for debugging
var connectionString = app.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(connectionString))
{
    var parts = connectionString.Split(';');
    for (int i = 0; i < parts.Length; i++)
    {
        var trimmedPart = parts[i].Trim();
        if (trimmedPart.StartsWith("Password=", StringComparison.OrdinalIgnoreCase))
        {
            parts[i] = "Password=********";
        }
    }
    Console.WriteLine($"[Database Config] Active Connection String: {string.Join(";", parts)}");
}
else
{
    Console.WriteLine("[Database Config] Connection string 'DefaultConnection' is null or empty!");
}

// Seed data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<NeoBoard.Infrastructure.Data.AppDbContext>();
        var passwordService = services.GetRequiredService<NeoBoard.Application.Common.Interfaces.IPasswordService>();
        
        try {
            await context.Database.MigrateAsync();
        } catch (Exception ex) {
            Console.WriteLine($"Migration failed, but proceeding to seeding: {ex.Message}");
        }
        
        await NeoBoard.Infrastructure.Data.DbSeeder.SeedAsync(context, passwordService);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
    }
}

app.UseMiddleware<NeoBoard.Web.Middlewares.SecurityExceptionHandlingMiddleware>();
app.UseMiddleware<NeoBoard.Web.Middlewares.SecurityHeadersMiddleware>();

app.UseCors("AllowReact");

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseStaticFiles();

app.UseRouting();
app.UseRateLimiter();
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<NeoBoard.Web.Middlewares.IpRestrictionMiddleware>();

// API attribute routing (cho [ApiController] với [Route("api/v1/...")])
app.MapControllers();

// MVC conventional routing
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Account}/{action=Login}/{id?}");

app.MapHub<NeoBoard.Web.Hubs.NotificationHub>("/r/notifications");

app.Run();
