using Bookstore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bookstore.Infrastructure.Data.Configurations;

public class BookConfiguration : IEntityTypeConfiguration<Book>
{
    public void Configure(EntityTypeBuilder<Book> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(b => b.AuthorName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.Price)
            .HasColumnType("decimal(18,2)");

        builder.Property(b => b.CoverImageUrl)
            .HasMaxLength(500);

        // FK: Book → Category
        builder.HasOne(b => b.Category)
            .WithMany(c => c.Books)
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // FK: Book → User (Seller only)
        builder.HasOne(b => b.Seller)
            .WithMany(u => u.SellerBooks)
            .HasForeignKey(b => b.SellerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
