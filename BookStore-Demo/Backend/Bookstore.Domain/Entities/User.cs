using Microsoft.AspNetCore.Identity;

namespace Bookstore.Domain.Entities;

public class User : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;

    // Navigation Properties
    public ICollection<Book> SellerBooks { get; set; } = new List<Book>();
    public ICollection<Basket> Baskets { get; set; } = new List<Basket>();
    public ICollection<Sale> CustomerSales { get; set; } = new List<Sale>();
}
