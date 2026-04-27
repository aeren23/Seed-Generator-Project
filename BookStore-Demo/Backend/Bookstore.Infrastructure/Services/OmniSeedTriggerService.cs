using System.Diagnostics;
using Bookstore.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Bookstore.Infrastructure.Services;

public class OmniSeedTriggerService : IOmniSeedService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<OmniSeedTriggerService> _logger;

    public OmniSeedTriggerService(IConfiguration configuration, ILogger<OmniSeedTriggerService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> TriggerResetAsync(CancellationToken cancellationToken = default)
    {
        string pythonExecutable = _configuration["OmniSeed:PythonExecutable"] ?? "python";
        string scriptPath = _configuration["OmniSeed:ScriptPath"] ?? "../../../Seed-Cli/omniseed/bookstore_cli.py";

        _logger.LogInformation("Triggering OmniSeed CLI reset command via: {Executable} {ScriptPath}", pythonExecutable, scriptPath);

        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = pythonExecutable,
                Arguments = $"\"{scriptPath}\" reset",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process { StartInfo = startInfo };
            
            process.Start();

            // Asynchronously read standard output and error
            var outputTask = process.StandardOutput.ReadToEndAsync(cancellationToken);
            var errorTask = process.StandardError.ReadToEndAsync(cancellationToken);

            await process.WaitForExitAsync(cancellationToken);

            string output = await outputTask;
            string error = await errorTask;

            if (process.ExitCode == 0)
            {
                _logger.LogInformation("OmniSeed CLI reset completed successfully.\nOutput: {Output}", output);
                return true;
            }
            else
            {
                _logger.LogError("OmniSeed CLI reset failed with exit code {ExitCode}.\nError: {Error}\nOutput: {Output}", 
                    process.ExitCode, error, output);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An exception occurred while trying to trigger the OmniSeed CLI.");
            return false;
        }
    }
}
