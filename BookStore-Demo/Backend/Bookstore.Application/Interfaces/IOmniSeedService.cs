namespace Bookstore.Application.Interfaces;

public interface IOmniSeedService
{
    Task<bool> TriggerResetAsync(CancellationToken cancellationToken = default);
}
