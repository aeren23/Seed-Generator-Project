using Bookstore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bookstore.Infrastructure.Data.Configurations;

public class BasketItemConfiguration : IEntityTypeConfiguration<BasketItem>
{
    public void Configure(EntityTypeBuilder<BasketItem> builder)
    {
        builder.HasKey(bi => bi.Id);

        // FK: BasketItem → Basket
        builder.HasOne(bi => bi.Basket)
            .WithMany(b => b.Items)
            .HasForeignKey(bi => bi.BasketId)
            .OnDelete(DeleteBehavior.Cascade);

        // FK: BasketItem → Book
        builder.HasOne(bi => bi.Book)
            .WithMany()
            .HasForeignKey(bi => bi.BookId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
