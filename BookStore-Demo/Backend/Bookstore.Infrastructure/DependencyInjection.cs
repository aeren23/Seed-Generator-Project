using Bookstore.Application.Interfaces;
using Bookstore.Infrastructure.Data;
using Bookstore.Infrastructure.Repositories;
using Bookstore.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Bookstore.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // PostgreSQL via EF Core
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped<IBookRepository, BookRepository>();
        services.AddScoped<IBasketRepository, BasketRepository>();
        services.AddScoped<ISaleRepository, SaleRepository>();

        // Services
        services.AddScoped<IBookService, BookService>();
        services.AddScoped<ICheckoutService, CheckoutService>();
        services.AddScoped<ISaleService, SaleService>();
        services.AddScoped<IOmniSeedService, OmniSeedTriggerService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IBasketService, BasketService>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
