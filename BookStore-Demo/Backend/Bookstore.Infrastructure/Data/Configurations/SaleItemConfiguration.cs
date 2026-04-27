using Bookstore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bookstore.Infrastructure.Data.Configurations;

public class SaleItemConfiguration : IEntityTypeConfiguration<SaleItem>
{
    public void Configure(EntityTypeBuilder<SaleItem> builder)
    {
        builder.HasKey(si => si.Id);

        builder.Property(si => si.UnitPrice)
            .HasColumnType("decimal(18,2)");

        // FK: SaleItem → Sale
        builder.HasOne(si => si.Sale)
            .WithMany(s => s.Items)
            .HasForeignKey(si => si.SaleId)
            .OnDelete(DeleteBehavior.Cascade);

        // FK: SaleItem → Book
        builder.HasOne(si => si.Book)
            .WithMany()
            .HasForeignKey(si => si.BookId)
            .OnDelete(DeleteBehavior.Restrict);

        // FK: SaleItem → User (Seller)
        builder.HasOne(si => si.Seller)
            .WithMany()
            .HasForeignKey(si => si.SellerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
