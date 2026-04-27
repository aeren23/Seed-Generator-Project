using Bookstore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bookstore.Infrastructure.Data.Configurations;

public class BasketConfiguration : IEntityTypeConfiguration<Basket>
{
    public void Configure(EntityTypeBuilder<Basket> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.IsCompleted)
            .HasDefaultValue(false);

        // FK: Basket → User
        builder.HasOne(b => b.User)
            .WithMany(u => u.Baskets)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
