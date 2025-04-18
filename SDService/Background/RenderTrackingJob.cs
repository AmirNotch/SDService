using SDService.IServices;

namespace SDService.Background;

public class RenderTrackingJob : AbstractJob
{
    private readonly IServiceScopeFactory _serviceScopeFactory;

    public RenderTrackingJob(IServiceScopeFactory serviceScopeFactory, ILogger<RenderTrackingJob> logger)
        : base(logger, nameof(RenderTrackingJob), jobWaitingTimeMs: 1000) // или вынеси в константу
    {
        _serviceScopeFactory = serviceScopeFactory;
    }

    protected override async Task DoWorkAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var renderService = scope.ServiceProvider.GetRequiredService<IRenderTrackingService>();

            await renderService.ProcessPendingRenderJobsAsync(stoppingToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{name} encountered error during execution.", _className);
            throw;
        }
    }
}
