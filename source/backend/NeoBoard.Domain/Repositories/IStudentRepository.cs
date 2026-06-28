using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using NeoBoard.Domain.Entities;

namespace NeoBoard.Domain.Repositories
{
    public interface IStudentRepository
    {
        Task<Student?> GetByIdAsync(Guid id);
        Task<Student?> GetByCodeAsync(string studentCode);
        Task<IEnumerable<Student>> GetAllAsync();
        Task AddAsync(Student student);
        Task UpdateAsync(Student student);
    }
}
