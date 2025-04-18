namespace SDService.IServices;

public interface IRenderTrackingService
{
    Task ProcessPendingRenderJobsAsync(CancellationToken cancellationToken);
}