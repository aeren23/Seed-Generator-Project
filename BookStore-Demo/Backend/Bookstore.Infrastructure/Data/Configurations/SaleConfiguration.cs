using Bookstore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bookstore.Infrastructure.Data.Configurations;

public class SaleConfiguration : IEntityTypeConfiguration<Sale>
{
    public void Configure(EntityTypeBuilder<Sale> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.TotalAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(s => s.SaleDate)
            .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

        // FK: Sale → User (Customer)
        builder.HasOne(s => s.Customer)
            .WithMany(u => u.CustomerSales)
            .HasForeignKey(s => s.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
