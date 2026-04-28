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
        string workingDirectory = _configuration["OmniSeed:WorkingDirectory"] ?? "/app/Seed-Cli";

        _logger.LogInformation("Triggering OmniSeed CLI reset: {Executable} -m omniseed reset (cwd: {Cwd})", pythonExecutable, workingDirectory);

        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = pythonExecutable,
                Arguments = "-m omniseed reset",
                WorkingDirectory = workingDirectory,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            // Pass DB_CONNECTION_STRING from the current environment so the CLI
            // connects to the Docker-internal database address (db:5432) instead
            // of localhost:5432 from .env
            var dbConn = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            if (!string.IsNullOrEmpty(dbConn))
            {
                startInfo.Environment["DB_CONNECTION_STRING"] = dbConn;
            }

            using var process = new Process { StartInfo = startInfo };
            
            process.Start();

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
