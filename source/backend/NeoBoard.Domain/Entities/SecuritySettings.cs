namespace NeoBoard.Domain.Entities
{
    public class SecuritySettings
    {
        public bool TwoFactorEnabled { get; set; } = false;
        public bool IpRestrictionEnabled { get; set; } = false;
    }
}
