using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using NeoBoard.Domain.Entities;
using NeoBoard.Domain.Repositories;

namespace NeoBoard.Infrastructure.Repositories
{
    public class CachedUserRepository : IUserRepository
    {
        private readonly IUserRepository _inner;
        private readonly IDistributedCache _cache;
        private readonly ILogger<CachedUserRepository> _logger;
        
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            ReferenceHandler = ReferenceHandler.IgnoreCycles,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public CachedUserRepository(IUserRepository inner, IDistributedCache cache, ILogger<CachedUserRepository> logger)
        {
            _inner = inner;
            _cache = cache;
            _logger = logger;
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            string cacheKey = $"user:{id}";
            
            // Try to get from cache
            try
            {
                var cachedData = await _cache.GetStringAsync(cacheKey);
                if (!string.IsNullOrEmpty(cachedData))
                {
                    try
                    {
                        return JsonSerializer.Deserialize<User>(cachedData, JsonOptions);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to deserialize cached user {UserId}", id);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read user {UserId} from Redis cache. Falling back to DB.", id);
            }

            // Get from DB
            var user = await _inner.GetByIdAsync(id);

            // Cache the result if found
            if (user != null)
            {
                try
                {
                    var options = new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10),
                        SlidingExpiration = TimeSpan.FromMinutes(2)
                    };
                    await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(user, JsonOptions), options);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to write user {UserId} to Redis cache.", id);
                }
            }

            return user;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            string cacheKey = $"user:email:{email.ToLower()}";
            
            // Try to get from cache
            try
            {
                var cachedData = await _cache.GetStringAsync(cacheKey);
                if (!string.IsNullOrEmpty(cachedData))
                {
                    try
                    {
                        return JsonSerializer.Deserialize<User>(cachedData, JsonOptions);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to deserialize cached user by email {Email}", email);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read user by email {Email} from Redis cache. Falling back to DB.", email);
            }

            // Get from DB
            var user = await _inner.GetByEmailAsync(email);

            if (user != null)
            {
                try
                {
                    var options = new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10),
                        SlidingExpiration = TimeSpan.FromMinutes(2)
                    };
                    await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(user, JsonOptions), options);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to write user by email {Email} to Redis cache.", email);
                }
            }

            return user;
        }

        public async Task<User?> GetByCodeAsync(string code)
        {
            // ByCode searches using Like (wildcard), caching is not ideal or can fallback directly to DB
            return await _inner.GetByCodeAsync(code);
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            // GetAll is generally list data, usually not cached directly as a single item or done with specific cache keys.
            // Fallback to DB for real-time list
            return await _inner.GetAllAsync();
        }

        public async Task AddAsync(User user)
        {
            await _inner.AddAsync(user);
            // No cache invalidation needed for new users as they don't have existing cache keys.
        }

        public async Task UpdateAsync(User user)
        {
            await _inner.UpdateAsync(user);

            // Invalidate cache keys to avoid stale data
            string idKey = $"user:{user.Id}";
            try
            {
                await _cache.RemoveAsync(idKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to remove user {UserId} from Redis cache during update.", user.Id);
            }

            if (!string.IsNullOrEmpty(user.Email))
            {
                string emailKey = $"user:email:{user.Email.ToLower()}";
                try
                {
                    await _cache.RemoveAsync(emailKey);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to remove user by email {Email} from Redis cache during update.", user.Email);
                }
            }
        }
    }
}
