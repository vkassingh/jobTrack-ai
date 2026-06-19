namespace JobTrackAI.AuthService.DTOs
{
    public sealed record ProfileDto(string Email, string UserId, string FullName);
    public sealed record UpdateProfileDto(string FullName);
    public sealed record ChangePasswordDto(string CurrentPassword, string NewPassword);
}
