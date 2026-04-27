namespace Bookstore.Domain.Entities;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Navigation Properties
    public ICollection<Book> Books { get; set; } = new List<Book>();
}
