using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NeoBoard.Application.Common.Interfaces;
using NeoBoard.Domain.Repositories;
using NeoBoard.Infrastructure.Data;
using NeoBoard.Infrastructure.Repositories;
using NeoBoard.Infrastructure.Services;

namespace NeoBoard.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseMySql(configuration.GetConnectionString("DefaultConnection"),
                    new MySqlServerVersion(new System.Version(8, 0, 31)),
                    b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IStudentRepository, StudentRepository>();
            services.AddScoped<IPasswordService, PasswordService>();
            services.AddScoped<ICaptchaService, CaptchaService>();
            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<ISmsService, SmsService>();
            services.AddScoped<IHashService, HashService>();
            services.AddScoped<IFileService, FileService>();
            services.AddHostedService<PredictiveMaintenanceService>();

            return services;
        }
    }
}
