using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using NeoBoard.Domain.Entities;

namespace NeoBoard.Domain.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByCodeAsync(string code);
        Task<IEnumerable<User>> GetAllAsync();
        Task AddAsync(User user);
        Task UpdateAsync(User user);
    }
}
