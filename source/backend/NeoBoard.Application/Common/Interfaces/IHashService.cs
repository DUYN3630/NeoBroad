namespace NeoBoard.Application.Common.Interfaces
{
    public interface IHashService
    {
        string ComputeHash(string input);
        string ComputeTransactionHash(string studentCode, string assetId, string selfieUrl, string previousHash, DateTime timestamp);
        bool VerifyHash(string input, string hash);
    }
}
