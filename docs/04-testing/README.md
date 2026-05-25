# 🧪 Chiến Lược Testing — NeoBoard

## Tổng Quan

| Loại Test | Công cụ | Coverage Target | Thư mục |
|---|---|---|---|
| **Unit Test (BE)** | xUnit + Moq | 80%+ business logic | `tests/NeoBoard.UnitTests/` |
| **Integration Test (BE)** | xUnit + WebApplicationFactory | Key flows | `tests/NeoBoard.IntegrationTests/` |
| **Unit Test (FE)** | Vitest + React Testing Library | 70%+ components | `src/**/*.test.tsx` |
| **E2E Test** | Playwright (future) | Critical paths | `e2e/` |

---

## Backend Testing

### Unit Tests
- Focus: Domain entities, Application services, Validators
- Mock: Repositories, External services
- Naming: `{MethodName}_Should_{ExpectedResult}_When_{Condition}`

```csharp
// Ví dụ
[Fact]
public async Task GetUserById_ShouldReturnUser_WhenUserExists()
{
    // Arrange
    var mockRepo = new Mock<IUserRepository>();
    mockRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(new User { Id = Guid.NewGuid(), FullName = "Test" });

    var service = new UserService(mockRepo.Object);

    // Act
    var result = await service.GetUserByIdAsync(Guid.NewGuid());

    // Assert
    Assert.NotNull(result);
    Assert.Equal("Test", result.FullName);
}
```

### Integration Tests
- Test full request → response pipeline
- Dùng in-memory database hoặc test PostgreSQL container
- Test: Auth flow, CRUD operations, validation

---

## Frontend Testing

### Component Tests
```typescript
// Vitest + React Testing Library
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

test('hiển thị tên user', () => {
  render(<UserCard user={{ fullName: 'Nguyễn Văn A' }} />);
  expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
});
```

### Hook Tests
- Test custom hooks với `renderHook`
- Mock API responses với MSW (Mock Service Worker)

---

## Test Commands

```bash
# Backend
cd source/backend
dotnet test                              # Chạy tất cả tests
dotnet test --filter "Category=Unit"     # Chỉ unit tests
dotnet test --collect:"XPlat Code Coverage"  # Coverage report

# Frontend
cd source/frontend
npm run test                  # Chạy tất cả tests
npm run test:coverage         # Coverage report
npm run test:watch           # Watch mode
```

---

## Quy Tắc Testing

1. **Viết test TRƯỚC khi tạo PR** — không merge code chưa có test
2. **Mỗi bug fix phải có test** — đảm bảo bug không tái hiện
3. **Test phải độc lập** — không phụ thuộc thứ tự chạy
4. **Test phải nhanh** — Unit test < 1s, Integration test < 5s
5. **Naming rõ ràng** — đọc test name biết ngay test gì
